/**
 * Script to fix orphaned orang tua records
 * Links orang tua records with null userId to existing user accounts
 * 
 * Usage: node scripts/fix-orangtua-link.js
 */

const { google } = require('googleapis');
require('dotenv').config({ path: './.env.local' });

// Google Sheets configuration
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

const SHEET_ID_ORANG_TUA = process.env.SHEET_ID_ORANG_TUA;
const SHEET_ID_USERS = process.env.SHEET_ID_USERS;

async function getSheetData(spreadsheetId, sheetName) {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheetId,
      range: `${sheetName}!A:Z`,
    });
    return response.data.values || [];
  } catch (error) {
    console.error(`Error fetching data from ${sheetName}:`, error.message);
    return [];
  }
}

async function updateSheetData(spreadsheetId, range, values) {
  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheetId,
      range: range,
      valueInputOption: 'RAW',
      resource: {
        values: values,
      },
    });
    return true;
  } catch (error) {
    console.error(`Error updating data:`, error.message);
    return false;
  }
}

async function fixOrangTuaLinks() {
  console.log('🔧 Starting Orang Tua Link Fix Script...\n');

  if (!SHEET_ID_ORANG_TUA || !SHEET_ID_USERS) {
    console.error('❌ Missing required environment variables:');
    console.error('   - SHEET_ID_ORANG_TUA:', SHEET_ID_ORANG_TUA ? 'SET' : 'NOT SET');
    console.error('   - SHEET_ID_USERS:', SHEET_ID_USERS ? 'SET' : 'NOT SET');
    process.exit(1);
  }

  // Get orang tua data
  console.log('📊 Fetching Orang Tua data...');
  const orangTuaData = await getSheetData(SHEET_ID_ORANG_TUA, 'Sheet1');
  if (orangTuaData.length === 0) {
    console.error('❌ No orang tua data found');
    process.exit(1);
  }

  // Get headers and find userId column index
  const headers = orangTuaData[0];
  const userIdIndex = headers.indexOf('userId');
  const idIndex = headers.indexOf('id');
  const namaIndex = headers.indexOf('nama');
  const emailIndex = headers.indexOf('email');

  if (userIdIndex === -1) {
    console.error('❌ userId column not found in orang tua sheet');
    process.exit(1);
  }

  console.log(`   Found ${orangTuaData.length - 1} orang tua records\n`);

  // Get users data
  console.log('📊 Fetching Users data...');
  const usersData = await getSheetData(SHEET_ID_USERS, 'Sheet1');
  if (usersData.length === 0) {
    console.error('❌ No users data found');
    process.exit(1);
  }

  const userHeaders = usersData[0];
  const userIdIndexUsers = userHeaders.indexOf('id');
  const userEmailIndex = userHeaders.indexOf('email');
  const userNameIndex = userHeaders.indexOf('name');

  console.log(`   Found ${usersData.length - 1} user records\n`);

  // Find orphaned orang tua records (userId is null/empty)
  const orphanedRecords = [];
  for (let i = 1; i < orangTuaData.length; i++) {
    const row = orangTuaData[i];
    const userId = row[userIdIndex];
    const id = row[idIndex];
    const nama = row[namaIndex];
    const email = row[emailIndex];

    if (!userId || userId === '' || userId === 'null') {
      orphanedRecords.push({
        rowIndex: i + 1, // +1 because sheet rows are 1-indexed
        id: id,
        nama: nama,
        email: email,
      });
    }
  }

  if (orphanedRecords.length === 0) {
    console.log('✅ No orphaned orang tua records found. All records are properly linked!');
    process.exit(0);
  }

  console.log(`🔍 Found ${orphanedRecords.length} orphaned orang tua record(s):\n`);
  for (const record of orphanedRecords) {
    console.log(`   - ID: ${record.id}, Nama: ${record.nama}, Email: ${record.email}`);
  }
  console.log('');

  // Try to match orphaned records with users by email or name
  console.log('🔗 Attempting to link orphaned records with user accounts...\n');
  
  const updates = [];
  for (const record of orphanedRecords) {
    // Try to find matching user by email
    let matchedUser = null;
    
    if (record.email) {
      matchedUser = usersData.slice(1).find(u => u[userEmailIndex] === record.email);
    }
    
    // If no email match, try by name
    if (!matchedUser && record.nama) {
      matchedUser = usersData.slice(1).find(u => u[userNameIndex] === record.nama);
    }

    if (matchedUser) {
      const userId = matchedUser[userIdIndexUsers];
      console.log(`   ✅ Match found: Orang Tua "${record.nama}" (ID: ${record.id}) → User ID: ${userId}`);
      
      // Prepare update
      const rowToUpdate = [...orangTuaData[record.rowIndex - 1]];
      rowToUpdate[userIdIndex] = userId;
      
      updates.push({
        rowIndex: record.rowIndex,
        data: rowToUpdate,
        orangTuaId: record.id,
        userId: userId,
        nama: record.nama,
      });
    } else {
      console.log(`   ❌ No match found for: Orang Tua "${record.nama}" (ID: ${record.id})`);
      console.log(`      Email: ${record.email || 'N/A'}`);
    }
  }

  console.log('');

  // Apply updates
  if (updates.length === 0) {
    console.log('⚠️  No updates to apply. No matching user accounts found.');
    console.log('\n💡 Suggestion: Create user accounts for these orang tua first, or manually link them.');
    process.exit(0);
  }

  console.log(`📝 Applying ${updates.length} update(s)...\n`);
  
  for (const update of updates) {
    const range = `Sheet1!A${update.rowIndex}:${String.fromCharCode(65 + headers.length - 1)}${update.rowIndex}`;
    const success = await updateSheetData(SHEET_ID_ORANG_TUA, range, [update.data]);
    
    if (success) {
      console.log(`   ✅ Updated: Orang Tua "${update.nama}" (ID: ${update.orangTuaId}) linked to User ID: ${update.userId}`);
    } else {
      console.log(`   ❌ Failed to update: Orang Tua "${update.nama}"`);
    }
  }

  console.log('\n✅ Orang Tua Link Fix completed!');
  console.log('\n📋 Summary:');
  console.log(`   - Total orphaned records: ${orphanedRecords.length}`);
  console.log(`   - Successfully linked: ${updates.length}`);
  console.log(`   - Remaining orphaned: ${orphanedRecords.length - updates.length}`);
  
  if (updates.length > 0) {
    console.log('\n🔄 Please refresh the application to see the changes.');
  }
}

fixOrangTuaLinks().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
