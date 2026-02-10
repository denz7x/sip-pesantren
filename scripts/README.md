# Setup Scripts for SIP Pesantren

This directory contains setup scripts for the SIP Pesantren application.

## Main Setup Script

### `setup.js` - Comprehensive Setup Script

This is the main setup script that automates the entire setup process for the SIP Pesantren application.

#### Features

1. **Prerequisites Check**
   - Verifies Node.js version (>= 18)
   - Checks required npm packages (googleapis, dotenv)
   - Validates project structure

2. **Environment Validation**
   - Checks all required environment variables
   - Validates Google Sheets credentials format
   - Verifies spreadsheet IDs

3. **Google API Connectivity Test**
   - Tests authentication with Google Sheets API
   - Verifies service account permissions
   - Checks spreadsheet access

4. **Database Schema Setup**
   - Creates headers for all 8 database sheets
   - Adds sample data for testing
   - Verifies data structure

5. **Setup Verification**
   - Tests read operations on all sheets
   - Provides detailed summary

#### Usage

```bash
# Run the setup script
npm run setup

# Or directly with node
node scripts/setup.js
```

#### Required Environment Variables

Make sure your `.env.local` file contains these variables:

```env
# Google Sheets API Configuration
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Spreadsheet IDs
SHEET_ID_SANTRI=your-spreadsheet-id
SHEET_ID_USTADZ=your-spreadsheet-id
SHEET_ID_ABSENSI=your-spreadsheet-id
SHEET_ID_TRANSAKSI=your-spreadsheet-id
SHEET_ID_PELANGGARAN=your-spreadsheet-id
SHEET_ID_HAFALAN=your-spreadsheet-id
SHEET_ID_ORANG_TUA=your-spreadsheet-id
SHEET_ID_USERS=your-spreadsheet-id
```

#### Setup Process

1. The script will ask for confirmation before proceeding
2. It will check prerequisites and show status
3. Environment variables will be validated
4. Google API connection will be tested
5. Database schema will be set up
6. A summary will be displayed

#### Troubleshooting

**Error: "Quota exceeded"**
- Google Sheets API has rate limits (300 requests per minute)
- Wait a few minutes and try again
- Consider implementing caching for production

**Error: "The caller does not have permission"**
- Ensure service account email is added as editor to all spreadsheets
- Check that spreadsheet IDs are correct

**Error: "Invalid credentials"**
- Verify private key format in .env.local
- Ensure the key includes BEGIN/END markers
- Check for proper escaping of newlines (\n)

## Legacy Setup Script

### `setup-sheets.js` - Basic Setup Script

This is the original setup script that only sets up the database schema without validation.

```bash
node scripts/setup-sheets.js
```

## User Setup Guide

See `SETUP-USERS.md` for instructions on setting up default users in the database.
