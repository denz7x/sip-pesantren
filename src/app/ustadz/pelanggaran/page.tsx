import { requireAuth } from "@/lib/auth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";

const pelanggaranList = [
  { nis: "2024003", nama: "Muhammad Yusuf", jenis: "Terlambat Shalat", kategori: "RINGAN", poin: 5 },
  { nis: "2024005", nama: "Abdullah Kamal", jenis: "Tidak Membawa Kitab", kategori: "RINGAN", poin: 3 },
];

export default async function UstadzPelanggaranPage() {
  const session = await requireAuth(["USTADZ"]);

  return (
    <DashboardLayout
      role="USTADZ"
      userName={session.name}
      pageTitle="Jurnal Pelanggaran"
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Catat Pelanggaran</h2>
        <p className="text-gray-500">Rekam pelanggaran kedisiplinan siswa</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Form Input */}
        <div className="lg:col-span-2">
          <Card variant="bordered">
            <CardHeader title="Form Pelanggaran" subtitle="Isi data di bawah ini" />
            <form className="space-y-4">
              <Input label="NIS Santri" placeholder="Masukkan NIS" />
              <Input label="Nama Santri" placeholder="Nama lengkap" />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Pelanggaran</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                  <option>Pilih jenis pelanggaran...</option>
                  <option>Terlambat Shalat</option>
                  <option>Tidak Membawa Kitab</option>
                  <option>Membuang Sampah Sembarangan</option>
                  <option>Berbicara Saat Pelajaran</option>
                  <option>Tidak Rapih</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm">RINGAN</Button>
                  <Button type="button" variant="outline" size="sm">SEDANG</Button>
                  <Button type="button" variant="outline" size="sm">BERAT</Button>
                </div>
              </div>
              <Input label="Catatan" placeholder="Detail pelanggaran" />
              <div className="flex gap-3">
                <Button type="submit" className="bg-red-600 hover:bg-red-700">Simpan</Button>
                <Button type="reset" variant="outline">Reset</Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Today's Summary */}
        <div className="lg:col-span-1">
          <Card variant="bordered">
            <CardHeader title="Hari Ini" subtitle="Ringkasan pelanggaran" />
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-red-100 rounded-lg">
                <span className="text-sm text-gray-600">Total Pelanggaran</span>
                <span className="text-xl font-bold text-red-600">5</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-100 rounded-lg">
                <span className="text-sm text-gray-600">Total Poin</span>
                <span className="text-xl font-bold text-yellow-600">18</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Pelanggaran */}
      <Card variant="bordered">
        <CardHeader title="Pelanggaran Terbaru" subtitle="Hari ini" />
        <div className="space-y-3">
          {pelanggaranList.map((pelanggaran, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-medium">{pelanggaran.nis.slice(-2)}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{pelanggaran.nama}</p>
                  <p className="text-sm text-gray-500">{pelanggaran.jenis}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    pelanggaran.kategori === "RINGAN" ? "warning" :
                    pelanggaran.kategori === "SEDANG" ? "danger" : "danger"
                  }
                >
                  {pelanggaran.kategori}
                </Badge>
                <span className="text-sm font-medium text-red-600">Poin: {pelanggaran.poin}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </DashboardLayout>
  );
}
