"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";

export type UserRole = "ADMIN" | "USTADZ" | "ORANG_TUA";

interface UserSession {
  id: number;
  email: string;
  role: UserRole;
  name: string;
}

export async function loginAction(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; role?: UserRole }> {
  // Validate inputs
  if (!email || !password) {
    return { success: false, error: "Email dan password harus diisi" };
  }

  try {
    // Fetch users directly from database
    const users = await db.select('users');

    // Find user by email
    const user = users.find((u: any) => u.email === email);

    if (!user) {
      return { success: false, error: "Email tidak ditemukan" };
    }

    // Check password (in production, use bcrypt)
    if (user.password !== password) {
      return { success: false, error: "Password salah" };
    }

    // Check if user is active
    if (user.isActive === "false" || user.isActive === false) {
      return { success: false, error: "Akun tidak aktif" };
    }

    // Create session
    const session = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("session", btoa(JSON.stringify(session)), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return { success: true, role: user.role };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, error: "Terjadi kesalahan saat login" };
  }
}


export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/login");
}

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const decoded = JSON.parse(atob(sessionCookie.value));
    return decoded as UserSession;
  } catch {
    return null;
  }
}

export async function requireAuth(allowedRoles?: UserRole[]): Promise<UserSession> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    redirect("/unauthorized");
  }

  return session;
}
