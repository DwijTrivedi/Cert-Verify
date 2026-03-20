import React, { useState, useCallback, useRef } from "react";
import { Upload, FileImage, Loader2, Search, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VerificationResult from "@/components/VerificationResult";

type VerificationStatus = "verified" | "forged" | "uncertain";

// ✅ Pointing to the internal API route
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

      if (!response.ok) throw new Error(`Server error: ${response.status}`);

      const backendData = await response.json();
      const isAuthentic = backendData.status.includes("LEGAL");

      setResult({
        status: isAuthentic ? "verified" : "forged",
        extractedData: {
          name: backendData.extractedData.name,
          institution: backendData.extractedData.institution,
          rollNumber: "N/A",
          degree: "Degree Certificate",
          year: "Check DB",
          certificateId: "System Scan",
        },
        confidence: isAuthentic ? 99 : 15,
        mismatches: isAuthentic ? [] : ["🚨 OCR Mismatch: Record not found in institutional database."],
      });

    } catch (error) {
      alert("Verification Failed: Backend unreachable. Please check Render logs.");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  // ... (Keep handleDrop, handleFileInput, and simulateIdSearch as they were)

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-foreground">Verify Certificate</h1>
          <p className="mt-2 text-muted-foreground">Upload an image or enter an ID.</p>
        </div>
        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="gap-2"><FileImage className="h-4 w-4" /> Upload</TabsTrigger>
            <TabsTrigger value="id" className="gap-2"><Hash className="h-4 w-4" /> Certificate ID</TabsTrigger>
          </TabsList>
          <TabsContent value="upload">
            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf, .jpg, .jpeg, .png" onChange={handleFileInput} />
            <div onDragOver={(e) => { e.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)} onDrop={handleDrop}
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 cursor-pointer ${dragActive ? "border-accent bg-accent/5" : "border-border bg-muted/30"}`}
              onClick={() => !uploading && fileInputRef.current?.click()} >
              {uploading ? <Loader2 className="h-10 w-10 text-accent animate-spin" /> : <Upload className="h-10 w-10 text-muted-foreground" />}
              <p className="mt-4 text-sm font-medium">{uploading ? "Analyzing document..." : "Click or drop file to verify"}</p>
            </div>
          </TabsContent>
          <TabsContent value="id">
            <div className="flex gap-2">
              <Input placeholder="Enter ID" value={certId} onChange={(e) => setCertId(e.target.value)} />
              <Button onClick={simulateIdSearch} disabled={uploading || !certId.trim()} className="bg-accent">Verify</Button>
            </div>
          </TabsContent>
        </Tabs>
        {result && <div className="mt-8"><VerificationResult {...result} /></div>}
      </div>
    </div>
  );
};

export default Verify;