"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { createUstadz, updateUstadz, deleteUstadz } from "./actions";

interface Ustadz {
  id: number;
  nip: string;
  nama: string;
  email: string;
  jenisKelamin: "LAKI" | "PEREMPUAN";
  spesialisasi: string;
  noTelepon: string;
  alamat: string;
  isActive: boolean;
}


interface UstadzClientProps {
  ustadzs: Ustadz[];
}

export default function UstadzClient({ ustadzs }: UstadzClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingUstadz, setEditingUstadz] = useState<Ustadz | null>(null);
  const [deletingUstadz, setDeletingUstadz] = useState<Ustadz | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingUstadz(null);
    setError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (ustadz: Ustadz) => {
    setEditingUstadz(ustadz);
    setError(null);
    setIsModalOpen(true);
  };

  const handleDelete = (ustadz: Ustadz) => {
    setDeletingUstadz(ustadz);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      nip: formData.get("nip") as string,
      nama: formData.get("nama") as string,
      email: formData.get("email") as string,
      jenisKelamin: formData.get("jenisKelamin") as "LAKI" | "PEREMPUAN",
      spesialisasi: formData.get("spesialisasi") as string,
      noTelepon: formData.get("noTelepon") as string,
      alamat: formData.get("alamat") as string,
      isActive: formData.get("isActive") === "true",
    };


    try {
      if (editingUstadz) {
        await updateUstadz(editingUstadz.id, data);
      } else {
        await createUstadz(data);
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
    if (!deletingUstadz) return;

    setIsLoading(true);
    try {
      await deleteUstadz(deletingUstadz.id);
      setIsDeleteModalOpen(false);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Ustadz</h2>
          <p className="text-gray-500">Kelola data ustadz di pondok</p>
        </div>
        <Button onClick={handleAdd}>+ Tambah Ustadz</Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  NIP
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nama
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Spesialisasi
                </th>

                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {ustadzs.map((ustadz) => (
                <tr key={ustadz.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{ustadz.nip}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {ustadz.nama}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {ustadz.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {ustadz.spesialisasi}
                  </td>

                  <td className="px-4 py-3">
                    <Badge variant={ustadz.isActive ? "success" : "warning"}>
                      {ustadz.isActive ? "AKTIF" : "TIDAK AKTIF"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(ustadz)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(ustadz)}
                      >
                        Hapus
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUstadz ? "Edit Ustadz" : "Tambah Ustadz Baru"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="NIP"
              name="nip"
              defaultValue={editingUstadz?.nip}
              required
            />
            <Input
              label="Nama Lengkap"
              name="nama"
              defaultValue={editingUstadz?.nama}
              required
            />
          </div>

          <Input
            label="Email (untuk login)"
            name="email"
            type="email"
            defaultValue={editingUstadz?.email}
            required
            disabled={!!editingUstadz}
            helperText={editingUstadz ? "Email tidak dapat diubah" : "Email ini akan digunakan untuk login. Password default: [6 karakter pertama email] + 123"}
          />


          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Jenis Kelamin"
              name="jenisKelamin"
              options={[
                { value: "LAKI", label: "Laki-laki" },
                { value: "PEREMPUAN", label: "Perempuan" },
              ]}
              defaultValue={editingUstadz?.jenisKelamin}
              required
            />
            <Input
              label="Spesialisasi"
              name="spesialisasi"
              defaultValue={editingUstadz?.spesialisasi}
              required
            />
          </div>

          <Input
            label="Alamat"
            name="alamat"
            defaultValue={editingUstadz?.alamat}
            required
          />

          <Input
            label="No. Telepon"
            name="noTelepon"
            type="tel"
            defaultValue={editingUstadz?.noTelepon}
          />

          <Select
            label="Status"
            name="isActive"
            options={[
              { value: "true", label: "Aktif" },
              { value: "false", label: "Tidak Aktif" },
            ]}
            defaultValue={editingUstadz?.isActive ? "true" : "false"}
            required
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
              {isLoading ? "Menyimpan..." : editingUstadz ? "Simpan" : "Tambah"}
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
            Apakah Anda yakin ingin menghapus ustadz{" "}
            <strong>{deletingUstadz?.nama}</strong>?
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
