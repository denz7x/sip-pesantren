"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import { createSantri, updateSantri, deleteSantri } from "./actions";

interface Santri {
  id: number;
  nis: string;
  nama: string;
  orangTuaId: number | null;
  jenisKelamin: "LAKI" | "PEREMPUAN";
  tanggalLahir: string;
  alamat: string;
  noTelepon: string;
  kelas: string;
  tahunMasuk: string;
  saldoDompet: number;
  isActive: boolean;
}

interface OrangTua {
  id: number;
  nama: string;
}

interface SantriClientProps {
  santris: Santri[];
  orangTuas: OrangTua[];
}

export default function SantriClient({ santris, orangTuas }: SantriClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingSantri, setEditingSantri] = useState<Santri | null>(null);
  const [deletingSantri, setDeletingSantri] = useState<Santri | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orangTuaMap = new Map(orangTuas.map((ot) => [ot.id, ot.nama]));

  const handleAdd = () => {
    setEditingSantri(null);
    setError(null);
    setIsModalOpen(true);
  };

  const handleEdit = (santri: Santri) => {
    setEditingSantri(santri);
    setError(null);
    setIsModalOpen(true);
  };

  const handleDelete = (santri: Santri) => {
    setDeletingSantri(santri);
    setIsDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      nis: formData.get("nis") as string,
      nama: formData.get("nama") as string,
      orangTuaId: formData.get("orangTuaId")
        ? parseInt(formData.get("orangTuaId") as string)
        : null,
      jenisKelamin: formData.get("jenisKelamin") as "LAKI" | "PEREMPUAN",
      tanggalLahir: formData.get("tanggalLahir") as string,
      alamat: formData.get("alamat") as string,
      noTelepon: formData.get("noTelepon") as string,
      kelas: formData.get("kelas") as string,
      tahunMasuk: formData.get("tahunMasuk") as string,
      saldoDompet: parseInt(formData.get("saldoDompet") as string) || 0,
      isActive: formData.get("isActive") === "true",
    };

    try {
      if (editingSantri) {
        await updateSantri(editingSantri.id, data);
      } else {
        await createSantri(data);
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
    if (!deletingSantri) return;

    setIsLoading(true);
    try {
      await deleteSantri(deletingSantri.id);
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
          <h2 className="text-2xl font-bold text-gray-900">Data Santri</h2>
          <p className="text-gray-500">Kelola data seluruh siswa di pondok</p>
        </div>
        <Button onClick={handleAdd}>+ Tambah Santri</Button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  NIS
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nama
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Kelas
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Orang Tua
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Saldo
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
              {santris.map((santri, index) => (
                <tr
                  key={`${santri.id || santri.nis || "unknown"}-${index}`}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {santri.nis}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {santri.nama}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {santri.kelas}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {santri.orangTuaId ? orangTuaMap.get(santri.orangTuaId) || "-" : "-"}
                  </td>

                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {formatCurrency(santri.saldoDompet)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={santri.isActive ? "success" : "warning"}>
                      {santri.isActive ? "AKTIF" : "NONAKTIF"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(santri)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(santri)}
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
        title={editingSantri ? "Edit Santri" : "Tambah Santri Baru"}
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
              label="NIS"
              name="nis"
              defaultValue={editingSantri?.nis}
              required
            />
            <Input
              label="Nama Lengkap"
              name="nama"
              defaultValue={editingSantri?.nama}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Jenis Kelamin"
              name="jenisKelamin"
              options={[
                { value: "LAKI", label: "Laki-laki" },
                { value: "PEREMPUAN", label: "Perempuan" },
              ]}
              defaultValue={editingSantri?.jenisKelamin}
              required
            />
            <Input
              label="Tanggal Lahir"
              name="tanggalLahir"
              type="date"
              defaultValue={editingSantri?.tanggalLahir}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Kelas"
              name="kelas"
              defaultValue={editingSantri?.kelas}
              required
            />
            <Input
              label="Tahun Masuk"
              name="tahunMasuk"
              defaultValue={editingSantri?.tahunMasuk}
              required
            />
          </div>

          <Select
            label="Orang Tua/Wali"
            name="orangTuaId"
            options={orangTuas.map((ot) => ({
              value: ot.id,
              label: ot.nama,
            }))}
            defaultValue={editingSantri?.orangTuaId || ""}
          />

          <Input
            label="Alamat"
            name="alamat"
            defaultValue={editingSantri?.alamat}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="No. Telepon"
              name="noTelepon"
              type="tel"
              defaultValue={editingSantri?.noTelepon}
            />
            <Input
              label="Saldo Dompet"
              name="saldoDompet"
              type="number"
              defaultValue={editingSantri?.saldoDompet || 0}
            />
          </div>

          <Select
            label="Status"
            name="isActive"
            options={[
              { value: "true", label: "Aktif" },
              { value: "false", label: "Nonaktif" },
            ]}
            defaultValue={editingSantri?.isActive ? "true" : "false"}
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
              {isLoading ? "Menyimpan..." : editingSantri ? "Simpan" : "Tambah"}
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
            Apakah Anda yakin ingin menghapus santri{" "}
            <strong>{deletingSantri?.nama}</strong>?
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
