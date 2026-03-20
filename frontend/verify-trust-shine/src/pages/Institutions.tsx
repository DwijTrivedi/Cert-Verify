import { useState } from "react";
import { Building2, Upload, CheckCircle2, FileSpreadsheet, Shield, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const connectedInstitutions = [
  { name: "Gujarat University", records: "45,200", status: "synced", lastSync: "2 hours ago" },
  { name: "Anna University", records: "128,500", status: "synced", lastSync: "30 min ago" },
  { name: "IIM Ahmedabad", records: "32,100", status: "syncing", lastSync: "In progress" },
  { name: "Osmania University", records: "67,800", status: "synced", lastSync: "1 hour ago" },
  { name: "NIT Trichy", records: "38,400", status: "synced", lastSync: "4 hours ago" },
  { name: "Goa University", records: "215,000", status: "pending", lastSync: "Awaiting approval" },
];

const statusStyles = {
  synced: "bg-success/10 text-success border-success/20",
  syncing: "bg-info/10 text-info border-info/20",
  pending: "bg-warning/10 text-warning border-warning/20",
};

const Institutions = () => {
  const [uploading, setUploading] = useState(false);

  const simulateUpload = () => {
    setUploading(true);
    setTimeout(() => setUploading(false), 3000);
  };

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container max-w-5xl">
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-foreground">Institution Portal</h1>
          <p className="mt-1 text-muted-foreground">
            Register your institution and upload certificate records for verification.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Upload section */}
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="rounded-lg bg-accent/10 p-2.5">
                  <Upload className="h-5 w-5 text-accent" />
                </div>
                <h2 className="text-base font-bold text-foreground">Bulk Upload</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Upload a CSV or Excel file containing certificate records. Each row should include student name, roll number, degree, year, and certificate ID.
              </p>
              <div
                onClick={simulateUpload}
                className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 cursor-pointer hover:border-accent/40 transition-colors mb-4"
              >
                {uploading ? (
                  <Loader2 className="h-8 w-8 text-accent animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                )}
                <p className="mt-3 text-sm font-medium text-foreground">
                  {uploading ? "Processing records..." : "Drop CSV/Excel file here"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Max 50,000 records per file</p>
              </div>
              {!uploading && (
                <Button onClick={simulateUpload} className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
                  Upload Records <ArrowRight className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-lg bg-primary/10 p-2.5">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-base font-bold text-foreground">API Access</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Integrate real-time certificate issuance with our REST API for automated record sync.
              </p>
              <div className="rounded-lg bg-muted p-3">
                <code className="font-mono text-xs text-foreground break-all">
                  POST /api/v1/certificates/batch
                </code>
              </div>
            </div>
          </div>

          {/* Connected institutions */}
          <div className="lg:col-span-3">
            <div className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-foreground">Connected Institutions</h2>
                <Input placeholder="Search..." className="max-w-[180px] h-8 text-sm" />
              </div>
              <div className="space-y-2">
                {connectedInstitutions.map((inst) => (
                  <div key={inst.name} className="flex items-center gap-3 rounded-lg border border-border/50 p-3.5 hover:bg-muted/30 transition-colors">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                      <Building2 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{inst.name}</p>
                      <p className="text-xs text-muted-foreground">{inst.records} records · {inst.lastSync}</p>
                    </div>
                    <Badge variant="outline" className={`text-xs shrink-0 ${statusStyles[inst.status as keyof typeof statusStyles]}`}>
                      {inst.status === "syncing" && <Loader2 className="h-3 w-3 animate-spin mr-1" />}
                      {inst.status === "synced" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                      {inst.status}
                    </Badge>
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

export default Institutions;
