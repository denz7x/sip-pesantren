import { requireAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { formatCurrency } from "@/lib/utils";

const transactions = [
  { nis: "2024001", nama: "Ahmad Santoso", kategori: "KANTIN", nominal: 15000, status: "BERHASIL" },
  { nis: "2024002", nama: "Fatimah Azzahra", kategori: "LAUNDRY", nominal: 25000, status: "BERHASIL" },
  { nis: "2024003", nama: "Muhammad Yusuf", kategori: "KANTIN", nominal: 10000, status: "BERHASIL" },
];

export default async function UstadzKasirPage() {
  const session = await requireAuth(["USTADZ"]);

  return (
    <DashboardLayout
      role="USTADZ"
      userName={session.name}
      pageTitle="POS / Kasir"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Transaksi Kasir</h2>
        <p className="text-gray-500">Catat transaksi pembayaran siswa</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Form Transaksi */}
        <div className="lg:col-span-2">
          <Card variant="bordered">
            <CardHeader title="Form Transaksi" subtitle="Isi data di bawah ini" />
            <form className="space-y-4">
              <Input label="NIS Santri" placeholder="Masukkan NIS" />
              <Input label="Nama Santri" placeholder="Nama lengkap" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option>Pilih kategori...</option>
                  <option>KANTIN</option>
                  <option>LAUNDRY</option>
                  <option>PERPUSTAKAAN</option>
                  <option>OTHER</option>
                </select>
              </div>
              <Input label="Nominal" type="number" placeholder="Rp 0" />
              <Input label="Catatan" placeholder="Deskripsi transaksi" />
              <div className="flex gap-3">
                <Button type="submit" className="bg-green-600 hover:bg-green-700">Proses Pembayaran</Button>
                <Button type="reset" variant="outline">Reset</Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Today's Summary */}
        <div className="lg:col-span-1">
          <Card variant="bordered">
            <CardHeader title="Hari Ini" subtitle="Ringkasan transaksi" />
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg">
                <span className="text-sm text-gray-600">Total Transaksi</span>
                <span className="text-xl font-bold text-green-600">12</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#2d9596]/10 rounded-lg">
                <span className="text-sm text-gray-600">Total Pendapatan</span>
                <span className="text-xl font-bold text-[#2d9596]">{formatCurrency(850000)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Transactions */}
      <Card variant="bordered">
        <CardHeader title="Transaksi Terbaru" subtitle="Hari ini" />
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIS</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nominal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((trans, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">08:3{idx}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{trans.nis}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{trans.nama}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{trans.kategori}</td>
                  <td className="px-4 py-3 text-sm font-medium text-red-600">-{formatCurrency(trans.nominal)}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {trans.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
