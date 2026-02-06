"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
}

interface SidebarProps {
  role: "ADMIN" | "USTADZ" | "ORANG_TUA";
  userName: string;
}

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();

  const navItems: NavItem[] = [
    // Admin & Ustadz
    {
      label: "Dashboard",
      href: role === "ADMIN" ? "/admin" : role === "USTADZ" ? "/ustadz" : "/orang-tua",
      icon: <DashboardIcon />,
    },
    // Admin Only
    ...(role === "ADMIN"
      ? [
          {
            label: "Kelola Santri",
            href: "/admin/santri",
            icon: <UserIcon />,
          },
          {
            label: "Kelola Ustadz",
            href: "/admin/ustadz",
            icon: <TeacherIcon />,
          },
          {
            label: "Kelola Orang Tua",
            href: "/admin/orang-tua",
            icon: <FamilyIcon />,
          },
          {
            label: "Top-up Saldo",
            href: "/admin/topup",
            icon: <WalletIcon />,
          },
          {
            label: "Keuangan",
            href: "/admin/keuangan",
            icon: <MoneyIcon />,
          },
        ]
      : []),
    // Ustadz Only
    ...(role === "USTADZ"
      ? [
          {
            label: "Input Absensi",
            href: "/ustadz/absensi",
            icon: <CalendarIcon />,
          },
          {
            label: "Setoran Hafalan",
            href: "/ustadz/hafalan",
            icon: <BookIcon />,
          },
          {
            label: "Jurnal Pelanggaran",
            href: "/ustadz/pelanggaran",
            icon: <AlertIcon />,
          },
          {
            label: "POS / Kasir",
            href: "/ustadz/kasir",
            icon: <ShopIcon />,
          },
        ]
      : []),
    // Shared
    {
      label: "Riwayat Absensi",
      href: "/absensi",
      icon: <CalendarIcon />,
      roles: ["ADMIN", "USTADZ", "ORANG_TUA"],
    },
    {
      label: "Riwayat Hafalan",
      href: "/hafalan",
      icon: <BookIcon />,
      roles: ["ADMIN", "USTADZ", "ORANG_TUA"],
    },
    {
      label: "Riwayat Transaksi",
      href: "/transaksi",
      icon: <MoneyIcon />,
      roles: ["ADMIN", "ORANG_TUA"],
    },
  ];

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-[#2d9596] text-white shadow-xl">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-[#247f80]">
        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
          <span className="text-[#2d9596] font-bold text-lg">SIP</span>
        </div>
        <div>
          <h1 className="font-bold text-lg leading-tight">SIP-Baiturrohman</h1>
          <p className="text-xs text-white/70">Pondok Pesanren</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-white text-[#2d9596] font-medium shadow-md"
                  : "text-white/80 hover:bg-[#247f80] hover:text-white"
              }`}
            >
              <span className="w-5 h-5">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-[#247f80]">
        <div className="flex items-center gap-3 px-4 py-3 bg-[#247f80] rounded-lg">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <UserIcon />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{userName}</p>
            <p className="text-xs text-white/70 truncate">{role.replace("_", " ")}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

// Icons
function DashboardIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  );
}

function TeacherIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function FamilyIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

function MoneyIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function ShopIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}
