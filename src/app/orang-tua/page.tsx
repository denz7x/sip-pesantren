"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, StatCard, CardHeader } from "@/components/ui/Card";
import { Badge, AttendanceBadge, TahfidzBadge, TransactionBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency, formatDate } from "@/lib/utils";

// Demo data for Orang Tua dashboard
const childData = {
  nama: "Ahmad Santoso",
  nis: "2024001",
  kelas: "Kelas 3",
  foto: null,
  saldo: 350000,
};

const todaySummary = {
  absensiStatus: "HADIR",
  absensiWaktu: "06:00",
  hafalanTerakhir: {
    tanggal: "2024-01-15",
    surat: "Al-Baqarah",
    ayat: "1-15",
    kualitas: "SANGAT_BAIK",
    nilai: 95,
  },
};

const recentTransactions = [
  { id: 1, tanggal: "2024-01-15", kategori: "TOPUP", nominal: 500000, saldo: 850000 },
  { id: 2, tanggal: "2024-01-15", kategori: "DEBIT", nominal: 25000, saldo: 825000, desc: "Kantin - Makan Siang" },
  { id: 3, tanggal: "2024-01-14", kategori: "DEBIT", nominal: 30000, saldo: 795000, desc: "Laundry" },
  { id: 4, tanggal: "2024-01-14", kategori: "TOPUP", nominal: 200000, saldo: 995000 },
  { id: 5, tanggal: "2024-01-13", kategori: "DEBIT", nominal: 20000, saldo: 795000, desc: "Kantin - Snack" },
];

const attendanceData = [
  { date: "01/01", hadir: 1, sakit: 0, izin: 0, alpha: 0 },
  { date: "02/01", hadir: 1, sakit: 0, izin: 0, alpha: 0 },
  { date: "03/01", hadir: 0, sakit: 1, izin: 0, alpha: 0 },
  { date: "04/01", hadir: 1, sakit: 0, izin: 0, alpha: 0 },
  { date: "05/01", hadir: 1, sakit: 0, izin: 0, alpha: 0 },
  { date: "06/01", hadir: 0, sakit: 0, izin: 1, alpha: 0 },
  { date: "07/01", hadir: 1, sakit: 0, izin: 0, alpha: 0 },
];

const hafalanData = [
  { date: "01/01", nilai: 85 },
  { date: "02/01", nilai: 90 },
  { date: "03/01", nilai: 88 },
  { date: "04/01", nilai: 95 },
  { date: "05/01", nilai: 92 },
  { date: "06/01", nilai: 87 },
  { date: "07/01", nilai: 94 },
];

const violations = [
  { tanggal: "2024-01-10", jenis: "Terlambat Shalat Subuh", kategori: "RINGAN", poin: 5 },
  { tanggal: "2024-01-05", jenis: "Tidak Membawa Kitab", kategori: "RINGAN", poin: 3 },
];

