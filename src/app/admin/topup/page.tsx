import { requireAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";

const recentTopups = [
  { id: 1, nis: "2024001", nama: "Ahmad Santoso", nominal: 500000, status: "BERHASIL", waktu: "08:30", admin: "Pengelola" },
  { id: 2, nis: "2024003", nama: "Muhammad Yusuf", nominal: 200000, status: "BERHASIL", waktu: "09:15", admin: "Pengelola" },
  { id: 3, nis: "2024005", nama: "Abdullah Kamal", nominal: 100000, status: "BERHASIL", waktu: "10:00", admin: "Pengelola" },
  { id: 4, nis: "2024002", nama: "Fatimah Azzahra", nominal: 150000, status: "PENDING", waktu: "10:45", admin: "-" },
];

export default async function AdminTopupPage() {
  const session = await requireAuth(["ADMIN"]);

  return (
    <DashboardLayout
      role="ADMIN"
      userName={session.name}
      pageTitle="Top-up Saldo Santri"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Top-up Saldo</h2>
          <p className="text-gray-500">Tambah saldo dompet siswa</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Form Topup */}
        <div className="lg:col-span-2">
          <Card variant="bordered">
            <CardHeader title="Form Top-up" subtitle="Isi data di bawah ini" />
            <form className="space-y-4">
              <Input label="NIS Santri" placeholder="Masukkan NIS" />
              <Input label="Nama Santri" placeholder="Nama lengkap" />
              <Input label="Nominal" type="number" placeholder="Rp 0" />
              <Input label="Catatan" placeholder="Opsional" />
              <div className="flex gap-3">
                <Button type="submit">Proses Top-up</Button>
                <Button type="reset" variant="outline">Reset</Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <Card variant="bordered">
            <CardHeader title="Statistik Hari Ini" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Transaksi</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Nominal</span>
                <span className="font-semibold text-green-600">{formatCurrency(1250000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Pending</span>
                <span className="font-semibold text-yellow-600">1</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Riwayat Topup */}
      <Card variant="bordered">
        <CardHeader title="Riwayat Top-up" subtitle="Transaksi hari ini" />
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIS</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nominal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentTopups.map((topup) => (
                <tr key={topup.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">{topup.waktu}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{topup.nis}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{topup.nama}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(topup.nominal)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      topup.status === "BERHASIL" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-yellow-100 text-yellow-800"
                    }`}>
                      {topup.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{topup.admin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
