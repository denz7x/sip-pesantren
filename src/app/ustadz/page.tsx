import { requireAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, StatCard, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

// Demo data for Ustadz dashboard
const todayStats = {
  HafalanDinput: 18,
  AbsensiDinput: 45,
  PelanggaranDinput: 5,
  TransaksiKasir: 850000,
};

const todayAbsensi = [
  { nis: "2024001", nama: "Ahmad Santoso", status: "HADIR", waktu: "06:00" },
  { nis: "2024002", nama: "Fatimah Azzahra", status: "HADIR", waktu: "06:02" },
  { nis: "2024003", nama: "Muhammad Yusuf", status: "SAKIT", waktu: "-" },
  { nis: "2024004", nama: "Aisyah Rahma", status: "HADIR", waktu: "05:58" },
  { nis: "2024005", nama: "Abdullah Kamal", status: "IZIN", waktu: "-" },
];

const recentHafalan = [
  { nama: "Ananda Bela", surat: "Al-Baqarah", ayat: "1-10", kualitas: "SANGAT_BAIK", nilai: 95 },
  { nama: "Kakak Dimas", surat: "An-Nisa", ayat: "1-5", kualitas: "BAIK", nilai: 85 },
  { nama: "Adik Siti", surat: "Al-Imran", ayat: "15-20", kualitas: "CUKUP", nilai: 70 },
];

const recentTransactions = [
  { nama: "Ahmad Santoso", kategori: "KANTIN", nominal: 15000, waktu: "08:30" },
  { nama: "Fatimah Azzahra", kategori: "LAUNDRY", nominal: 25000, waktu: "09:00" },
  { nama: "Muhammad Yusuf", kategori: "KANTIN", nominal: 10000, waktu: "09:30" },
];

export default async function UstadzDashboardPage() {
  const session = await requireAuth(["USTADZ"]);

  return (
    <DashboardLayout
      role="USTADZ"
      userName={session.name}
      pageTitle="Dashboard Ustadz"
    >
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Assalamu&apos;alaikum, {session.name}!</h2>
        <p className="text-gray-500 mt-1">Berikut ringkasan aktivitas hari ini.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Setoran Hafalan"
          value={todayStats.HafalanDinput}
          icon={<BookIcon />}
          color="tosc"
        />
        <StatCard
          title="Absensi Tercatat"
          value={todayStats.AbsensiDinput}
          icon={<CalendarIcon />}
          color="blue"
        />
        <StatCard
          title="Pelanggaran Hari Ini"
          value={todayStats.PelanggaranDinput}
          icon={<AlertIcon />}
          color="red"
        />
        <StatCard
          title="Transaksi Kasir"
          value={formatCurrency(todayStats.TransaksiKasir)}
          icon={<MoneyIcon />}
          color="green"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Attendance */}
        <div className="lg:col-span-2">
          <Card variant="bordered">
            <div className="flex items-center justify-between mb-4">
              <CardHeader title="Absensi Hari Ini" subtitle="Kelas yang Anda ampu" />
              <a href="/ustadz/absensi" className="text-sm text-[#2d9596] hover:underline">
                Lihat Semua →
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">NIS</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {todayAbsensi.map((santri, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-500">{santri.nis}</td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-900">{santri.nama}</td>
                      <td className="px-4 py-2">
                        <AttendanceBadge status={santri.status} />
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-500">{santri.waktu}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card variant="bordered">
            <CardHeader title="Input Data" />
            <div className="space-y-2">
              <a
                href="/ustadz/absensi"
                className="flex items-center gap-3 p-3 bg-[#2d9596]/10 rounded-lg hover:bg-[#2d9596]/20 transition-colors"
              >
                <CalendarIcon />
                <div>
                  <p className="text-sm font-medium text-gray-900">Input Absensi</p>
                  <p className="text-xs text-gray-500">Catat kehadiran</p>
                </div>
              </a>
              <a
                href="/ustadz/hafalan"
                className="flex items-center gap-3 p-3 bg-[#2d9596]/10 rounded-lg hover:bg-[#2d9596]/20 transition-colors"
              >
                <BookIcon />
                <div>
                  <p className="text-sm font-medium text-gray-900">Setoran Hafalan</p>
                  <p className="text-xs text-gray-500">Catat setoran</p>
                </div>
              </a>
              <a
                href="/ustadz/pelanggaran"
                className="flex items-center gap-3 p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                <AlertIcon />
                <div>
                  <p className="text-sm font-medium text-gray-900">Jurnal Pelanggaran</p>
                  <p className="text-xs text-gray-500">Catat pelanggaran</p>
                </div>
              </a>
              <a
                href="/ustadz/kasir"
                className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
              >
                <MoneyIcon />
                <div>
                  <p className="text-sm font-medium text-gray-900">POS / Kasir</p>
                  <p className="text-xs text-gray-500">Transaksi belanja</p>
                </div>
              </a>
            </div>
          </Card>

          {/* Recent Hafalan */}
          <Card variant="bordered">
            <CardHeader title="Setoran Hafalan Terbaru" subtitle="Hari ini" />
            <div className="space-y-3">
              {recentHafalan.map((hafalan, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">{hafalan.nama}</p>
                    <TahfidzBadge quality={hafalan.kualitas} />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {hafalan.surat} Ayat {hafalan.ayat}
                  </p>
                  <p className="text-xs font-medium text-[#2d9596] mt-1">Nilai: {hafalan.nilai}</p>
                </div>
              ))}
            </div>
          </Card>

          {/* Recent Transactions */}
          <Card variant="bordered">
            <CardHeader title="Transaksi Terbaru" subtitle="Kasir Kantin" />
            <div className="space-y-2">
              {recentTransactions.map((trans, idx) => (
                <div key={idx} className="flex items-center justify-between p-2">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{trans.nama}</p>
                    <p className="text-xs text-gray-500">{trans.kategori}</p>
                  </div>
                  <p className="text-sm font-medium text-red-600">-{formatCurrency(trans.nominal)}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Icons
function BookIcon() {
  return (
    <svg className="w-5 h-5 text-[#2d9596]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function MoneyIcon() {
  return (
    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function AttendanceBadge({ status }: { status: string }) {
  const variants: Record<string, { class: string; label: string }> = {
    HADIR: { class: "bg-green-100 text-green-800", label: "Hadir" },
    SAKIT: { class: "bg-yellow-100 text-yellow-800", label: "Sakit" },
    IZIN: { class: "bg-blue-100 text-blue-800", label: "Izin" },
    ALPHA: { class: "bg-red-100 text-red-800", label: "Alpha" },
  };

  const { class: variantClass, label } = variants[status] || { class: "bg-gray-100 text-gray-800", label: status };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variantClass}`}>
      {label}
    </span>
  );
}

function TahfidzBadge({ quality }: { quality: string }) {
  const variants: Record<string, { class: string; label: string }> = {
    SANGAT_BAIK: { class: "bg-green-100 text-green-800", label: "Sangat Baik" },
    BAIK: { class: "bg-blue-100 text-blue-800", label: "Baik" },
    CUKUP: { class: "bg-yellow-100 text-yellow-800", label: "Cukup" },
    KURANG: { class: "bg-red-100 text-red-800", label: "Kurang" },
  };

  const { class: variantClass, label } = variants[quality] || { class: "bg-gray-100 text-gray-800", label: quality };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variantClass}`}>
      {label}
    </span>
  );
}
