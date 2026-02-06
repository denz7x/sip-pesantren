import { requireAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";

const allTransactions = [
  { id: 1, tanggal: "2024-01-15", kategori: "TOPUP", nominal: 500000, saldo: 850000, desc: "Top-up dari Orang Tua" },
  { id: 2, tanggal: "2024-01-15", kategori: "DEBIT", nominal: 25000, saldo: 825000, desc: "Kantin - Makan Siang" },
  { id: 3, tanggal: "2024-01-14", kategori: "DEBIT", nominal: 30000, saldo: 795000, desc: "Laundry" },
  { id: 4, tanggal: "2024-01-14", kategori: "TOPUP", nominal: 200000, saldo: 995000, desc: "Top-up dari Orang Tua" },
  { id: 5, tanggal: "2024-01-13", kategori: "DEBIT", nominal: 20000, saldo: 795000, desc: "Kantin - Snack" },
  { id: 6, tanggal: "2024-01-12", kategori: "TOPUP", nominal: 300000, saldo: 815000, desc: "Top-up dari Orang Tua" },
  { id: 7, tanggal: "2024-01-11", kategori: "DEBIT", nominal: 15000, saldo: 515000, desc: "Kantin - Makan Siang" },
];

export default async function OrangTuaTransaksiPage() {
  const session = await requireAuth(["ORANG_TUA"]);

  return (
    <DashboardLayout
      role="ORANG_TUA"
      userName={session.name}
      pageTitle="Riwayat Transaksi"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Riwayat Transaksi</h2>
        <p className="text-gray-500">Pencatatan keuangan Ananda</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card variant="bordered" className="text-center">
          <p className="text-sm text-gray-500 mb-1">Total Top-up</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(allTransactions.filter(t => t.kategori === "TOPUP").reduce((a, b) => a + b.nominal, 0))}
          </p>
        </Card>
        <Card variant="bordered" className="text-center">
          <p className="text-sm text-gray-500 mb-1">Total Pengeluaran</p>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(allTransactions.filter(t => t.kategori === "DEBIT").reduce((a, b) => a + b.nominal, 0))}
          </p>
        </Card>
        <Card variant="bordered" className="text-center">
          <p className="text-sm text-gray-500 mb-1">Saldo Saat Ini</p>
          <p className="text-2xl font-bold text-[#2d9596]">
            {formatCurrency(allTransactions[0]?.saldo || 0)}
          </p>
        </Card>
      </div>

      {/* Transaction List */}
      <Card variant="bordered">
        <CardHeader title="Semua Transaksi" subtitle="Riwayat lengkap" />
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nominal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saldo</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {allTransactions.map((trans) => (
                <tr key={trans.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{trans.tanggal}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      trans.kategori === "TOPUP"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {trans.kategori === "TOPUP" ? "Top-up" : "Debit"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{trans.desc}</td>
                  <td className={`px-4 py-3 text-sm font-medium ${
                    trans.kategori === "TOPUP" ? "text-green-600" : "text-red-600"
                  }`}>
                    {trans.kategori === "TOPUP" ? "+" : "-"}{formatCurrency(trans.nominal)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{formatCurrency(trans.saldo)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
