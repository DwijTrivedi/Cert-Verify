import { useState, useRef } from "react";
import {
  Upload, CheckCircle2, FileSpreadsheet,
  Shield, ArrowRight, Loader2, AlertCircle, X,
  History, Clock, FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import PageTransition from "@/components/PageTransition";

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "";

// ── Mock upload history (RLS means we only show THIS institution's own logs) ──
const uploadLogs = [
  { file: "BTech_2024_Batch.xlsx",       records: 450,  status: "synced",  uploadedAt: "Today, 11:42 AM",    size: "38 KB" },
  { file: "Pharmacy_2025.xlsx",           records: 200,  status: "pending", uploadedAt: "Today, 09:15 AM",    size: "19 KB" },
  { file: "MBA_Evening_2023.xlsx",        records: 312,  status: "synced",  uploadedAt: "Yesterday, 4:30 PM", size: "27 KB" },
  { file: "MCA_Lateral_2024.xlsx",        records: 88,   status: "synced",  uploadedAt: "Yesterday, 1:00 PM", size: "9 KB"  },
  { file: "BCA_Supplementary_2024.xlsx",  records: 55,   status: "failed",  uploadedAt: "22 May, 10:10 AM",  size: "6 KB"  },
  { file: "MSc_Chemistry_2023.xlsx",      records: 140,  status: "synced",  uploadedAt: "21 May, 2:45 PM",   size: "13 KB" },
];

// ── Glow badge styles ──────────────────────────────────────────────────────────
const badgeStyles: Record<string, string> = {
  synced:  "border-emerald-500/40 bg-emerald-500/10 text-emerald-400 shadow-[0_0_10px_hsl(152_82%_50%/0.45)]",
  pending: "border-amber-500/40  bg-amber-500/10  text-amber-400  shadow-[0_0_10px_hsl(38_92%_50%/0.40)]",
  failed:  "border-red-500/40    bg-red-500/10    text-red-400    shadow-[0_0_10px_hsl(0_72%_51%/0.35)]",
};

const badgeIcons: Record<string, React.ReactNode> = {
  synced:  <CheckCircle2 className="h-3 w-3" />,
  pending: <Clock className="h-3 w-3 animate-pulse" />,
  failed:  <AlertCircle className="h-3 w-3" />,
};

const listItemVariants = {
  hidden:  { opacity: 0, x: 14 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.06, duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const Institutions = () => {
  const { authHeader } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadResult, setUploadResult] = useState<{ success: boolean; message: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB

  const validateAndSetFile = (file: File) => {
    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
    if (!isExcel) {
      toast({ title: "Invalid file type", description: "Only .xlsx or .xls files are accepted.", variant: "destructive" });
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      toast({
        title: "File too large",
        description: `Max size is 10 MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)} MB.`,
        variant: "destructive",
      });
      return;
    }
    setSelectedFile(file);
    setUploadResult(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) validateAndSetFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) { fileInputRef.current?.click(); return; }
    setUploading(true);
    setUploadResult(null);
    const formData = new FormData();
    formData.append("file", selectedFile);
    try {
      const headers = authHeader() as Record<string, string>;
      const response = await fetch(`${API_BASE}/upload-excel`, { method: "POST", headers, body: formData });
      const data = await response.json();
      if (response.ok) {
        setUploadResult({ success: true, message: data.message ?? "Upload successful!" });
        toast({ title: "✅ Upload Successful", description: data.message ?? "Records synced to database." });
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
      } else {
        const errMsg = data.detail ?? "Upload failed. Please try again.";
        setUploadResult({ success: false, message: errMsg });
        toast({ title: "Upload Failed", description: errMsg, variant: "destructive" });
      }
    } catch {
      const errMsg = "Network error — could not reach the server.";
      setUploadResult({ success: false, message: errMsg });
      toast({ title: "Network Error", description: errMsg, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setUploadResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="portal-institution min-h-screen bg-background">
      <PageTransition>
        <div className="container max-w-5xl py-8 sm:py-12">

          {/* ── Header ── */}
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="flex items-center gap-3 mb-1">
              <div className="w-2 h-8 rounded-full portal-accent-fill" />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">Institution Portal</h1>
            </div>
            <p className="ml-5 text-muted-foreground text-sm">
              Upload student records to sync with the certificate verification database.
            </p>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-5">

            {/* ── Left: Upload + API ── */}
            <div className="lg:col-span-2 space-y-5">

              {/* Bulk Upload Card */}
              <motion.div
                className="rounded-2xl border border-border/50 bg-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.1 }}
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="rounded-xl portal-accent-bg portal-accent-border border p-2.5">
                    <Upload className="h-5 w-5 portal-accent-text" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground">Bulk Upload</h2>
                    <p className="text-xs text-muted-foreground">Max 1 MB · .xlsx / .xls</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  Required columns:<br />
                  <code className="font-mono text-[11px] portal-accent-text">name · roll · uni · deg · year</code>
                </p>

                <input
                  ref={fileInputRef}
                  id="excel-file-input"
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {/* Drop zone with border-glow on hover/drag */}
                <motion.div
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleFileDrop}
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  animate={dragActive
                    ? { scale: 1.03, boxShadow: "0 0 0 2px hsl(var(--portal-accent)), 0 0 30px hsl(var(--portal-accent)/0.3)" }
                    : { scale: 1,    boxShadow: "0 0 0 0px transparent" }
                  }
                  whileHover={!uploading ? {
                    scale: 1.02,
                    boxShadow: "0 0 0 1.5px hsl(var(--portal-accent)/0.5), 0 0 20px hsl(var(--portal-accent)/0.18)"
                  } : {}}
                  transition={{ type: "spring", stiffness: 280, damping: 22 }}
                  className={[
                    "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 cursor-pointer mb-4 transition-colors duration-200",
                    dragActive
                      ? "portal-accent-border portal-accent-bg"
                      : selectedFile
                      ? "portal-accent-border portal-accent-bg"
                      : "border-border/50 hover:portal-accent-border hover:portal-accent-bg",
                  ].join(" ")}
                >
                  <AnimatePresence mode="wait">
                    {uploading ? (
                      <motion.div key="uploading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 portal-accent-text animate-spin" />
                        <p className="text-xs font-medium portal-accent-text">Uploading to database…</p>
                      </motion.div>
                    ) : selectedFile ? (
                      <motion.div key="file" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-2 text-center">
                        <FileSpreadsheet className="h-8 w-8 portal-accent-text" />
                        <p className="text-xs font-semibold text-foreground max-w-[160px] truncate">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                      </motion.div>
                    ) : (
                      <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-2 text-center">
                        <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
                        <p className="text-xs font-medium text-foreground">Click or drag to select</p>
                        <p className="text-xs text-muted-foreground">.xlsx / .xls · max 10 MB</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Result banner */}
                <AnimatePresence>
                  {uploadResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`flex items-start gap-2 rounded-xl p-3 mb-3 text-xs overflow-hidden ${
                        uploadResult.success
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-red-500/10 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {uploadResult.success
                        ? <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                        : <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      }
                      <span className="flex-1">{uploadResult.message}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      id="upload-excel-btn"
                      onClick={handleUpload}
                      disabled={uploading}
                      className="w-full gap-2 portal-accent-fill text-white hover:opacity-90"
                    >
                      {uploading ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
                      ) : selectedFile ? (
                        <>Upload Records <ArrowRight className="h-4 w-4" /></>
                      ) : (
                        <>Select File <ArrowRight className="h-4 w-4" /></>
                      )}
                    </Button>
                  </motion.div>
                  {selectedFile && !uploading && (
                    <Button id="clear-file-btn" variant="outline" size="icon" onClick={clearFile} title="Clear selection">
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </motion.div>

              {/* API Access Card */}
              <motion.div
                className="rounded-2xl border border-border/50 bg-card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="rounded-xl portal-accent-bg portal-accent-border border p-2.5">
                    <Shield className="h-5 w-5 portal-accent-text" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground">API Access</h2>
                    <p className="text-xs text-muted-foreground">Automated sync endpoint</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                  Integrate real-time certificate issuance via REST API for automated record sync.
                </p>
                <div className="rounded-xl bg-muted/60 border border-border/40 p-3">
                  <code className="font-mono text-xs text-foreground break-all">
                    POST /api/upload-excel
                  </code>
                </div>
              </motion.div>
            </div>

            {/* ── Right: Upload / Sync History ── */}
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
            >
              <div className="rounded-2xl border border-border/50 bg-card p-5 h-full">

                {/* Panel header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <History className="h-4 w-4 portal-accent-text" />
                    <h2 className="text-base font-bold text-foreground">Recent Sync History</h2>
                    <Badge variant="outline" className="text-xs text-muted-foreground ml-1">
                      {uploadLogs.length}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">Your uploads only</span>
                </div>

                {/* Column headers */}
                <div className="grid grid-cols-[1fr_auto_auto] gap-x-3 px-3 mb-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">File</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right">Records</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right w-20">Status</span>
                </div>

                {/* Log rows */}
                <div className="space-y-2">
                  {uploadLogs.map((log, i) => (
                    <motion.div
                      key={log.file}
                      custom={i}
                      variants={listItemVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ x: 3, transition: { duration: 0.12 } }}
                      className="grid grid-cols-[1fr_auto_auto] gap-x-3 items-center rounded-xl border border-border/40 bg-muted/20 px-3 py-3 hover:bg-muted/40 hover:border-border transition-all cursor-default"
                    >
                      {/* File info */}
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="shrink-0 w-7 h-7 rounded-lg portal-accent-bg portal-accent-border border flex items-center justify-center">
                          <FileText className="h-3.5 w-3.5 portal-accent-text" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{log.file}</p>
                          <p className="text-xs text-muted-foreground">{log.uploadedAt} · {log.size}</p>
                        </div>
                      </div>

                      {/* Record count */}
                      <span className="text-sm font-bold text-foreground tabular-nums text-right">
                        {log.records.toLocaleString()}
                      </span>

                      {/* Glowing status badge */}
                      <div className="flex justify-end w-20">
                        <Badge
                          variant="outline"
                          className={`text-xs flex items-center gap-1 px-2 py-0.5 font-semibold ${badgeStyles[log.status]}`}
                        >
                          {badgeIcons[log.status]}
                          {log.status}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Footer summary */}
                <div className="mt-5 pt-4 border-t border-border/30 flex items-center justify-between text-xs text-muted-foreground">
                  <span>
                    {uploadLogs.filter(l => l.status === "synced").length} synced ·{" "}
                    {uploadLogs.filter(l => l.status === "pending").length} pending ·{" "}
                    {uploadLogs.filter(l => l.status === "failed").length} failed
                  </span>
                  <span className="font-medium text-foreground">
                    {uploadLogs.reduce((s, l) => s + l.records, 0).toLocaleString()} total records
                  </span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </PageTransition>
    </div>
  );
};

export default Institutions;
