import { CheckCircle2, XCircle, AlertTriangle, FileText, User, Hash, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ExtractedData {
  name: string;
  rollNumber: string;
  institution: string;
  degree: string;
  year: string;
  certificateId: string;
}

interface VerificationResultProps {
  status: "verified" | "forged" | "uncertain";
  extractedData: ExtractedData;
  confidence: number;
  mismatches: string[];
}

const statusConfig = {
  verified: {
    icon: CheckCircle2,
    label: "Verified Authentic",
    bg: "bg-success/10 border-success/30",
    text: "text-success",
    badge: "bg-success text-success-foreground",
  },
  forged: {
    icon: XCircle,
    label: "Forgery Detected",
    bg: "bg-danger/10 border-danger/30",
    text: "text-danger",
    badge: "bg-danger text-danger-foreground",
  },
  uncertain: {
    icon: AlertTriangle,
    label: "Needs Review",
    bg: "bg-warning/10 border-warning/30",
    text: "text-warning",
    badge: "bg-warning text-warning-foreground",
  },
};

const VerificationResult = ({ status, extractedData, confidence, mismatches }: VerificationResultProps) => {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border-2 p-6 animate-slide-up ${config.bg}`}>
      <div className="flex items-center gap-3 mb-5">
        <Icon className={`h-8 w-8 ${config.text}`} />
        <div>
          <h3 className={`text-lg font-bold ${config.text}`}>{config.label}</h3>
          <p className="text-sm text-muted-foreground">Confidence: {confidence}%</p>
        </div>
        <Badge className={`ml-auto ${config.badge} border-0`}>{status.toUpperCase()}</Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {[
          { icon: User, label: "Name", value: extractedData.name },
          { icon: Hash, label: "Roll Number", value: extractedData.rollNumber },
          { icon: GraduationCap, label: "Institution", value: extractedData.institution },
          { icon: FileText, label: "Degree", value: extractedData.degree },
          { icon: Hash, label: "Certificate ID", value: extractedData.certificateId },
          { icon: FileText, label: "Year", value: extractedData.year },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2.5 rounded-lg bg-card/60 p-3 border border-border/50">
            <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">{item.label}</p>
              <p className="text-sm font-medium text-foreground truncate">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {mismatches.length > 0 && (
        <div className="mt-4 rounded-lg bg-danger/5 border border-danger/20 p-4">
          <p className="text-sm font-semibold text-danger mb-2">Mismatches Found:</p>
          <ul className="space-y-1">
            {mismatches.map((m, i) => (
              <li key={i} className="flex items-center gap-2 text-sm text-danger/80">
                <XCircle className="h-3.5 w-3.5 shrink-0" /> {m}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default VerificationResult;
