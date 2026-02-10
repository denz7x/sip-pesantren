"use server";

import { db } from "@/db";
import { revalidatePath } from "next/cache";

export async function createTransaksi(data: {
  SantriId: number;
  ustadzId?: number;
  adminId?: number;
  tanggal: string;
  waktu: string;
  jenis: "TOPUP" | "PAYMENT" | "WITHDRAWAL";
  nominal: number;
  kategori: string;
  deskripsi?: string;
  saldoSebelum: number;
  saldoSetelah: number;
}) {
  try {
    // Generate new ID
    const allData = await db.select("transaksis");
    const newId = allData.length > 0 
      ? Math.max(...allData.map((d: any) => parseInt(d.id) || 0)) + 1 
      : 1;

    await db.insert("transaksis", {
      id: newId,
      ...data,
      createdAt: new Date().toISOString(),
    });

    revalidatePath("/ustadz/kasir");
    return { success: true };
  } catch (error) {
    console.error("Error creating transaksi:", error);
    throw new Error("Failed to create transaksi");
  }
}

export async function updateTransaksi(
  id: number,
  data: Partial<{
    SantriId: number;
    ustadzId: number;
    adminId: number;
    tanggal: string;
    waktu: string;
    jenis: "TOPUP" | "PAYMENT" | "WITHDRAWAL";
    nominal: number;
    kategori: string;
    deskripsi: string;
    saldoSebelum: number;
    saldoSetelah: number;
  }>
) {
  try {
    await db.update("transaksis", id, data);
    revalidatePath("/ustadz/kasir");
    return { success: true };
  } catch (error) {
    console.error("Error updating transaksi:", error);
    throw new Error("Failed to update transaksi");
  }
}

export async function deleteTransaksi(id: number) {
  try {
    await db.delete("transaksis", id);
    revalidatePath("/ustadz/kasir");
    return { success: true };
  } catch (error) {
    console.error("Error deleting transaksi:", error);
    throw new Error("Failed to delete transaksi");
  }
}
