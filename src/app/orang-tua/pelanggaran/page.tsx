import { requireAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Badge } from "@/components/ui/Badge";
import { db } from "@/db";

export default async function OrangTuaPelanggaranPage() {
  const session = await requireAuth(["ORANG_TUA"]);
  
  // Fetch data from database
  const santris = await db.select("santris");
  const pelanggarans = await db.select("pelanggarans");
  const orangTuas = await db.select("orangTua");
  
  // Find the current orang tua
  const sessionIdNum = Number(session.id);
  const currentOrangTua = orangTuas.find((ot: any) => Number(ot.userId) === sessionIdNum);
  
  // Find the santri that belongs to this orang tua
  const child = currentOrangTua 
    ? santris.find((s: any) => Number(s.orangTuaId) === Number(currentOrangTua.id))
    : null;
  
  // Get pelanggaran for this child
  const childPelanggarans = child 
    ? pelanggarans
        .filter((p: any) => Number(p.SantriId) === Number(child.id))
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  // Calculate stats
  const totalPelanggaran = childPelanggarans.length;
  const totalPoin = childPelanggarans.reduce((sum: number, p: any) => sum + (parseInt(p.poinSanksi) || 0), 0);
  const ringanCount = childPelanggarans.filter((p: any) => p.kategori === "RINGAN").length;
  const sedangCount = childPelanggarans.filter((p: any) => p.kategori === "SEDANG").length;
  const beratCount = childPelanggarans.filter((p: any) => p.kategori === "BERAT").length;

  return (
    <DashboardLayout
      role="ORANG_TUA"
      userName={session.name}
      userId={String(session.id)}
      pageTitle="Riwayat Pelanggaran"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Riwayat Pelanggaran</h2>
        <p className="text-gray-500">Catatan kedisiplinan Ananda</p>
      </div>

      {!child ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-gray-600 font-medium">Tidak ada data santri yang terdaftar.</p>
          <p className="text-gray-400 text-sm mt-1">Silakan hubungi admin untuk mendaftarkan anak Anda.</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="glass-card rounded-2xl p-4 text-center bg-gradient-to-br from-red-50 to-red-100/50 border-red-200">
              <p className="text-sm text-gray-500 mb-1">Total Pelanggaran</p>
              <p className="text-2xl font-bold text-red-600">{totalPelanggaran}</p>
            </div>
            <div className="glass-card rounded-2xl p-4 text-center bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200">
              <p className="text-sm text-gray-500 mb-1">Total Poin</p>
              <p className="text-2xl font-bold text-yellow-600">{totalPoin}</p>
            </div>
            <div className="glass-card rounded-2xl p-4 text-center bg-gradient-to-br from-orange-50 to-orange-100/50 border-orange-200">
              <p className="text-sm text-gray-500 mb-1">Ringan</p>
              <p className="text-2xl font-bold text-orange-600">{ringanCount}</p>
            </div>
            <div className="glass-card rounded-2xl p-4 text-center bg-gradient-to-br from-red-50 to-red-100/50 border-red-200">
              <p className="text-sm text-gray-500 mb-1">Sedang/Berat</p>
              <p className="text-2xl font-bold text-red-600">{sedangCount + beratCount}</p>
            </div>
          </div>

          {/* Pelanggaran List */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Daftar Pelanggaran</h3>
              <p className="text-xs text-gray-400">Riwayat lengkap pelanggaran dan sanksi</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Poin</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {childPelanggarans.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                        <div className="flex flex-col items-center">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
                            <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <p className="text-green-600 font-medium">Tidak ada pelanggaran!</p>
                          <p className="text-gray-400 text-sm mt-1">Ananda tetap disiplin</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    childPelanggarans.map((p: any) => (
                      <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900">{p.tanggal}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800 max-w-[200px] truncate">
                          {p.jenisPelanggaran}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              p.kategori === "RINGAN" ? "warning" :
                              p.kategori === "SEDANG" ? "danger" : "danger"
                            }
                            size="sm"
                          >
                            {p.kategori}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm font-bold text-red-600">{p.poinSanksi}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{p.tindakan}</td>
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
