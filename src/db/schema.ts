// Database Schema Definitions for SIP-Baiturrohman
// This file defines all table structures used in the application

// ============ TYPES ============
export type UserRole = "ADMIN" | "USTADZ" | "ORANG_TUA";
export type Gender = "LAKI" | "PEREMPUAN";
export type AttendanceStatus = "HADIR" | "SAKIT" | "IZIN" | "ALPHA";
export type TahfidzQuality = "SANGAT_BAIK" | "BAIK" | "CUKUP" | "KURANG";
export type TransactionType = "TOPUP" | "DEBIT" | "KREDIT";
export type ViolationCategory = "RINGAN" | "SEDANG" | "BERAT" | "SANGAT_BERAT";

// ============ INTERFACES ============
export interface User {
  id: number;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Santri {
  id: number;
  nis: string;
  nama: string;
  orangTuaId?: number;
  jenisKelamin?: Gender;
  tanggalLahir?: string;
  alamat?: string;
  noTelepon?: string;
  foto?: string;
  kelas?: string;
  tahunMasuk?: string;
  saldoDompet: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ustadz {
  id: number;
  userId?: number;
  nip?: string;
  nama: string;
  jenisKelamin?: Gender;
  spesialisasi?: string;
  noTelepon?: string;
  alamat?: string;
  foto?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Kelas {
  id: number;
  nama: string;
  tingkat?: string;
  ustadzId?: number;
  createdAt: Date;
}

export interface Absensi {
  id: number;
  SantriId?: number;
  ustadzId?: number;
  tanggal: string;
  status: AttendanceStatus;
  keterangan?: string;
  createdAt: Date;
}

export interface SetoranHafalan {
  id: number;
  SantriId?: number;
  ustadzId?: number;
  tanggal: string;
  namaSurat: string;
  ayat: string;
  mulaiAyat?: number;
  akhirAyat?: number;
  kualitas?: TahfidzQuality;
  nilai?: number;
  catatan?: string;
  createdAt: Date;
}

export interface Transaksi {
  id: number;
  SantriId?: number;
  ustadzId?: number;
  adminId?: number;
  tanggal: string;
  waktu: string;
  jenis: TransactionType;
  nominal: number;
  kategori?: string;
  deskripsi?: string;
  saldoSebelum?: number;
  saldoSetelah?: number;
  createdAt: Date;
}

export interface Pelanggaran {
  id: number;
  SantriId?: number;
  ustadzId?: number;
  tanggal: string;
  jenisPelanggaran: string;
  kategori?: ViolationCategory;
  poinSanksi?: number;
  tindakan?: string;
  catatan?: string;
  sudahDilaporkan: boolean;
  createdAt: Date;
}

export interface KategoriPelanggaran {
  id: number;
  nama: string;
  kategori?: ViolationCategory;
  poin?: number;
  createdAt: Date;
}

export interface Notifikasi {
  id: number;
  userId?: number;
  judul: string;
  pesan: string;
  tipe?: string;
  sudahDibaca: boolean;
  createdAt: Date;
}

// ============ ENUMS ============
export const roleEnum = {
  ADMIN: "ADMIN",
  USTADZ: "USTADZ",
  ORANG_TUA: "ORANG_TUA",
} as const;

export const genderEnum = {
  LAKI: "LAKI",
  PEREMPUAN: "PEREMPUAN",
} as const;

export const attendanceStatusEnum = {
  HADIR: "HADIR",
  SAKIT: "SAKIT",
  IZIN: "IZIN",
  ALPHA: "ALPHA",
} as const;

export const tahfidzQualityEnum = {
  SANGAT_BAIK: "SANGAT_BAIK",
  BAIK: "BAIK",
  CUKUP: "CUKUP",
  KURANG: "KURANG",
} as const;

export const transactionTypeEnum = {
  TOPUP: "TOPUP",
  DEBIT: "DEBIT",
  KREDIT: "KREDIT",
} as const;

export const violationTypeEnum = {
  RINGAN: "RINGAN",
  SEDANG: "SEDANG",
  BERAT: "BERAT",
  SANGAT_BERAT: "SANGAT_BERAT",
} as const;
