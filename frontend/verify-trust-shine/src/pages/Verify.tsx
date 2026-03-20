import React, { useState, useCallback, useRef } from "react";
import { Upload, FileImage, Loader2, Search, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VerificationResult from "../components/VerificationResult"; // Case-sensitive check!

type VerificationStatus = "verified" | "forged" | "uncertain";

// ✅ Unified relative path for the Monolith
const API_URL = "/api";

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

const Verify = () => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ResultData | null>(null);
  const [certId, setCertId] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processRealVerification = async (file: File) => {
    setUploading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_URL}/extract`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Server error");
      }

      const backendData = await response.json();
      const isAuthentic = backendData.status.includes("LEGAL");

      setResult({
        status: isAuthentic ? "verified" : "forged",
        extractedData: {
          name: backendData.extractedData.name,
          institution: backendData.extractedData.institution,
          rollNumber: "N/A",
          degree: "Academic Degree",
          year: "Validated",
          certificateId: "Cloud Scan",
        },
        confidence: isAuthentic ? 99 : 20,
        mismatches: isAuthentic ? [] : ["🚨 Database Record Mismatch: Certificate may be forged."],
      });

    } catch (error: any) {
      alert(`Error: ${error.message}`);
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
    <div className="min-h-screen bg-background py-10">
      <div className="container max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold">CertVerify OCR</h1>
          <p className="mt-2 text-muted-foreground">Upload your document for instant database cross-referencing.</p>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="gap-2"><FileImage className="h-4 w-4" /> Image/PDF</TabsTrigger>
            <TabsTrigger value="id" className="gap-2"><Hash className="h-4 w-4" /> Certificate ID</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf, .jpg, .jpeg, .png" onChange={handleFileInput} />
            <div onDragOver={(e) => { e.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)} onDrop={handleDrop}
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 cursor-pointer transition-all ${dragActive ? "border-accent bg-accent/5 scale-[1.02]" : "border-border bg-muted/30 hover:border-accent/40"}`}
              onClick={() => !uploading && fileInputRef.current?.click()} >
              {uploading ? <Loader2 className="h-10 w-10 text-accent animate-spin" /> : <Upload className="h-10 w-10 text-muted-foreground" />}
              <p className="mt-4 text-sm font-medium">{uploading ? "Contacting Database..." : "Click or Drop Certificate to Verify"}</p>
            </div>
          </TabsContent>

          <TabsContent value="id">
            <div className="flex gap-2">
              <Input placeholder="Enter Certificate ID" value={certId} onChange={(e) => setCertId(e.target.value)} />
              <Button disabled={uploading || !certId.trim()} className="bg-accent">Search</Button>
            </div>
          </TabsContent>
        </Tabs>

        {result && <div className="mt-8 animate-in fade-in slide-in-from-bottom-4"><VerificationResult {...result} /></div>}
      </div>
    </div>
  );
};

export default Verify;