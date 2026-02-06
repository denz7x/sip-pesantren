import { requireAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const setoranHafalan = [
  { nis: "2024001", nama: "Ahmad Santoso", surat: "Al-Baqarah", ayat: "1-10", nilai: 95 },
  { nis: "2024002", nama: "Fatimah Azzahra", surat: "Al-Baqarah", ayat: "1-5", nilai: 88 },
  { nis: "2024003", nama: "Muhammad Yusuf", surat: "An-Nisa", ayat: "1-8", nilai: 92 },
];

export default async function UstadzHafalanPage() {
  const session = await requireAuth(["USTADZ"]);

  return (
    <DashboardLayout
      role="USTADZ"
      userName={session.name}
      pageTitle="Setoran Hafalan"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Catat Setoran Hafalan</h2>
        <p className="text-gray-500">Rekam setoran hafalan Al-Quran siswa</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Form Input */}
        <div className="lg:col-span-2">
          <Card variant="bordered">
            <CardHeader title="Form Setoran Hafalan" subtitle="Isi data di bawah ini" />
            <form className="space-y-4">
              <Input label="NIS Santri" placeholder="Masukkan NIS" />
              <Input label="Nama Santri" placeholder="Nama lengkap" />
              <div className="grid grid-cols-2 gap-4">
                <Input label="Surat" placeholder="Nama surat" />
                <Input label="Ayat" placeholder="Contoh: 1-10" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kualitas Hafalan</label>
                <div className="flex gap-2">
                  {["SANGAT_BAIK", "BAIK", "CUKUP", "KURANG"].map((kualitas) => (
                    <Button key={kualitas} variant="outline" type="button" size="sm">
                      {kualitas.replace("_", " ")}
                    </Button>
                  ))}
                </div>
              </div>
              <Input label="Nilai" type="number" placeholder="0-100" />
              <Input label="Catatan" placeholder="Catatan untuk siswa" />
              <div className="flex gap-3">
                <Button type="submit">Simpan</Button>
                <Button type="reset" variant="outline">Reset</Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Today's Summary */}
        <div className="lg:col-span-1">
          <Card variant="bordered">
            <CardHeader title="Hari Ini" subtitle="Ringkasan setoran" />
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-[#2d9596]/10 rounded-lg">
                <span className="text-sm text-gray-600">Total Setoran</span>
                <span className="text-xl font-bold text-[#2d9596]">18</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg">
                <span className="text-sm text-gray-600">Rata-rata Nilai</span>
                <span className="text-xl font-bold text-green-600">92</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Setoran */}
      <Card variant="bordered">
        <CardHeader title="Setoran Terbaru" subtitle="Hari ini" />
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIS</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Surat</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ayat</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nilai</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {setoranHafalan.map((setoran) => (
                <tr key={setoran.nis} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">{setoran.nis}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{setoran.nama}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{setoran.surat}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{setoran.ayat}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{setoran.nilai}</td>
                  <td className="px-4 py-3">
                    <Button variant="outline" size="sm">Edit</Button>
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
