const { google } = require('googleapis');
require('dotenv').config({ path: './.env.local' });

console.log('Environment variables loaded:');
console.log('GOOGLE_SHEETS_CLIENT_EMAIL:', process.env.GOOGLE_SHEETS_CLIENT_EMAIL ? 'SET' : 'NOT SET');
console.log('GOOGLE_SHEETS_PRIVATE_KEY:', process.env.GOOGLE_SHEETS_PRIVATE_KEY ? 'SET' : 'NOT SET');
console.log('SHEET_ID_SANTRI:', process.env.SHEET_ID_SANTRI);

// Google Sheets configuration
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SHEETS_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// Sheet configurations
const sheetConfigs = {
  santris: {
    id: process.env.SHEET_ID_SANTRI,
    gid: '0',
    headers: ['id', 'nis', 'nama', 'orangTuaId', 'jenisKelamin', 'tanggalLahir', 'alamat', 'noTelepon', 'foto', 'kelas', 'tahunMasuk', 'saldoDompet', 'isActive', 'createdAt', 'updatedAt'],
    sampleData: [
      [1, '2024001', 'Ahmad Santoso', null, 'LAKI', '2010-01-15', 'Jl. Sudirman No. 1', '081234567890', null, 'Kelas 1', '2024', 350000, true, '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'],
      [2, '2024002', 'Fatimah Azzahra', null, 'PEREMPUAN', '2010-03-20', 'Jl. Thamrin No. 2', '081234567891', null, 'Kelas 2', '2024', 280000, true, '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'],
      [3, '2024003', 'Muhammad Yusuf', null, 'LAKI', '2009-12-10', 'Jl. Malioboro No. 3', '081234567892', null, 'Kelas 3', '2024', 420000, true, '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'],
    ]
  },
  ustadzs: {
    id: process.env.SHEET_ID_USTADZ,
    gid: '189830710',
    headers: ['id', 'userId', 'nip', 'nama', 'email', 'jenisKelamin', 'spesialisasi', 'noTelepon', 'alamat', 'foto', 'isActive', 'createdAt', 'updatedAt'],
    sampleData: [
      [1, null, 'UST001', 'Ustadz Ahmad', 'ustadz.ahmad@gmail.com', 'LAKI', 'Tahfidz', '081234567893', 'Jl. Masjid No. 1', null, true, '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'],
      [2, null, 'UST002', 'Ustadzah Siti', 'ustadzah.siti@yahoo.com', 'PEREMPUAN', 'Akhlak', '081234567894', 'Jl. Masjid No. 2', null, true, '2024-01-01T00:00:00Z', '2024-01-01T00:00:00Z'],
    ]
  },

  absensis: {
    id: process.env.SHEET_ID_ABSENSI,
    gid: '95055288',
    headers: ['id', 'SantriId', 'ustadzId', 'tanggal', 'status', 'keterangan', 'createdAt'],
    sampleData: [
      [1, 1, 1, '2024-01-15', 'HADIR', null, '2024-01-15T00:00:00Z'],
      [2, 2, 1, '2024-01-15', 'HADIR', null, '2024-01-15T00:00:00Z'],
      [3, 3, 2, '2024-01-15', 'SAKIT', 'Demam', '2024-01-15T00:00:00Z'],
    ]
  },
  transaksis: {
    id: process.env.SHEET_ID_TRANSAKSI,
    gid: '191644107',
    headers: ['id', 'SantriId', 'ustadzId', 'adminId', 'tanggal', 'waktu', 'jenis', 'nominal', 'kategori', 'deskripsi', 'saldoSebelum', 'saldoSetelah', 'createdAt'],
    sampleData: [
      [1, 1, null, null, '2024-01-10', '08:00:00', 'TOPUP', 50000, 'Tabungan', 'Setoran bulanan', 300000, 350000, '2024-01-10T08:00:00Z'],
      [2, 2, null, null, '2024-01-10', '08:15:00', 'TOPUP', 50000, 'Tabungan', 'Setoran bulanan', 230000, 280000, '2024-01-10T08:15:00Z'],
      [3, 3, null, null, '2024-01-10', '08:30:00', 'TOPUP', 50000, 'Tabungan', 'Setoran bulanan', 370000, 420000, '2024-01-10T08:30:00Z'],
    ]
  },
  pelanggarans: {
    id: process.env.SHEET_ID_PELANGGARAN,
    gid: '1684122507',
    headers: ['id', 'SantriId', 'ustadzId', 'tanggal', 'jenisPelanggaran', 'kategori', 'poinSanksi', 'tindakan', 'catatan', 'sudahDilaporkan', 'createdAt'],
    sampleData: [
      [1, 1, 1, '2024-01-12', 'Terlambat masuk kelas', 'RINGAN', 5, 'Teguran lisan', 'Terlambat 15 menit', true, '2024-01-12T00:00:00Z'],
    ]
  },
  setoranHafalans: {
    id: process.env.SHEET_ID_HAFALAN,
    gid: '869009823',
    headers: ['id', 'SantriId', 'ustadzId', 'tanggal', 'namaSurat', 'ayat', 'mulaiAyat', 'akhirAyat', 'kualitas', 'nilai', 'catatan', 'createdAt'],
    sampleData: [
      [1, 1, 1, '2024-01-14', 'Al-Fatihah', '1-7', 1, 7, 'BAIK', 85, 'Lancar tapi perlu lebih fasih', '2024-01-14T00:00:00Z'],
      [2, 2, 2, '2024-01-14', 'An-Naba', '1-10', 1, 10, 'SANGAT_BAIK', 95, 'Sangat bagus', '2024-01-14T00:00:00Z'],
    ]
  }
};

async function setupSheet(sheetName, config) {
  try {
    console.log(`Setting up ${sheetName} sheet (ID: ${config.id})...`);

    // First, try to get the spreadsheet metadata to see available sheets
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: config.id,
    });

    console.log(`Available sheets in ${sheetName}:`, spreadsheet.data.sheets.map(s => s.properties.title));

    // Use the first sheet available
    const firstSheetName = spreadsheet.data.sheets[0].properties.title;
    console.log(`Using sheet: ${firstSheetName}`);

    // Clear existing data
    await sheets.spreadsheets.values.clear({
      spreadsheetId: config.id,
      range: `${firstSheetName}!A:Z`,
    });

    // Add headers
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.id,
      range: `${firstSheetName}!A1`,
      valueInputOption: 'RAW',
      resource: {
        values: [config.headers],
      },
    });

    // Add sample data
    if (config.sampleData && config.sampleData.length > 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: config.id,
        range: `${firstSheetName}!A2`,
        valueInputOption: 'RAW',
        resource: {
          values: config.sampleData,
        },
      });
    }

    console.log(`${sheetName} sheet setup completed!`);
  } catch (error) {
    console.error(`Error setting up ${sheetName} sheet:`, error.message);
  }
}

async function main() {
  console.log('Starting Google Sheets setup...');

  for (const [sheetName, config] of Object.entries(sheetConfigs)) {
    await setupSheet(sheetName, config);
  }

  console.log('All sheets setup completed!');
}

main().catch(console.error);
