"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface HeaderProps {
  title: string;
  userName: string;
  userRole: string;
  userId?: string;
  notifications?: number;
  onMenuClick?: () => void;
}

export function Header({ title, userName, userRole, userId, notifications = 0, onMenuClick }: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  // Load profile photo from localStorage
  useEffect(() => {
    if (userId) {
      const savedPhoto = localStorage.getItem(`profile_photo_${userId}`);
      if (savedPhoto) {
        setProfilePhoto(savedPhoto);
      }
    }
  }, [userId]);

  return (
    <header className="sticky top-0 z-30 glass-header shadow-lg safe-area-top">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3 lg:py-4">
        {/* Left Side - Mobile Menu & Title */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-xl bg-tosca-700/50 hover:bg-tosca-600/50 transition-colors touch-target border border-tosca-400/50"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          {/* Page Title */}
          <div>
            <h1 className="text-lg lg:text-xl font-bold text-white">{title}</h1>
            <p className="text-xs lg:text-sm text-tosca-100 hidden sm:block">Selamat Datang, {userName}</p>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 lg:p-2.5 text-tosca-100 hover:text-white hover:bg-tosca-700/50 rounded-xl transition-all duration-300 touch-target border border-tosca-400/50"
            >
              <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {notifications > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 lg:w-5 lg:h-5 bg-gradient-to-br from-red-400 to-red-500 text-white text-[10px] lg:text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  {notifications > 9 ? "9+" : notifications}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 lg:w-80 glass-card bg-tosca-800/95 border-tosca-400/50 rounded-2xl shadow-2xl py-2 z-50">
                <div className="px-4 py-3 border-b border-tosca-400/30">
                  <h3 className="font-semibold text-white">Notifikasi</h3>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <p className="px-4 py-4 text-sm text-tosca-200 text-center">
                    Tidak ada notifikasi baru
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-2 lg:gap-3 p-1.5 lg:p-2 hover:bg-tosca-700/50 rounded-xl transition-all duration-300 touch-target border border-tosca-400/50"
            >
              <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full overflow-hidden bg-gradient-to-br from-tosca-300 to-tosca-500 flex items-center justify-center shadow-lg ring-2 ring-tosca-200/50">
                {profilePhoto ? (
                  <img 
                    src={profilePhoto} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-bold text-sm lg:text-base">
                    {userName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div className="hidden md:block text-left">
                <p className="text-sm font-semibold text-white">{userName}</p>
                <p className="text-xs text-tosca-200">{userRole.replace("_", " ")}</p>
              </div>
              <svg className="w-4 h-4 text-tosca-200 hidden sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showProfile && (
              <div className="absolute right-0 mt-2 w-48 glass-card bg-tosca-800/95 rounded-2xl shadow-2xl py-2 z-50 border border-tosca-400/50">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-tosca-100 hover:bg-tosca-700/50 transition-colors"
                  onClick={() => setShowProfile(false)}
                >
                  <svg className="w-4 h-4 text-tosca-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Profil Saya
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-tosca-100 hover:bg-tosca-700/50 transition-colors"
                  onClick={() => setShowProfile(false)}
                >
                  <svg className="w-4 h-4 text-tosca-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Pengaturan
                </Link>
                <hr className="my-1 border-tosca-400/30" />
                <button
                  onClick={async () => {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    window.location.href = '/login';
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-300 hover:bg-red-500/20 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Keluar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
