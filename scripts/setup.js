#!/usr/bin/env node

/**
 * SIP Pesantren - Comprehensive Setup Script
 * 
 * This script automates the setup process for the SIP Pesantren application.
 * It validates prerequisites, checks environment variables, tests Google API
 * connectivity, and initializes the Google Sheets database.
 * 
 * Usage: node scripts/setup.js
 */

const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper functions for colored output
const log = {
  info: (msg) => console.log(`${colors.blue}ℹ ${colors.reset}${msg}`),
  success: (msg) => console.log(`${colors.green}✓ ${colors.reset}${msg}`),
  error: (msg) => console.log(`${colors.red}✗ ${colors.reset}${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠ ${colors.reset}${msg}`),
  step: (msg) => console.log(`\n${colors.cyan}${colors.bright}▶ ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.magenta}${colors.bright}${'='.repeat(60)}${colors.reset}\n${colors.magenta}${colors.bright}  ${msg}${colors.reset}\n${colors.magenta}${colors.bright}${'='.repeat(60)}${colors.reset}`),
};

// Required environment variables
const requiredEnvVars = [
  'GOOGLE_SHEETS_CLIENT_EMAIL',
  'GOOGLE_SHEETS_PRIVATE_KEY',
  'SHEET_ID_SANTRI',
  'SHEET_ID_USTADZ',
  'SHEET_ID_ABSENSI',
  'SHEET_ID_TRANSAKSI',
  'SHEET_ID_PELANGGARAN',
  'SHEET_ID_HAFALAN',
];

// Sheet configurations
const sheetConfigs = {
  santris: {
    name: 'Santri Database',
    id: process.env.SHEET_ID_SANTRI,
    headers: ['id', 'nis', 'nama', 'orangTuaId', 'jenisKelamin', 'tanggalLahir', 'alamat', 'noTelepon', 'foto', 'kelas', 'tahunMasuk', 'saldoDompet', 'isActive', 'createdAt', 'updatedAt'],
    sampleData: [
      [1, '2024001', 'Ahmad Santoso', null, 'LAKI', '2010-01-15', 'Jl. Sudirman No. 1', '081234567890', null, 'Kelas 1', '2024', 350000, true, '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'],
      [2, '2024002', 'Fatimah Azzahra', null, 'PEREMPUAN', '2010-03-20', 'Jl. Thamrin No. 2', '081234567891', null, 'Kelas 2', '2024', 280000, true, '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'],
      [3, '2024003', 'Muhammad Yusuf', null, 'LAKI', '2009-12-10', 'Jl. Malioboro No. 3', '081234567892', null, 'Kelas 3', '2024', 420000, true, '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'],
    ]
  },
  ustadzs: {
    name: 'Ustadz Database',
    id: process.env.SHEET_ID_USTADZ,
    headers: ['id', 'userId', 'nip', 'nama', 'email', 'jenisKelamin', 'spesialisasi', 'noTelepon', 'alamat', 'foto', 'isActive', 'createdAt', 'updatedAt'],
    sampleData: [
      [1, null, 'UST001', 'Ustadz Ahmad', 'ustadz.ahmad@gmail.com', 'LAKI', 'Tahfidz', '081234567893', 'Jl. Masjid No. 1', null, true, '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'],
      [2, null, 'UST002', 'Ustadzah Siti', 'ustadzah.siti@yahoo.com', 'PEREMPUAN', 'Akhlak', '081234567894', 'Jl. Masjid No. 2', null, true, '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'],
    ]
  },
  absensis: {
    name: 'Absensi Database',
    id: process.env.SHEET_ID_ABSENSI,
    headers: ['id', 'SantriId', 'ustadzId', 'tanggal', 'status', 'keterangan', 'createdAt'],
    sampleData: [
      [1, 1, 1, '2024-01-15', 'HADIR', null, '2024-01-15T00:00:00Z'],
      [2, 2, 1, '2024-01-15', 'HADIR', null, '2024-01-15T00:00:00Z'],
      [3, 3, 2, '2024-01-15', 'SAKIT', 'Demam', '2024-01-15T00:00:00Z'],
    ]
  },
  transaksis: {
    name: 'Transaksi Database',
    id: process.env.SHEET_ID_TRANSAKSI,
    headers: ['id', 'SantriId', 'ustadzId', 'adminId', 'tanggal', 'waktu', 'jenis', 'nominal', 'kategori', 'deskripsi', 'saldoSebelum', 'saldoSetelah', 'createdAt'],
    sampleData: [
      [1, 1, null, null, '2024-01-10', '08:00:00', 'TOPUP', 50000, 'Tabungan', 'Setoran bulanan', 300000, 350000, '2024-01-10T08:00:00Z'],
      [2, 2, null, null, '2024-01-10', '08:15:00', 'TOPUP', 50000, 'Tabungan', 'Setoran bulanan', 230000, 280000, '2024-01-10T08:15:00Z'],
      [3, 3, null, null, '2024-01-10', '08:30:00', 'TOPUP', 50000, 'Tabungan', 'Setoran bulanan', 370000, 420000, '2024-01-10T08:30:00Z'],
    ]
  },
  pelanggarans: {
    name: 'Pelanggaran Database',
    id: process.env.SHEET_ID_PELANGGARAN,
    headers: ['id', 'SantriId', 'ustadzId', 'tanggal', 'jenisPelanggaran', 'kategori', 'poinSanksi', 'tindakan', 'catatan', 'sudahDilaporkan', 'createdAt'],
    sampleData: [
      [1, 1, 1, '2024-01-12', 'Terlambat masuk kelas', 'RINGAN', 5, 'Teguran lisan', 'Terlambat 15 menit', true, '2024-01-12T00:00:00Z'],
    ]
  },
  setoranHafalans: {
    name: 'Hafalan Database',
    id: process.env.SHEET_ID_HAFALAN,
    headers: ['id', 'SantriId', 'ustadzId', 'tanggal', 'namaSurat', 'ayat', 'mulaiAyat', 'akhirAyat', 'kualitas', 'nilai', 'catatan', 'createdAt'],
    sampleData: [
      [1, 1, 1, '2024-01-14', 'Al-Fatihah', '1-7', 1, 7, 'BAIK', 85, 'Lancar tapi perlu lebih fasih', '2024-01-14T00:00:00Z'],
      [2, 2, 2, '2024-01-14', 'An-Naba', '1-10', 1, 10, 'SANGAT_BAIK', 95, 'Sangat bagus', '2024-01-14T00:00:00Z'],
    ]
  }
};

