import { requireAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader, StatCard } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import { db } from "@/db";

export default async function AdminKeuanganPage() {
  const session = await requireAuth(["ADMIN"]);
  
  // Fetch real data from database
  const transaksis = await db.select("transaksis");
  
  // Calculate financial summary
  const totalPemasukan = transaksis
    .filter((t: any) => t.jenis === "TOPUP")
    .reduce((sum: number, t: any) => sum + (parseInt(t.nominal) || 0), 0);
    
  const totalPengeluaran = transaksis
    .filter((t: any) => t.jenis === "DEBIT" || t.jenis === "PENGELUARAN")
    .reduce((sum: number, t: any) => sum + (parseInt(t.nominal) || 0), 0);
    
  const saldoKas = totalPemasukan - totalPengeluaran;
  
  // Get recent transactions (last 10)
  const recentKeuangan = transaksis
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
    .map((t: any) => ({
      id: t.id,
      tanggal: t.tanggal,
      kategori: t.jenis === "TOPUP" ? "PEMASUKAN" : "PENGELUARAN",
      deskripsi: t.deskripsi || t.kategori,
      nominal: parseInt(t.nominal) || 0,
    }));


  return (
    <DashboardLayout
      role="ADMIN"
      userName={session.name}
      userId={String(session.id)}
      pageTitle="Rekapitulasi Keuangan"
    >

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Rekapitulasi Keuangan</h2>
        <p className="text-gray-500">Pencatatan keuangan pondok</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Pemasukan"
          value={formatCurrency(totalPemasukan)}
          icon={<ArrowUpIcon />}
          color="green"
        />
        <StatCard
          title="Total Pengeluaran"
          value={formatCurrency(totalPengeluaran)}
          icon={<ArrowDownIcon />}
          color="red"
        />
        <StatCard
          title="Saldo Kas"
          value={formatCurrency(saldoKas)}
          icon={<WalletIcon />}
          color="tosc"
        />
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <Card variant="bordered">
            <CardHeader title="Transaksi Terbaru" subtitle="Pencatatan keuangan" />
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nominal</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentKeuangan.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                        Belum ada transaksi
                      </td>
                    </tr>
                  ) : (
                    recentKeuangan.map((trans) => (
                      <tr key={trans.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-500">{trans.tanggal}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            trans.kategori === "PEMASUKAN"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {trans.kategori}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{trans.deskripsi}</td>
                        <td className={`px-4 py-3 text-sm font-medium ${
                          trans.kategori === "PEMASUKAN" ? "text-green-600" : "text-red-600"
                        }`}>
                          {trans.kategori === "PEMASUKAN" ? "+" : "-"}{formatCurrency(trans.nominal)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>

              </table>
            </div>
          </Card>
        </div>

        {/* Summary by Category */}
        <div className="lg:col-span-1">
          <Card variant="bordered">
            <CardHeader title="Ringkasan per Kategori" subtitle="Semua transaksi" />
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-500">Total Pemasukan (Top-up)</span>
                  <span className="text-sm font-medium text-green-600">{formatCurrency(totalPemasukan)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: totalPemasukan > 0 ? "100%" : "0%" }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-500">Total Pengeluaran</span>
                  <span className="text-sm font-medium text-red-600">{formatCurrency(totalPengeluaran)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: totalPemasukan > 0 ? `${(totalPengeluaran / totalPemasukan) * 100}%` : "0%" }} />
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-700">Saldo Kas</span>
                  <span className={`text-sm font-bold ${saldoKas >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(saldoKas)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  );
}

function ArrowUpIcon() {
  return (
    <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}

function ArrowDownIcon() {
  return (
    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg className="w-6 h-6 text-[#2d9596]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}
