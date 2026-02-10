import { requireAuth } from "@/lib/auth";
import { db } from "@/db";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

export default async function TransaksiPage() {
  const session = await requireAuth(["ADMIN", "ORANG_TUA"]);

  // Fetch data from Google Sheets
  const santris = await db.select('santris');
  const transaksis = await db.select('transaksis');

  // Filter transaksi based on role
  let filteredTransaksis = transaksis;
  if (session.role === "ORANG_TUA") {
    // Orang tua only sees their children's transactions
    const orangTua = await db.select('orangTua');
    const currentOrangTua = orangTua.find(ot => ot.userId === session.id);
    if (currentOrangTua) {
      const mySantriIds = santris
        .filter(s => s.orangTuaId === currentOrangTua.id)
        .map(s => s.id);
      filteredTransaksis = transaksis.filter(t => mySantriIds.includes(t.SantriId));
    }
  }

  return (
    <DashboardLayout
      role={session.role}
      userName={session.name}
      userId={String(session.id)}
      pageTitle="Riwayat Transaksi"
    >

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Riwayat Transaksi</h2>
        <p className="text-gray-500">
          {session.role === "ORANG_TUA" 
            ? "Lihat riwayat transaksi anak Anda" 
            : "Lihat riwayat transaksi santri"}
        </p>
      </div>

      <Card variant="bordered">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIS</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Santri</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nominal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTransaksis.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Tidak ada data transaksi
                  </td>
                </tr>
              ) : (
                filteredTransaksis.map((transaksi) => {
                  const santri = santris.find(s => s.id === transaksi.SantriId);
                  return (
                    <tr key={transaksi.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500">{transaksi.tanggal}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{santri?.nis || "-"}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{santri?.nama || "Unknown"}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={transaksi.jenis === "TOPUP" ? "success" : "danger"}
                        >
                          {transaksi.jenis}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{transaksi.kategori}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {formatCurrency(parseInt(transaksi.nominal) || 0)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{transaksi.deskripsi || "-"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
