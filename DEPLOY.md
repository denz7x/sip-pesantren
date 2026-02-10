# Panduan Deployment SIP Pesantren ke Vercel

## Prasyarat
- Akun GitHub
- Akun Vercel (bisa login dengan GitHub)
- Project SIP Pesantren sudah siap

## Catatan Penting
Aplikasi ini menggunakan **Server-Side Rendering (SSR)** karena memerlukan:
- API routes dengan cookies untuk authentication
- Dynamic rendering untuk session management

Jadi deployment menggunakan mode **serverless functions** di Vercel, bukan static export.

## Langkah 1: Push ke GitHub

### 1.1 Inisialisasi Git (jika belum)
```bash
cd 5c545958-637b-416e-a3eb-5dcf940bcaca
git init
```

### 1.2 Buat Repository di GitHub
1. Buka https://github.com/new
2. Isi nama repository: `sip-pesantren` (atau nama lain)
3. Pilih visibility: Public atau Private
4. Klik "Create repository"

### 1.3 Push Kode ke GitHub
```bash
# Tambahkan semua file
git add .

# Commit
git commit -m "Initial commit - SIP Pesantren ready for deployment"

# Tambahkan remote (ganti username dengan username GitHub Anda)
git remote add origin https://github.com/username/sip-pesantren.git

# Push ke GitHub
git push -u origin main
```

## Langkah 2: Deploy ke Vercel

### 2.1 Login ke Vercel
1. Buka https://vercel.com
2. Klik "Sign Up" atau "Login"
3. Pilih "Continue with GitHub"
4. Authorize Vercel untuk mengakses repository GitHub Anda

### 2.2 Import Project
1. Di dashboard Vercel, klik "Add New Project"
2. Cari dan pilih repository `sip-pesantren`
3. Klik "Import"

### 2.3 Konfigurasi Project
Vercel akan otomatis mendeteksi Next.js dengan konfigurasi default:

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Build Command | `npm run build` |
| Output Directory | (biarkan default - Next.js akan handle) |
| Install Command | `npm install` |

**Catatan:** Jangan ubah Output Directory karena aplikasi menggunakan SSR, bukan static export.

Klik "Deploy"


### 2.4 Tunggu Build Selesai
- Vercel akan build project (biasanya 2-5 menit)
- Jika berhasil, Anda akan mendapatkan URL seperti:
  - `https://sip-pesantren.vercel.app`
  - Atau `https://sip-pesantren-username.vercel.app`

## Langkah 3: Environment Variables

Setelah deploy berhasil, Anda perlu menambahkan environment variables:

### 3.1 Buka Project Settings
1. Di dashboard Vercel, klik project Anda
2. Klik tab "Settings"
3. Pilih "Environment Variables" di sidebar

### 3.2 Tambahkan Variables
Tambahkan semua variable dari `.env.local`:

| Name | Value |
|------|-------|
| `GOOGLE_SHEETS_CLIENT_EMAIL` | `sip-sheets-service@sip-pesantren-db.iam.gserviceaccount.com` |
| `GOOGLE_SHEETS_PRIVATE_KEY` | `-----BEGIN PRIVATE KEY-----\nMIIEvQ...` (copy dari .env.local) |
| `SHEET_ID_SANTRI` | `1IJK123LMN456OPQ789RST` |
| `SHEET_ID_USTADZ` | `1ABC...` |
| `SHEET_ID_ABSENSI` | `1DEF...` |
| `SHEET_ID_TRANSAKSI` | `1GHI...` |
| `SHEET_ID_PELANGGARAN` | `1JKL...` |
| `SHEET_ID_HAFALAN` | `1MNO...` |

**Catatan Penting untuk PRIVATE KEY:**
- Pastikan formatnya benar dengan `\n` untuk newlines
- Atau copy langsung dari file JSON service account

### 3.3 Redeploy
Setelah menambahkan environment variables:
1. Klik tab "Deployments"
2. Klik "..." (titik tiga) di deployment terbaru
3. Pilih "Redeploy"
4. Centang "Use existing Build Cache"
5. Klik "Redeploy"

## Langkah 4: Custom Domain (Opsional)

Jika Anda punya domain sendiri:

### 4.1 Tambahkan Domain
1. Di project settings, pilih "Domains"
2. Masukkan domain Anda (contoh: `sip.baiturrohman.sch.id`)
3. Ikuti instruksi untuk setup DNS

### 4.2 Setup DNS
Tambahkan record di DNS provider Anda:

| Type | Name | Value |
|------|------|-------|
| A | @ | 76.76.21.21 |
| CNAME | www | cname.vercel-dns.com |

## Troubleshooting

### Error: "Cannot find module" saat build
```bash
# Pastikan dependencies terinstall
npm install
```

### Error: "Route with dynamic = error couldn't be rendered statically"
Ini terjadi karena aplikasi menggunakan cookies untuk authentication. Solusi:
- Pastikan `next.config.ts` tidak menggunakan `output: 'export'`
- Vercel akan otomatis menggunakan serverless functions untuk API routes

### Error: "GOOGLE_SHEETS_PRIVATE_KEY" format
Pastikan private key di environment variables Vercel memiliki format yang benar:
- Harus include `-----BEGIN PRIVATE KEY-----` dan `-----END PRIVATE KEY-----`
- Newlines harus diganti dengan `\n`

### Error: "The caller does not have permission"
Pastikan service account email sudah di-share ke semua Google Sheets dengan role "Editor".

### Error: "Function invocation failed" atau timeout
API routes yang memanggil Google Sheets mungkin memerlukan waktu lebih lama. Di Vercel:
- Dashboard → Project Settings → Functions
- Increase "Function Max Duration" menjadi 30 detik (untuk plan Pro) atau 10 detik (hobby plan)


## Update Deployment

Setelah ada perubahan kode:

```bash
# Commit perubahan
git add .
git commit -m "Update: deskripsi perubahan"
git push origin main
```

Vercel akan otomatis redeploy ketika ada push ke main branch.

## Kontak Support

Jika ada masalah:
1. Check logs di Vercel dashboard → "Deployments" → Klik deployment → "Build Logs"
2. Pastikan semua environment variables sudah benar
3. Verifikasi Google Sheets API permissions

---

**Selamat! Aplikasi SIP Pesantren Anda sekarang bisa diakses publik! 🎉**
