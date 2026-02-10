import { requireAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, StatCard, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { db } from "@/db";

export default async function UstadzDashboardPage() {
  const session = await requireAuth(["USTADZ"]);
  
  // Fetch real data from database
  const santris = await db.select("santris");
  const absensis = await db.select("absensis");
  const hafalans = await db.select("setoranHafalans");
  const transaksis = await db.select("transaksis");
  const pelanggarans = await db.select("pelanggarans");
  
  // Get today's date
  const today = new Date().toISOString().split("T")[0];
  
  // Calculate stats
  const todayAbsensiData = absensis.filter((a: any) => a.tanggal === today);
  const todayHafalanData = hafalans.filter((h: any) => h.tanggal === today);
  const todayPelanggaranData = pelanggarans.filter((p: any) => p.tanggal === today);
  const todayTransaksiData = transaksis.filter((t: any) => t.tanggal === today && t.jenis === "PAYMENT");

  const todayStats = {
    HafalanDinput: todayHafalanData.length,
    AbsensiDinput: todayAbsensiData.length,
    PelanggaranDinput: todayPelanggaranData.length,
    TransaksiKasir: todayTransaksiData.reduce((sum: number, t: any) => sum + (parseInt(t.nominal) || 0), 0),
  };
  
  // Get recent absensi (last 5)
  const recentAbsensi = todayAbsensiData
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((a: any) => {
      const santri = santris.find((s: any) => s.id === a.SantriId);
      return {
        nis: santri ? santri.nis : "-",
        nama: santri ? santri.nama : `ID: ${a.SantriId}`,
        status: a.status,
        waktu: a.createdAt ? new Date(a.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "-",
      };
    });
  
  // Get recent hafalan (last 3)
  const recentHafalan = hafalans
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)
    .map((h: any) => {
      const santri = santris.find((s: any) => s.id === h.SantriId);
      return {
        nama: santri ? santri.nama : `ID: ${h.SantriId}`,
        surat: h.namaSurat,
        ayat: h.ayat,
        kualitas: h.kualitas,
        nilai: h.nilai,
      };
    });
  
  // Get recent transactions (last 3)
  const recentTransactions = transaksis
    .filter((t: any) => t.jenis === "PAYMENT")
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)
    .map((t: any) => {
      const santri = santris.find((s: any) => s.id === t.SantriId);
      return {
        nama: santri ? santri.nama : `ID: ${t.SantriId}`,
        kategori: t.kategori,
        nominal: parseInt(t.nominal) || 0,
        waktu: t.waktu,
      };
    });

  return (
    <DashboardLayout
      role="USTADZ"
      userName={session.name}
      userId={String(session.id)}
      pageTitle="Dashboard Ustadz"
    >
      {/* Welcome Section - Glassmorphism */}
      <div className="mb-6">
        <div className="glass-card rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-tosca-500 to-tosca-600 text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-xl sm:text-2xl font-bold">Assalamu&apos;alaikum, {session.name}!</h2>
            <p className="text-white/80 text-sm sm:text-base mt-1">Berikut ringkasan aktivitas hari ini.</p>
          </div>
        </div>
      </div>

      {/* Quick Stats - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="glass rounded-2xl p-4 border border-white/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-tosca-100 rounded-xl flex items-center justify-center">
              <BookIcon />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Setoran Hafalan</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{todayStats.HafalanDinput}</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-4 border border-white/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <CalendarIcon />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Absensi Tercatat</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{todayStats.AbsensiDinput}</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-4 border border-white/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertIcon />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Pelanggaran</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{todayStats.PelanggaranDinput}</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-4 border border-white/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <MoneyIcon />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Transaksi Kasir</p>
              <p className="text-lg sm:text-xl font-bold text-gray-800">{formatCurrency(todayStats.TransaksiKasir)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile Optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Today's Attendance */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Absensi Hari Ini</h4>
                <p className="text-xs text-gray-400">Kelas yang Anda ampu</p>
              </div>
              <a href="/ustadz/absensi" className="text-xs sm:text-sm text-tosca-600 hover:text-tosca-700 font-medium">
                Lihat Semua →
              </a>
            </div>
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-[10px] sm:text-xs font-medium text-gray-400 uppercase py-2">NIS</th>
                    <th className="text-left text-[10px] sm:text-xs font-medium text-gray-400 uppercase py-2">Nama</th>
                    <th className="text-left text-[10px] sm:text-xs font-medium text-gray-400 uppercase py-2">Status</th>
                    <th className="text-left text-[10px] sm:text-xs font-medium text-gray-400 uppercase py-2 hidden sm:table-cell">Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAbsensi.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-400 text-sm">
                        Belum ada absensi hari ini
                      </td>
                    </tr>
                  ) : (
                    recentAbsensi.map((santri, idx) => (
                      <tr key={idx} className="border-b border-gray-50 last:border-0">
                        <td className="py-3 text-xs sm:text-sm text-gray-500">{santri.nis}</td>
                        <td className="py-3 text-xs sm:text-sm font-medium text-gray-800">{santri.nama}</td>
                        <td className="py-3">
                          <AttendanceBadge status={santri.status} />
                        </td>
                        <td className="py-3 text-xs text-gray-400 hidden sm:table-cell">{santri.waktu}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Quick Actions */}
          <div className="glass-card rounded-2xl p-4 sm:p-6">
            <h4 className="font-semibold text-gray-800 text-sm sm:text-base mb-4">Input Data</h4>
            <div className="space-y-2">
              <a
                href="/ustadz/absensi"
                className="flex items-center gap-3 p-3 sm:p-4 bg-tosca-50/80 backdrop-blur-sm rounded-xl hover:bg-tosca-100/80 transition-all duration-300 border border-tosca-100/50"
              >
                <div className="w-8 h-8 bg-tosca-100 rounded-lg flex items-center justify-center">
                  <CalendarIconSmall />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Input Absensi</p>
                  <p className="text-xs text-gray-500">Catat kehadiran</p>
                </div>
              </a>
              <a
                href="/ustadz/hafalan"
                className="flex items-center gap-3 p-3 sm:p-4 bg-tosca-50/80 backdrop-blur-sm rounded-xl hover:bg-tosca-100/80 transition-all duration-300 border border-tosca-100/50"
              >
                <div className="w-8 h-8 bg-tosca-100 rounded-lg flex items-center justify-center">
                  <BookIconSmall />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Setoran Hafalan</p>
                  <p className="text-xs text-gray-500">Catat setoran</p>
                </div>
              </a>
              <a
                href="/ustadz/pelanggaran"
                className="flex items-center gap-3 p-3 sm:p-4 bg-red-50/80 backdrop-blur-sm rounded-xl hover:bg-red-100/80 transition-all duration-300 border border-red-100/50"
              >
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertIconSmall />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">Jurnal Pelanggaran</p>
                  <p className="text-xs text-gray-500">Catat pelanggaran</p>
                </div>
              </a>
              <a
                href="/ustadz/kasir"
                className="flex items-center gap-3 p-3 sm:p-4 bg-green-50/80 backdrop-blur-sm rounded-xl hover:bg-green-100/80 transition-all duration-300 border border-green-100/50"
              >
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <MoneyIconSmall />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">POS / Kasir</p>
                  <p className="text-xs text-gray-500">Transaksi belanja</p>
                </div>
              </a>
            </div>
          </div>

          {/* Recent Hafalan */}
          <div className="glass-card rounded-2xl p-4 sm:p-6">
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Setoran Hafalan Terbaru</h4>
              <p className="text-xs text-gray-400">Terakhir</p>
            </div>
            <div className="space-y-3">
              {recentHafalan.length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-tosca-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <BookIcon />
                  </div>
                  <p className="text-sm text-gray-500">Belum ada setoran hafalan</p>
                </div>
              ) : (
                recentHafalan.map((hafalan, idx) => (
                  <div key={idx} className="p-3 bg-tosca-50/50 backdrop-blur-sm rounded-xl border border-tosca-100/30">
                    <div className="flex items-center justify-between">
                      <p className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-1">{hafalan.nama}</p>
                      <TahfidzBadge quality={hafalan.kualitas} />
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">
                      {hafalan.surat} Ayat {hafalan.ayat}
                    </p>
                    <p className="text-[10px] sm:text-xs font-medium text-tosca-600 mt-1">Nilai: {hafalan.nilai}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="glass-card rounded-2xl p-4 sm:p-6">
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Transaksi Terbaru</h4>
              <p className="text-xs text-gray-400">Kasir Kantin</p>
            </div>
            <div className="space-y-2">
              {recentTransactions.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500">Belum ada transaksi</p>
                </div>
              ) : (
                recentTransactions.map((trans, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 border-b border-gray-50 last:border-0">
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-1">{trans.nama}</p>
                      <p className="text-[10px] sm:text-xs text-gray-400">{trans.kategori}</p>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-red-500">-{formatCurrency(trans.nominal)}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Icons
function BookIcon() {
  return (
    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-tosca-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function MoneyIcon() {
  return (
    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

// Small icons for quick actions
function BookIconSmall() {
  return (
    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-tosca-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function CalendarIconSmall() {
  return (
    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-tosca-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function AlertIconSmall() {
  return (
    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function MoneyIconSmall() {
  return (
    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function AttendanceBadge({ status }: { status: string }) {
  const variants: Record<string, { class: string; label: string }> = {
    HADIR: { class: "bg-green-100 text-green-700", label: "Hadir" },
    SAKIT: { class: "bg-yellow-100 text-yellow-700", label: "Sakit" },
    IZIN: { class: "bg-blue-100 text-blue-700", label: "Izin" },
    ALPHA: { class: "bg-red-100 text-red-700", label: "Alpha" },
  };

  const { class: variantClass, label } = variants[status] || { class: "bg-gray-100 text-gray-600", label: status };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${variantClass}`}>
      {label}
    </span>
  );
}

function TahfidzBadge({ quality }: { quality: string }) {
  const variants: Record<string, { class: string; label: string }> = {
    SANGAT_BAIK: { class: "bg-green-100 text-green-700", label: "Sangat Baik" },
    BAIK: { class: "bg-blue-100 text-blue-700", label: "Baik" },
    CUKUP: { class: "bg-yellow-100 text-yellow-700", label: "Cukup" },
    KURANG: { class: "bg-red-100 text-red-700", label: "Kurang" },
  };

  const { class: variantClass, label } = variants[quality] || { class: "bg-gray-100 text-gray-600", label: quality };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${variantClass}`}>
      {label}
    </span>
  );
}
