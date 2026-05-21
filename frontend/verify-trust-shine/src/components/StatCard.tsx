import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

const variantStyles = {
  default: "bg-card border-border/50",
  success: "bg-success/5 border-success/20",
  warning: "bg-warning/5 border-warning/20",
  danger:  "bg-danger/5 border-danger/20",
};

const iconVariants = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger:  "bg-danger/10 text-danger",
};

const valueColor = {
  default: "text-foreground",
  success: "text-success",
  warning: "text-warning",
  danger:  "text-danger",
};

const StatCard = ({ icon: Icon, label, value, trend, variant = "default" }: StatCardProps) => (
  <motion.div
    whileHover={{ scale: 1.03, y: -3, transition: { duration: 0.18 } }}
    whileTap={{ scale: 0.98 }}
    className={`rounded-2xl border p-5 transition-shadow hover:shadow-lg hover:shadow-black/10 ${variantStyles[variant]}`}
  >
    <div className="flex items-start justify-between">
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className={`mt-1.5 text-2xl font-extrabold tabular-nums ${valueColor[variant]}`}>{value}</p>
        {trend && (
          <p className="mt-1 text-xs font-medium text-success">{trend}</p>
        )}
      </div>
      <div className={`rounded-xl p-2.5 shrink-0 ml-3 ${iconVariants[variant]}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  </motion.div>
);

export default StatCard;
