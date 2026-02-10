"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Card, CardHeader } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils";
import { createTransaksi } from "./actions";

interface Santri {
  id: number;
  nis: string;
  nama: string;
  kelas: string;
  saldoDompet: number;
}

interface Transaksi {
  id: number;
  SantriId: number;
  ustadzId: number;
  adminId?: number;
  tanggal: string;
  waktu: string;
  jenis: "TOPUP" | "WITHDRAW" | "PAYMENT";
  nominal: number;
  kategori: string;
  deskripsi?: string;
  saldoSebelum: number;
  saldoSetelah: number;
  createdAt: string;
}

interface KasirClientProps {
  santris: Santri[];
  transaksis: Transaksi[];
  ustadzId: number;
}

export default function KasirClient({ santris, transaksis, ustadzId }: KasirClientProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSantriId, setSelectedSantriId] = useState<number | null>(null);

  const selectedSantri = selectedSantriId ? santris.find(s => s.id === selectedSantriId) : null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const santriId = Number(formData.get("SantriId"));
    const nominal = Number(formData.get("nominal")) || 0;
    
    // Debug log
    console.log("Form santriId:", santriId, "type:", typeof santriId);
    console.log("Available santris:", santris.map(s => ({ id: s.id, type: typeof s.id, nama: s.nama })));
    
    // Convert both to number for comparison
    const santri = santris.find(s => Number(s.id) === santriId);


    if (!santri) {
      setError(`Santri dengan ID ${santriId} tidak ditemukan`);
      setIsLoading(false);
      return;
    }

    if (nominal <= 0) {
      setError("Nominal harus lebih dari 0");
      setIsLoading(false);
      return;
    }

    if (nominal > santri.saldoDompet) {
      setError(`Saldo tidak mencukupi. Saldo: ${formatCurrency(santri.saldoDompet)}, Dibutuhkan: ${formatCurrency(nominal)}`);
      setIsLoading(false);
      return;
    }

    const now = new Date();
    const data = {
      SantriId: santriId,
      ustadzId: ustadzId,
      adminId: null as any,
      tanggal: now.toISOString().split('T')[0],
      waktu: now.toTimeString().split(' ')[0],
      jenis: "PAYMENT" as const,
      nominal: nominal,
      kategori: formData.get("kategori") as string,
      deskripsi: formData.get("deskripsi") as string,
      saldoSebelum: santri.saldoDompet,
      saldoSetelah: santri.saldoDompet - nominal,
    };

    try {
      await createTransaksi(data);
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const getSantri = (santriId: number) => {
    return santris.find(s => Number(s.id) === Number(santriId));
  };


  // Calculate stats - filter for today's transactions with jenis PAYMENT
  const today = new Date().toISOString().split('T')[0];
  const todayTransaksis = transaksis.filter(t => {
    const transDate = t.tanggal?.split('T')[0] || t.tanggal;
    return transDate === today && t.jenis === "PAYMENT";
  });
  
  const totalTransaksi = todayTransaksis.length;
  const totalPendapatan = todayTransaksis.reduce((sum, t) => sum + (t.nominal || 0), 0);


  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Transaksi Kasir</h2>
        <p className="text-gray-500">Catat transaksi pembayaran siswa</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Form Transaksi */}
        <div className="lg:col-span-2">
          <Card variant="bordered">
            <CardHeader title="Form Transaksi" subtitle="Isi data di bawah ini" />
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <Select
                label="Santri"
                name="SantriId"
                options={[
                  { value: "", label: "Pilih Santri..." },
                  ...santris.map((s) => ({
                    value: s.id,
                    label: `${s.nis} - ${s.nama} (${s.kelas}) - Saldo: ${formatCurrency(s.saldoDompet || 0)}`,
                  }))
                ]}
                onChange={(e) => setSelectedSantriId(parseInt(e.target.value) || null)}
                required
              />

              {selectedSantri && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Saldo tersedia: <span className="font-bold">{formatCurrency(selectedSantri.saldoDompet || 0)}</span>
                  </p>
                </div>
              )}


              <Select
                label="Kategori"
                name="kategori"
                options={[
                  { value: "KANTIN", label: "Kantin" },
                  { value: "LAUNDRY", label: "Laundry" },
                  { value: "PERPUSTAKAAN", label: "Perpustakaan" },
                  { value: "OTHER", label: "Lainnya" },
                ]}
                required
              />

              <Input
                label="Nominal"
                name="nominal"
                type="number"
                min="1"
                placeholder="Rp 0"
                required
              />

              <Input
                label="Deskripsi"
                name="deskripsi"
                placeholder="Deskripsi transaksi (opsional)"
              />

              <div className="flex gap-3">
                <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={isLoading}>
                  {isLoading ? "Memproses..." : "Proses Pembayaran"}
                </Button>
              </div>

            </form>
          </Card>
        </div>

        {/* Today's Summary */}
        <div className="lg:col-span-1">
          <Card variant="bordered">
            <CardHeader title="Hari Ini" subtitle="Ringkasan transaksi" />
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-green-100 rounded-lg">
                <span className="text-sm text-gray-600">Total Transaksi</span>
                <span className="text-xl font-bold text-green-600">{totalTransaksi}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-[#2d9596]/10 rounded-lg">
                <span className="text-sm text-gray-600">Total Pendapatan</span>
                <span className="text-xl font-bold text-[#2d9596]">{formatCurrency(totalPendapatan)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Transactions */}
      <Card variant="bordered">
        <CardHeader title="Transaksi Terbaru" subtitle={`${todayTransaksis.length} transaksi hari ini`} />

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">NIS</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nominal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {todayTransaksis.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Belum ada transaksi hari ini
                  </td>
                </tr>
              ) : (
                todayTransaksis.map((trans) => {
                  const santri = getSantri(trans.SantriId);
                  return (
                    <tr key={trans.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500">{trans.waktu}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{santri?.nis || '-'}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{santri?.nama || 'Unknown'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{trans.kategori}</td>
                      <td className="px-4 py-3 text-sm font-medium text-red-600">-{formatCurrency(trans.nominal || 0)}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          BERHASIL
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

          </table>
        </div>
      </Card>
    </div>
  );
}