export default function OrangTuaDashboardPage() {
  const child = childData;
  const summary = todaySummary;

  return (
    <DashboardLayout
      role="ORANG_TUA"
      userName="Bapak/Ibu Ahmad"
      pageTitle="Dashboard Orang Tua"
    >
      {/* Child Info Card */}
      <div className="mb-8">
        <Card variant="elevated" className="bg-gradient-to-r from-[#2d9596] to-[#247f80] text-white">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center text-4xl font-bold">
              {child.nama.charAt(0)}
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold">{child.nama}</h2>
              <p className="text-white/80">
                {child.nis} • {child.kelas}
              </p>
            </div>
            <div className="text-center md:text-right">
              <p className="text-white/80 text-sm">Saldo Dompet</p>
              <p className="text-3xl font-bold">{formatCurrency(child.saldo)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Today's Summary */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Hari Ini</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Absensi Hari Ini */}
          <Card variant="bordered" className="text-center">
            <div className="mb-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <CalendarIcon />
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-1">Absensi Hari Ini</p>
            <AttendanceBadge status={summary.absensiStatus} />
            <p className="text-xs text-gray-500 mt-2">Waktu: {summary.absensiWaktu}</p>
          </Card>

          {/* Hafalan Terakhir */}
          <Card variant="bordered" className="text-center">
            <div className="mb-3">
              <div className="w-12 h-12 bg-[#2d9596]/10 rounded-full flex items-center justify-center mx-auto">
                <BookIcon />
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-1">Hafalan Terakhir</p>
            <p className="font-semibold text-gray-900">{summary.hafalanTerakhir.surat}</p>
            <p className="text-xs text-gray-500">Ayat {summary.hafalanTerakhir.ayat}</p>
            <div className="mt-2">
              <TahfidzBadge quality={summary.hafalanTerakhir.kualitas} />
            </div>
          </Card>

          {/* Saldo */}
          <Card variant="bordered" className="text-center">
            <div className="mb-3">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <WalletIcon />
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-1">Sisa Saldo</p>
            <p className="text-2xl font-bold text-[#2d9596]">{formatCurrency(child.saldo)}</p>
            <p className="text-xs text-gray-500 mt-1">Terakhir diperbarui: Hari ini</p>
          </Card>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Attendance Chart */}
        <Card variant="bordered">
          <CardHeader title="Grafik Kehadiran" subtitle="7 Hari terakhir" />
          <div className="h-48 flex items-end justify-between gap-2">
            {attendanceData.map((data, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col gap-0.5">
                  {data.hadir > 0 && (
                    <div
                      className="w-full bg-green-500 rounded-t"
                      style={{ height: `${data.hadir * 20}px` }}
                    />
                  )}
                  {data.sakit > 0 && (
                    <div
                      className="w-full bg-yellow-500"
                      style={{ height: `${data.sakit * 20}px` }}
                    />
                  )}
                  {data.izin > 0 && (
                    <div
                      className="w-full bg-blue-500"
                      style={{ height: `${data.izin * 20}px` }}
                    />
                  )}
                  {data.alpha > 0 && (
                    <div
                      className="w-full bg-red-500 rounded-b"
                      style={{ height: `${data.alpha * 20}px` }}
                    />
                  )}
                </div>
                <span className="text-xs text-gray-500">{data.date}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="text-xs text-gray-500">Hadir</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-yellow-500 rounded" />
              <span className="text-xs text-gray-500">Sakit</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded" />
              <span className="text-xs text-gray-500">Izin</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded" />
              <span className="text-xs text-gray-500">Alpha</span>
            </div>
          </div>
        </Card>

        {/* Tahfidz Chart */}
        <Card variant="bordered">
          <CardHeader title="Grafik Hafalan" subtitle="Nilai setoran 7 hari terakhir" />
          <div className="h-48 flex items-end justify-between gap-2 px-4">
            {hafalanData.map((data, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-[#2d9596] rounded-t transition-all duration-300 hover:bg-[#247f80]"
                  style={{ height: `${data.nilai}%` }}
                />
                <span className="text-xs text-gray-500">{data.date}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">Rata-rata Nilai</p>
            <p className="text-2xl font-bold text-[#2d9596]">
              {Math.round(hafalanData.reduce((a, b) => a + b.nilai, 0) / hafalanData.length)}
            </p>
          </div>
        </Card>
      </div>

      {/* Transactions & Violations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transaction History */}
        <div className="lg:col-span-2">
          <Card variant="bordered">
            <div className="flex items-center justify-between mb-4">
              <CardHeader title="Riwayat Transaksi" subtitle="Pencatatan keuangan" />
              <Button variant="outline" size="sm">
                Lihat Semua
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Jenis</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nominal</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Saldo</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentTransactions.map((trans) => (
                    <tr key={trans.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{trans.tanggal}</td>
                      <td className="px-4 py-3">
                        <TransactionBadge type={trans.kategori} />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {trans.desc || "-"}
                      </td>
                      <td className={`px-4 py-3 text-sm font-medium ${
                        trans.kategori === "TOPUP" ? "text-green-600" : "text-red-600"
                      }`}>
                        {trans.kategori === "TOPUP" ? "+" : "-"}{formatCurrency(trans.nominal)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {formatCurrency(trans.saldo)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Violations */}
        <div className="lg:col-span-1">
          <Card variant="bordered">
            <CardHeader title="Riwayat Pelanggaran" subtitle="Catatan kedisiplinan" />
            {violations.length > 0 ? (
              <div className="space-y-3">
                {violations.map((violation, idx) => (
                  <div key={idx} className="p-3 bg-red-50 border border-red-100 rounded-lg">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium text-gray-900">{violation.jenis}</p>
                      <Badge
                        variant={
                          violation.kategori === "RINGAN" ? "warning" :
                          violation.kategori === "SEDANG" ? "danger" : "danger"
                        }
                        size="sm"
                      >
                        {violation.kategori}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-500">{violation.tanggal}</p>
                      <p className="text-xs font-medium text-red-600">Poin: {violation.poin}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckIcon />
                <p className="mt-2 text-sm text-green-600 font-medium">Tidak ada pelanggaran!</p>
                <p className="text-xs text-gray-500">Ananda tetap disiplin</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Icons
function CalendarIcon() {
  return (
    <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg className="w-6 h-6 text-[#2d9596]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-12 h-12 text-green-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