// Setup results tracking
const setupResults = {
  prerequisites: false,
  environment: false,
  googleAuth: false,
  sheets: {},
  errors: [],
};

/**
 * Step 1: Check Prerequisites
 */
async function checkPrerequisites() {
  log.step('Step 1: Checking Prerequisites');
  
  let allPassed = true;

  // Check Node.js version
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  log.info(`Node.js version: ${nodeVersion}`);
  
  if (majorVersion < 18) {
    log.error('Node.js version 18 or higher is required');
    allPassed = false;
  } else {
    log.success('Node.js version is compatible');
  }

  // Check if running from correct directory
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    log.error('package.json not found. Please run this script from the project root directory.');
    allPassed = false;
  } else {
    log.success('Running from project root directory');
  }

  // Check required npm packages
  const requiredPackages = ['googleapis', 'dotenv'];
  for (const pkg of requiredPackages) {
    try {
      require.resolve(pkg);
      log.success(`Package '${pkg}' is installed`);
    } catch (e) {
      log.error(`Package '${pkg}' is not installed. Run: npm install`);
      allPassed = false;
    }
  }

  setupResults.prerequisites = allPassed;
  return allPassed;
}

/**
 * Step 2: Load and Validate Environment Variables
 */
async function validateEnvironment() {
  log.step('Step 2: Validating Environment Variables');

  // Load .env.local
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    log.error('.env.local file not found!');
    log.info('Please create .env.local file based on .env.example or GUIDE-SETUP.md');
    setupResults.environment = false;
    return false;
  }

  // Load dotenv
  require('dotenv').config({ path: './.env.local' });

  let allValid = true;
  const missing = [];

  // Check required variables
  for (const envVar of requiredEnvVars) {
    const value = process.env[envVar];
    if (!value || value.trim() === '') {
      missing.push(envVar);
      log.error(`${envVar} is not set`);
      allValid = false;
    } else {
      // Mask sensitive values
      const displayValue = envVar.includes('KEY') 
        ? '***' + value.slice(-10) 
        : value.slice(0, 20) + (value.length > 20 ? '...' : '');
      log.success(`${envVar}: ${displayValue}`);
    }
  }

  if (missing.length > 0) {
    log.error(`\nMissing environment variables: ${missing.join(', ')}`);
    log.info('Please set these variables in your .env.local file');
  }

  // Validate private key format
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY;
  if (privateKey) {
    if (!privateKey.includes('BEGIN PRIVATE KEY') || !privateKey.includes('END PRIVATE KEY')) {
      log.error('GOOGLE_SHEETS_PRIVATE_KEY format appears invalid');
      log.info('Make sure to include the full key with BEGIN/END markers');
      allValid = false;
    } else {
      log.success('Private key format appears valid');
    }
  }

  // Validate spreadsheet IDs format
  const sheetIds = [
    process.env.SHEET_ID_SANTRI,
    process.env.SHEET_ID_USTADZ,
    process.env.SHEET_ID_ABSENSI,
    process.env.SHEET_ID_TRANSAKSI,
    process.env.SHEET_ID_PELANGGARAN,
    process.env.SHEET_ID_HAFALAN,
  ];

  for (const [index, id] of sheetIds.entries()) {
    if (id && !/^[a-zA-Z0-9_-]+$/.test(id)) {
      log.error(`Spreadsheet ID at position ${index + 1} contains invalid characters`);
      allValid = false;
    }
  }

  setupResults.environment = allValid;
  return allValid;
}

