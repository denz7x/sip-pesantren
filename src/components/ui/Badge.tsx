interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md";
}

export function Badge({ children, variant = "default", size = "md" }: BadgeProps) {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    danger: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}

// Status-specific badges for the app
export function AttendanceBadge({ status }: { status: string }) {
  const variants: Record<string, { class: string; label: string }> = {
    HADIR: { class: "bg-green-100 text-green-800", label: "Hadir" },
    SAKIT: { class: "bg-yellow-100 text-yellow-800", label: "Sakit" },
    IZIN: { class: "bg-blue-100 text-blue-800", label: "Izin" },
    ALPHA: { class: "bg-red-100 text-red-800", label: "Alpha" },
  };

  const { class: variantClass, label } = variants[status] || { class: "bg-gray-100 text-gray-800", label: status };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClass}`}>
      {label}
    </span>
  );
}

export function TahfidzBadge({ quality }: { quality: string }) {
  const variants: Record<string, { class: string; label: string }> = {
    SANGAT_BAIK: { class: "bg-green-100 text-green-800", label: "Sangat Baik" },
    BAIK: { class: "bg-blue-100 text-blue-800", label: "Baik" },
    CUKUP: { class: "bg-yellow-100 text-yellow-800", label: "Cukup" },
    KURANG: { class: "bg-red-100 text-red-800", label: "Kurang" },
  };

  const { class: variantClass, label } = variants[quality] || { class: "bg-gray-100 text-gray-800", label: quality };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClass}`}>
      {label}
    </span>
  );
}

export function TransactionBadge({ type }: { type: string }) {
  const variants: Record<string, { class: string; label: string }> = {
    TOPUP: { class: "bg-green-100 text-green-800", label: "Topup" },
    DEBIT: { class: "bg-red-100 text-red-800", label: "Debit" },
    KREDIT: { class: "bg-blue-100 text-blue-800", label: "Kredit" },
  };

  const { class: variantClass, label } = variants[type] || { class: "bg-gray-100 text-gray-800", label: type };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClass}`}>
      {label}
    </span>
  );
}

export function ViolationBadge({ category }: { category: string }) {
  const variants: Record<string, { class: string; label: string }> = {
    RINGAN: { class: "bg-yellow-100 text-yellow-800", label: "Ringan" },
    SEDANG: { class: "bg-orange-100 text-orange-800", label: "Sedang" },
    BERAT: { class: "bg-red-100 text-red-800", label: "Berat" },
    SANGAT_BERAT: { class: "bg-red-200 text-red-900", label: "Sangat Berat" },
  };

  const { class: variantClass, label } = variants[category] || { class: "bg-gray-100 text-gray-800", label: category };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variantClass}`}>
      {label}
    </span>
  );
}
