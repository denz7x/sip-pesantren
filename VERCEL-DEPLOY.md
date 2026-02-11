# 🚀 Panduan Deployment ke Vercel

## 📋 Prasyarat
- Akun GitHub (sudah ada)
- Akun Vercel (gratis, daftar di [vercel.com](https://vercel.com))
- Project SIP Pesantren sudah di-push ke GitHub

---

## 🎯 Langkah 1: Push ke GitHub

Jika belum push, jalankan:

```bash
cd 5c545958-637b-416e-a3eb-5dcf940bcaca

# Inisialisasi git (jika belum)
git init

# Tambahkan semua file
git add .

# Commit
git commit -m "Ready for Vercel deployment"

# Push ke GitHub (ganti dengan username Anda)
git remote add origin https://github.com/username/sip-pesantren.git
git push -u origin main
```

---

## 🎯 Langkah 2: Setup Vercel

### 2.1 Login ke Vercel
1. Buka [vercel.com](https://vercel.com)
2. Klik "Sign Up" dan pilih "Continue with GitHub"
3. Authorize Vercel untuk mengakses repository GitHub Anda

### 2.2 Import Project
1. Di dashboard Vercel, klik **"Add New..."** → **"Project"**
2. Cari repository `sip-pesantren` di daftar
3. Klik **"Import"**

### 2.3 Konfigurasi Build
Vercel akan otomatis mendeteksi Next.js. Pastikan setting berikut:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `5c545958-637b-416e-a3eb-5dcf940bcaca` (jika project di subfolder) |
| **Build Command** | `npm run build` |
| **Output Directory** | (biarkan default) |
| **Install Command** | `npm install` |

> ⚠️ **Penting**: Jika project Anda berada di subfolder `5c545958-637b-416e-a3eb-5dcf940bcaca`, pastikan untuk mengatur **Root Directory** ke folder tersebut!

### 2.4 Environment Variables
Tambahkan semua variabel dari `.env.local`:

Klik **"Environment Variables"** dan tambahkan:

```
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...
SHEET_ID_SANTRI=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
SHEET_ID_USTADZ=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
SHEET_ID_ABSENSI=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
SHEET_ID_TRANSAKSI=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
SHEET_ID_PELANGGARAN=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
SHEET_ID_HAFALAN=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
SHEET_ID_ORANG_TUA=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
SHEET_ID_USERS=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms
```

> 🔐 **Tips**: Untuk `GOOGLE_SHEETS_PRIVATE_KEY`, pastikan formatnya benar dengan `\n` untuk newlines.

### 2.5 Deploy
Klik **"Deploy"** dan tunggu proses build selesai (biasanya 2-5 menit).

---

## 🎯 Langkah 3: Verifikasi Deployment

### 3.1 Cek Build Logs
Jika ada error, cek logs di:
- Dashboard Vercel → Project → **"Deployments"** → Klik deployment terbaru → **"Build Logs"**

### 3.2 Test Login
Buka URL deployment (contoh: `https://sip-pesantren.vercel.app`) dan test login dengan:
- **Admin**: `admin@baiturrohman.sch.id` / `admin123`
- **Ustadz**: `ustadz@baiturrohman.sch.id` / `ustadz123`
- **Orang Tua**: `ortu@baiturrohman.sch.id` / `ortu123`

---

## 🔧 Troubleshooting

### Error: "connect ECONNREFUSED 127.0.0.1:3000"
**Solusi**: Ini terjadi karena Google Sheets auth gagal. Pastikan:
1. Environment variables sudah benar di Vercel
2. Service account email sudah di-share ke semua Google Sheets
3. Private key format benar (dengan `\n`)

### Error: "The caller does not have permission"
**Solusi**: 
1. Buka setiap Google Sheet
2. Klik **"Share"**
3. Tambahkan service account email dengan role **"Editor"**

### Error: "Invalid credentials"
**Solusi**: 
- Periksa `GOOGLE_SHEETS_PRIVATE_KEY` - pastikan tidak ada karakter ekstra
- Format yang benar: `-----BEGIN PRIVATE KEY-----\nMIIE...` (satu baris dengan `\n`)

### Build Gagal
**Solusi**:
```bash
# Coba build lokal dulu
cd 5c545958-637b-416e-a3eb-5dcf940bcaca
npm run build
```
Perbaiki error yang muncul, lalu push ulang.

---

## 🌐 Custom Domain (Opsional)

Jika ingin domain sendiri (contoh: `siap.baiturrohman.sch.id`):

1. Di Vercel Dashboard → Project → **"Settings"** → **"Domains"**
2. Masukkan domain Anda
3. Ikuti instruksi untuk setup DNS (tambahkan CNAME record)
4. Tunggu propagasi DNS (biasanya 24-48 jam)

---

## 🔄 Auto-Deploy

Vercel akan otomatis deploy setiap kali Anda push ke GitHub:
```bash
git add .
git commit -m "Update fitur baru"
git push origin main
```

Vercel akan mendeteksi push dan melakukan redeploy otomatis!

---

## 📞 Butuh Bantuan?

Jika mengalami masalah:
1. Cek **Build Logs** di Vercel Dashboard
2. Pastikan semua environment variables sudah benar
3. Verifikasi Google Sheets API sudah di-enable
4. Cek service account sudah di-share ke semua spreadsheets

---

## ✅ Checklist Pre-Deployment

- [ ] Project sudah di-push ke GitHub
- [ ] Environment variables sudah disiapkan
- [ ] Google Sheets API enabled
- [ ] Service account sudah di-share ke semua spreadsheets
- [ ] Build lokal berhasil (`npm run build`)
- [ ] Login lokal berfungsi

**Setelah deploy berhasil, aplikasi Anda akan live di URL Vercel! 🎉**
