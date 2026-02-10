"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { createAbsensi, updateAbsensi, deleteAbsensi } from "./actions";

interface Santri {
  id: number;
  nis: string;
  nama: string;
  kelas: string;
}

interface Absensi {
  id: number;
  SantriId: number;
  ustadzId: number;
  tanggal: string;
  status: string;
  keterangan?: string;
  createdAt: string;
}

interface AbsensiClientProps {
  santris: Santri[];
  absensis: Absensi[];
  ustadzId: number;
}

export default function AbsensiClient({ santris, absensis, ustadzId }: AbsensiClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingAbsensi, setEditingAbsensi] = useState<Absensi | null>(null);
  const [deletingAbsensi, setDeletingAbsensi] = useState<Absensi | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingAbsensi(null);
    setError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (absensi: Absensi) => {
    setEditingAbsensi(absensi);
    setError(null);
    setIsModalOpen(true);
  };

  const handleDelete = (absensi: Absensi) => {
    setDeletingAbsensi(absensi);
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
      status: formData.get("status") as string,
      keterangan: formData.get("keterangan") as string,
    };

    try {
      if (editingAbsensi) {
        await updateAbsensi(editingAbsensi.id, data);
      } else {
        await createAbsensi(data);
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
    if (!deletingAbsensi) return;

    setIsLoading(true);
    try {
      await deleteAbsensi(deletingAbsensi.id);
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

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Absensi Santri</h2>
          <p className="text-gray-500">Kelola absensi harian santri</p>
        </div>
        <Button onClick={handleAdd}>+ Input Absensi</Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIS</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kelas</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keterangan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {absensis.map((absen) => {
                const santri = getSantri(absen.SantriId);
                return (
                  <tr key={absen.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">{santri?.nis}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{santri?.nama}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{santri?.kelas}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{absen.tanggal}</td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          absen.status === "HADIR" ? "success" :
                          absen.status === "SAKIT" ? "warning" :
                          absen.status === "IZIN" ? "info" : "danger"
                        }
                      >
                        {absen.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{absen.keterangan || "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEdit(absen)}>
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(absen)}
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
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAbsensi ? "Edit Absensi" : "Input Absensi Baru"}
        size="md"
      >
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
            defaultValue={editingAbsensi?.SantriId}
            required
          />

          <Input
            label="Tanggal"
            name="tanggal"
            type="date"
            defaultValue={editingAbsensi?.tanggal || new Date().toISOString().split('T')[0]}
            required
          />

          <Select
            label="Status"
            name="status"
            options={[
              { value: "HADIR", label: "Hadir" },
              { value: "SAKIT", label: "Sakit" },
              { value: "IZIN", label: "Izin" },
              { value: "ALPA", label: "Alpa" },
            ]}
            defaultValue={editingAbsensi?.status || "HADIR"}
            required
          />

          <Input
            label="Keterangan"
            name="keterangan"
            defaultValue={editingAbsensi?.keterangan || ""}
            placeholder="Contoh: Demam, urusan keluarga, dll"
          />

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : editingAbsensi ? "Simpan" : "Tambah"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Konfirmasi Hapus"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Apakah Anda yakin ingin menghapus data absensi ini?
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
    </>
  );
}
