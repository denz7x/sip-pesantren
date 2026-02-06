import { requireAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";

// Demo data
const santris = [
  { nis: "2024001", nama: "Ahmad Santoso", kelas: "Kelas 1", orangTua: "Bpk. Hadi", saldo: 350000, status: "AKTIF" },
  { nis: "2024002", nama: "Fatimah Azzahra", kelas: "Kelas 2", orangTua: "Ibu Sari", saldo: 280000, status: "AKTIF" },
  { nis: "2024003", nama: "Muhammad Yusuf", kelas: "Kelas 3", orangTua: "Bpk. Anwar", saldo: 420000, status: "AKTIF" },
  { nis: "2024004", nama: "Aisyah Rahma", kelas: "Kelas 1", orangTua: "Ibu Dewi", saldo: 195000, status: "CUTI" },
  { nis: "2024005", nama: "Abdullah Kamal", kelas: "Kelas 2", orangTua: "Bpk. Rahman", saldo: 510000, status: "AKTIF" },
];

export default async function AdminSantriPage() {
  const session = await requireAuth(["ADMIN"]);

  return (
    <DashboardLayout
      role="ADMIN"
      userName={session.name}
      pageTitle="Kelola Santri"
    >
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Santri</h2>
          <p className="text-gray-500">Kelola data seluruh siswa di pondok</p>
        </div>
        <Button>+ Tambah Santri</Button>
      </div>

      <Card variant="bordered">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIS</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kelas</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orang Tua</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saldo</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {santris.map((santri) => (
                <tr key={santri.nis} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{santri.nis}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{santri.nama}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{santri.kelas}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{santri.orangTua}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(santri.saldo)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={santri.status === "AKTIF" ? "success" : "warning"}>
                      {santri.status}
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
