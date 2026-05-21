import { useState, useRef } from "react";
import {
  Building2, Upload, CheckCircle2, FileSpreadsheet,
  Shield, ArrowRight, Loader2, AlertCircle, X, Database
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import PageTransition from "@/components/PageTransition";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

const connectedInstitutions = [
  { name: "Gujarat University",   records: "45,200",  status: "synced",  lastSync: "2 hours ago" },
  { name: "Anna University",      records: "128,500", status: "synced",  lastSync: "30 min ago" },
  { name: "IIM Ahmedabad",        records: "32,100",  status: "syncing", lastSync: "In progress" },
  { name: "Osmania University",   records: "67,800",  status: "synced",  lastSync: "1 hour ago" },
  { name: "NIT Trichy",           records: "38,400",  status: "synced",  lastSync: "4 hours ago" },
  { name: "Goa University",       records: "215,000", status: "pending", lastSync: "Awaiting approval" },
];

const statusStyles = {
  synced:  "bg-success/10 text-success border-success/20",
  syncing: "bg-info/10 text-info border-info/20",
  pending: "bg-warning/10 text-warning border-warning/20",
};

const listItemVariants = {
  hidden:  { opacity: 0, x: -12 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: i * 0.05, duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] },
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
  const [search, setSearch] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
    if (!isExcel) {
      toast({ title: "Invalid file type", description: "Please select a valid Excel file (.xlsx or .xls).", variant: "destructive" });
      return;
    }
    setSelectedFile(file);
    setUploadResult(null);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    const isExcel = file.name.endsWith(".xlsx") || file.name.endsWith(".xls");
    if (!isExcel) {
      toast({ title: "Invalid file type", description: "Only .xlsx or .xls files are accepted.", variant: "destructive" });
      return;
    }
    setSelectedFile(file);
    setUploadResult(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      fileInputRef.current?.click();
      return;
    }
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

  const filteredInstitutions = connectedInstitutions.filter(
    (i) => i.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    /* portal-institution scopes emerald CSS vars to this subtree */
    <div className="portal-institution min-h-screen bg-background">
      <PageTransition>
        <div className="container max-w-5xl py-8 sm:py-12">
          {/* Header */}
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
              Upload certificate records for cross-referencing and verification.
            </p>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-5">
            {/* ── Left column: Upload + API Access ── */}
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
                    <p className="text-xs text-muted-foreground">Excel spreadsheet → database</p>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  Upload an Excel file (.xlsx / .xls) with columns:<br />
                  <code className="font-mono text-[11px] portal-accent-text">name · roll · uni · deg · year</code>
                </p>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  id="excel-file-input"
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {/* Drop zone */}
                <motion.div
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleFileDrop}
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  whileHover={!uploading ? { scale: 1.015 } : {}}
                  animate={dragActive ? { scale: 1.02 } : { scale: 1 }}
                  className={[
                    "flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all duration-300 mb-4",
                    dragActive
                      ? "portal-accent-border portal-accent-bg dropzone-active"
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
                        <p className="text-xs text-muted-foreground">.xlsx / .xls · up to 50,000 rows</p>
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
                          ? "bg-success/10 text-success border border-success/20"
                          : "bg-destructive/10 text-destructive border border-destructive/20"
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
                  Integrate real-time certificate issuance with our REST API for automated record sync.
                </p>
                <div className="rounded-xl bg-muted/60 border border-border/40 p-3">
                  <code className="font-mono text-xs text-foreground break-all">
                    POST /api/upload-excel
                  </code>
                </div>
              </motion.div>
            </div>

            {/* ── Right column: Connected Institutions ── */}
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 }}
            >
              <div className="rounded-2xl border border-border/50 bg-card p-5 h-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 portal-accent-text" />
                    <h2 className="text-base font-bold text-foreground">Connected Institutions</h2>
                    <Badge variant="outline" className="text-xs text-muted-foreground ml-1">
                      {connectedInstitutions.length}
                    </Badge>
                  </div>
                  <Input
                    placeholder="Search institutions…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-8 text-xs w-full sm:max-w-[200px] border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  {filteredInstitutions.map((inst, i) => (
                    <motion.div
                      key={inst.name}
                      custom={i}
                      variants={listItemVariants}
                      initial="hidden"
                      animate="visible"
                      whileHover={{ x: 4, transition: { duration: 0.12 } }}
                      className="flex items-center gap-3 rounded-xl border border-border/40 p-3.5 hover:bg-muted/40 hover:border-border transition-all cursor-default"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl portal-accent-bg portal-accent-border border shrink-0">
                        <Building2 className="h-4 w-4 portal-accent-text" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground truncate">{inst.name}</p>
                        <p className="text-xs text-muted-foreground">{inst.records} records · {inst.lastSync}</p>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs shrink-0 flex items-center gap-1 ${statusStyles[inst.status as keyof typeof statusStyles]}`}
                      >
                        {inst.status === "syncing" && <Loader2 className="h-3 w-3 animate-spin" />}
                        {inst.status === "synced"  && <CheckCircle2 className="h-3 w-3" />}
                        {inst.status}
                      </Badge>
                    </motion.div>
                  ))}
                  {filteredInstitutions.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-8">No institutions match your search.</p>
                  )}
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
