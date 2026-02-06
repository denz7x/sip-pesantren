import { requireAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const santris = [
  { nis: "2024001", nama: "Ahmad Santoso", status: "HADIR" },
  { nis: "2024002", nama: "Fatimah Azzahra", status: null },
  { nis: "2024003", nama: "Muhammad Yusuf", status: "IZIN" },
  { nis: "2024004", nama: "Aisyah Rahma", status: "HADIR" },
  { nis: "2024005", nama: "Abdullah Kamal", status: "SAKIT" },
];

export default async function UstadzAbsensiPage() {
  const session = await requireAuth(["USTADZ"]);

  return (
    <DashboardLayout
      role="USTADZ"
      userName={session.name}
      pageTitle="Input Absensi"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Input Absensi Harian</h2>
        <p className="text-gray-500">Catat kehadiran siswa untuk hari ini</p>
      </div>

      <Card variant="bordered">
        <div className="mb-4 flex items-center justify-between">
          <CardHeader title="Daftar Santri" subtitle="Kelas yang Anda ampu" />
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Simpan Draft</Button>
            <Button size="sm">Simpan & Kirim</Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIS</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status Kehadiran</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {santris.map((santri) => (
                <tr key={santri.nis} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">{santri.nis}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{santri.nama}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant={santri.status === "HADIR" ? "primary" : "outline"}
                        size="sm"
                        className={santri.status === "HADIR" ? "bg-green-600" : ""}
                      >
                        HADIR
                      </Button>
                      <Button variant={santri.status === "SAKIT" ? "primary" : "outline"} size="sm">
                        SAKIT
                      </Button>
                      <Button variant={santri.status === "IZIN" ? "primary" : "outline"} size="sm">
                        IZIN
                      </Button>
                      <Button variant={santri.status === "ALPHA" ? "primary" : "outline"} size="sm">
                        ALPHA
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="mt-4 text-right">
        <p className="text-sm text-gray-500">
          Hadir: 2 | Sakit: 1 | Izin: 1 | Alpha: 1
        </p>
      </div>
    </DashboardLayout>
  );
}
