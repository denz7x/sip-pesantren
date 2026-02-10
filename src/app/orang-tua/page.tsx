import { requireAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, StatCard, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { db } from "@/db";

export default async function OrangTuaDashboardPage() {
  const session = await requireAuth(["ORANG_TUA"]);
  
  // Fetch real data from database
  const santris = await db.select("santris");
  const absensis = await db.select("absensis");
  const hafalans = await db.select("setoranHafalans");
  const transaksis = await db.select("transaksis");
  const pelanggarans = await db.select("pelanggarans");
  const orangTuas = await db.select("orangTua");
  
  // Find the current orang tua based on user session (convert to number for comparison)
  const sessionIdNum = Number(session.id);
  const currentOrangTua = orangTuas.find((ot: any) => Number(ot.userId) === sessionIdNum);
  
  // Find the santri that belongs to this orang tua (convert to number for comparison)
  const child = currentOrangTua 
    ? santris.find((s: any) => Number(s.orangTuaId) === Number(currentOrangTua.id))
    : null;


    
  if (!child) {
    return (
      <DashboardLayout role="ORANG_TUA" userName={session.name} userId={String(session.id)} pageTitle="Dashboard Orang Tua">
        <div className="glass-card rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-tosca-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-tosca-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium">Tidak ada data santri yang terdaftar.</p>
          <p className="text-gray-400 text-sm mt-1">Silakan hubungi admin untuk mendaftarkan anak Anda.</p>
        </div>
      </DashboardLayout>
    );
  }

  // Get today's date
  const today = new Date().toISOString().split("T")[0];
  
  // Get child's ID as number for consistent comparison
  const childId = Number(child.id);
  
  // Get today's absensi - FIX: use Number() for comparison
  const todayAbsensi = absensis.find((a: any) => Number(a.SantriId) === childId && a.tanggal === today);
  
  // Get all absensi for this child (last 30 days)
  const allAbsensi = absensis
    .filter((a: any) => Number(a.SantriId) === childId)
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Get latest hafalan - FIX: use Number() for comparison
  const childHafalans = hafalans.filter((h: any) => Number(h.SantriId) === childId);
  const latestHafalan = childHafalans
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  
  // Get recent transactions for this child - FIX: use Number() for comparison
  const childTransactions = transaksis
    .filter((t: any) => Number(t.SantriId) === childId)
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((t: any) => ({
      id: t.id,
      tanggal: t.tanggal,
      kategori: t.jenis,
      nominal: parseInt(t.nominal) || 0,
      saldo: parseInt(t.saldoSetelah) || 0,
      desc: t.deskripsi,
    }));
  
  // Calculate current balance from latest transaction or fallback to child data
  const latestTransaction = childTransactions[0];
  const currentBalance = latestTransaction ? latestTransaction.saldo : (parseInt(child.saldoDompet) || 0);

  
  // Get violations for this child - FIX: use Number() for comparison
  const childViolations = pelanggarans
    .filter((p: any) => Number(p.SantriId) === childId)
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map((p: any) => ({
      tanggal: p.tanggal,
      jenis: p.jenisPelanggaran,
      kategori: p.kategori,
      poin: p.poinSanksi,
      tindakan: p.tindakan,
    }));
  
  // Calculate attendance stats
  const totalHadir = allAbsensi.filter((a: any) => a.status === "HADIR").length;
  const totalSakit = allAbsensi.filter((a: any) => a.status === "SAKIT").length;
  const totalIzin = allAbsensi.filter((a: any) => a.status === "IZIN").length;
  const totalAlpha = allAbsensi.filter((a: any) => a.status === "ALPHA").length;
  
  // Calculate attendance data for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split("T")[0];
  });
  
  const attendanceData = last7Days.map(date => {
    const dayAbsensi = absensis.find((a: any) => Number(a.SantriId) === childId && a.tanggal === date);
    const dayLabel = date.split("-")[2] + "/" + date.split("-")[1];
    return {
      date: dayLabel,
      hadir: dayAbsensi?.status === "HADIR" ? 1 : 0,
      sakit: dayAbsensi?.status === "SAKIT" ? 1 : 0,
      izin: dayAbsensi?.status === "IZIN" ? 1 : 0,
      alpha: dayAbsensi?.status === "ALPHA" ? 1 : 0,
    };
  });
  
  // Calculate hafalan data for the last 7 days
  const hafalanData = last7Days.map(date => {
    const dayHafalan = hafalans.find((h: any) => Number(h.SantriId) === childId && h.tanggal === date);
    const dayLabel = date.split("-")[2] + "/" + date.split("-")[1];
    return {
      date: dayLabel,
      nilai: dayHafalan ? parseInt(dayHafalan.nilai) : 0,
    };
  }).filter(h => h.nilai > 0);
  
  // Calculate average hafalan
  const avgHafalan = childHafalans.length > 0
    ? Math.round(childHafalans.reduce((sum: number, h: any) => sum + (parseInt(h.nilai) || 0), 0) / childHafalans.length)
    : 0;
  
  const summary = {
    absensiStatus: todayAbsensi?.status || "BELUM",
    absensiWaktu: todayAbsensi?.createdAt 
      ? new Date(todayAbsensi.createdAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
      : "-",
    hafalanTerakhir: latestHafalan ? {
      tanggal: latestHafalan.tanggal,
      surat: latestHafalan.namaSurat,
      ayat: latestHafalan.ayat,
      kualitas: latestHafalan.kualitas,
      nilai: latestHafalan.nilai,
    } : null,
  };

  return (
    <DashboardLayout
      role="ORANG_TUA"
      userName={session.name}
      userId={String(session.id)}
      pageTitle="Dashboard Orang Tua"
    >
      {/* Child Info Card - Glassmorphism */}
      <div className="mb-6">
        <div className="glass-card rounded-2xl p-6 bg-gradient-to-r from-tosca-500 to-tosca-600 text-white relative overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 relative z-10">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl sm:text-4xl font-bold ring-4 ring-white/30">
              {child.nama ? child.nama.charAt(0) : "?"}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-bold">{child.nama}</h2>
              <p className="text-white/80 text-sm sm:text-base">
                {child.nis} • {child.kelas}
              </p>
              <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs">
                  {child.jenisKelamin === "LAKI" ? "Laki-laki" : "Perempuan"}
                </span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs">
                  Masuk {child.tahunMasuk}
                </span>
              </div>
            </div>
            <div className="text-center sm:text-right bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <p className="text-white/70 text-xs sm:text-sm">Saldo Dompet</p>
              <p className="text-2xl sm:text-3xl font-bold">{formatCurrency(currentBalance)}</p>
            </div>

          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{totalHadir}</p>
          <p className="text-xs text-gray-500">Hadir</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-yellow-600">{totalSakit}</p>
          <p className="text-xs text-gray-500">Sakit</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{totalIzin}</p>
          <p className="text-xs text-gray-500">Izin</p>
        </div>
        <div className="glass rounded-xl p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{totalAlpha}</p>
          <p className="text-xs text-gray-500">Alpha</p>
        </div>
      </div>

      {/* Today's Summary - Mobile Optimized */}
      <div className="mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3">Ringkasan Hari Ini</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Absensi Hari Ini */}
          <div className="glass rounded-2xl p-4 border border-white/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <CalendarIcon />
              </div>
              <div>
                <p className="text-xs text-gray-500">Absensi Hari Ini</p>
                <AttendanceBadge status={summary.absensiStatus} />
              </div>
            </div>
            <p className="text-xs text-gray-400">Waktu: {summary.absensiWaktu}</p>
          </div>

          {/* Hafalan Terakhir */}
          <div className="glass rounded-2xl p-4 border border-white/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-tosca-100 rounded-xl flex items-center justify-center">
                <BookIcon />
              </div>
              <div>
                <p className="text-xs text-gray-500">Hafalan Terakhir</p>
                {summary.hafalanTerakhir ? (
                  <p className="font-semibold text-gray-800 text-sm">{summary.hafalanTerakhir.surat}</p>
                ) : (
                  <p className="text-sm text-gray-400">Belum ada</p>
                )}
              </div>
            </div>
            {summary.hafalanTerakhir && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400">Ayat {summary.hafalanTerakhir.ayat}</p>
                <TahfidzBadge quality={summary.hafalanTerakhir.kualitas} />
              </div>
            )}
          </div>

          {/* Saldo */}
          <div className="glass rounded-2xl p-4 border border-white/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <WalletIcon />
              </div>
              <div>
                <p className="text-xs text-gray-500">Sisa Saldo</p>
                <p className="text-lg sm:text-xl font-bold text-tosca-600">{formatCurrency(currentBalance)}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              {latestTransaction ? `Terakhir: ${latestTransaction.kategori} ${latestTransaction.tanggal}` : 'Belum ada transaksi'}
            </p>
          </div>

        </div>
      </div>

      {/* Charts Section - Mobile Optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Attendance Chart */}
        <div className="glass-card rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Grafik Kehadiran</h4>
            <span className="text-xs text-gray-400">7 Hari terakhir</span>
          </div>
          <div className="h-40 sm:h-48 flex items-end justify-between gap-1 sm:gap-2">
            {attendanceData.map((data, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col gap-0.5">
                  {data.hadir > 0 && (
                    <div className="w-full bg-green-500 rounded-t-sm" style={{ height: `${data.hadir * 20}px` }} />
                  )}
                  {data.sakit > 0 && (
                    <div className="w-full bg-yellow-500" style={{ height: `${data.sakit * 20}px` }} />
                  )}
                  {data.izin > 0 && (
                    <div className="w-full bg-blue-500" style={{ height: `${data.izin * 20}px` }} />
                  )}
                  {data.alpha > 0 && (
                    <div className="w-full bg-red-500 rounded-b-sm" style={{ height: `${data.alpha * 20}px` }} />
                  )}
                </div>
                <span className="text-[10px] sm:text-xs text-gray-500">{data.date}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 mt-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-sm" />
              <span className="text-[10px] sm:text-xs text-gray-500">Hadir</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-sm" />
              <span className="text-[10px] sm:text-xs text-gray-500">Sakit</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-sm" />
              <span className="text-[10px] sm:text-xs text-gray-500">Izin</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-red-500 rounded-sm" />
              <span className="text-[10px] sm:text-xs text-gray-500">Alpha</span>
            </div>
          </div>
        </div>

        {/* Tahfidz Chart */}
        <div className="glass-card rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Grafik Hafalan</h4>
            <span className="text-xs text-gray-400">Nilai setoran</span>
          </div>
          <div className="h-40 sm:h-48 flex items-end justify-between gap-1 sm:gap-2 px-2">
            {hafalanData.length === 0 ? (
              <div className="w-full flex items-center justify-center">
                <p className="text-gray-400 text-sm">Belum ada data hafalan</p>
              </div>
            ) : (
              hafalanData.map((data, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-tosca-500 to-tosca-400 rounded-t-sm transition-all duration-300"
                    style={{ height: `${data.nilai}%` }}
                  />
                  <span className="text-[10px] sm:text-xs text-gray-500">{data.date}</span>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">Rata-rata Nilai</p>
            <p className="text-xl sm:text-2xl font-bold text-tosca-600">{avgHafalan}</p>
          </div>
        </div>
      </div>

      {/* Transactions & Violations - Mobile Optimized */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Transaction History */}
        <div className="lg:col-span-2">
          <div className="glass-card rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Riwayat Transaksi</h4>
                <p className="text-xs text-gray-400">Pencatatan keuangan</p>
              </div>
              <a href="/orang-tua/transaksi" className="text-xs sm:text-sm text-tosca-600 hover:text-tosca-700 font-medium">
                Lihat Semua →
              </a>
            </div>
            <div className="overflow-x-auto -mx-4 px-4">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left text-[10px] sm:text-xs font-medium text-gray-400 uppercase py-2">Tanggal</th>
                    <th className="text-left text-[10px] sm:text-xs font-medium text-gray-400 uppercase py-2">Jenis</th>
                    <th className="text-left text-[10px] sm:text-xs font-medium text-gray-400 uppercase py-2 hidden sm:table-cell">Deskripsi</th>
                    <th className="text-left text-[10px] sm:text-xs font-medium text-gray-400 uppercase py-2">Nominal</th>
                    <th className="text-left text-[10px] sm:text-xs font-medium text-gray-400 uppercase py-2">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {childTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">
                        Belum ada transaksi
                      </td>
                    </tr>
                  ) : (
                    childTransactions.map((trans) => (
                      <tr key={trans.id} className="border-b border-gray-50 last:border-0">
                        <td className="py-3 text-xs sm:text-sm text-gray-700">{trans.tanggal}</td>
                        <td className="py-3">
                          <TransactionBadge type={trans.kategori} />
                        </td>
                        <td className="py-3 text-xs text-gray-500 hidden sm:table-cell max-w-[150px] truncate">
                          {trans.desc || "-"}
                        </td>
                        <td className={`py-3 text-xs sm:text-sm font-medium ${
                          trans.kategori === "TOPUP" ? "text-green-600" : "text-red-600"
                        }`}>
                          {trans.kategori === "TOPUP" ? "+" : "-"}{formatCurrency(trans.nominal)}
                        </td>
                        <td className="py-3 text-xs sm:text-sm text-gray-700">
                          {formatCurrency(trans.saldo)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Violations */}
        <div className="lg:col-span-1">
          <div className="glass-card rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Riwayat Pelanggaran</h4>
                <p className="text-xs text-gray-400">Catatan kedisiplinan</p>
              </div>
              {childViolations.length > 0 && (
                <a href="/orang-tua/pelanggaran" className="text-xs sm:text-sm text-tosca-600 hover:text-tosca-700 font-medium">
                  Lihat Semua →
                </a>
              )}
            </div>
            {childViolations.length > 0 ? (
              <div className="space-y-3">
                {childViolations.map((violation, idx) => (
                  <div key={idx} className="p-3 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-xl">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-2">{violation.jenis}</p>
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
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Tindakan: {violation.tindakan}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[10px] sm:text-xs text-gray-400">{violation.tanggal}</p>
                      <p className="text-[10px] sm:text-xs font-medium text-red-500">Poin: {violation.poin}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckIcon />
                </div>
                <p className="text-sm text-green-600 font-medium">Tidak ada pelanggaran!</p>
                <p className="text-xs text-gray-400 mt-1">Ananda tetap disiplin</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        {/* Hafalan History */}
        <div className="glass-card rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Riwayat Hafalan</h4>
              <p className="text-xs text-gray-400">Setoran terakhir</p>
            </div>
            {childHafalans.length > 0 && (
              <a href="/orang-tua/hafalan" className="text-xs sm:text-sm text-tosca-600 hover:text-tosca-700 font-medium">
                Lihat Semua →
              </a>
            )}
          </div>
          {childHafalans.length > 0 ? (
            <div className="space-y-3">
              {childHafalans.slice(0, 3).map((h: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-tosca-50/80 backdrop-blur-sm border border-tosca-100 rounded-xl">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-800">{h.namaSurat}</p>
                    <p className="text-[10px] sm:text-xs text-gray-500">Ayat {h.ayat}</p>
                  </div>
                  <div className="text-right">
                    <TahfidzBadge quality={h.kualitas} />
                    <p className="text-[10px] sm:text-xs text-gray-400 mt-1">{h.tanggal}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400">Belum ada setoran hafalan</p>
            </div>
          )}
        </div>

        {/* Absensi History */}
        <div className="glass-card rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Riwayat Absensi</h4>
              <p className="text-xs text-gray-400">Kehadiran terakhir</p>
            </div>
            {allAbsensi.length > 0 && (
              <a href="/orang-tua/absensi" className="text-xs sm:text-sm text-tosca-600 hover:text-tosca-700 font-medium">
                Lihat Semua →
              </a>
            )}
          </div>
          {allAbsensi.length > 0 ? (
            <div className="space-y-3">
              {allAbsensi.slice(0, 3).map((a: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50/80 backdrop-blur-sm border border-gray-100 rounded-xl">
                  <div>
                    <AttendanceBadge status={a.status} />
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">{a.keterangan || "-"}</p>
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-400">{a.tanggal}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400">Belum ada data absensi</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

// Icons
function CalendarIcon() {
  return (
    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg className="w-5 h-5 text-tosca-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
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

function AttendanceBadge({ status }: { status: string }) {
  const variants: Record<string, { class: string; label: string }> = {
    HADIR: { class: "bg-green-100 text-green-700", label: "Hadir" },
    SAKIT: { class: "bg-yellow-100 text-yellow-700", label: "Sakit" },
    IZIN: { class: "bg-blue-100 text-blue-700", label: "Izin" },
    ALPHA: { class: "bg-red-100 text-red-700", label: "Alpha" },
    BELUM: { class: "bg-gray-100 text-gray-600", label: "Belum" },
  };

  const variant = variants[status] || { class: "bg-gray-100 text-gray-600", label: status };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${variant.class}`}>
      {variant.label}
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

  const variant = variants[quality] || { class: "bg-gray-100 text-gray-600", label: quality };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${variant.class}`}>
      {variant.label}
    </span>
  );
}

function TransactionBadge({ type }: { type: string }) {
  const variants: Record<string, { class: string; label: string }> = {
    TOPUP: { class: "bg-green-100 text-green-700", label: "Topup" },
    PAYMENT: { class: "bg-red-100 text-red-700", label: "Bayar" },
    DEBIT: { class: "bg-red-100 text-red-700", label: "Debit" },
  };

  const variant = variants[type] || { class: "bg-gray-100 text-gray-600", label: type };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${variant.class}`}>
      {variant.label}
    </span>
  );
}
