import { requireAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, StatCard, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

// Demo data for visualization
const demoStats = {
  totalSantri: 156,
  totalUstadz: 24,
  totalTransaksi: 12500000,
  kehadiranHariIni: 148,
  absensiRate: 94.9,
  totalPelanggaran: 12,
};

const recentTransactions = [
  { id: 1, nama: "Ahmad Santoso", nominal: 50000, jenis: "TOPUP", waktu: "08:30" },
  { id: 2, nama: "Fatimah Azzahra", nominal: 25000, jenis: "DEBIT", waktu: "09:15" },
  { id: 3, nama: "Muhammad Yusuf", nominal: 100000, jenis: "TOPUP", waktu: "10:00" },
  { id: 4, nama: "Aisyah Rahma", nominal: 15000, jenis: "DEBIT", waktu: "10:45" },
  { id: 5, nama: "Abdullah Kamal", nominal: 75000, jenis: "TOPUP", waktu: "11:30" },
];

const recentPelanggaran = [
  { id: 1, nama: "Zaky Pratama", jenis: "Terlambat Shalat", kategori: "RINGAN", waktu: "07:00" },
  { id: 2, nama: "Rizky Firmanda", jenis: "Tidak Membawa Kitab", kategori: "RINGAN", waktu: "08:30" },
  { id: 3, nama: "Dimas Aryo", jenis: "Membuang Sampah Sembarangan", kategori: "SEDANG", waktu: "10:00" },
];

export default async function AdminDashboardPage() {
  const session = await requireAuth(["ADMIN"]);

  return (
    <DashboardLayout
      role="ADMIN"
      userName={session.name}
      pageTitle="Dashboard Admin"
    >
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Selamat Datang, {session.name}!</h2>
        <p className="text-gray-500 mt-1">Berikut ringkasan aktivitas hari ini di Pondok Pesanren.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Santri"
          value={demoStats.totalSantri}
          icon={<UserIcon />}
          color="tosc"
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Total Ustadz"
          value={demoStats.totalUstadz}
          icon={<TeacherIcon />}
          color="blue"
        />
        <StatCard
          title="Kehadiran Hari Ini"
          value={`${demoStats.kehadiranHariIni}/${demoStats.totalSantri}`}
          icon={<CalendarIcon />}
          color="green"
          trend={{ value: demoStats.absensiRate, isPositive: true }}
        />
        <StatCard
          title="Total Transaksi Hari Ini"
          value={formatCurrency(demoStats.totalTransaksi)}
          icon={<MoneyIcon />}
          color="yellow"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <Card variant="bordered">
            <CardHeader
              title="Transaksi Terbaru"
              subtitle="Riwayat transaksi hari ini"
            />
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Santri</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nominal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentTransactions.map((transaksi) => (
                    <tr key={transaksi.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{transaksi.nama}</td>
                      <td className="px-4 py-3">
                        <Badge variant={transaksi.jenis === "TOPUP" ? "success" : "warning"}>
                          {transaksi.jenis}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {formatCurrency(transaksi.nominal)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{transaksi.waktu}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Sidebar Content */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card variant="bordered">
            <CardHeader title="Aksi Cepat" />
            <div className="grid grid-cols-2 gap-3">
              <a href="/admin/santri" className="flex flex-col items-center p-3 bg-[#2d9596]/10 rounded-lg hover:bg-[#2d9596]/20 transition-colors">
                <UserIcon />
                <span className="text-xs mt-1 text-gray-700">Santri</span>
              </a>
              <a href="/admin/topup" className="flex flex-col items-center p-3 bg-green-100 rounded-lg hover:bg-green-200 transition-colors">
                <WalletIcon />
                <span className="text-xs mt-1 text-gray-700">Top-up</span>
              </a>
              <a href="/admin/keuangan" className="flex flex-col items-center p-3 bg-yellow-100 rounded-lg hover:bg-yellow-200 transition-colors">
                <MoneyIcon />
                <span className="text-xs mt-1 text-gray-700">Keuangan</span>
              </a>
              <a href="/admin/ustadz" className="flex flex-col items-center p-3 bg-blue-100 rounded-lg hover:bg-blue-200 transition-colors">
                <TeacherIcon />
                <span className="text-xs mt-1 text-gray-700">Ustadz</span>
              </a>
            </div>
          </Card>

          {/* Recent Violations */}
          <Card variant="bordered">
            <CardHeader title="Pelanggaran Terbaru" subtitle="Hari ini" />
            <div className="space-y-3">
              {recentPelanggaran.map((pelanggaran) => (
                <div key={pelanggaran.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertIcon />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{pelanggaran.nama}</p>
                    <p className="text-xs text-gray-500">{pelanggaran.jenis}</p>
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
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Icons
function UserIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function TeacherIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function MoneyIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}
