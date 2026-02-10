"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";

interface SantriData {
  id?: number;
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

export async function createSantri(data: SantriData) {
  try {
    // Get current data to find next ID
    const existingData = await db.select('santris');
    const nextId = existingData.length > 0 
      ? Math.max(...existingData.map((s: {id: number}) => s.id)) + 1 
      : 1;

    const santriToInsert = {
      ...data,
      id: nextId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await db.insert('santris', santriToInsert);
    
    if (!result) {
      throw new Error("Failed to create santri");
    }

    revalidatePath("/admin/santri");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error creating santri:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to create santri");
  }
}

export async function updateSantri(id: number, data: SantriData) {
  try {
    const santriToUpdate = {
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };

    const result = await db.update('santris', id, santriToUpdate);
    
    if (!result) {
      throw new Error("Failed to update santri");
    }

    revalidatePath("/admin/santri");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error updating santri:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to update santri");
  }
}

export async function deleteSantri(id: number) {
  try {
    const result = await db.delete('santris', id);
    
    if (!result) {
      throw new Error("Failed to delete santri");
    }

    revalidatePath("/admin/santri");
    return { success: true };
  } catch (error) {
    console.error("Error deleting santri:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to delete santri");
  }
}
