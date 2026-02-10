"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { createPelanggaran, updatePelanggaran, deletePelanggaran } from "./actions";

interface Santri {
  id: number;
  nis: string;
  nama: string;
  kelas: string;
}

interface Pelanggaran {
  id: number;
  SantriId: number;
  ustadzId: number;
  tanggal: string;
  jenisPelanggaran: string;
  kategori: "RINGAN" | "SEDANG" | "BERAT";
  poinSanksi: number;
  tindakan: string;
  catatan?: string;
  sudahDilaporkan: boolean;
  createdAt: string;
}

interface PelanggaranClientProps {
  santris: Santri[];
  pelanggarans: Pelanggaran[];
  ustadzId: number;
}

export default function PelanggaranClient({ santris, pelanggarans, ustadzId }: PelanggaranClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingPelanggaran, setEditingPelanggaran] = useState<Pelanggaran | null>(null);
  const [deletingPelanggaran, setDeletingPelanggaran] = useState<Pelanggaran | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingPelanggaran(null);
    setError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (pelanggaran: Pelanggaran) => {
    setEditingPelanggaran(pelanggaran);
    setError(null);
    setIsModalOpen(true);
  };

  const handleDelete = (pelanggaran: Pelanggaran) => {
    setDeletingPelanggaran(pelanggaran);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      SantriId: parseInt(formData.get("SantriId") as string),
      ustadzId: ustadzId,
      tanggal: formData.get("tanggal") as string,
      jenisPelanggaran: formData.get("jenisPelanggaran") as string,
      kategori: formData.get("kategori") as "RINGAN" | "SEDANG" | "BERAT",
      poinSanksi: parseInt(formData.get("poinSanksi") as string) || 0,
      tindakan: formData.get("tindakan") as string,
      catatan: formData.get("catatan") as string,
      sudahDilaporkan: formData.get("sudahDilaporkan") === "true",
    };

    try {
      if (editingPelanggaran) {
        await updatePelanggaran(editingPelanggaran.id, data);
      } else {
        await createPelanggaran(data);
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
    if (!deletingPelanggaran) return;

    setIsLoading(true);
    try {
      await deletePelanggaran(deletingPelanggaran.id);
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

  const getKategoriColor = (kategori: string) => {
    switch (kategori) {
      case "RINGAN": return "bg-yellow-100 text-yellow-800";
      case "SEDANG": return "bg-orange-100 text-orange-800";
      case "BERAT": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Calculate stats
  const totalPelanggaran = pelanggarans.length;
  const totalPoin = pelanggarans.reduce((sum, p) => sum + p.poinSanksi, 0);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Catat Pelanggaran</h2>
        <p className="text-gray-500">Rekam pelanggaran kedisiplinan siswa</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Form Input */}
        <div className="lg:col-span-2">
          <Card variant="bordered">
            <CardHeader title="Form Pelanggaran" subtitle="Isi data di bawah ini" />
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
                defaultValue={editingPelanggaran?.SantriId}
                required
              />

              <Input
                label="Tanggal"
                name="tanggal"
                type="date"
                defaultValue={editingPelanggaran?.tanggal || new Date().toISOString().split('T')[0]}
                required
              />

              <Input
                label="Jenis Pelanggaran"
                name="jenisPelanggaran"
                defaultValue={editingPelanggaran?.jenisPelanggaran || ""}
                placeholder="Contoh: Terlambat Shalat, Tidak Membawa Kitab"
                required
              />

              <Select
                label="Kategori"
                name="kategori"
                options={[
                  { value: "RINGAN", label: "Ringan" },
                  { value: "SEDANG", label: "Sedang" },
                  { value: "BERAT", label: "Berat" },
                ]}
                defaultValue={editingPelanggaran?.kategori || "RINGAN"}
                required
              />

              <Input
                label="Poin Sanksi"
                name="poinSanksi"
                type="number"
                min="0"
                defaultValue={editingPelanggaran?.poinSanksi || ""}
                placeholder="Jumlah poin"
                required
              />

              <Input
                label="Tindakan"
                name="tindakan"
                defaultValue={editingPelanggaran?.tindakan || ""}
                placeholder="Tindakan yang diambil"
                required
              />

              <Input
                label="Catatan"
                name="catatan"
                defaultValue={editingPelanggaran?.catatan || ""}
                placeholder="Detail tambahan (opsional)"
              />

              <Select
                label="Status Pelaporan"
                name="sudahDilaporkan"
                options={[
                  { value: "true", label: "Sudah Dilaporkan" },
                  { value: "false", label: "Belum Dilaporkan" },
                ]}
                defaultValue={editingPelanggaran?.sudahDilaporkan ? "true" : "false"}
                required
              />

              <div className="flex gap-3">
                <Button type="submit" className="bg-red-600 hover:bg-red-700" disabled={isLoading}>
                  {isLoading ? "Menyimpan..." : editingPelanggaran ? "Simpan" : "Tambah"}
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
            <CardHeader title="Statistik" subtitle="Ringkasan pelanggaran" />
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-red-100 rounded-lg">
                <span className="text-sm text-gray-600">Total Pelanggaran</span>
                <span className="text-xl font-bold text-red-600">{totalPelanggaran}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-100 rounded-lg">
                <span className="text-sm text-gray-600">Total Poin</span>
                <span className="text-xl font-bold text-yellow-600">{totalPoin}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Pelanggaran */}
      <Card variant="bordered">
        <div className="flex items-center justify-between mb-4">
          <CardHeader title="Pelanggaran Terbaru" subtitle="Data pelanggaran siswa" />
          <Button onClick={handleAdd}>+ Input Pelanggaran</Button>
        </div>
        <div className="space-y-3">
          {pelanggarans.map((pelanggaran) => {
            const santri = getSantri(pelanggaran.SantriId);
            return (
              <div key={pelanggaran.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <span className="text-red-600 font-medium">{santri?.nis.slice(-2)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{santri?.nama}</p>
                    <p className="text-sm text-gray-500">{pelanggaran.jenisPelanggaran}</p>
                    <p className="text-xs text-gray-400">Tindakan: {pelanggaran.tindakan}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getKategoriColor(pelanggaran.kategori)}`}>
                    {pelanggaran.kategori}
                  </span>
                  <span className="text-sm font-medium text-red-600">Poin: {pelanggaran.poinSanksi}</span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(pelanggaran)}>
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(pelanggaran)}
                    >
                      Hapus
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
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
            Apakah Anda yakin ingin menghapus data pelanggaran ini?
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
