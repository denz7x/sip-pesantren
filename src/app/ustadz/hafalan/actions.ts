"use server";

import { db } from "@/db";
import { revalidatePath } from "next/cache";

export async function createHafalan(data: {
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
}) {
  try {
    // Generate new ID
    const allData = await db.select("setoranHafalans");
    const newId = allData.length > 0 
      ? Math.max(...allData.map((d: any) => parseInt(d.id) || 0)) + 1 
      : 1;

    await db.insert("setoranHafalans", {
      id: newId,
      ...data,
      createdAt: new Date().toISOString(),
    });

    revalidatePath("/ustadz/hafalan");
    return { success: true };
  } catch (error) {
    console.error("Error creating hafalan:", error);
    throw new Error("Failed to create hafalan");
  }
}

export async function updateHafalan(
  id: number,
  data: Partial<{
    SantriId: number;
    ustadzId: number;
    tanggal: string;
    namaSurat: string;
    ayat: string;
    mulaiAyat: number;
    akhirAyat: number;
    kualitas: "KURANG" | "CUKUP" | "BAIK" | "SANGAT_BAIK";
    nilai: number;
    catatan: string;
  }>
) {
  try {
    await db.update("setoranHafalans", id, data);
    revalidatePath("/ustadz/hafalan");
    return { success: true };
  } catch (error) {
    console.error("Error updating hafalan:", error);
    throw new Error("Failed to update hafalan");
  }
}

export async function deleteHafalan(id: number) {
  try {
    await db.delete("setoranHafalans", id);
    revalidatePath("/ustadz/hafalan");
    return { success: true };
  } catch (error) {
    console.error("Error deleting hafalan:", error);
    throw new Error("Failed to delete hafalan");
  }
}
