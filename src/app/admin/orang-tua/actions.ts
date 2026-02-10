"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/db";

interface OrangTuaData {
  id?: number;
  nama: string;
  email: string;
  noTelepon: string;
  alamat: string;
  isActive: boolean;
}

// Helper function to create user account for orang tua
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
    role: "ORANG_TUA",
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

export async function createOrangTua(data: OrangTuaData) {
  try {
    console.log("DEBUG createOrangTua - received data:", JSON.stringify(data, null, 2));
    
    // Check if email already exists in users
    const existingUsers = await db.select('users');
    const emailExists = existingUsers.some((u: any) => u.email === data.email);
    
    if (emailExists) {
      throw new Error("Email sudah terdaftar. Silakan gunakan email lain.");
    }

    // Create user account first
    const userId = await createUserAccount(data.email, data.nama);
    console.log("DEBUG createOrangTua - created user with ID:", userId);
    
    // Get current data to find next ID
    const existingData = await db.select('orangTua');
    const nextId = existingData.length > 0 
      ? Math.max(...existingData.map((ot: {id: number}) => ot.id)) + 1 
      : 1;

    const orangTuaToInsert = {
      ...data,
      id: nextId,
      userId: userId, // Link to the newly created user
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    console.log("DEBUG createOrangTua - inserting:", JSON.stringify(orangTuaToInsert, null, 2));
    
    const result = await db.insert('orangTua', orangTuaToInsert);
    
    console.log("DEBUG createOrangTua - insert result:", result);

    
    if (!result) {
      throw new Error("Failed to create orang tua");
    }

    revalidatePath("/admin/orang-tua");
    return { 
      success: true, 
      data: result,
      message: `Orang tua berhasil dibuat. Akun login telah dibuat dengan email: ${data.email} dan password default.`
    };
  } catch (error) {
    console.error("Error creating orang tua:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to create orang tua");
  }
}


export async function updateOrangTua(id: number, data: OrangTuaData) {
  try {
    console.log("DEBUG updateOrangTua - received id:", id, "data:", JSON.stringify(data, null, 2));
    
    const orangTuaToUpdate = {
      ...data,
      id,
      updatedAt: new Date().toISOString(),
    };

    console.log("DEBUG updateOrangTua - updating with:", JSON.stringify(orangTuaToUpdate, null, 2));
    
    const result = await db.update('orangTua', id, orangTuaToUpdate);
    
    console.log("DEBUG updateOrangTua - update result:", result);

    
    if (!result) {
      throw new Error("Failed to update orang tua");
    }

    revalidatePath("/admin/orang-tua");
    return { success: true, data: result };
  } catch (error) {
    console.error("Error updating orang tua:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to update orang tua");
  }
}

export async function deleteOrangTua(id: number) {
  try {
    const result = await db.delete('orangTua', id);
    
    if (!result) {
      throw new Error("Failed to delete orang tua");
    }

    revalidatePath("/admin/orang-tua");
    return { success: true };
  } catch (error) {
    console.error("Error deleting orang tua:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to delete orang tua");
  }
}

// Helper function to fix orphaned orang tua records (userId is null but user account exists)
export async function fixOrangTuaUserLink(orangTuaId: number, userId: number) {
  try {
    console.log(`DEBUG fixOrangTuaUserLink - linking orangTua ${orangTuaId} to user ${userId}`);
    
    // Get current orang tua data
    const orangTuaData = await db.select('orangTua');
    const orangTua = orangTuaData.find((ot: any) => ot.id === orangTuaId);
    
    if (!orangTua) {
      throw new Error("Orang tua not found");
    }

    // Update the orang tua record with the userId
    const updatedData = {
      ...orangTua,
      userId: userId,
      updatedAt: new Date().toISOString(),
    };

    const result = await db.update('orangTua', orangTuaId, updatedData);
    
    if (!result) {
      throw new Error("Failed to update orang tua user link");
    }

    console.log(`DEBUG fixOrangTuaUserLink - successfully linked orangTua ${orangTuaId} to user ${userId}`);
    revalidatePath("/admin/orang-tua");
    return { success: true, message: "Orang tua berhasil di-link ke user account" };
  } catch (error) {
    console.error("Error fixing orang tua user link:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to fix orang tua user link");
  }
}
