"use server";

import { db } from "@/db";
import { revalidatePath } from "next/cache";

export async function createPelanggaran(data: {
  SantriId: number;
  ustadzId: number;
  tanggal: string;
  jenisPelanggaran: string;
  kategori: "RINGAN" | "SEDANG" | "BERAT";
  poinSanksi: number;
  tindakan: string;
  catatan?: string;
  sudahDilaporkan?: boolean;
}) {
  try {
    // Generate new ID
    const allData = await db.select("pelanggarans");
    const newId = allData.length > 0 
      ? Math.max(...allData.map((d: any) => parseInt(d.id) || 0)) + 1 
      : 1;

    await db.insert("pelanggarans", {
      id: newId,
      ...data,
      sudahDilaporkan: data.sudahDilaporkan ?? false,
      createdAt: new Date().toISOString(),
    });

    revalidatePath("/ustadz/pelanggaran");
    return { success: true };
  } catch (error) {
    console.error("Error creating pelanggaran:", error);
    throw new Error("Failed to create pelanggaran");
  }
}

export async function updatePelanggaran(
  id: number,
  data: Partial<{
    SantriId: number;
    ustadzId: number;
    tanggal: string;
    jenisPelanggaran: string;
    kategori: "RINGAN" | "SEDANG" | "BERAT";
    poinSanksi: number;
    tindakan: string;
    catatan: string;
    sudahDilaporkan: boolean;
  }>
) {
  try {
    await db.update("pelanggarans", id, data);
    revalidatePath("/ustadz/pelanggaran");
    return { success: true };
  } catch (error) {
    console.error("Error updating pelanggaran:", error);
    throw new Error("Failed to update pelanggaran");
  }
}

export async function deletePelanggaran(id: number) {
  try {
    await db.delete("pelanggarans", id);
    revalidatePath("/ustadz/pelanggaran");
    return { success: true };
  } catch (error) {
    console.error("Error deleting pelanggaran:", error);
    throw new Error("Failed to delete pelanggaran");
  }
}
