import { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, AlertTriangle, Activity, TrendingUp, Clock, Building2, Ban } from "lucide-react";
import StatCard from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { API_BASE } from "@/lib/api";

// Types matching what the backend returns from Verification_Log
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
  forged: "bg-danger/10 text-danger border-danger/20",
  uncertain: "bg-warning/10 text-warning border-warning/20",
};

const alertBadge: Record<string, string> = {
  danger: "bg-danger/10 text-danger border-danger/20",
  warning: "bg-warning/10 text-warning border-warning/20",
  info: "bg-info/10 text-info border-info/20",
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

const Dashboard = () => {
  const [history, setHistory] = useState<VerificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API_BASE}/dashboard-stats`)
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

  // Derive counts from fetched history (all records, you can extend API to return totals)
  const verified = history.filter((v) => v.status === "verified").length;
  const forged = history.filter((v) => v.status === "forged").length;
  const uncertain = history.filter((v) => v.status === "uncertain").length;

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-foreground">Admin Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Monitor verification activity and forgery trends.</p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard icon={Activity} label="Total Verifications" value={String(history.length)} trend="Live data" />
          <StatCard icon={ShieldCheck} label="Verified Authentic" value={String(verified)} variant="success" />
          <StatCard icon={ShieldAlert} label="Forgeries Detected" value={String(forged)} variant="danger" />
          <StatCard icon={AlertTriangle} label="Pending Review" value={String(uncertain)} variant="warning" />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent verifications */}
          <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-foreground">Recent Verifications</h2>
              <Badge variant="outline" className="text-muted-foreground">Live</Badge>
            </div>

            {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
            {error && <p className="text-sm text-danger">Error: {error}</p>}

            <div className="space-y-2">
              {history.map((v) => (
                <div key={v.id} className="flex items-center gap-3 rounded-lg border border-border/50 p-3 hover:bg-muted/30 transition-colors">
                  <span className="font-mono text-xs text-muted-foreground w-16 shrink-0">#{v.id}</span>
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
                </div>
              ))}
              {!loading && history.length === 0 && (
                <p className="text-sm text-muted-foreground">No verification records yet.</p>
              )}
            </div>
          </div>

          {/* Alerts & Quick Stats */}
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-base font-bold text-foreground mb-4">Alerts</h2>
              <div className="space-y-3">
                {alerts.map((alert, i) => (
                  <div key={i} className={`rounded-lg border p-3 text-sm ${alertBadge[alert.severity]}`}>
                    {alert.message}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-5">
              <h2 className="text-base font-bold text-foreground mb-4">Quick Stats</h2>
              <div className="space-y-3">
                {[
                  { icon: Building2, label: "Connected Institutions", value: "854" },
                  { icon: Clock, label: "Avg Verification Time", value: "2.8s" },
                  { icon: TrendingUp, label: "This Week's Checks", value: "4,231" },
                  { icon: Ban, label: "Blacklisted Entities", value: "47" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <item.icon className="h-4 w-4" /> {item.label}
                    </div>
                    <span className="text-sm font-bold text-foreground">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
