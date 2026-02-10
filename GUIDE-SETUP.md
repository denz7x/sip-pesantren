# Panduan Setup Google Sheets sebagai Database

## Langkah 1: Setup Google Cloud Project

### 1.1 Buat Project Baru
1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Klik "Select a project" di header
3. Klik "New Project"
4. Masukkan nama project: `sip-pesantren-db`
5. Klik "Create"

### 1.2 Enable Google Sheets API
1. Di Google Cloud Console, buka menu hamburger (☰)
2. Pilih "APIs & Services" > "Library"
3. Cari "Google Sheets API"
4. Klik "Google Sheets API"
5. Klik "Enable"

### 1.3 Buat Service Account
1. Pilih "APIs & Services" > "Credentials"
2. Klik "Create Credentials" > "Service Account"
3. Masukkan detail:
   - Service account name: `sip-sheets-service`
   - Service account ID: `sip-sheets-service`
   - Description: `Service account for SIP Pesantren Google Sheets database`
4. Klik "Create and Continue"
5. Skip role assignment (klik "Done")

### 1.4 Generate Private Key
1. Di halaman "Credentials", klik service account yang baru dibuat
2. Pilih tab "Keys"
3. Klik "Add Key" > "Create new key"
4. Pilih format "JSON"
5. Klik "Create" - file JSON akan terdownload otomatis

## Langkah 2: Setup Google Sheets

### 2.1 Buat Spreadsheets
Buat 8 spreadsheet terpisah untuk setiap tabel:

1. **Santri Database**: https://sheets.google.com/create?title=SIP-Santri
2. **Ustadz Database**: https://sheets.google.com/create?title=SIP-Ustadz
3. **Absensi Database**: https://sheets.google.com/create?title=SIP-Absensi
4. **Transaksi Database**: https://sheets.google.com/create?title=SIP-Transaksi
5. **Pelanggaran Database**: https://sheets.google.com/create?title=SIP-Pelanggaran
6. **Hafalan Database**: https://sheets.google.com/create?title=SIP-Hafalan
7. **Orang Tua Database**: https://sheets.google.com/create?title=SIP-OrangTua
8. **Users Database**: https://sheets.google.com/create?title=SIP-Users


### 2.2 Share Spreadsheets dengan Service Account
Untuk setiap spreadsheet:
1. Klik tombol "Share" (hijau)
2. Masukkan email service account (dari file JSON yang didownload)
3. Berikan role "Editor"
4. Klik "Share"

### 2.3 Dapatkan Spreadsheet ID
Dari URL setiap spreadsheet, copy ID-nya:
```
https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
```

## Langkah 3: Konfigurasi Environment Variables

### 3.1 Update .env.local
Buka file `.env.local` dan update dengan data sebenarnya:

```env
# Google Sheets API Configuration
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"
GOOGLE_SHEETS_CLIENT_EMAIL="sip-sheets-service@sip-pesantren-db.iaNaNFGH"

# Spreadsheet IDs
SHEET_ID_SANTRI="1ABC123DEF456GHI789JKL"
SHEET_ID_USTADZ="1MNO123PQR456STU789VWX"
SHEET_ID_ABSENSI="1YZA123BCD456EFG789HIJ"
SHEET_ID_TRANSAKSI="1KLM123NOP456QRS789TUV"
SHEET_ID_PELANGGARAN="1WXY123ZAB456CDE789FGH"
SHEET_ID_HAFALAN="1IJK123LMN456OPQ789RST"
SHEET_ID_ORANG_TUA="1UVW123XYZ456ABC789DEF"
SHEET_ID_USERS="1GHI123JKL456MNO789PQR"
```

**Catatan**: Untuk private key, copy seluruh isi dari file JSON yang didownload, termasuk tanda petik dan \n.


## Langkah 4: Setup Database Schema

### 4.1 Jalankan Setup Script
```bash
cd 5c545958-637b-416e-a3eb-5dcf940bcaca
node scripts/setup-sheets.js
```

