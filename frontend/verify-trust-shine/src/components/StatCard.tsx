import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

const variantStyles = {
  default: "bg-card border-border",
  success: "bg-success/5 border-success/20",
  warning: "bg-warning/5 border-warning/20",
  danger: "bg-danger/5 border-danger/20",
};

const iconVariants = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
};

const StatCard = ({ icon: Icon, label, value, trend, variant = "default" }: StatCardProps) => (
  <div className={`rounded-xl border p-5 transition-all hover:shadow-md ${variantStyles[variant]}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
        {trend && (
          <p className="mt-1 text-xs font-medium text-success">{trend}</p>
        )}
      </div>
      <div className={`rounded-lg p-2.5 ${iconVariants[variant]}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </div>
);

export default StatCard;
