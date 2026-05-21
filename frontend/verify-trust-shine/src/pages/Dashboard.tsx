import { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, AlertTriangle, Activity, TrendingUp, Clock, Building2, Ban } from "lucide-react";
import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";
import SkeletonLoader from "@/components/SkeletonLoader";
import { Badge } from "@/components/ui/badge";
import { API_BASE } from "@/lib/api";
import PageTransition from "@/components/PageTransition";
import { useAuth } from "@/context/AuthContext";

interface VerificationLog {
  id: number;
  certificate_id: string;
  student_name: string;
  status: string;
  verified_at: string;
}

const alerts = [
  { message: "Spike in forged certificates from 'Global Tech University' — 23 flagged in last 24h", severity: "danger" },
  { message: "3 new institutions pending verification approval", severity: "warning" },
  { message: "Database sync completed for Gujarat University — 12,450 records", severity: "info" },
];

const statusBadge: Record<string, string> = {
  verified: "bg-success/10 text-success border-success/20",
  forged:   "bg-danger/10 text-danger border-danger/20",
  uncertain:"bg-warning/10 text-warning border-warning/20",
};

const alertBadge: Record<string, string> = {
  danger:  "bg-danger/10 text-danger border-danger/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  info:    "bg-info/10 text-info border-info/20",
};

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  return `${Math.floor(diffHr / 24)} day(s) ago`;
}

// Stagger container + child variants for stat cards
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const Dashboard = () => {
  const [history, setHistory] = useState<VerificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { authHeader } = useAuth();

  useEffect(() => {
    const headers = authHeader() as Record<string, string>;
    fetch(`${API_BASE}/api/dashboard-stats`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setHistory(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const verified  = history.filter((v) => v.status === "verified").length;
  const forged    = history.filter((v) => v.status === "forged").length;
  const uncertain = history.filter((v) => v.status === "uncertain").length;

  return (
    /* portal-institution scopes emerald CSS vars to this subtree */
    <div className="portal-institution min-h-screen bg-background">
      <PageTransition>
        <div className="container py-8 sm:py-12">
          {/* Header */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="w-2 h-8 rounded-full portal-accent-fill" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">Admin Dashboard</h1>
            </div>
            <p className="ml-5 text-muted-foreground text-sm">
              Monitor verification activity and forgery trends in real time.
            </p>
          </motion.div>

          {/* Stat Cards — staggered entry */}
          <motion.div
            className="grid gap-4 grid-cols-2 lg:grid-cols-4 mb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {[
              { icon: Activity,     label: "Total Verifications",  value: String(history.length), variant: "default" as const },
              { icon: ShieldCheck,  label: "Verified Authentic",   value: String(verified),        variant: "success" as const },
              { icon: ShieldAlert,  label: "Forgeries Detected",   value: String(forged),          variant: "danger" as const },
              { icon: AlertTriangle,label: "Pending Review",       value: String(uncertain),       variant: "warning" as const },
            ].map((card) => (
              <motion.div key={card.label} variants={itemVariants}>
                <StatCard
                  icon={card.icon}
                  label={card.label}
                  value={card.value}
                  variant={card.variant}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Main grid */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Verifications — 2/3 width */}
            <motion.div
              className="lg:col-span-2 rounded-2xl border border-border/50 bg-card p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.35 }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-foreground">Recent Verifications</h2>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full portal-accent-fill animate-pulse" />
                  <Badge variant="outline" className="text-muted-foreground text-xs">Live</Badge>
                </div>
              </div>

              {loading && <SkeletonLoader rows={5} />}
              {error && (
                <p className="text-sm text-danger py-4 text-center">
                  ⚠ Could not load verifications: {error}
                </p>
              )}

              {!loading && !error && (
                <div className="space-y-2">
                  {history.map((v, i) => (
                    <motion.div
                      key={v.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.28 }}
                      whileHover={{ x: 4, transition: { duration: 0.15 } }}
                      className="flex items-center gap-3 rounded-xl border border-border/40 p-3 hover:bg-muted/40 hover:border-border transition-all cursor-default"
                    >
                      <span className="font-mono text-xs text-muted-foreground w-12 shrink-0">#{v.id}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{v.student_name}</p>
                        <p className="text-xs text-muted-foreground truncate">{v.certificate_id}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs shrink-0 ${statusBadge[v.status] ?? "bg-muted/10 text-muted-foreground"}`}
                      >
                        {v.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground shrink-0 hidden sm:inline">
                        {timeAgo(v.verified_at)}
                      </span>
                    </motion.div>
                  ))}
                  {history.length === 0 && (
                    <p className="text-sm text-muted-foreground py-8 text-center">
                      No verification records yet.
                    </p>
                  )}
                </div>
              )}
            </motion.div>

            {/* Sidebar: Alerts + Quick Stats */}
            <motion.div
              className="space-y-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.35 }}
            >
              {/* Alerts */}
              <div className="rounded-2xl border border-border/50 bg-card p-5">
                <h2 className="text-base font-bold text-foreground mb-4">System Alerts</h2>
                <div className="space-y-3">
                  {alerts.map((alert, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.07 }}
                      className={`rounded-xl border p-3 text-xs leading-relaxed ${alertBadge[alert.severity]}`}
                    >
                      {alert.message}
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="rounded-2xl border border-border/50 bg-card p-5">
                <h2 className="text-base font-bold text-foreground mb-4">Quick Stats</h2>
                <div className="space-y-3.5">
                  {[
                    { icon: Building2, label: "Connected Institutions", value: "854" },
                    { icon: Clock,     label: "Avg Verification Time",  value: "2.8s" },
                    { icon: TrendingUp,label: "This Week's Checks",     value: "4,231" },
                    { icon: Ban,       label: "Blacklisted Entities",   value: "47" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <item.icon className="h-3.5 w-3.5 shrink-0" /> {item.label}
                      </div>
                      <span className="text-sm font-bold text-foreground tabular-nums">{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </PageTransition>
    </div>
  );
};

export default Dashboard;