Script ini akan membuat headers dan data sample di setiap spreadsheet.

## Langkah 5: Test Integrasi

### 5.1 Jalankan Aplikasi
```bash
npm run dev
```

### 5.2 Test Koneksi
Buka halaman admin/santri untuk melihat apakah data ter-load dari Google Sheets.

## Troubleshooting

### Error: "The caller does not have permission"
- Pastikan service account sudah di-share dengan role "Editor" di semua spreadsheet
- Pastikan spreadsheet ID sudah benar

### Error: "Invalid credentials"
- Pastikan private key dan client email sudah benar di .env.local
- Pastikan tidak ada spasi ekstra atau karakter yang missing

### Error: "Spreadsheet not found"
- Pastikan spreadsheet ID sudah benar
- Pastikan spreadsheet belum dihapus

## Struktur Data Spreadsheet

### Santri Sheet (Sheet1)
| Column | Header | Type | Contoh |
|--------|--------|------|--------|
| A | id | number | 1 |
| B | nis | string | 2024001 |
| C | nama | string | Ahmad Santoso |
| D | orangTuaId | number | 1 |
| E | jenisKelamin | string | LAKI |
| F | tanggalLahir | string | 2008-01-15 |
| G | alamat | string | Jl. Sudirman No. 1 |
| H | noTelepon | string | 08123456789 |
| I | foto | string |  |
| J | kelas | string | Kelas 1 |
| K | tahunMasuk | string | 2024 |
| L | saldoDompet | number | 350000 |
| M | isActive | boolean | true |
| N | createdAt | date | 2024-01-01 |
| O | updatedAt | date | 2024-01-01 |

### Ustadz Sheet (Sheet1)
| Column | Header | Type | Contoh |
|--------|--------|------|--------|
| A | id | number | 1 |
| B | userId | number | 1 |
| C | nip | string | UST001 |
| D | nama | string | Ustadz Ahmad |
| E | jenisKelamin | string | LAKI |
| F | spesialisasi | string | Tahfidz |
| G | noTelepon | string | 08123456789 |
| H | alamat | string | Jl. Malioboro |
| I | foto | string |  |
| J | isActive | boolean | true |
| K | createdAt | date | 2024-01-01 |
| L | updatedAt | date | 2024-01-01 |

### Orang Tua Sheet (Sheet1)
| Column | Header | Type | Contoh |
|--------|--------|------|--------|
| A | id | number | 1 |
| B | userId | number | 3 |
| C | nama | string | Bapak Ahmad |
| D | noTelepon | string | 081234567890 |
| E | alamat | string | Jl. Sudirman No. 1 |
| F | isActive | boolean | true |
| G | createdAt | date | 2024-01-01 |
| H | updatedAt | date | 2024-01-01 |

### Users Sheet (Sheet1)
| Column | Header | Type | Contoh |
|--------|--------|------|--------|
| A | id | number | 1 |
| B | email | string | admin@pesantren.com |
| C | password | string | admin123 |
| D | role | string | ADMIN |
| E | name | string | Administrator |
| F | isActive | boolean | true |
| G | createdAt | date | 2024-01-01 |
| H | updatedAt | date | 2024-01-01 |

**Role yang tersedia:**
- `ADMIN` - Pengelola sistem (akses penuh)
- `USTADZ` - Guru/ustadz (input data santri)
- `ORANG_TUA` - Orang tua santri (monitoring anak)

**Default Users:**
| Email | Password | Role |
|-------|----------|------|
| admin@pesantren.com | admin123 | ADMIN |
| ustadz@pesantren.com | ustadz123 | USTADZ |
| ortu@pesantren.com | ortu123 | ORANG_TUA |

Dan seterusnya untuk tabel lainnya...


## Support

Jika mengalami kesulitan, periksa:
1. Console log di terminal untuk error messages
2. Network tab di browser dev tools
3. Google Cloud Console untuk status API
