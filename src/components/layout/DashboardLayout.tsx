"use client";

import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface DashboardLayoutProps {
  children: ReactNode;
  role: "ADMIN" | "USTADZ" | "ORANG_TUA";
  userName: string;
  pageTitle: string;
  notifications?: number;
}

export function DashboardLayout({
  children,
  role,
  userName,
  pageTitle,
  notifications = 0,
}: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar role={role} userName={userName} />
      
      <div className="ml-64">
        <Header
          title={pageTitle}
          userName={userName}
          userRole={role}
          notifications={notifications}
        />
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
