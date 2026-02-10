"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

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
    // Call the API to authenticate
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!data.success) {
      return { success: false, error: data.error || "Login gagal" };
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("session", btoa(JSON.stringify(data.user)), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return { success: true, role: data.user.role };
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
