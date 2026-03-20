import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Briefcase, Shield } from 'lucide-react';

const SignInPortal = () => {
  return (
    <div className="flex min-h-screen bg-background items-center justify-center p-6">
      <div className="w-full max-w-3xl animate-slide-up">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
              <Shield className="h-7 w-7 text-accent" />
            </div>
          </div>
          <h1 className="text-4xl font-extrabold text-foreground mb-2">
            Cert<span className="text-accent">Verify</span> Portal
          </h1>
          <p className="text-muted-foreground text-lg">
            Select your account type to continue
          </p>
        </div>

        {/* Two Portal Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Institution Card */}
          <div className="rounded-2xl border border-border bg-card hover:border-accent/40 hover:shadow-lg hover:shadow-accent/5 transition-all duration-300 p-8 flex flex-col items-center text-center group cursor-pointer">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors">
              <Building2 className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Institution Portal</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              For universities and educational bodies. Upload student records, manage the certificate database, and monitor verification activity.
            </p>
            <div className="w-full space-y-3 mt-auto">
              <Link
                to="/signin/institution"
                className="block w-full py-3 px-4 bg-accent text-accent-foreground font-semibold rounded-xl text-center hover:opacity-90 transition-opacity"
              >
                Sign In as Institution
              </Link>
              <Link
                to="/signup/institution"
                className="block w-full py-3 px-4 border border-border text-foreground font-semibold rounded-xl text-center hover:bg-muted transition-colors"
              >
                Register Institution
              </Link>
            </div>
          </div>

          {/* Company Card */}
          <div className="rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 p-8 flex flex-col items-center text-center group cursor-pointer">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Company Portal</h2>
            <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
              For employers and hiring companies. Verify candidate certificates and credentials instantly — no database access required.
            </p>
            <div className="w-full space-y-3 mt-auto">
              <Link
                to="/signin/company"
                className="block w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-xl text-center hover:opacity-90 transition-opacity"
              >
                Sign In as Company
              </Link>
              <Link
                to="/signup/company"
                className="block w-full py-3 px-4 border border-border text-foreground font-semibold rounded-xl text-center hover:bg-muted transition-colors"
              >
                Register Company
              </Link>
            </div>
          </div>
        </div>

        {/* Guest link */}
        <p className="text-center mt-8 text-sm text-muted-foreground">
          Just need a quick check?{' '}
          <Link to="/verify" className="font-semibold text-accent hover:underline">
            Use Guest Verification →
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignInPortal;
