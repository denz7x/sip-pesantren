import { requireAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const ustadzs = [
  { id: 1, nip: "UST001", nama: "Ustadz Ahmad", spesialisasi: "Tahfidz", status: "AKTIF", kelas: "Kelas 1" },
  { id: 2, nip: "UST002", nama: "Ustadz Budi", spesialisasi: "Fiqih", status: "AKTIF", kelas: "Kelas 2" },
  { id: 3, nip: "UST003", nama: "Ustadz Chandra", spesialisasi: "Aqidah", status: "AKTIF", kelas: "Kelas 3" },
  { id: 4, nip: "UST004", nama: "Ustadz Dewi", spesialisasi: "Bahasa Arab", status: "CUTI", kelas: "-" },
];

export default async function AdminUstadzPage() {
  const session = await requireAuth(["ADMIN"]);

  return (
    <DashboardLayout
      role="ADMIN"
      userName={session.name}
      pageTitle="Kelola Ustadz"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Ustadz</h2>
          <p className="text-gray-500">Kelola data pengajar di pondok</p>
        </div>
        <Button>+ Tambah Ustadz</Button>
      </div>

      <Card variant="bordered">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIP</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Spesialisasi</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kelas</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ustadzs.map((ustadz) => (
                <tr key={ustadz.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{ustadz.nip}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{ustadz.nama}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{ustadz.spesialisasi}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{ustadz.kelas}</td>
                  <td className="px-4 py-3">
                    <Badge variant={ustadz.status === "AKTIF" ? "success" : "warning"}>
                      {ustadz.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="outline" size="sm">Detail</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </DashboardLayout>
  );
}
