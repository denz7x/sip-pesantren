import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Fetch users from Google Sheets
    const users = await db.select('users');
    
    // Find user by email
    const user = users.find((u: any) => u.email === email);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Email tidak ditemukan" },
        { status: 401 }
      );
    }

    // Check password (in production, use bcrypt)
    if (user.password !== password) {
      return NextResponse.json(
        { success: false, error: "Password salah" },
        { status: 401 }
      );
    }

    // Check if user is active
    if (user.isActive === "false" || user.isActive === false) {
      return NextResponse.json(
        { success: false, error: "Akun tidak aktif" },
        { status: 401 }
      );
    }

    // Create session
    const session = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    };

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("session", btoa(JSON.stringify(session)), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      role: user.role,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
