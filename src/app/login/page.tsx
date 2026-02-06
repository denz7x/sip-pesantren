"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { login, getRoleRedirectUrl } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await login(email, password);

      if (result.success) {
        // Get user from mock data to determine redirect
        const mockUsers: Record<string, { role: string; name: string }> = {
          "admin@pesantren.com": { role: "ADMIN", name: "Pengelola" },
          "ustadz@pesantren.com": { role: "USTADZ", name: "Ustadz Ahmad" },
          "ortu@pesantren.com": { role: "ORANG_TUA", name: "Bapak/Ibu Orang Tua" },
        };

        const user = mockUsers[email];
        router.push(getRoleRedirectUrl(user.role as "ADMIN" | "USTADZ" | "ORANG_TUA"));
      } else {
        setError(result.error || "Login gagal");
      }
    } catch {
      setError("Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    { email: "admin@pesantren.com", role: "Admin", desc: "Akses Penuh" },
    { email: "ustadz@pesantren.com", role: "Ustadz", desc: "Input Data" },
    { email: "ortu@pesantren.com", role: "Orang Tua", desc: "Monitoring" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2d9596] to-[#247f80] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-lg mb-4">
            <span className="text-[#2d9596] font-bold text-2xl">SIP</span>
          </div>
          <h1 className="text-2xl font-bold text-white">SIP-Baiturrohman</h1>
          <p className="text-white/80 mt-1">Sistem Informasi Pondok Pesanren</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 text-center">
            Masuk ke Akun Anda
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email Anda"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password Anda"
              required
            />

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Masuk
            </Button>
          </form>
        </div>

        {/* Demo Accounts */}
        <div className="mt-6 bg-white/90 backdrop-blur rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Akun Demo:</h3>
          <div className="space-y-2">
            {demoAccounts.map((account) => (
              <button
                key={account.email}
                onClick={() => {
                  setEmail(account.email);
                  setPassword("demo123");
                }}
                className="w-full text-left p-3 rounded-lg bg-white hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{account.role}</p>
                    <p className="text-xs text-gray-500">{account.desc}</p>
                  </div>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                    {account.email}
                  </code>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/60 text-sm mt-6">
          © 2024 SIP-Baiturrohman. All rights reserved.
        </p>
      </div>
    </div>
  );
}
