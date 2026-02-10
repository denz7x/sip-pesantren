"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/useAuth";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"general" | "security" | "notifications">("general");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // General settings
  const [generalSettings, setGeneralSettings] = useState({
    language: "id",
    timezone: "Asia/Jakarta",
    dateFormat: "DD/MM/YYYY",
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    transactionAlerts: true,
    attendanceAlerts: true,
  });

  const handleSaveGeneral = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessage("Pengaturan umum berhasil disimpan!");
    } catch (error) {
      setMessage("Gagal menyimpan pengaturan.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSecurity = async () => {
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      setMessage("Password baru dan konfirmasi tidak cocok!");
      return;
    }
    if (securitySettings.newPassword.length < 6) {
      setMessage("Password baru minimal 6 karakter!");
      return;
    }

    setIsLoading(true);
    setMessage(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessage("Password berhasil diubah!");
      setSecuritySettings({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      setMessage("Gagal mengubah password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessage("Pengaturan notifikasi berhasil disimpan!");
    } catch (error) {
      setMessage("Gagal menyimpan pengaturan notifikasi.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout
      role={user.role}
      userName={user.name}
      userId={String(user.id)}
      pageTitle="Pengaturan"
    >

      <div className="max-w-4xl mx-auto">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("general")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "general"
                ? "border-[#2d9596] text-[#2d9596]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Umum
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "security"
                ? "border-[#2d9596] text-[#2d9596]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Keamanan
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "notifications"
                ? "border-[#2d9596] text-[#2d9596]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Notifikasi
          </button>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`p-3 mb-4 rounded-lg text-sm ${
            message.includes("berhasil") 
              ? "bg-green-50 text-green-600 border border-green-200" 
              : "bg-red-50 text-red-600 border border-red-200"
          }`}>
            {message}
          </div>
        )}

        {/* General Settings */}
        {activeTab === "general" && (
          <Card variant="bordered">
            <CardHeader title="Pengaturan Umum" subtitle="Konfigurasi dasar aplikasi" />
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bahasa
                </label>
                <select
                  value={generalSettings.language}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, language: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d9596] focus:border-transparent"
                >
                  <option value="id">Bahasa Indonesia</option>
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zona Waktu
                </label>
                <select
                  value={generalSettings.timezone}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d9596] focus:border-transparent"
                >
                  <option value="Asia/Jakarta">Asia/Jakarta (WIB)</option>
                  <option value="Asia/Makassar">Asia/Makassar (WITA)</option>
                  <option value="Asia/Jayapura">Asia/Jayapura (WIT)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format Tanggal
                </label>
                <select
                  value={generalSettings.dateFormat}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, dateFormat: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#2d9596] focus:border-transparent"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>

              <div className="pt-4">
                <Button onClick={handleSaveGeneral} disabled={isLoading}>
                  {isLoading ? "Menyimpan..." : "Simpan Pengaturan"}
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Security Settings */}
        {activeTab === "security" && (
          <Card variant="bordered">
            <CardHeader title="Keamanan" subtitle="Ubah password dan pengaturan keamanan" />
            <div className="space-y-4">
              <Input
                label="Password Saat Ini"
                type="password"
                value={securitySettings.currentPassword}
                onChange={(e) => setSecuritySettings({ ...securitySettings, currentPassword: e.target.value })}
                placeholder="Masukkan password saat ini"
              />
              <Input
                label="Password Baru"
                type="password"
                value={securitySettings.newPassword}
                onChange={(e) => setSecuritySettings({ ...securitySettings, newPassword: e.target.value })}
                placeholder="Minimal 6 karakter"
              />
              <Input
                label="Konfirmasi Password Baru"
                type="password"
                value={securitySettings.confirmPassword}
                onChange={(e) => setSecuritySettings({ ...securitySettings, confirmPassword: e.target.value })}
                placeholder="Ulangi password baru"
              />

              <div className="pt-4">
                <Button onClick={handleSaveSecurity} disabled={isLoading}>
                  {isLoading ? "Menyimpan..." : "Ubah Password"}
                </Button>
              </div>

              <hr className="my-6 border-gray-200" />

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Sesi Aktif</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">Perangkat Saat Ini</p>
                      <p className="text-sm text-gray-500">Windows • Chrome • Jakarta, Indonesia</p>
                    </div>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Aktif
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Notification Settings */}
        {activeTab === "notifications" && (
          <Card variant="bordered">
            <CardHeader title="Notifikasi" subtitle="Atur preferensi notifikasi Anda" />
            <div className="space-y-4">
              {[
                { key: "emailNotifications", label: "Notifikasi Email", description: "Terima notifikasi melalui email" },
                { key: "pushNotifications", label: "Notifikasi Push", description: "Notifikasi browser saat aplikasi terbuka" },
                { key: "smsNotifications", label: "Notifikasi SMS", description: "Terima notifikasi penting via SMS" },
                { key: "transactionAlerts", label: "Alert Transaksi", description: "Notifikasi untuk setiap transaksi" },
                { key: "attendanceAlerts", label: "Alert Absensi", description: "Notifikasi perubahan status absensi" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={notificationSettings[item.key as keyof typeof notificationSettings] as boolean}
                      onChange={(e) => setNotificationSettings({
                        ...notificationSettings,
                        [item.key]: e.target.checked,
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#2d9596]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2d9596]"></div>
                  </label>
                </div>
              ))}

              <div className="pt-4">
                <Button onClick={handleSaveNotifications} disabled={isLoading}>
                  {isLoading ? "Menyimpan..." : "Simpan Pengaturan"}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
