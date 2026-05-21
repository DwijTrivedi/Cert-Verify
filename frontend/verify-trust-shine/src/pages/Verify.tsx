import React, { useState, useCallback, useRef } from "react";
import { Upload, FileImage, Loader2, Search, Hash, ShieldCheck, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VerificationResult from "../components/VerificationResult";
import { API_BASE } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import PageTransition from "@/components/PageTransition";

type VerificationStatus = "verified" | "forged" | "uncertain";

interface ResultData {
  status: VerificationStatus;
  extractedData: {
    name: string;
    rollNumber: string;
    institution: string;
    degree: string;
    year: string;
    certificateId: string;
  };
  confidence: number;
  mismatches: string[];
}

const cardVariants = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const Verify = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const [certId, setCertId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { authHeader } = useAuth();
  const { toast } = useToast();

  const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2 MB

  const processRealVerification = async (file: File) => {
    // ── 2 MB hard cap ────────────────────────────────────────────────────────
    if (file.size > MAX_FILE_BYTES) {
      toast({
        title: "File too large",
        description: `Max size is 2 MB. Your file is ${(file.size / 1024 / 1024).toFixed(2)} MB.`,
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Auth header fix: wire JWT so require_any_auth on backend passes
      const headers = authHeader() as Record<string, string>;

      const response = await fetch(`${API_BASE}/extract`, {
        method: "POST",
        headers, // Authorization: Bearer <token>
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.detail || `Server error (${response.status})`;
        toast({ title: "Verification Failed", description: msg, variant: "destructive" });
        return;
      }

      const backendData = await response.json();
      const isAuthentic = backendData.status?.includes("LEGAL");

      setResult({
        status: isAuthentic ? "verified" : "forged",
        extractedData: {
          name: backendData.extractedData?.name ?? "Unknown",
          institution: backendData.extractedData?.institution ?? "Unknown",
          rollNumber: "N/A",
          degree: "Academic Degree",
          year: "Validated",
          certificateId: "Cloud Scan",
        },
        confidence: isAuthentic ? 99 : 20,
        mismatches: isAuthentic
          ? []
          : ["🚨 Database Record Mismatch: Certificate may be forged."],
      });

      toast({
        title: isAuthentic ? "✅ Certificate Verified" : "🚨 Forgery Detected",
        description: isAuthentic
          ? `Record found for ${backendData.extractedData?.name}.`
          : "No matching record in the database.",
        variant: isAuthentic ? "default" : "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Network Error",
        description: "Could not reach the verification server.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processRealVerification(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processRealVerification(e.target.files[0]);
    }
  };

  return (
    /* portal-company scopes cyan CSS vars to this subtree */
    <div className="portal-company min-h-screen bg-background">
      <PageTransition>
        {/* Subtle grid background texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(var(--portal-accent)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--portal-accent)) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative container max-w-3xl py-10 sm:py-14">
          {/* Header */}
          <motion.div
            className="mb-10 text-center"
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl portal-accent-bg portal-accent-border border mb-4">
              <ShieldCheck className="h-7 w-7 portal-accent-text" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Certificate{" "}
              <span className="portal-accent-text">Scanner</span>
            </h1>
            <p className="mt-2 text-muted-foreground text-sm sm:text-base">
              Upload a certificate for instant OCR &amp; database cross-referencing.
            </p>
          </motion.div>

          {/* Tabs */}
          <motion.div variants={cardVariants} initial="hidden" animate="visible">
            <Tabs defaultValue="upload" className="space-y-6">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 border border-border/50">
                <TabsTrigger
                  value="upload"
                  className="gap-2 data-[state=active]:portal-accent-bg data-[state=active]:portal-accent-text"
                >
                  <FileImage className="h-4 w-4" /> Image / PDF
                </TabsTrigger>
                <TabsTrigger value="id" className="gap-2">
                  <Hash className="h-4 w-4" /> Certificate ID
                </TabsTrigger>
              </TabsList>

              {/* Upload tab */}
              <TabsContent value="upload">
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileInput}
                />

                <motion.div
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  whileHover={!uploading ? { scale: 1.015 } : {}}
                  whileTap={!uploading ? { scale: 0.99 } : {}}
                  animate={dragActive ? { scale: 1.02 } : { scale: 1 }}
                  className={[
                    "flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 sm:p-16 cursor-pointer transition-all duration-300 relative overflow-hidden",
                    dragActive
                      ? "portal-accent-border portal-accent-bg dropzone-active"
                      : "border-border/50 bg-card hover:portal-accent-border hover:portal-accent-bg",
                  ].join(" ")}
                >
                  {/* Background glow */}
                  <div
                    className="absolute inset-0 opacity-0 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: "radial-gradient(ellipse at center, var(--portal-accent-bg, transparent) 0%, transparent 70%)",
                      opacity: dragActive ? 1 : 0,
                    }}
                  />

                  <AnimatePresence mode="wait">
                    {uploading ? (
                      <motion.div
                        key="uploading"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex flex-col items-center gap-4"
                      >
                        <div className="relative">
                          <Loader2 className="h-12 w-12 portal-accent-text animate-spin" />
                          <div
                            className="absolute inset-0 rounded-full animate-ping opacity-20"
                            style={{ backgroundColor: `hsl(var(--portal-accent))` }}
                          />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold portal-accent-text">Scanning document…</p>
                          <p className="text-xs text-muted-foreground mt-1">Cross-referencing with database</p>
                        </div>
                        {/* Progress bar */}
                        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: `hsl(var(--portal-accent))` }}
                            animate={{ width: ["0%", "85%", "90%"] }}
                            transition={{ duration: 3, ease: "easeOut" }}
                          />
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="idle"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex flex-col items-center gap-3 text-center"
                      >
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center portal-accent-bg portal-accent-border border"
                        >
                          <Upload className={`h-7 w-7 ${dragActive ? "portal-accent-text" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            {dragActive ? "Release to scan" : "Drop certificate here"}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            or <span className="portal-accent-text font-medium">click to browse</span>
                          </p>
                          <p className="text-xs text-muted-foreground/60 mt-2">PDF · JPG · PNG supported</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </TabsContent>

              {/* Certificate ID tab */}
              <TabsContent value="id">
                <motion.div
                  className="rounded-2xl border border-border/50 bg-card p-6 space-y-4"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Search className="h-4 w-4" />
                    Enter a certificate ID to look up
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. CERT-2024-001234"
                      value={certId}
                      onChange={(e) => setCertId(e.target.value)}
                      className="flex-1 border-border/50 focus:border-[hsl(var(--portal-accent))] focus:ring-[hsl(var(--portal-accent)/0.3)]"
                    />
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                      <Button
                        disabled={uploading || !certId.trim()}
                        className="gap-2 portal-accent-fill text-white hover:opacity-90"
                      >
                        <Search className="h-4 w-4" /> Search
                      </Button>
                    </motion.div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Certificate ID lookup coming soon — use file upload for now.
                  </p>
                </motion.div>
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Result */}
          <AnimatePresence>
            {result && (
              <motion.div
                className="mt-8"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35 }}
              >
                <VerificationResult {...result} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </PageTransition>
    </div>
  );
};

export default Verify;