/**
 * Step 3: Test Google API Authentication
 */
async function testGoogleAuth() {
  log.step('Step 3: Testing Google API Authentication');

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // Test authentication by getting access token
    const client = await auth.getClient();
    log.success('Successfully authenticated with Google Sheets API');

    // Test API access by listing spreadsheets (if possible)
    const sheets = google.sheets({ version: 'v4', auth });
    
    // Try to access one spreadsheet to verify permissions
    const testSheetId = process.env.SHEET_ID_SANTRI;
    try {
      const response = await sheets.spreadsheets.get({
        spreadsheetId: testSheetId,
      });
      log.success(`Successfully accessed spreadsheet: ${response.data.properties.title}`);
      setupResults.googleAuth = true;
      return true;
    } catch (error) {
      if (error.message.includes('not found')) {
        log.error(`Spreadsheet with ID ${testSheetId} not found`);
        log.info('Please verify the spreadsheet ID and ensure the spreadsheet exists');
      } else if (error.message.includes('permission')) {
        log.error('Permission denied. Make sure to share the spreadsheet with the service account email');
        log.info(`Service account: ${process.env.GOOGLE_SHEETS_CLIENT_EMAIL}`);
      } else {
        log.error(`API Error: ${error.message}`);
      }
      setupResults.googleAuth = false;
      return false;
    }
  } catch (error) {
    log.error(`Authentication failed: ${error.message}`);
    if (error.message.includes('invalid_grant')) {
      log.info('The private key or client email may be incorrect. Please check your credentials.');
    }
    setupResults.googleAuth = false;
    return false;
  }
}

/**
 * Step 4: Setup Database Schema
 */
async function setupDatabase() {
  log.step('Step 4: Setting up Database Schema');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  for (const [key, config] of Object.entries(sheetConfigs)) {
    log.info(`\nSetting up ${config.name}...`);
    
    try {
      // Get spreadsheet info
      const spreadsheet = await sheets.spreadsheets.get({
        spreadsheetId: config.id,
      });

      const sheetName = spreadsheet.data.sheets[0].properties.title;
      log.info(`Using sheet: ${sheetName}`);

      // Clear existing data
      await sheets.spreadsheets.values.clear({
        spreadsheetId: config.id,
        range: `${sheetName}!A:Z`,
      });
      log.success('Cleared existing data');

      // Add headers
      await sheets.spreadsheets.values.update({
        spreadsheetId: config.id,
        range: `${sheetName}!A1`,
        valueInputOption: 'RAW',
        resource: {
          values: [config.headers],
        },
      });
      log.success('Added headers');

      // Add sample data
      if (config.sampleData && config.sampleData.length > 0) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: config.id,
          range: `${sheetName}!A2`,
          valueInputOption: 'RAW',
          resource: {
            values: config.sampleData,
          },
        });
        log.success(`Added ${config.sampleData.length} sample rows`);
      }

      setupResults.sheets[key] = { success: true, name: config.name };
    } catch (error) {
      log.error(`Failed to setup ${config.name}: ${error.message}`);
      setupResults.sheets[key] = { success: false, name: config.name, error: error.message };
      setupResults.errors.push({ sheet: config.name, error: error.message });
    }
  }
}

/**
 * Step 5: Verify Setup
 */
