import { requireAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { db } from "@/db";

export default async function OrangTuaHafalanPage() {
  const session = await requireAuth(["ORANG_TUA"]);
  
  // Fetch data from database
  const santris = await db.select("santris");
  const hafalans = await db.select("setoranHafalans");
  const orangTuas = await db.select("orangTua");
  
  // Find the current orang tua
  const sessionIdNum = Number(session.id);
  const currentOrangTua = orangTuas.find((ot: any) => Number(ot.userId) === sessionIdNum);
  
  // Find the santri that belongs to this orang tua
  const child = currentOrangTua 
    ? santris.find((s: any) => Number(s.orangTuaId) === Number(currentOrangTua.id))
    : null;
  
  // Get hafalan for this child
  const childHafalans = child 
    ? hafalans
        .filter((h: any) => Number(h.SantriId) === Number(child.id))
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  // Calculate stats with proper validation
  const totalSetoran = childHafalans.length;
  
  // Parse nilai with validation - ensure it's a valid number between 0-100
  const validNilai = childHafalans.map((h: any) => {
    const nilai = parseInt(h.nilai);
    return !isNaN(nilai) && nilai >= 0 && nilai <= 100 ? nilai : 0;
  });
  
  const avgNilai = totalSetoran > 0 && validNilai.length > 0
    ? Math.round(validNilai.reduce((sum: number, n: number) => sum + n, 0) / validNilai.length)
    : 0;


  return (
    <DashboardLayout
      role="ORANG_TUA"
      userName={session.name}
      userId={String(session.id)}
      pageTitle="Riwayat Hafalan"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Riwayat Hafalan</h2>
        <p className="text-gray-500">Setoran dan perkembangan hafalan Ananda</p>
      </div>

      {!child ? (
        <div className="glass-card rounded-2xl p-8 text-center">
          <p className="text-gray-600 font-medium">Tidak ada data santri yang terdaftar.</p>
          <p className="text-gray-400 text-sm mt-1">Silakan hubungi admin untuk mendaftarkan anak Anda.</p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="glass-card rounded-2xl p-6 text-center bg-gradient-to-br from-tosca-50 to-tosca-100/50 border-tosca-200">
              <p className="text-sm text-gray-500 mb-1">Total Setoran</p>
              <p className="text-3xl font-bold text-tosca-600">{totalSetoran}</p>
              <p className="text-xs text-gray-400">kali setoran</p>
            </div>
            <div className="glass-card rounded-2xl p-6 text-center bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
              <p className="text-sm text-gray-500 mb-1">Rata-rata Nilai</p>
              <p className="text-3xl font-bold text-blue-600">{avgNilai}</p>
              <p className="text-xs text-gray-400">dari 100</p>
            </div>
            <div className="glass-card rounded-2xl p-6 text-center bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
              <p className="text-sm text-gray-500 mb-1">Kualitas Terbaik</p>
              <p className="text-xl font-bold text-green-600">
                {childHafalans.some((h: any) => h.kualitas === "SANGAT_BAIK") ? "Sangat Baik" : 
                 childHafalans.some((h: any) => h.kualitas === "BAIK") ? "Baik" : "-"}
              </p>
            </div>
          </div>

          {/* Hafalan List */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Daftar Setoran</h3>
              <p className="text-xs text-gray-400">Riwayat lengkap setoran hafalan</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Surat</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ayat</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kualitas</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nilai</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {childHafalans.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                        Belum ada setoran hafalan
                      </td>
                    </tr>
                  ) : (
                    childHafalans.map((h: any) => (
                      <tr key={h.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900">{h.tanggal}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-800">{h.namaSurat}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{h.ayat}</td>
                        <td className="px-4 py-3">
                          <TahfidzBadge quality={h.kualitas} />
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-bold ${
                            parseInt(h.nilai) >= 90 ? "text-green-600" :
                            parseInt(h.nilai) >= 80 ? "text-blue-600" :
                            parseInt(h.nilai) >= 70 ? "text-yellow-600" : "text-red-600"
                          }`}>
                            {h.nilai}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">
                          {h.catatan || "-"}
                        </td>
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

function TahfidzBadge({ quality }: { quality: string }) {
  const variants: Record<string, { class: string; label: string }> = {
    SANGAT_BAIK: { class: "bg-green-100 text-green-700", label: "Sangat Baik" },
    BAIK: { class: "bg-blue-100 text-blue-700", label: "Baik" },
    CUKUP: { class: "bg-yellow-100 text-yellow-700", label: "Cukup" },
    KURANG: { class: "bg-red-100 text-red-700", label: "Kurang" },
  };

  const variant = variants[quality] || { class: "bg-gray-100 text-gray-600", label: quality };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variant.class}`}>
      {variant.label}
    </span>
  );
}
