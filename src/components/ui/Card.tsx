import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "bordered";
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", variant = "default", padding = "md", children, ...props }, ref) => {
    const variants = {
      default: "bg-white",
      elevated: "bg-white shadow-lg",
      bordered: "bg-white border-2 border-gray-200",
    };

    const paddings = {
      none: "",
      sm: "p-3",
      md: "p-5",
      lg: "p-6",
    };

    return (
      <div
        ref={ref}
        className={`rounded-xl ${variants[variant]} ${paddings[padding]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  subtitle?: string;
}

export function CardHeader({ title, subtitle, className = "", ...props }: CardHeaderProps) {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: "tosc" | "blue" | "green" | "yellow" | "red";
}

export function StatCard({ title, value, icon, trend, color = "tosc" }: StatCardProps) {
  const colors = {
    tosc: "bg-[#2d9596]",
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500",
  };

  return (
    <Card variant="elevated" className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {trend && (
            <p className={`text-sm mt-2 ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
              {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}% dari bulan lalu
            </p>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${colors[color as keyof typeof colors] || colors.tosc}`}>
            <div className="text-white">{icon}</div>
          </div>
        )}
      </div>
    </Card>
  );
}