async function verifySetup() {
  log.step('Step 5: Verifying Setup');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });

  const sheets = google.sheets({ version: 'v4', auth });

  let allVerified = true;

  for (const [key, config] of Object.entries(sheetConfigs)) {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: config.id,
        range: 'A1:E1', // Just check headers
      });

      if (response.data.values && response.data.values.length > 0) {
        log.success(`${config.name}: Headers verified`);
      } else {
        log.warning(`${config.name}: No data found`);
        allVerified = false;
      }
    } catch (error) {
      log.error(`${config.name}: Verification failed - ${error.message}`);
      allVerified = false;
    }
  }

  return allVerified;
}

/**
 * Print Setup Summary
 */
function printSummary() {
  log.header('SETUP SUMMARY');

  console.log(`\n${colors.bright}Prerequisites Check:${colors.reset} ${setupResults.prerequisites ? colors.green + '✓ PASSED' : colors.red + '✗ FAILED'}${colors.reset}`);
  console.log(`${colors.bright}Environment Variables:${colors.reset} ${setupResults.environment ? colors.green + '✓ VALID' : colors.red + '✗ INVALID'}${colors.reset}`);
  console.log(`${colors.bright}Google API Auth:${colors.reset} ${setupResults.googleAuth ? colors.green + '✓ SUCCESS' : colors.red + '✗ FAILED'}${colors.reset}`);

  console.log(`\n${colors.bright}Database Sheets:${colors.reset}`);
  for (const [key, result] of Object.entries(setupResults.sheets)) {
    const status = result.success ? colors.green + '✓' : colors.red + '✗';
    console.log(`  ${status} ${result.name}${colors.reset}`);
  }

  if (setupResults.errors.length > 0) {
    console.log(`\n${colors.red}${colors.bright}Errors encountered:${colors.reset}`);
    for (const error of setupResults.errors) {
      console.log(`  ${colors.red}- ${error.sheet}: ${error.error}${colors.reset}`);
    }
  }

  const allSuccess = setupResults.prerequisites && 
                     setupResults.environment && 
                     setupResults.googleAuth && 
                     Object.values(setupResults.sheets).every(s => s.success);

  if (allSuccess) {
    console.log(`\n${colors.green}${colors.bright}✓ Setup completed successfully!${colors.reset}`);
    console.log(`\n${colors.cyan}Next steps:${colors.reset}`);
    console.log(`  1. Run the development server: ${colors.bright}npm run dev${colors.reset}`);
    console.log(`  2. Open http://localhost:3000 in your browser`);
    console.log(`  3. Login with default credentials (see login page)`);
  } else {
    console.log(`\n${colors.yellow}${colors.bright}⚠ Setup completed with warnings/errors${colors.reset}`);
    console.log(`\n${colors.cyan}Please fix the issues above and run the setup again:${colors.reset}`);
    console.log(`  ${colors.bright}node scripts/setup.js${colors.reset}`);
  }

  console.log(`\n${colors.dim}For detailed setup instructions, see GUIDE-SETUP.md${colors.reset}\n`);
}

/**
 * Interactive mode - ask user for confirmation
 */
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

/**
 * Main function
 */
async function main() {
  log.header('SIP PESANTREN - SETUP SCRIPT');
  console.log(`${colors.dim}This script will set up the SIP Pesantren application${colors.reset}`);
  console.log(`${colors.dim}Make sure you have configured .env.local before continuing${colors.reset}\n`);

  // Check if user wants to proceed
  const answer = await askQuestion(`${colors.yellow}Do you want to proceed with the setup? (y/n): ${colors.reset}`);
  if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
    console.log('\nSetup cancelled.');
    process.exit(0);
  }

  // Run setup steps
  const prerequisites = await checkPrerequisites();
  if (!prerequisites) {
    log.error('Prerequisites check failed. Please fix the issues and try again.');
    printSummary();
    process.exit(1);
  }

  const environment = await validateEnvironment();
  if (!environment) {
    log.error('Environment validation failed. Please configure .env.local properly.');
    printSummary();
    process.exit(1);
  }

  const googleAuth = await testGoogleAuth();
  if (!googleAuth) {
    log.error('Google API authentication failed. Please check your credentials.');
    printSummary();
    process.exit(1);
  }

  // Setup database
  await setupDatabase();

  // Verify setup
  await verifySetup();

  // Print summary
  printSummary();

  // Exit with appropriate code
  const allSuccess = setupResults.prerequisites && 
                     setupResults.environment && 
                     setupResults.googleAuth && 
                     Object.values(setupResults.sheets).every(s => s.success);

  process.exit(allSuccess ? 0 : 1);
}

// Run main function
main().catch(error => {
  log.error(`Unexpected error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
