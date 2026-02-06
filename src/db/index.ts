// Database client - Using Drizzle ORM with SQLite
// Note: In production, this will be provided by @kilocode/app-builder-db
// For now, using simple mock database for development

import type { User, Santri, Ustadz, Absensi, SetoranHafalan, Transaksi, Pelanggaran, Notifikasi } from "./schema";

// Mock database for demo purposes
export const mockDb = {
  users: [] as User[],
  santris: [] as Santri[],
  ustadzs: [] as Ustadz[],
  absensis: [] as Absensi[],
  setoranHafalans: [] as SetoranHafalan[],
  transaksis: [] as Transaksi[],
  pelanggarnas: [] as Pelanggaran[],
  notifikasis: [] as Notifikasi[],
};

// Export for use in server components
export const db = {
  select: () => mockDb,
  insert: () => mockDb,
  update: () => mockDb,
  delete: () => mockDb,
} as const;
