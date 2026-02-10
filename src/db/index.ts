import { google } from 'googleapis';

// Google Sheets configuration
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Cache for sheet names to reduce API calls
const sheetNameCache: { [key: string]: { name: string; timestamp: number } } = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Rate limiting and retry configuration
const REQUEST_QUEUE: (() => Promise<void>)[] = [];
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 300; // 300ms between requests (~3.3 requests per second)
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// In-memory data cache
const dataCache: { [key: string]: { data: any[]; timestamp: number } } = {};
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
async function executeWithRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES, delay = INITIAL_RETRY_DELAY): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    // Check if it's a quota exceeded error (429)
    if (error?.code === 429 || error?.status === 429 || error?.message?.includes('Quota exceeded')) {
      if (retries > 0) {
        console.log(`Quota exceeded, retrying in ${delay}ms... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return executeWithRetry(fn, retries - 1, delay * 2); // Exponential backoff
      }
    }
    throw error;
  }
}

// Add request to queue with retry support
function queueRequest<T>(fn: () => Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    REQUEST_QUEUE.push(async () => {
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
function getCachedData(key: string): any[] | null {
  const cached = dataCache[key];
  if (cached && (Date.now() - cached.timestamp) < DATA_CACHE_TTL) {
    return cached.data;
  }
  return null;
}

// Set cached data
function setCachedData(key: string, data: any[]) {
  dataCache[key] = { data, timestamp: Date.now() };
}

// Clear cached data for a key
function clearCachedData(key: string) {
  delete dataCache[key];
}

// Sheet configurations
const sheetConfigs = {
  santris: {
    id: process.env.SHEET_ID_SANTRI,
    gid: '0',
    range: 'Sheet1!A:Z',
  },
  ustadzs: {
    id: process.env.SHEET_ID_USTADZ,
    gid: '189830710',
    range: 'Sheet1!A:Z',
  },
  absensis: {
    id: process.env.SHEET_ID_ABSENSI,
    gid: '95055288',
    range: 'Sheet1!A:Z',
  },
  transaksis: {
    id: process.env.SHEET_ID_TRANSAKSI,
    gid: '191644107',
    range: 'Sheet1!A:Z',
  },
  pelanggarans: {
    id: process.env.SHEET_ID_PELANGGARAN,
    gid: '1684122507',
    range: 'Sheet1!A:Z',
  },
  setoranHafalans: {
    id: process.env.SHEET_ID_HAFALAN,
    gid: '869009823',
    range: 'Sheet1!A:Z',
  },
  orangTua: {
    id: process.env.SHEET_ID_ORANG_TUA,
    gid: '0',
    range: 'Sheet1!A:Z',
  },
  users: {
    id: process.env.SHEET_ID_USERS,
    gid: '0',
    range: 'Sheet1!A:Z',
  }
};

// Helper function to get sheet config
function getSheetConfig(tableName: string) {
  return sheetConfigs[tableName as keyof typeof sheetConfigs];
}

// Helper function to get actual sheet name with caching
async function getActualSheetName(tableName: string): Promise<string> {
  const config = getSheetConfig(tableName);
  if (!config || !config.id) return 'Sheet1';
  
  // Check cache first with TTL
  const cached = sheetNameCache[config.id];
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.name;
  }
  
  try {
    const spreadsheet = await queueRequest(() => sheets.spreadsheets.get({
      spreadsheetId: config.id,
    }));
    
    const sheetNames = spreadsheet.data.sheets?.map(s => s.properties?.title).filter((t): t is string => !!t) || [];
    const actualSheetName = sheetNames[0] || 'Sheet1';
    
    // Cache the result with timestamp
    if (config.id) {
      sheetNameCache[config.id] = { name: actualSheetName, timestamp: Date.now() };
    }
    
    return actualSheetName;
  } catch (error) {
    console.error(`Error getting sheet name for ${tableName}:`, error);
    return 'Sheet1';
  }
}

// Helper function to find row index by ID
function findRowIndexById(allData: any[], id: number | string): number {
  const targetId = Number(id);
  
  for (let i = 0; i < allData.length; i++) {
    const rowId = allData[i].id;
    if (rowId === null || rowId === undefined) continue;
    
    const parsedRowId = Number(rowId);
    if (parsedRowId === targetId) {
      return i;
    }
  }
  
  return -1;
}

async function fetchSheetData(sheetName: string): Promise<any[]> {
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

    const response = await queueRequest(() => sheets.spreadsheets.values.get({
      spreadsheetId: config.id,
      range: range,
    }));

    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    // Convert rows to objects using headers
    const headers = rows[0];
    const data = rows.slice(1).map(row => {
      const obj: any = {};
      headers.forEach((header: string, index: number) => {
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

// Export database interface
export const db: {
  select: (tableName: string) => Promise<any[]>;
  insert: (tableName: string, data: any) => Promise<{ success: boolean }>;
  update: (tableName: string, id: number | string, data: any) => Promise<{ success: boolean }>;
  delete: (tableName: string, id: number | string) => Promise<{ success: boolean }>;
} = {
  select: async (tableName: string): Promise<any[]> => {
    return await fetchSheetData(tableName);
  },
  
  insert: async (tableName: string, data: any): Promise<{ success: boolean }> => {
    try {
      const config = getSheetConfig(tableName);
      if (!config) {
        throw new Error(`Sheet config not found for ${tableName}`);
      }

      const sheetName = await getActualSheetName(tableName);
      
      // Get headers from first row
      const headerResponse = await queueRequest(() => sheets.spreadsheets.values.get({
        spreadsheetId: config.id,
        range: `${sheetName}!A1:Z1`,
      }));

      const headers = headerResponse.data.values?.[0] || [];
      
      // Build values array in the same order as headers
      const values = headers.map((header: string) => {
        const value = data[header] ?? '';
        return value;
      });
      
      // Append to sheet
      await queueRequest(() => sheets.spreadsheets.values.append({
        spreadsheetId: config.id,
        range: `${sheetName}!A:Z`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [values],
        },
      }));

      // Clear cache after write
      clearCachedData(tableName);
      
      console.log(`Inserted into ${tableName}:`, data);
      return { success: true };
    } catch (error) {
      console.error(`Error inserting into ${tableName}:`, error);
      throw error;
    }
  },

  
  update: async (tableName: string, id: number | string, data: any): Promise<{ success: boolean }> => {
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
      const spreadsheet = await queueRequest(() => sheets.spreadsheets.values.get({
        spreadsheetId: config.id,
        range: `${sheetName}!A1:Z1`,
      }));

      const headers = spreadsheet.data.values?.[0] || [];
      
      // Build update values array
      const targetId = Number(id);
      const updateValues = headers.map((header: string) => {
        let value;
        if (header === 'id') value = targetId;
        else if (header === 'updatedAt') value = new Date().toISOString();
        else value = data[header] ?? '';
        return value;
      });
      
      // Update the row (rowIndex + 2 because row 1 is headers, and arrays are 0-indexed)
      const updateRange = `${sheetName}!A${rowIndex + 2}:Z${rowIndex + 2}`;
      
      await queueRequest(() => sheets.spreadsheets.values.update({
        spreadsheetId: config.id,
        range: updateRange,
        valueInputOption: 'RAW',
        requestBody: {
          values: [updateValues],
        },
      }));

      // Clear cache after write
      clearCachedData(tableName);
      
      console.log(`Updated ${tableName} with id ${id}`);
      return { success: true };
    } catch (error) {
      console.error(`Error updating ${tableName}:`, error);
      throw error;
    }
  },

  
  delete: async (tableName: string, id: number | string): Promise<{ success: boolean }> => {
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
      await queueRequest(() => sheets.spreadsheets.values.clear({
        spreadsheetId: config.id,
        range: `${sheetName}!A${rowIndex + 2}:Z${rowIndex + 2}`,
      }));

      // Clear cache after write
      clearCachedData(tableName);
      
      console.log(`Deleted from ${tableName} with id ${id}`);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting from ${tableName}:`, error);
      throw error;
    }
  },
};
