import { Link } from "react-router-dom";
import { Shield, Upload, Building2, BarChart3, Lock, Zap, Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.png";

const features = [
  {
    icon: Upload,
    title: "Smart Upload & OCR",
    description: "Upload certificates in any format. Our AI extracts name, roll number, marks, and certificate ID automatically.",
  },
  {
    icon: Shield,
    title: "Authenticity Verification",
    description: "Cross-reference extracted data against verified institutional databases to instantly detect forgeries.",
  },
  {
    icon: Lock,
    title: "Blockchain Security",
    description: "Digital watermarks and blockchain verification ensure tamper-proof certificate authentication.",
  },
  {
    icon: Building2,
    title: "Institution Integration",
    description: "Universities can upload records in bulk or real-time via secure APIs for seamless verification.",
  },
  {
    icon: BarChart3,
    title: "Admin Dashboard",
    description: "Monitor verification activity, detect forgery trends, and manage blacklisted entities from one place.",
  },
  {
    icon: Globe,
    title: "Scalable & Affordable",
    description: "Built for state-wide deployment. Works with physical and digital certificates across institutions.",
  },
];

const stats = [
  { value: "2.4M+", label: "Certificates Verified" },
  { value: "850+", label: "Institutions Connected" },
  { value: "99.7%", label: "Detection Accuracy" },
  { value: "<3s", label: "Avg Verification Time" },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden hero-gradient">
        <div className="absolute inset-0 opacity-20">
          <img src={heroBg} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <div className="container relative z-10 flex flex-col items-center py-24 text-center lg:py-36">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent-foreground mb-6">
            <Zap className="h-3.5 w-3.5 text-accent" />
            <span className="text-accent">Certificate Verification</span>
          </div>
          <h1 className="max-w-4xl text-4xl font-extrabold leading-tight text-primary-foreground sm:text-5xl dark:text-white lg:text-6xl">
            Stop Fake Degrees.{" "}
            <span className="text-gradient">Protect Integrity.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-lg font-extrabold leading-relaxed transition-colors duration-300 text-slate-50 dark:text-white">
  A smart, scalable system for verifying academic certificates using OCR, 
  blockchain verification, and centralized institutional databases.
</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/verify">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 px-6">
                Verify a Certificate <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/institutions">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2 px-6">
                For Institutions <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-card">
        <div className="container grid grid-cols-2 gap-6 py-12 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-3xl font-extrabold text-accent">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center mb-14">
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">
              End-to-End Verification
            </h2>
            <p className="mt-3 text-muted-foreground">
              From upload to verdict — every step is automated, secure, and auditable.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5"
              >
                <div className="mb-4 inline-flex rounded-lg bg-accent/10 p-3 text-accent transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-background">
        <div className="container max-w-3xl">
          <div className="rounded-2xl border border-border bg-card p-10 sm:p-14 border-l-4 border-l-accent shadow-sm">
            <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl">
              Ready to protect academic integrity?
            </h2>
            <p className="mt-3 text-muted-foreground max-w-lg">
              Join hundreds of institutions already using CertVerify to eliminate certificate fraud.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/verify">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2">
                  Start Verifying <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/institutions">
                <Button size="lg" variant="outline">
                  Register Institution
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent" />
            <span className="font-bold text-foreground">CertVerify</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2026 CertVerify. Securing academic credentials nationwide.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
