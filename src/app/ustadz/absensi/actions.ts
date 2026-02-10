"use server";

import { db } from "@/db";
import { revalidatePath } from "next/cache";

export async function createAbsensi(data: {
  SantriId: number;
  ustadzId: number;
  tanggal: string;
  status: string;
  keterangan?: string;
}) {
  try {
    // Generate new ID
    const allData = await db.select("absensis");
    const newId = allData.length > 0 
      ? Math.max(...allData.map((d: any) => parseInt(d.id) || 0)) + 1 
      : 1;

    await db.insert("absensis", {
      id: newId,
      ...data,
      createdAt: new Date().toISOString(),
    });

    revalidatePath("/ustadz/absensi");
    return { success: true };
  } catch (error) {
    console.error("Error creating absensi:", error);
    throw new Error("Failed to create absensi");
  }
}

export async function updateAbsensi(
  id: number,
  data: {
    SantriId?: number;
    ustadzId?: number;
    tanggal?: string;
    status?: string;
    keterangan?: string;
  }
) {
  try {
    await db.update("absensis", id, data);
    revalidatePath("/ustadz/absensi");
    return { success: true };
  } catch (error) {
    console.error("Error updating absensi:", error);
    throw new Error("Failed to update absensi");
  }
}

export async function deleteAbsensi(id: number) {
  try {
    await db.delete("absensis", id);
    revalidatePath("/ustadz/absensi");
    return { success: true };
  } catch (error) {
    console.error("Error deleting absensi:", error);
    throw new Error("Failed to delete absensi");
  }
}
