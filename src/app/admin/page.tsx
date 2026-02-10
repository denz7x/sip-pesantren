import { requireAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, StatCard, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { db } from "@/db";

export default async function AdminDashboardPage() {
  const session = await requireAuth(["ADMIN"]);
  
  // Fetch real data from database
  const santris = await db.select("santris");
  const ustadzs = await db.select("ustadzs");
  const transaksis = await db.select("transaksis");
  const absensis = await db.select("absensis");
  const pelanggarans = await db.select("pelanggarans");
  
  // Calculate stats
  const totalSantri = santris.length;
  const totalUstadz = ustadzs.length;
  
  // Calculate today's transactions
  const today = new Date().toISOString().split("T")[0];
  const todayTransaksi = transaksis.filter((t: any) => t.tanggal === today);
  const totalTransaksi = todayTransaksi.reduce((sum: number, t: any) => sum + (parseInt(t.nominal) || 0), 0);
  
  // Calculate attendance rate
  const todayAbsensi = absensis.filter((a: any) => a.tanggal === today);
  const hadirCount = todayAbsensi.filter((a: any) => a.status === "HADIR").length;
  const absensiRate = totalSantri > 0 ? Math.round((hadirCount / totalSantri) * 100) : 0;
  
  // Get recent transactions (last 5)
  const recentTransactions = transaksis
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((t: any) => {
      const santri = santris.find((s: any) => s.id === t.SantriId);
      return {
        id: t.id,
        nama: santri ? santri.nama : `ID: ${t.SantriId}`,
        nominal: parseInt(t.nominal) || 0,
        jenis: t.jenis,
        waktu: t.waktu,
      };
    });
  
  // Get recent pelanggaran (last 3)
  const recentPelanggaran = pelanggarans
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)
    .map((p: any) => {
      const santri = santris.find((s: any) => s.id === p.SantriId);
      return {
        id: p.id,
        nama: santri ? santri.nama : `ID: ${p.SantriId}`,
        jenis: p.jenisPelanggaran,
        kategori: p.kategori,
        waktu: p.tanggal,
      };
    });

  return (
    <DashboardLayout
      role="ADMIN"
      userName={session.name}
      userId={String(session.id)}
      pageTitle="Dashboard Admin"
    >
      {/* Welcome Section - Glassmorphism */}
      <div className="mb-6">
        <div className="glass-card rounded-2xl p-5 sm:p-6 bg-gradient-to-r from-tosca-500 to-tosca-600 text-white relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-xl sm:text-2xl font-bold">Selamat Datang, {session.name}!</h2>
            <p className="text-white/80 text-sm sm:text-base mt-1">Berikut ringkasan aktivitas hari ini di Pondok Pesantren.</p>
          </div>
        </div>
      </div>

      {/* Stats Grid - Mobile Optimized */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="glass rounded-2xl p-4 border border-white/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-tosca-100 rounded-xl flex items-center justify-center">
              <UserIcon />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Total Santri</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{totalSantri}</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-4 border border-white/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <TeacherIcon />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Total Ustadz</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{totalUstadz}</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-4 border border-white/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <CalendarIcon />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Kehadiran</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{hadirCount}/{totalSantri}</p>
              <p className="text-[10px] sm:text-xs text-green-600">{absensiRate}% hadir</p>
            </div>
          </div>
        </div>

        <div className="glass rounded-2xl p-4 border border-white/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <MoneyIcon />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Transaksi Hari Ini</p>
              <p className="text-lg sm:text-xl font-bold text-gray-800">{formatCurrency(totalTransaksi)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid - Mobile Optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Transaksi Terbaru</h4>
                <p className="text-xs text-gray-400">Riwayat transaksi hari ini</p>
              </div>
              <a href="/admin/keuangan" className="text-xs sm:text-sm text-tosca-600 hover:text-tosca-700 font-medium">
                Lihat Semua →
              </a>
            </div>
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-[10px] sm:text-xs font-medium text-gray-400 uppercase py-2">Nama Santri</th>
                    <th className="text-left text-[10px] sm:text-xs font-medium text-gray-400 uppercase py-2">Jenis</th>
                    <th className="text-left text-[10px] sm:text-xs font-medium text-gray-400 uppercase py-2">Nominal</th>
                    <th className="text-left text-[10px] sm:text-xs font-medium text-gray-400 uppercase py-2 hidden sm:table-cell">Waktu</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-400 text-sm">
                        Belum ada transaksi hari ini
                      </td>
                    </tr>
                  ) : (
                    recentTransactions.map((transaksi) => (
                      <tr key={transaksi.id} className="border-b border-gray-50 last:border-0">
                        <td className="py-3 text-xs sm:text-sm text-gray-700 font-medium">{transaksi.nama}</td>
                        <td className="py-3">
                          <Badge variant={transaksi.jenis === "TOPUP" ? "success" : "warning"} size="sm">
                            {transaksi.jenis}
                          </Badge>
                        </td>
                        <td className="py-3 text-xs sm:text-sm font-semibold text-gray-800">
                          {formatCurrency(transaksi.nominal)}
                        </td>
                        <td className="py-3 text-xs text-gray-400 hidden sm:table-cell">{transaksi.waktu}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-4 sm:space-y-6">
          {/* Quick Actions */}
          <div className="glass-card rounded-2xl p-4 sm:p-6">
            <h4 className="font-semibold text-gray-800 text-sm sm:text-base mb-4">Aksi Cepat</h4>
            <div className="grid grid-cols-2 gap-3">
              <a href="/admin/santri" className="flex flex-col items-center p-3 sm:p-4 bg-tosca-50/80 backdrop-blur-sm rounded-xl hover:bg-tosca-100/80 transition-all duration-300 border border-tosca-100/50">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-tosca-100 rounded-lg flex items-center justify-center mb-2">
                  <UserIconSmall />
                </div>
                <span className="text-xs sm:text-sm text-gray-700 font-medium">Santri</span>
              </a>
              <a href="/admin/topup" className="flex flex-col items-center p-3 sm:p-4 bg-green-50/80 backdrop-blur-sm rounded-xl hover:bg-green-100/80 transition-all duration-300 border border-green-100/50">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                  <WalletIconSmall />
                </div>
                <span className="text-xs sm:text-sm text-gray-700 font-medium">Top-up</span>
              </a>
              <a href="/admin/keuangan" className="flex flex-col items-center p-3 sm:p-4 bg-yellow-50/80 backdrop-blur-sm rounded-xl hover:bg-yellow-100/80 transition-all duration-300 border border-yellow-100/50">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-yellow-100 rounded-lg flex items-center justify-center mb-2">
                  <MoneyIconSmall />
                </div>
                <span className="text-xs sm:text-sm text-gray-700 font-medium">Keuangan</span>
              </a>
              <a href="/admin/ustadz" className="flex flex-col items-center p-3 sm:p-4 bg-blue-50/80 backdrop-blur-sm rounded-xl hover:bg-blue-100/80 transition-all duration-300 border border-blue-100/50">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                  <TeacherIconSmall />
                </div>
                <span className="text-xs sm:text-sm text-gray-700 font-medium">Ustadz</span>
              </a>
            </div>
          </div>

          {/* Recent Violations */}
          <div className="glass-card rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Pelanggaran Terbaru</h4>
                <p className="text-xs text-gray-400">Hari ini</p>
              </div>
            </div>
            <div className="space-y-3">
              {recentPelanggaran.length === 0 ? (
                <div className="text-center py-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckIcon />
                  </div>
                  <p className="text-sm text-green-600 font-medium">Tidak ada pelanggaran!</p>
                  <p className="text-xs text-gray-400 mt-1">Semua santri berperilaku baik</p>
                </div>
              ) : (
                recentPelanggaran.map((pelanggaran) => (
                  <div key={pelanggaran.id} className="flex items-start gap-3 p-3 bg-red-50/80 backdrop-blur-sm rounded-xl border border-red-100/50">
                    <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <AlertIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-1">{pelanggaran.nama}</p>
                      <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-1">{pelanggaran.jenis}</p>
                    </div>
                    <Badge
                      variant={
                        pelanggaran.kategori === "RINGAN" ? "warning" :
                        pelanggaran.kategori === "SEDANG" ? "danger" : "danger"
                      }
                      size="sm"
                    >
                      {pelanggaran.kategori}
                    </Badge>
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
function UserIcon() {
  return (
    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-tosca-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function TeacherIcon() {
  return (
    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function MoneyIcon() {
  return (
    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

// Small icons for quick actions
function UserIconSmall() {
  return (
    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-tosca-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function TeacherIconSmall() {
  return (
    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function WalletIconSmall() {
  return (
    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

function MoneyIconSmall() {
  return (
    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
