"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { createOrangTua, updateOrangTua, deleteOrangTua } from "./actions";

interface OrangTua {
  id: number;
  nama: string;
  email: string;
  noTelepon: string;
  alamat: string;
  isActive: boolean;
}

interface OrangTuaClientProps {
  orangTuas: OrangTua[];
}

export default function OrangTuaClient({ orangTuas }: OrangTuaClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingOrangTua, setEditingOrangTua] = useState<OrangTua | null>(null);
  const [deletingOrangTua, setDeletingOrangTua] = useState<OrangTua | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);


  const handleAdd = () => {
    setEditingOrangTua(null);
    setError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (orangTua: OrangTua) => {
    setEditingOrangTua(orangTua);
    setError(null);
    setIsModalOpen(true);
  };

  const handleDelete = (orangTua: OrangTua) => {
    setDeletingOrangTua(orangTua);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      nama: formData.get("nama") as string,
      email: formData.get("email") as string,
      noTelepon: formData.get("noTelepon") as string,
      alamat: formData.get("alamat") as string,
      isActive: formData.get("isActive") === "true",
    };

    try {
      if (editingOrangTua) {
        await updateOrangTua(editingOrangTua.id, data);
        setIsModalOpen(false);
        window.location.reload();
      } else {
        const result = await createOrangTua(data);
        setIsModalOpen(false);
        setSuccessMessage(result.message || "Orang tua berhasil dibuat. Akun login telah dibuat.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };


  const handleConfirmDelete = async () => {
    if (!deletingOrangTua) return;

    setIsLoading(true);
    try {
      await deleteOrangTua(deletingOrangTua.id);
      setIsDeleteModalOpen(false);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Data Orang Tua</h2>
          <p className="text-gray-500">Kelola data orang tua siswa di pondok</p>
        </div>
        <Button onClick={handleAdd}>+ Tambah Orang Tua</Button>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-green-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-green-800 font-medium">Berhasil!</p>
              <p className="text-green-700 text-sm mt-1">{successMessage}</p>
              <p className="text-green-600 text-xs mt-2">
                Password default: <strong>{successMessage.match(/email: (\S+)/)?.[1]?.split('@')[0]?.substring(0, 6)}123</strong>
              </p>
            </div>
          </div>
        </div>
      )}


      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nama
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  No. Telepon
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
              {orangTuas.length > 0 ? (
                orangTuas.map((orangTua, index) => (
                  <tr
                    key={`${orangTua.id || orangTua.email || "unknown"}-${index}`}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {orangTua.id || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {orangTua.nama || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {orangTua.email || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {orangTua.noTelepon || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={orangTua.isActive ? "success" : "warning"}>
                        {orangTua.isActive ? "AKTIF" : "TIDAK AKTIF"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(orangTua)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(orangTua)}
                        >
                          Hapus
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center">
                      <svg
                        className="w-12 h-12 text-gray-300 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <p className="text-lg font-medium">
                        Belum ada data orang tua
                      </p>
                      <p className="text-sm">
                        Tambahkan data orang tua siswa untuk memulai
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOrangTua ? "Edit Orang Tua" : "Tambah Orang Tua Baru"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <Input
            label="Nama Lengkap"
            name="nama"
            defaultValue={editingOrangTua?.nama}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              name="email"
              type="email"
              defaultValue={editingOrangTua?.email}
              required
            />
            <Input
              label="No. Telepon"
              name="noTelepon"
              type="tel"
              defaultValue={editingOrangTua?.noTelepon}
            />
          </div>

          <Input
            label="Alamat"
            name="alamat"
            defaultValue={editingOrangTua?.alamat}
            required
          />

          <Select
            label="Status"
            name="isActive"
            options={[
              { value: "true", label: "Aktif" },
              { value: "false", label: "Tidak Aktif" },
            ]}
            defaultValue={editingOrangTua?.isActive ? "true" : "false"}
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
              {isLoading
                ? "Menyimpan..."
                : editingOrangTua
                ? "Simpan"
                : "Tambah"}
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
            Apakah Anda yakin ingin menghapus orang tua{" "}
            <strong>{deletingOrangTua?.nama}</strong>?
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
