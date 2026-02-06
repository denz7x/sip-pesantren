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

export async function getSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie?.value) {
    return null;
  }

  // For demo, decode base64 and parse (in production, use proper JWT)
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

export async function login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  // For demo, accept any password
  const user = mockUsers[email];

  if (!user) {
    return { success: false, error: "Email tidak ditemukan" };
  }

  const cookieStore = await cookies();
  cookieStore.set("session", btoa(JSON.stringify(user)), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  return { success: true };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/login");
}

export function getRoleRedirectUrl(role: UserRole): string {
  switch (role) {
    case "ADMIN":
      return "/admin";
    case "USTADZ":
      return "/ustadz";
    case "ORANG_TUA":
      return "/orang-tua";
    default:
      return "/login";
  }
}
