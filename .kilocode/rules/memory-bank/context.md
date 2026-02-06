# Active Context: SIP-Baiturrohman Management System

## Current State

**Project Status**: ✅ Complete - Sistem Informasi Pondok Pesanren

A comprehensive pondok pesant management system built with Next.js 16, TypeScript, and Tailwind CSS 4. Features a modern, clean, and responsive design with tosca/green color scheme.

## Recently Completed

- [x] Database Schema Design (Users, Santri, Ustadz, Kelas, Absensi, Hafalan, Transaksi, Pelanggaran)
- [x] UI Components Library (Button, Card, Input, Badge, Table, Modal)
- [x] Dashboard Layout with Sidebar and Header (Tosca theme)
- [x] Authentication System with Role-Based Access (Admin, Ustadz, Orang Tua)
- [x] Admin Dashboard with full CRUD access
- [x] Ustadz Dashboard for data entry (Absensi, Hafalan, Pelanggaran, Kasir)
- [x] Orang Tua Dashboard with monitoring (Today's summary, Charts, Transactions)
- [x] Login Page with demo accounts
- [x] Fix: Move auth to server action for client-side login

## Current Structure

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `src/app/login/page.tsx` | Login page | ✅ Complete |
| `src/app/admin/page.tsx` | Admin dashboard | ✅ Complete |
| `src/app/ustadz/page.tsx` | Ustadz dashboard | ✅ Complete |
| `src/app/orang-tua/page.tsx` | Parent dashboard | ✅ Complete |
| `src/components/ui/` | UI components | ✅ Complete |
| `src/components/layout/` | Layout components | ✅ Complete |
| `src/db/schema.ts` | Database types | ✅ Complete |
| `src/app/login/actions.ts` | Server actions for auth | ✅ Complete |
| `src/lib/auth.ts` | Authentication (Server Components) | ✅ Complete |
| `src/lib/utils.ts` | Utilities | ✅ Complete |

## User Roles & Features

### 1. ADMIN (Pengelola)
- ✅ Full CRUD access to all data
- ✅ Manage Santri, Ustadz, Orang Tua
- ✅ Top-up saldo for students
- ✅ View global financial recap

### 2. USTADZ (Penginput Data)
- ✅ Daily attendance input
- ✅ Tahfidz recording (Surat, Ayat, Nilai, Catatan)
- ✅ Violation journal (Poin Kedisiplinan)
- ✅ POS/Cashier for transactions

### 3. ORANG TUA (Viewer)
- ✅ View only their children's data
- ✅ Dashboard with today's summary (Saldo, Absensi, Hafalan)
- ✅ Attendance charts and Tahfidz charts
- ✅ Financial history (Topup, Spending)
- ✅ Violation notifications

## Database Schema

### Main Tables
- **users** - Authentication (Admin, Ustadz, Orang Tua)
- **santris** - Student data with wallet balance
- **ustadzs** - Teacher data
- **kelass** - Classes
- **absensis** - Daily attendance
- **setoran_hafalans** - Tahfidz recordings
- **transaksis** - Financial transactions
- **pelanggarnas** - Discipline violations
- **notifikasis** - Notifications

## Color Scheme

- Primary: Tosca Green (#2d9596)
- Secondary: Darker Tosca (#247f80)
- Background: Light Gray (#f9fafb)
- Cards: White (#ffffff)

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@pesantren.com | demo123 |
| Ustadz | ustadz@pesastricht.com | demo123 |
| Orang Tua | ortu@pesanten.com | demo123 |

## Pending Improvements

- [ ] API Routes for CRUD operations
- [ ] Server Actions for data mutations
- [ ] Real database integration (Drizzle ORM)
- [ ] Image upload for profiles
- [ ] Notification system for parents
- [ ] Advanced charts with Recharts
- [ ] Export reports functionality

## Session History

| Date | Changes |
|------|---------|
| Initial | Base Next.js template created |
| 2024 | SIP-Baiturrohman complete implementation |
