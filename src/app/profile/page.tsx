"use client";

import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/lib/useAuth";

export default function ProfilePage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Photo upload states
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Load saved photo from localStorage on mount
  useEffect(() => {
    const savedPhoto = localStorage.getItem(`profile_photo_${user?.id}`);
    if (savedPhoto) {
      setProfilePhoto(savedPhoto);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: "",
        address: "",
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessage("Profil berhasil diperbarui!");
      setIsEditing(false);
    } catch (error) {
      setMessage("Gagal memperbarui profil. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage("File harus berupa gambar (JPG, PNG, GIF, etc)");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage("Ukuran file maksimal 2MB");
      return;
    }

    setSelectedFile(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    setMessage(null);
  };

  const handleUpload = async () => {
    if (!selectedFile || !previewUrl) return;

    setIsUploading(true);
    setMessage(null);

    try {
      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Save to localStorage (in real app, this would be an API call)
      localStorage.setItem(`profile_photo_${user?.id}`, previewUrl);
      setProfilePhoto(previewUrl);
      setSelectedFile(null);
      setPreviewUrl(null);
      setMessage("Foto profil berhasil diupload!");
    } catch (error) {
      setMessage("Gagal mengupload foto. Silakan coba lagi.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelUpload = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = () => {
    if (confirm("Apakah Anda yakin ingin menghapus foto profil?")) {
      localStorage.removeItem(`profile_photo_${user?.id}`);
      setProfilePhoto(null);
      setMessage("Foto profil berhasil dihapus");
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout
      role={user.role}
      userName={user.name}
      userId={String(user.id)}
      pageTitle="Profil Saya"
    >


      <div className="max-w-3xl mx-auto">
        {/* Profile Header */}
        <Card variant="elevated" className="mb-6">
          <div className="flex flex-col md:flex-row items-center gap-6 p-6">
            <div className="relative">
              {/* Profile Photo or Initials */}
              <div className="w-32 h-32 rounded-full overflow-hidden bg-[#2d9596] flex items-center justify-center">
                {previewUrl ? (
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                  />
                ) : profilePhoto ? (
                  <img 
                    src={profilePhoto} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-4xl font-bold">
                    {user.name ? user.name.charAt(0).toUpperCase() : "?"}
                  </span>
                )}
              </div>

              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              {/* Photo Action Buttons */}
              <div className="absolute -bottom-1 -right-1 flex gap-1">
                <button
                  onClick={handlePhotoClick}
                  className="w-10 h-10 bg-white border-2 border-gray-200 rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors shadow-sm"
                  title={previewUrl ? "Ganti Foto" : "Ubah Foto"}
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
                
                {profilePhoto && !previewUrl && (
                  <button
                    onClick={handleRemovePhoto}
                    className="w-10 h-10 bg-white border-2 border-red-200 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors shadow-sm"
                    title="Hapus Foto"
                  >
                    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            <div className="text-center md:text-left flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
              <p className="text-gray-500 capitalize">{user.role.replace("_", " ")}</p>
              <p className="text-sm text-gray-400 mt-1">Bergabung sejak 2024</p>
              
              {/* Upload Actions */}
              {previewUrl && (
                <div className="flex gap-2 mt-3 justify-center md:justify-start">
                  <Button 
                    onClick={handleUpload} 
                    disabled={isUploading}
                    size="sm"
                  >
                    {isUploading ? "Mengupload..." : "Upload Foto"}
                  </Button>
                  <Button 
                    onClick={handleCancelUpload} 
                    variant="outline"
                    size="sm"
                    disabled={isUploading}
                  >
                    Batal
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-2">
              {!isEditing && (
                <Button onClick={() => setIsEditing(true)} variant="outline">
                  Edit Profil
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Profile Form */}
        <Card variant="bordered">
          <CardHeader title="Informasi Pribadi" subtitle="Detail informasi akun Anda" />
          
          {message && (
            <div className={`p-3 mb-4 rounded-lg text-sm ${
              message.includes("berhasil") 
                ? "bg-green-50 text-green-600 border border-green-200" 
                : "bg-red-50 text-red-600 border border-red-200"
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nama Lengkap"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                required
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
              />
              <Input
                label="Nomor Telepon"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
              />
              <Input
                label="Alamat"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                disabled={!isEditing}
              />
            </div>

            {isEditing && (
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user.name || "",
                      email: user.email || "",
                      phone: "",
                      address: "",
                    });
                  }}
                  disabled={isLoading}
                >
                  Batal
                </Button>
              </div>
            )}
          </form>
        </Card>

        {/* Account Info */}
        <Card variant="bordered" className="mt-6">
          <CardHeader title="Informasi Akun" />
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">ID Pengguna</span>
              <span className="font-medium text-gray-900">{user.id || "-"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Role</span>
              <span className="font-medium text-gray-900 capitalize">
                {user.role?.replace("_", " ") || "-"}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500">Status</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Aktif
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-500">Terakhir Login</span>
              <span className="font-medium text-gray-900">
                {new Date().toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
