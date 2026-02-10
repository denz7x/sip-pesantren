"use client";

import { ReactNode, useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "ADMIN" | "USTADZ" | "ORANG_TUA";
  userName: string;
  userId?: string;
  pageTitle: string;
  notifications?: number;
}

export function DashboardLayout({
  children,
  role,
  userName,
  userId,
  pageTitle,
  notifications = 0,
}: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-soft">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-tosca-900/30 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar 
          role={role} 
          userName={userName} 
          userId={userId}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 min-w-0">
        <Header
          title={pageTitle}
          userName={userName}
          userRole={role}
          userId={userId}
          notifications={notifications}
          onMenuClick={() => setIsMobileMenuOpen(true)}
        />

        <main className="p-4 lg:p-6 safe-area-bottom">
          {children}
        </main>
      </div>
    </div>
  );
}
