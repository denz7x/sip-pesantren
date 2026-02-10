"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAction } from "./actions";
import { Logo } from "@/components/ui/Logo";


export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    const result = await loginAction(username, password);

    if (!result.success) {
      setError(result.error || "Login gagal");
      setLoading(false);
      return;
    }

    // Redirect based on role
    switch (result.role) {
      case "ADMIN":
        router.push("/admin");
        break;
      case "USTADZ":
        router.push("/ustadz");
        break;
      case "ORANG_TUA":
        router.push("/orang-tua");
        break;
      default:
        router.push("/");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-tosca-100 via-tosca-200 to-tosca-300 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-tosca-400/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-tosca-300/30 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-white/20 rounded-full blur-3xl" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="text-center mb-8 animate-slide-up">
          <div className="flex justify-center mb-4">
            <Logo size="xl" variant="dark" showText={false} />
          </div>
          <h1 className="text-2xl font-bold text-tosca-800 mb-2">Sistem Informasi & Administrasi Pondok Pesantren (SIAP) </h1>
          <p className="text-tosca-600 font-medium">Pondok Pesantren Baiturrohman</p>
        </div>


        {/* Login Card */}
        <div className="glass-card p-8 animate-slide-up" style={{ animationDelay: "0.1s" }}>
          <h2 className="text-2xl font-bold text-tosca-800 mb-6 text-center">Masuk ke Akun</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-100/80 border border-red-300 rounded-xl text-red-700 text-sm animate-slide-up">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-tosca-700 mb-2">
                Username / Email
              </label>
              <input
                type="text"
                id="username"
                name="username"
                required
                className="w-full px-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-tosca-500 focus:border-transparent transition-all"
                placeholder="Masukkan username atau email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-tosca-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                className="w-full px-4 py-3 rounded-xl glass-input focus:ring-2 focus:ring-tosca-500 focus:border-transparent transition-all"
                placeholder="Masukkan password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl glass-button text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Memuat...
                </>
              ) : (
                "Masuk"
              )}
            </button>
          </form>


        </div>

        {/* Footer */}
        <p className="text-center mt-8 text-sm text-tosca-600">
          © 2026 Pondok Pesantren Baiturrohman. All rights reserved.
        </p>
      </div>

      {/* Watermark */}
      <div className="absolute bottom-4 right-4 z-20">
        <p className="text-xs text-white-500/60 font-medium bold">developed by @denz7x</p>
      </div>
    </div>

  );
}
