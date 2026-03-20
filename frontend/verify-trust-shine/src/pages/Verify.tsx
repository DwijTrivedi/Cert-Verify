import React, { useState, useCallback, useRef } from "react";
import { Upload, FileImage, Loader2, Search, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VerificationResult from "@/components/VerificationResult";

type VerificationStatus = "verified" | "forged" | "uncertain";

// ✅ We define this INTERNALLY so it never fails
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

      // ✅ Uses the local API_URL variable defined at line 14
      const response = await fetch(`${API_URL}/extract`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Server communication failed.");

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
        mismatches: isAuthentic ? [] : ["🚨 Database record missing or name mismatch detected!"],
      });

    } catch (error) {
      alert("System Error: The backend is unreachable.");
      console.error(error);
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

  const simulateIdSearch = () => {
    setUploading(true);
    setResult(null);
    setTimeout(() => {
      setResult({
        status: "verified",
        extractedData: {
          name: "Database User",
          rollNumber: "DB-1045",
          institution: "Database University",
          degree: "B.Tech Computer Science",
          year: "2024",
          certificateId: certId,
        },
        confidence: 99,
        mismatches: [],
      });
      setUploading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background py-10">
      <div className="container max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-foreground">Verify Certificate</h1>
          <p className="mt-2 text-muted-foreground">Upload a certificate image or enter its ID.</p>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="gap-2"><FileImage className="h-4 w-4" /> Upload Image</TabsTrigger>
            <TabsTrigger value="id" className="gap-2"><Hash className="h-4 w-4" /> Certificate ID</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <input type="file" ref={fileInputRef} className="hidden" accept=".pdf, .jpg, .jpeg, .png" onChange={handleFileInput} />
            <div onDragOver={(e) => { e.preventDefault(); setDragActive(true); }} onDragLeave={() => setDragActive(false)} onDrop={handleDrop}
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-12 transition-colors cursor-pointer ${dragActive ? "border-accent bg-accent/5" : "border-border bg-muted/30 hover:border-accent/40"}`}
              onClick={() => !uploading && fileInputRef.current?.click()} >
              {uploading ? <Loader2 className="h-10 w-10 text-accent animate-spin" /> : <Upload className="h-10 w-10 text-muted-foreground" />}
              <p className="mt-4 text-sm font-medium">{uploading ? "Analyzing document..." : "Drop certificate image here or click to upload"}</p>
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