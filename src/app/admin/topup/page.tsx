"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/lib/useAuth";


interface Santri {
  id: number;
  nis: string;
  nama: string;
  saldoDompet: number;
}

interface Transaksi {
  id: number;
  SantriId: string;
  tanggal: string;
  waktu: string;
  jenis: string;
  nominal: number;
  kategori: string;
  deskripsi: string;
  saldoSebelum: number;
  saldoSetelah: number;
  createdAt: string;
}


export default function AdminTopupPage() {
  const { user } = useAuth();
  const [santris, setSantris] = useState<Santri[]>([]);
  const [selectedSantri, setSelectedSantri] = useState<Santri | null>(null);
  const [nominal, setNominal] = useState("");
  const [catatan, setCatatan] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transaksis, setTransaksis] = useState<Transaksi[]>([]);
  const [todayStats, setTodayStats] = useState({ totalTransaksi: 0, totalNominal: 0 });

  useEffect(() => {
    fetchSantris();
    fetchTransaksis();
  }, []);

  useEffect(() => {
    // Calculate today's statistics
    const today = new Date().toISOString().split("T")[0];
    const todayTrans = transaksis.filter(t => t.tanggal === today && t.jenis === "TOPUP");
    const totalNominal = todayTrans.reduce((sum, t) => sum + (parseInt(t.nominal as any) || 0), 0);
    setTodayStats({
      totalTransaksi: todayTrans.length,
      totalNominal: totalNominal
    });
  }, [transaksis]);




  const fetchSantris = async () => {
    try {
      const response = await fetch("/api/santri");
      if (!response.ok) throw new Error("Failed to fetch santri");
      const result = await response.json();
      // Handle both direct array and {data: array} formats
      const data = Array.isArray(result) ? result : result.data || [];
      setSantris(data);
    } catch (err) {
      console.error("Error fetching santri:", err);
      setError("Gagal memuat data santri");
    }
  };

  const fetchTransaksis = async () => {
    try {
      const response = await fetch("/api/transaksi");
      if (!response.ok) throw new Error("Failed to fetch transaksi");
      const result = await response.json();
      // Handle both direct array and {data: array} formats
      const data = Array.isArray(result) ? result : result.data || [];
      // Sort by createdAt descending and take last 10
      const sorted = data.sort((a: Transaksi, b: Transaksi) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ).slice(0, 10);
      setTransaksis(sorted);
    } catch (err) {
      console.error("Error fetching transaksi:", err);
    }
  };



  const handleSantriChange = (value: string) => {
    const santri = santris.find((s) => s.id.toString() === value);
    setSelectedSantri(santri || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSantri) {
      setError("Pilih santri terlebih dahulu");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/transaksi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          SantriId: selectedSantri.id,
          nominal: parseInt(nominal),
          jenis: "TOPUP",
          kategori: "Tabungan",
          deskripsi: catatan || "Top-up saldo",
        }),
      });

      if (!response.ok) throw new Error("Failed to process topup");

      const result = await response.json();
      
      // Refresh data
      await fetchSantris();
      await fetchTransaksis();
      
      // Update selected santri with new saldo if still selected
      if (selectedSantri && result.data) {
        const updatedSantri = {
          ...selectedSantri,
          saldoDompet: result.data.saldoSetelah,
        };
        setSelectedSantri(updatedSantri);
      }

      // Reset form
      setNominal("");
      setCatatan("");
      alert("Top-up berhasil! Saldo telah diperbarui.");

    } catch (err) {

      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };


  if (!user) return null;

  return (
    <DashboardLayout
      role="ADMIN"
      userName={user.name}
      userId={String(user.id)}
      pageTitle="Top-up Saldo Santri"
    >


      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Top-up Saldo</h2>
          <p className="text-gray-500">Tambah saldo dompet siswa</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Form Topup */}
        <div className="lg:col-span-2">
          <Card variant="bordered">
            <CardHeader title="Form Top-up" subtitle="Pilih santri dan masukkan nominal" />
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <Select
                label="Pilih Santri"
                name="santri"
                options={santris.map((s) => ({
                  value: s.id.toString(),
                  label: `${s.nis} - ${s.nama}`,
                }))}
                value={selectedSantri?.id.toString() || ""}
                onChange={(e) => handleSantriChange(e.target.value)}
                required
              />

              {selectedSantri && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>NIS:</strong> {selectedSantri.nis}
                  </p>
                  <p className="text-sm text-blue-800">
                    <strong>Nama:</strong> {selectedSantri.nama}
                  </p>
                  <p className="text-sm text-blue-800">
                    <strong>Saldo Saat Ini:</strong> {formatCurrency(selectedSantri.saldoDompet || 0)}
                  </p>
                </div>
              )}

              <Input
                label="Nominal"
                type="number"
                placeholder="Rp 0"
                value={nominal}
                onChange={(e) => setNominal(e.target.value)}
                required
              />

              <Input
                label="Catatan"
                placeholder="Opsional"
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
              />

              <div className="flex gap-3">
                <Button type="submit" disabled={isLoading || !selectedSantri}>
                  {isLoading ? "Memproses..." : "Proses Top-up"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedSantri(null);
                    setNominal("");
                    setCatatan("");
                    setError(null);
                  }}
                >
                  Reset
                </Button>
              </div>
            </form>
          </Card>

        </div>

        {/* Summary */}
        <div className="space-y-6">
          <Card variant="bordered">
            <CardHeader title="Statistik Hari Ini" />
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Transaksi</span>
                <span className="font-semibold">{todayStats.totalTransaksi}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Total Nominal</span>
                <span className="font-semibold text-green-600">{formatCurrency(todayStats.totalNominal)}</span>
              </div>
            </div>
          </Card>
        </div>

      </div>

      {/* Riwayat Topup */}
      <Card variant="bordered">
        <CardHeader title="Riwayat Top-up" subtitle="10 transaksi terakhir" />
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Waktu</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Santri</th>

                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nominal</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Saldo Setelah</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transaksis.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    Belum ada transaksi
                  </td>
                </tr>
              ) : (
                transaksis.map((transaksi) => {
                  const santri = santris.find((s) => s.id.toString() === transaksi.SantriId);
                  return (
                    <tr key={transaksi.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {transaksi.tanggal} {transaksi.waktu}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {santri ? `${santri.nis} - ${santri.nama}` : `ID: ${transaksi.SantriId}`}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          transaksi.jenis === "TOPUP" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {transaksi.jenis}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {formatCurrency(transaksi.nominal)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">{transaksi.kategori}</td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600">
                        {formatCurrency(transaksi.saldoSetelah)}
                      </td>
                    </tr>
                  );
                })
              )}

            </tbody>
          </table>
        </div>
      </Card>

    </DashboardLayout>
  );
}
