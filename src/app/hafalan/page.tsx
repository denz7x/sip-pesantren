import { requireAuth } from "@/lib/auth";

import { db } from "@/db";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function HafalanPage() {
  const session = await requireAuth(["ADMIN", "USTADZ", "ORANG_TUA"]);

  // Fetch data from Google Sheets
  const santris = await db.select('santris');
  const ustadzs = await db.select('ustadzs');
  const hafalans = await db.select('setoranHafalans');

  // Filter hafalan based on role
  let filteredHafalans = hafalans;
  if (session.role === "ORANG_TUA") {
    // Orang tua only sees their children's hafalan
    const orangTua = await db.select('orangTua');
    const currentOrangTua = orangTua.find(ot => ot.userId === session.id);

    if (currentOrangTua) {
      const mySantriIds = santris
        .filter(s => s.orangTuaId === currentOrangTua.id)
        .map(s => s.id);
      filteredHafalans = hafalans.filter(h => mySantriIds.includes(h.SantriId));
    }
  }

  return (
    <DashboardLayout
      role={session.role}
      userName={session.name}
      userId={String(session.id)}
      pageTitle="Riwayat Hafalan"
    >


      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Riwayat Hafalan</h2>
        <p className="text-gray-500">
          {session.role === "ORANG_TUA" 
            ? "Lihat riwayat hafalan anak Anda" 
            : "Lihat riwayat setoran hafalan santri"}
        </p>
      </div>

      <Card variant="bordered">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIS</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Santri</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Surat</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ayat</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kualitas</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nilai</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Penguji</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredHafalans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    Tidak ada data hafalan
                  </td>
                </tr>
              ) : (
                filteredHafalans.map((hafalan) => {
                  const santri = santris.find(s => s.id === hafalan.SantriId);
                  const ustadz = ustadzs.find(u => u.id === hafalan.ustadzId);
                  return (
                    <tr key={hafalan.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{santri?.nis || "-"}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{santri?.nama || "Unknown"}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{hafalan.namaSurat}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{hafalan.ayat}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{hafalan.tanggal}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            hafalan.kualitas === "SANGAT_BAIK" ? "success" :
                            hafalan.kualitas === "BAIK" ? "info" :
                            hafalan.kualitas === "CUKUP" ? "warning" : "danger"
                          }
                        >
                          {hafalan.kualitas}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{hafalan.nilai}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{ustadz?.nama || "-"}</td>
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
