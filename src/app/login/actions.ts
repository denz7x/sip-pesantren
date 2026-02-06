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

// Mock user data for demo purposes
const mockUsers: Record<string, UserSession> = {
  "admin@pesantren.com": {
    id: 1,
    email: "admin@pesantren.com",
    role: "ADMIN",
    name: "Pengelola",
  },
  "ustadz@pesantren.com": {
    id: 2,
    email: "ustadz@pesantren.com",
    role: "USTADZ",
    name: "Ustadz Ahmad",
  },
  "ortu@pesantren.com": {
    id: 3,
    email: "ortu@pesantren.com",
    role: "ORANG_TUA",
    name: "Bapak/Ibu Orang Tua",
  },
};

export async function loginAction(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; role?: UserRole }> {
  // Validate inputs
  if (!email || !password) {
    return { success: false, error: "Email dan password harus diisi" };
  }

  const user = mockUsers[email];

  if (!user) {
    return { success: false, error: "Email tidak ditemukan" };
  }

  // For demo purposes, accept any password that is at least 6 characters
  if (password.length < 6) {
    return { success: false, error: "Password minimal 6 karakter" };
  }

  const cookieStore = await cookies();
  cookieStore.set("session", btoa(JSON.stringify(user)), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return { success: true, role: user.role };
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


