"use client";

import Image from "next/image";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark";
  showText?: boolean;
}

export function Logo({ size = "md", variant = "dark", showText = true }: LogoProps) {
  const sizeClasses = {
    sm: { container: "w-8 h-8", image: 32, text: "text-sm", subtext: "text-xs" },
    md: { container: "w-10 h-10", image: 40, text: "text-base", subtext: "text-xs" },
    lg: { container: "w-14 h-14", image: 56, text: "text-lg", subtext: "text-sm" },
    xl: { container: "w-16 h-16", image: 64, text: "text-xl", subtext: "text-base" },
  };


  const colors = variant === "light" 
    ? { text: "text-white", subtext: "text-white/80" }
    : { text: "text-gray-900", subtext: "text-gray-600" };

  const s = sizeClasses[size];

  return (
    <div className="flex items-center gap-3">
      {/* Logo Image */}
      <div className={`${s.container} relative overflow-hidden`}>
        <Image
          src="/images/logo.png"
          alt="Pondok Pesantren Baiturrohman"
          fill
          className="object-contain"
          priority
        />
      </div>


      {/* Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold ${s.text} ${colors.text} leading-tight`}>
            Sistem Administrasi & Informasi
          </span>
          <span className={`${s.subtext} ${colors.subtext}`}>
            Pondok Pesantren Baiturrohman
          </span>
        </div>
      )}

    </div>
  );
}

// Simple logo icon only (for favicon or small icons)
export function LogoIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <div className={`${className} relative rounded overflow-hidden`}>
      <Image
        src="/images/logo.png"
        alt="Logo"
        fill
        className="object-contain"
      />
    </div>
  );
}
