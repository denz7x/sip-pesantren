"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader } from "@/components/ui/Card";
import { createHafalan, updateHafalan, deleteHafalan } from "./actions";

interface Santri {
  id: number;
  nis: string;
  nama: string;
  kelas: string;
}

interface Hafalan {
  id: number;
  SantriId: number;
  ustadzId: number;
  tanggal: string;
  namaSurat: string;
  ayat: string;
  mulaiAyat: number;
  akhirAyat: number;
  kualitas: "KURANG" | "CUKUP" | "BAIK" | "SANGAT_BAIK";
  nilai: number;
  catatan?: string;
  createdAt: string;
}

interface HafalanClientProps {
  santris: Santri[];
  hafalans: Hafalan[];
  ustadzId: number;
}

export default function HafalanClient({ santris, hafalans, ustadzId }: HafalanClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingHafalan, setEditingHafalan] = useState<Hafalan | null>(null);
  const [deletingHafalan, setDeletingHafalan] = useState<Hafalan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingHafalan(null);
    setError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (hafalan: Hafalan) => {
    setEditingHafalan(hafalan);
    setError(null);
    setIsModalOpen(true);
  };

  const handleDelete = (hafalan: Hafalan) => {
    setDeletingHafalan(hafalan);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const ayatRange = (formData.get("ayat") as string).split("-");
    const mulaiAyat = parseInt(ayatRange[0]) || 1;
    const akhirAyat = parseInt(ayatRange[1]) || mulaiAyat;

    const data = {
      SantriId: parseInt(formData.get("SantriId") as string),
      ustadzId: ustadzId,
      tanggal: formData.get("tanggal") as string,
      namaSurat: formData.get("namaSurat") as string,
      ayat: formData.get("ayat") as string,
      mulaiAyat: mulaiAyat,
      akhirAyat: akhirAyat,
      kualitas: formData.get("kualitas") as "KURANG" | "CUKUP" | "BAIK" | "SANGAT_BAIK",
      nilai: parseInt(formData.get("nilai") as string) || 0,
      catatan: formData.get("catatan") as string,
    };

    try {
      if (editingHafalan) {
        await updateHafalan(editingHafalan.id, data);
      } else {
        await createHafalan(data);
      }
      setIsModalOpen(false);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingHafalan) return;

    setIsLoading(true);
    try {
      await deleteHafalan(deletingHafalan.id);
      setIsDeleteModalOpen(false);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const getSantri = (santriId: number) => {
    return santris.find(s => s.id === santriId);
  };

  const getKualitasColor = (kualitas: string) => {
    switch (kualitas) {
      case "SANGAT_BAIK": return "text-green-600 bg-green-100";
      case "BAIK": return "text-blue-600 bg-blue-100";
      case "CUKUP": return "text-yellow-600 bg-yellow-100";
      case "KURANG": return "text-red-600 bg-red-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  // Calculate stats
  const totalSetoran = hafalans.length;
  const rataRataNilai = hafalans.length > 0 
    ? Math.round(hafalans.reduce((sum, h) => sum + h.nilai, 0) / hafalans.length)
    : 0;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Catat Setoran Hafalan</h2>
        <p className="text-gray-500">Rekam setoran hafalan Al-Quran siswa</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Form Input */}
        <div className="lg:col-span-2">
          <Card variant="bordered">
            <CardHeader title="Form Setoran Hafalan" subtitle="Isi data di bawah ini" />
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <Select
                label="Santri"
                name="SantriId"
                options={santris.map((s) => ({
                  value: s.id,
                  label: `${s.nis} - ${s.nama} (${s.kelas})`,
                }))}
                defaultValue={editingHafalan?.SantriId}
                required
              />

              <Input
                label="Tanggal"
                name="tanggal"
                type="date"
                defaultValue={editingHafalan?.tanggal || new Date().toISOString().split('T')[0]}
                required
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Nama Surat"
                  name="namaSurat"
                  defaultValue={editingHafalan?.namaSurat || ""}
                  placeholder="Contoh: Al-Baqarah"
                  required
                />
                <Input
                  label="Ayat"
                  name="ayat"
                  defaultValue={editingHafalan?.ayat || ""}
                  placeholder="Contoh: 1-10"
                  required
                />
              </div>

              <Select
                label="Kualitas Hafalan"
                name="kualitas"
                options={[
                  { value: "SANGAT_BAIK", label: "Sangat Baik" },
                  { value: "BAIK", label: "Baik" },
                  { value: "CUKUP", label: "Cukup" },
                  { value: "KURANG", label: "Kurang" },
                ]}
                defaultValue={editingHafalan?.kualitas || "BAIK"}
                required
              />

              <Input
                label="Nilai"
                name="nilai"
                type="number"
                min="0"
                max="100"
                defaultValue={editingHafalan?.nilai || ""}
                placeholder="0-100"
                required
              />

              <Input
                label="Catatan"
                name="catatan"
                defaultValue={editingHafalan?.catatan || ""}
                placeholder="Catatan untuk siswa"
              />

              <div className="flex gap-3">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Menyimpan..." : editingHafalan ? "Simpan" : "Tambah"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Batal
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Stats Summary */}
        <div className="lg:col-span-1">
          <Card variant="bordered">
            <CardHeader title="Statistik" subtitle="Ringkasan setoran" />
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-[#2d9596]/10 rounded-lg">
                <span className="text-sm text-gray-600">Total Setoran</span>
                <span className="text-xl font-bold text-[#2d9596]">{totalSetoran}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg">
                <span className="text-sm text-gray-600">Rata-rata Nilai</span>
                <span className="text-xl font-bold text-green-600">{rataRataNilai}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Setoran */}
      <Card variant="bordered">
        <div className="flex items-center justify-between mb-4">
          <CardHeader title="Setoran Terbaru" subtitle="Data setoran hafalan" />
          <Button onClick={handleAdd}>+ Input Setoran</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIS</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Surat</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ayat</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kualitas</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nilai</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hafalans.map((hafalan) => {
                const santri = getSantri(hafalan.SantriId);
                return (
                  <tr key={hafalan.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">{santri?.nis}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{santri?.nama}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{hafalan.namaSurat}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{hafalan.ayat}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getKualitasColor(hafalan.kualitas)}`}>
                        {hafalan.kualitas.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{hafalan.nilai}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(hafalan)}>
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(hafalan)}
                        >
                          Hapus
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Apakah Anda yakin ingin menghapus data setoran hafalan ini?
          </p>
          <p className="text-sm text-red-600">
            Tindakan ini tidak dapat dibatalkan.
          </p>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              variant="outline"
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={handleConfirmDelete}
              disabled={isLoading}
            >
              {isLoading ? "Menghapus..." : "Hapus"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
