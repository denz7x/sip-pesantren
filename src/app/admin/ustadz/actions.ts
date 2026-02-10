"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";

interface UstadzData {
  id?: number;
  nip: string;
  nama: string;
  email: string;
  jenisKelamin: "LAKI" | "PEREMPUAN";
  spesialisasi: string;
  noTelepon: string;
  alamat: string;
  isActive: boolean;
}

// Helper function to create user account for ustadz
async function createUserAccount(email: string, nama: string): Promise<number> {
  // Get current users to find next ID
  const existingUsers = await db.select('users');
  const nextUserId = existingUsers.length > 0 
    ? Math.max(...existingUsers.map((u: {id: number}) => u.id)) + 1 
    : 1;

  // Generate default password (first 6 characters of email + "123")
  const defaultPassword = email.split('@')[0].substring(0, 6) + "123";

  const userToInsert = {
    id: nextUserId,
    email: email,
    password: defaultPassword, // In production, should be hashed
    role: "USTADZ",
    name: nama,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  console.log("DEBUG createUserAccount - creating user:", JSON.stringify(userToInsert, null, 2));
  
  const result = await db.insert('users', userToInsert);
  
  if (!result) {
    throw new Error("Failed to create user account");
  }

  return nextUserId;
}


export async function createUstadz(data: UstadzData) {
  try {
    console.log("DEBUG createUstadz - received data:", JSON.stringify(data, null, 2));
    
    // Check if email already exists in users
    const existingUsers = await db.select('users');
    const emailExists = existingUsers.some((u: any) => u.email === data.email);
    
    if (emailExists) {
      throw new Error("Email sudah terdaftar. Silakan gunakan email lain.");
    }

    // Create user account first
    const userId = await createUserAccount(data.email, data.nama);
    console.log("DEBUG createUstadz - created user with ID:", userId);
    
    // Get current data to find next ID
    const existingData = await db.select('ustadzs');
    const nextId = existingData.length > 0 
      ? Math.max(...existingData.map((u: {id: number}) => u.id)) + 1 
      : 1;

    const ustadzToInsert = {
      ...data,
      id: nextId,
      userId: userId, // Link to the newly created user
      foto: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log("DEBUG createUstadz - inserting:", JSON.stringify(ustadzToInsert, null, 2));
    
    const result = await db.insert('ustadzs', ustadzToInsert);
    
    console.log("DEBUG createUstadz - insert result:", result);
    
    if (!result) {
      throw new Error("Failed to create ustadz");
    }

    revalidatePath("/admin/ustadz");
    return { 
      success: true, 
      data: result,
      message: `Ustadz berhasil dibuat. Akun login telah dibuat dengan email: ${data.email} dan password default.`
    };
  } catch (error) {
    console.error("Error creating ustadz:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to create ustadz");
  }
}


export async function updateUstadz(id: number, data: UstadzData) {
  try {
    const ustadzToUpdate = {
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };

    const result = await db.update('ustadzs', id, ustadzToUpdate);
    
    if (!result) {
      throw new Error("Failed to update ustadz");
    }

    revalidatePath("/admin/ustadz");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error updating ustadz:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to update ustadz");
  }
}

export async function deleteUstadz(id: number) {
  try {
    const result = await db.delete('ustadzs', id);
    
    if (!result) {
      throw new Error("Failed to delete ustadz");
    }

    revalidatePath("/admin/ustadz");
    return { success: true };
  } catch (error) {
    console.error("Error deleting ustadz:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to delete ustadz");
  }
}
