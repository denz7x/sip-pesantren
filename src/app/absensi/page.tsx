import { requireAuth } from "@/lib/auth";
import { db } from "@/db";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default async function AbsensiPage() {
  const session = await requireAuth(["ADMIN", "USTADZ", "ORANG_TUA"]);

  // Determine role-based dashboard path
  const dashboardPath = session.role === "ADMIN" 
    ? "/admin" 
    : session.role === "USTADZ" 
    ? "/ustadz" 
    : "/orang-tua";

  // Fetch data from Google Sheets
  const santris = await db.select('santris');
  const absensis = await db.select('absensis');

  // Filter absensi based on role
  let filteredAbsensis = absensis;
  if (session.role === "ORANG_TUA") {
    // Orang tua only sees their children's absensi
    const orangTua = await db.select('orangTua');
    const currentOrangTua = orangTua.find(ot => ot.userId === session.id);

    if (currentOrangTua) {
      const mySantriIds = santris
        .filter(s => s.orangTuaId === currentOrangTua.id)
        .map(s => s.id);
      filteredAbsensis = absensis.filter(a => mySantriIds.includes(a.SantriId));
    }
  }

  return (
    <DashboardLayout
      role={session.role}
      userName={session.name}
      userId={String(session.id)}
      pageTitle="Riwayat Absensi"
    >

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Riwayat Absensi</h2>
        <p className="text-gray-500">
          {session.role === "ORANG_TUA" 
            ? "Lihat riwayat absensi anak Anda" 
            : "Lihat riwayat absensi santri"}
        </p>
      </div>

      <Card variant="bordered">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIS</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Santri</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kelas</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keterangan</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAbsensis.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Tidak ada data absensi
                  </td>
                </tr>
              ) : (
                filteredAbsensis.map((absen) => {
                  const santri = santris.find(s => s.id === absen.SantriId);
                  return (
                    <tr key={absen.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{santri?.nis || "-"}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{santri?.nama || "Unknown"}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{santri?.kelas || "-"}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{absen.tanggal}</td>
                      <td className="px-4 py-3">
                        <Badge
                          variant={
                            absen.status === "HADIR" ? "success" :
                            absen.status === "SAKIT" ? "warning" :
                            absen.status === "IZIN" ? "info" : "danger"
                          }
                        >
                          {absen.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{absen.keterangan || "-"}</td>
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
