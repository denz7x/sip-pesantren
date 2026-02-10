import { requireAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import { db } from "@/db";

export default async function OrangTuaTransaksiPage() {
  const session = await requireAuth(["ORANG_TUA"]);
  
  // Fetch data from database
  const santris = await db.select("santris");
  const transaksis = await db.select("transaksis");
  const orangTuas = await db.select("orangTua");
  
  // Find the current orang tua
  const sessionIdNum = Number(session.id);
  const currentOrangTua = orangTuas.find((ot: any) => Number(ot.userId) === sessionIdNum);
  
  // Find the santri that belongs to this orang tua
  const child = currentOrangTua 
    ? santris.find((s: any) => Number(s.orangTuaId) === Number(currentOrangTua.id))
    : null;
  
  // Get transactions for this child
  const childTransactions = child 
    ? transaksis
        .filter((t: any) => Number(t.SantriId) === Number(child.id))
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map((t: any) => ({
          id: t.id,
          tanggal: t.tanggal,
          kategori: t.jenis,
          nominal: parseInt(t.nominal) || 0,
          saldo: parseInt(t.saldoSetelah) || 0,
          desc: t.deskripsi || "-",
        }))
    : [];

  // Calculate summary
  const totalTopup = childTransactions
    .filter((t: any) => t.kategori === "TOPUP")
    .reduce((sum: number, t: any) => sum + t.nominal, 0);
    
  const totalPengeluaran = childTransactions
    .filter((t: any) => t.kategori === "PAYMENT" || t.kategori === "DEBIT")
    .reduce((sum: number, t: any) => sum + t.nominal, 0);
    
  const currentSaldo = child?.saldoDompet || 0;

  return (
    <DashboardLayout
      role="ORANG_TUA"
      userName={session.name}
      userId={String(session.id)}
      pageTitle="Riwayat Transaksi"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Riwayat Transaksi</h2>
        <p className="text-gray-500">Pencatatan keuangan Ananda</p>
      </div>

      {!child ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-gray-600 font-medium">Tidak ada data santri yang terdaftar.</p>
          <p className="text-gray-400 text-sm mt-1">Silakan hubungi admin untuk mendaftarkan anak Anda.</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="glass-card rounded-2xl p-6 text-center bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
              <p className="text-sm text-gray-500 mb-1">Total Top-up</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(totalTopup)}
              </p>
            </div>
            <div className="glass-card rounded-2xl p-6 text-center bg-gradient-to-br from-red-50 to-red-100/50 border-red-200">
              <p className="text-sm text-gray-500 mb-1">Total Pengeluaran</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(totalPengeluaran)}
              </p>
            </div>
            <div className="glass-card rounded-2xl p-6 text-center bg-gradient-to-br from-tosca-50 to-tosca-100/50 border-tosca-200">
              <p className="text-sm text-gray-500 mb-1">Saldo Saat Ini</p>
              <p className="text-2xl font-bold text-tosca-600">
                {formatCurrency(currentSaldo)}
              </p>
            </div>
          </div>

          {/* Transaction List */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Semua Transaksi</h3>
              <p className="text-xs text-gray-400">Riwayat lengkap keuangan</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nominal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saldo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {childTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                        Belum ada transaksi
                      </td>
                    </tr>
                  ) : (
                    childTransactions.map((trans: any) => (
                      <tr key={trans.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900">{trans.tanggal}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            trans.kategori === "TOPUP"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}>
                            {trans.kategori === "TOPUP" ? "Top-up" : "Pembayaran"}
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
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
