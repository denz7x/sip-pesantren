import { requireAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { db } from "@/db";

export default async function OrangTuaAbsensiPage() {
  const session = await requireAuth(["ORANG_TUA"]);
  
  // Fetch data from database
  const santris = await db.select("santris");
  const absensis = await db.select("absensis");
  const orangTuas = await db.select("orangTua");
  
  // Find the current orang tua
  const sessionIdNum = Number(session.id);
  const currentOrangTua = orangTuas.find((ot: any) => Number(ot.userId) === sessionIdNum);
  
  // Find the santri that belongs to this orang tua
  const child = currentOrangTua 
    ? santris.find((s: any) => Number(s.orangTuaId) === Number(currentOrangTua.id))
    : null;
  
  // Get absensi for this child
  const childAbsensi = child 
    ? absensis
        .filter((a: any) => Number(a.SantriId) === Number(child.id))
        .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  // Calculate stats
  const totalHadir = childAbsensi.filter((a: any) => a.status === "HADIR").length;
  const totalSakit = childAbsensi.filter((a: any) => a.status === "SAKIT").length;
  const totalIzin = childAbsensi.filter((a: any) => a.status === "IZIN").length;
  const totalAlpha = childAbsensi.filter((a: any) => a.status === "ALPHA").length;

  return (
    <DashboardLayout
      role="ORANG_TUA"
      userName={session.name}
      userId={String(session.id)}
      pageTitle="Riwayat Absensi"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Riwayat Absensi</h2>
        <p className="text-gray-500">Catatan kehadiran Ananda</p>
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
            <div className="glass-card rounded-2xl p-4 text-center bg-gradient-to-br from-green-50 to-green-100/50 border-green-200">
              <p className="text-sm text-gray-500 mb-1">Hadir</p>
              <p className="text-2xl font-bold text-green-600">{totalHadir}</p>
            </div>
            <div className="glass-card rounded-2xl p-4 text-center bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200">
              <p className="text-sm text-gray-500 mb-1">Sakit</p>
              <p className="text-2xl font-bold text-yellow-600">{totalSakit}</p>
            </div>
            <div className="glass-card rounded-2xl p-4 text-center bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200">
              <p className="text-sm text-gray-500 mb-1">Izin</p>
              <p className="text-2xl font-bold text-blue-600">{totalIzin}</p>
            </div>
            <div className="glass-card rounded-2xl p-4 text-center bg-gradient-to-br from-red-50 to-red-100/50 border-red-200">
              <p className="text-sm text-gray-500 mb-1">Alpha</p>
              <p className="text-2xl font-bold text-red-600">{totalAlpha}</p>
            </div>
          </div>

          {/* Absensi List */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Daftar Kehadiran</h3>
              <p className="text-xs text-gray-400">Riwayat lengkap absensi</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keterangan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {childAbsensi.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
                        Belum ada data absensi
                      </td>
                    </tr>
                  ) : (
                    childAbsensi.map((a: any) => (
                      <tr key={a.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 text-sm text-gray-900">{a.tanggal}</td>
                        <td className="px-4 py-3">
                          <AttendanceBadge status={a.status} />
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">{a.keterangan || "-"}</td>
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

function AttendanceBadge({ status }: { status: string }) {
  const variants: Record<string, { class: string; label: string }> = {
    HADIR: { class: "bg-green-100 text-green-700", label: "Hadir" },
    SAKIT: { class: "bg-yellow-100 text-yellow-700", label: "Sakit" },
    IZIN: { class: "bg-blue-100 text-blue-700", label: "Izin" },
    ALPHA: { class: "bg-red-100 text-red-700", label: "Alpha" },
  };

  const variant = variants[status] || { class: "bg-gray-100 text-gray-600", label: status };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variant.class}`}>
      {variant.label}
    </span>
  );
}
