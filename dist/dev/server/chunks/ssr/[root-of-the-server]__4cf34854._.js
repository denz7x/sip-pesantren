module.exports = [
"[externals]/child_process [external] (child_process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("child_process", () => require("child_process"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/https [external] (https, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("https", () => require("https"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/os [external] (os, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("os", () => require("os"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/process [external] (process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("process", () => require("process"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/querystring [external] (querystring, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("querystring", () => require("querystring"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/http2 [external] (http2, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("http2", () => require("http2"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[project]/src/db/index.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "db",
    ()=>db
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$googleapis$2f$build$2f$src$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/googleapis/build/src/index.js [app-rsc] (ecmascript)");
;
// Google Sheets configuration
const auth = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$googleapis$2f$build$2f$src$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["google"].auth.GoogleAuth({
    credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n')
    },
    scopes: [
        'https://www.googleapis.com/auth/spreadsheets'
    ]
});
const sheets = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$googleapis$2f$build$2f$src$2f$index$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["google"].sheets({
    version: 'v4',
    auth
});
// Cache for sheet names to reduce API calls
const sheetNameCache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
// Rate limiting and retry configuration
const REQUEST_QUEUE = [];
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 300; // 300ms between requests (~3.3 requests per second)
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second
// In-memory data cache
const dataCache = {};
const DATA_CACHE_TTL = 30 * 1000; // 30 seconds cache for read operations
// Process request queue with retry logic
async function processQueue() {
    if (REQUEST_QUEUE.length === 0) return;
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        setTimeout(processQueue, MIN_REQUEST_INTERVAL - timeSinceLastRequest);
        return;
    }
    const request = REQUEST_QUEUE.shift();
    if (request) {
        lastRequestTime = Date.now();
        try {
            await request();
        } catch (error) {
            console.error('Request failed:', error);
        }
        // Process next request
        setTimeout(processQueue, MIN_REQUEST_INTERVAL);
    }
}
// Execute request with retry logic for 429 errors
async function executeWithRetry(fn, retries = MAX_RETRIES, delay = INITIAL_RETRY_DELAY) {
    try {
        return await fn();
    } catch (error) {
        // Check if it's a quota exceeded error (429)
        if (error?.code === 429 || error?.status === 429 || error?.message?.includes('Quota exceeded')) {
            if (retries > 0) {
                console.log(`Quota exceeded, retrying in ${delay}ms... (${retries} retries left)`);
                await new Promise((resolve)=>setTimeout(resolve, delay));
                return executeWithRetry(fn, retries - 1, delay * 2); // Exponential backoff
            }
        }
        throw error;
    }
}
// Add request to queue with retry support
function queueRequest(fn) {
    return new Promise((resolve, reject)=>{
        REQUEST_QUEUE.push(async ()=>{
            try {
                const result = await executeWithRetry(fn);
                resolve(result);
            } catch (error) {
                reject(error);
            }
        });
        processQueue();
    });
}
// Get cached data if available
function getCachedData(key) {
    const cached = dataCache[key];
    if (cached && Date.now() - cached.timestamp < DATA_CACHE_TTL) {
        return cached.data;
    }
    return null;
}
// Set cached data
function setCachedData(key, data) {
    dataCache[key] = {
        data,
        timestamp: Date.now()
    };
}
// Clear cached data for a key
function clearCachedData(key) {
    delete dataCache[key];
}
// Sheet configurations
const sheetConfigs = {
    santris: {
        id: process.env.SHEET_ID_SANTRI,
        gid: '0',
        range: 'Sheet1!A:Z'
    },
    ustadzs: {
        id: process.env.SHEET_ID_USTADZ,
        gid: '189830710',
        range: 'Sheet1!A:Z'
    },
    absensis: {
        id: process.env.SHEET_ID_ABSENSI,
        gid: '95055288',
        range: 'Sheet1!A:Z'
    },
    transaksis: {
        id: process.env.SHEET_ID_TRANSAKSI,
        gid: '191644107',
        range: 'Sheet1!A:Z'
    },
    pelanggarans: {
        id: process.env.SHEET_ID_PELANGGARAN,
        gid: '1684122507',
        range: 'Sheet1!A:Z'
    },
    setoranHafalans: {
        id: process.env.SHEET_ID_HAFALAN,
        gid: '869009823',
        range: 'Sheet1!A:Z'
    },
    orangTua: {
        id: process.env.SHEET_ID_ORANG_TUA,
        gid: '0',
        range: 'Sheet1!A:Z'
    },
    users: {
        id: process.env.SHEET_ID_USERS,
        gid: '0',
        range: 'Sheet1!A:Z'
    }
};
// Helper function to get sheet config
function getSheetConfig(tableName) {
    return sheetConfigs[tableName];
}
// Helper function to get actual sheet name with caching
async function getActualSheetName(tableName) {
    const config = getSheetConfig(tableName);
    if (!config || !config.id) return 'Sheet1';
    // Check cache first with TTL
    const cached = sheetNameCache[config.id];
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.name;
    }
    try {
        const spreadsheet = await queueRequest(()=>sheets.spreadsheets.get({
                spreadsheetId: config.id
            }));
        const sheetNames = spreadsheet.data.sheets?.map((s)=>s.properties?.title).filter((t)=>!!t) || [];
        const actualSheetName = sheetNames[0] || 'Sheet1';
        // Cache the result with timestamp
        if (config.id) {
            sheetNameCache[config.id] = {
                name: actualSheetName,
                timestamp: Date.now()
            };
        }
        return actualSheetName;
    } catch (error) {
        console.error(`Error getting sheet name for ${tableName}:`, error);
        return 'Sheet1';
    }
}
// Helper function to find row index by ID
function findRowIndexById(allData, id) {
    const targetId = Number(id);
    for(let i = 0; i < allData.length; i++){
        const rowId = allData[i].id;
        if (rowId === null || rowId === undefined) continue;
        const parsedRowId = Number(rowId);
        if (parsedRowId === targetId) {
            return i;
        }
    }
    return -1;
}
async function fetchSheetData(sheetName) {
    try {
        // Check cache first
        const cached = getCachedData(sheetName);
        if (cached) {
            return cached;
        }
        const config = getSheetConfig(sheetName);
        if (!config || !config.id) {
            console.error(`Sheet config not found for ${sheetName}`);
            return [];
        }
        // Use cached sheet name to reduce API calls
        const actualSheetName = await getActualSheetName(sheetName);
        const range = `${actualSheetName}!A:Z`;
        const response = await queueRequest(()=>sheets.spreadsheets.values.get({
                spreadsheetId: config.id,
                range: range
            }));
        const rows = response.data.values;
        if (!rows || rows.length === 0) {
            return [];
        }
        // Convert rows to objects using headers
        const headers = rows[0];
        const data = rows.slice(1).map((row)=>{
            const obj = {};
            headers.forEach((header, index)=>{
                obj[header] = row[index] || null;
            });
            return obj;
        });
        // Cache the data
        setCachedData(sheetName, data);
        return data;
    } catch (error) {
        console.error(`Error fetching ${sheetName} data:`, error);
        return [];
    }
}
const db = {
    select: async (tableName)=>{
        return await fetchSheetData(tableName);
    },
    insert: async (tableName, data)=>{
        try {
            const config = getSheetConfig(tableName);
            if (!config) {
                throw new Error(`Sheet config not found for ${tableName}`);
            }
            const sheetName = await getActualSheetName(tableName);
            // Get headers from first row
            const headerResponse = await queueRequest(()=>sheets.spreadsheets.values.get({
                    spreadsheetId: config.id,
                    range: `${sheetName}!A1:Z1`
                }));
            const headers = headerResponse.data.values?.[0] || [];
            // Build values array in the same order as headers
            const values = headers.map((header)=>{
                const value = data[header] ?? '';
                return value;
            });
            // Append to sheet
            await queueRequest(()=>sheets.spreadsheets.values.append({
                    spreadsheetId: config.id,
                    range: `${sheetName}!A:Z`,
                    valueInputOption: 'RAW',
                    requestBody: {
                        values: [
                            values
                        ]
                    }
                }));
            // Clear cache after write
            clearCachedData(tableName);
            console.log(`Inserted into ${tableName}:`, data);
            return {
                success: true
            };
        } catch (error) {
            console.error(`Error inserting into ${tableName}:`, error);
            throw error;
        }
    },
    update: async (tableName, id, data)=>{
        try {
            const config = getSheetConfig(tableName);
            if (!config) {
                throw new Error(`Sheet config not found for ${tableName}`);
            }
            const sheetName = await getActualSheetName(tableName);
            // Get all data to find the row
            const allData = await fetchSheetData(tableName);
            // Find row index
            const rowIndex = findRowIndexById(allData, id);
            if (rowIndex === -1) {
                throw new Error(`Record with id ${id} not found in ${tableName}`);
            }
            // Get headers from first row
            const spreadsheet = await queueRequest(()=>sheets.spreadsheets.values.get({
                    spreadsheetId: config.id,
                    range: `${sheetName}!A1:Z1`
                }));
            const headers = spreadsheet.data.values?.[0] || [];
            // Build update values array
            const targetId = Number(id);
            const updateValues = headers.map((header)=>{
                let value;
                if (header === 'id') value = targetId;
                else if (header === 'updatedAt') value = new Date().toISOString();
                else value = data[header] ?? '';
                return value;
            });
            // Update the row (rowIndex + 2 because row 1 is headers, and arrays are 0-indexed)
            const updateRange = `${sheetName}!A${rowIndex + 2}:Z${rowIndex + 2}`;
            await queueRequest(()=>sheets.spreadsheets.values.update({
                    spreadsheetId: config.id,
                    range: updateRange,
                    valueInputOption: 'RAW',
                    requestBody: {
                        values: [
                            updateValues
                        ]
                    }
                }));
            // Clear cache after write
            clearCachedData(tableName);
            console.log(`Updated ${tableName} with id ${id}`);
            return {
                success: true
            };
        } catch (error) {
            console.error(`Error updating ${tableName}:`, error);
            throw error;
        }
    },
    delete: async (tableName, id)=>{
        try {
            const config = getSheetConfig(tableName);
            if (!config) {
                throw new Error(`Sheet config not found for ${tableName}`);
            }
            const sheetName = await getActualSheetName(tableName);
            // Get all data to find the row
            const allData = await fetchSheetData(tableName);
            // Find row index
            const rowIndex = findRowIndexById(allData, id);
            if (rowIndex === -1) {
                throw new Error(`Record with id ${id} not found in ${tableName}`);
            }
            // Clear the row (rowIndex + 2 because row 1 is headers)
            await queueRequest(()=>sheets.spreadsheets.values.clear({
                    spreadsheetId: config.id,
                    range: `${sheetName}!A${rowIndex + 2}:Z${rowIndex + 2}`
                }));
            // Clear cache after write
            clearCachedData(tableName);
            console.log(`Deleted from ${tableName} with id ${id}`);
            return {
                success: true
            };
        } catch (error) {
            console.error(`Error deleting from ${tableName}:`, error);
            throw error;
        }
    }
};
}),
"[project]/src/app/ustadz/absensi/actions.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* __next_internal_action_entry_do_not_use__ [{"407409818b00f3061cb6b438f60454cf22dd50ba8b":"deleteAbsensi","4077296589ca4f3ce2dfedb8c7f2d8fdadc5adc7d6":"createAbsensi","608a8e100afddb968650bc0ad91f53b536de631dc7":"updateAbsensi"},"",""] */ __turbopack_context__.s([
    "createAbsensi",
    ()=>createAbsensi,
    "deleteAbsensi",
    ()=>deleteAbsensi,
    "updateAbsensi",
    ()=>updateAbsensi
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/server-reference.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/db/index.ts [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/cache.js [app-rsc] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/build/webpack/loaders/next-flight-loader/action-validate.js [app-rsc] (ecmascript)");
;
;
;
async function createAbsensi(data) {
    try {
        // Generate new ID
        const allData = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].select("absensis");
        const newId = allData.length > 0 ? Math.max(...allData.map((d)=>parseInt(d.id) || 0)) + 1 : 1;
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].insert("absensis", {
            id: newId,
            ...data,
            createdAt: new Date().toISOString()
        });
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/ustadz/absensi");
        return {
            success: true
        };
    } catch (error) {
        console.error("Error creating absensi:", error);
        throw new Error("Failed to create absensi");
    }
}
async function updateAbsensi(id, data) {
    try {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].update("absensis", id, data);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/ustadz/absensi");
        return {
            success: true
        };
    } catch (error) {
        console.error("Error updating absensi:", error);
        throw new Error("Failed to update absensi");
    }
}
async function deleteAbsensi(id) {
    try {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["db"].delete("absensis", id);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$cache$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["revalidatePath"])("/ustadz/absensi");
        return {
            success: true
        };
    } catch (error) {
        console.error("Error deleting absensi:", error);
        throw new Error("Failed to delete absensi");
    }
}
;
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$action$2d$validate$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["ensureServerEntryExports"])([
    createAbsensi,
    updateAbsensi,
    deleteAbsensi
]);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(createAbsensi, "4077296589ca4f3ce2dfedb8c7f2d8fdadc5adc7d6", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(updateAbsensi, "608a8e100afddb968650bc0ad91f53b536de631dc7", null);
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$webpack$2f$loaders$2f$next$2d$flight$2d$loader$2f$server$2d$reference$2e$js__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["registerServerReference"])(deleteAbsensi, "407409818b00f3061cb6b438f60454cf22dd50ba8b", null);
}),
"[project]/.next-internal/server/app/ustadz/absensi/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/ustadz/absensi/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript) <locals>", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ustadz$2f$absensi$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/ustadz/absensi/actions.ts [app-rsc] (ecmascript)");
;
;
;
}),
"[project]/.next-internal/server/app/ustadz/absensi/page/actions.js { ACTIONS_MODULE0 => \"[project]/src/app/ustadz/absensi/actions.ts [app-rsc] (ecmascript)\" } [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "407409818b00f3061cb6b438f60454cf22dd50ba8b",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ustadz$2f$absensi$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["deleteAbsensi"],
    "4077296589ca4f3ce2dfedb8c7f2d8fdadc5adc7d6",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ustadz$2f$absensi$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["createAbsensi"],
    "608a8e100afddb968650bc0ad91f53b536de631dc7",
    ()=>__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ustadz$2f$absensi$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["updateAbsensi"]
]);
var __TURBOPACK__imported__module__$5b$project$5d2f2e$next$2d$internal$2f$server$2f$app$2f$ustadz$2f$absensi$2f$page$2f$actions$2e$js__$7b$__ACTIONS_MODULE0__$3d3e$__$225b$project$5d2f$src$2f$app$2f$ustadz$2f$absensi$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$2922$__$7d$__$5b$app$2d$rsc$5d$__$28$server__actions__loader$2c$__ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i('[project]/.next-internal/server/app/ustadz/absensi/page/actions.js { ACTIONS_MODULE0 => "[project]/src/app/ustadz/absensi/actions.ts [app-rsc] (ecmascript)" } [app-rsc] (server actions loader, ecmascript) <locals>');
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$app$2f$ustadz$2f$absensi$2f$actions$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/app/ustadz/absensi/actions.ts [app-rsc] (ecmascript)");
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__4cf34854._.js.map