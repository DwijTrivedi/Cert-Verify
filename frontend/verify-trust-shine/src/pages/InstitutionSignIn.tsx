import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Building2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const InstitutionSignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Show success banner if user just activated MFA
  const mfaActivated = (location.state as any)?.mfaActivated;
  useEffect(() => {
    if (mfaActivated) setError('');
  }, [mfaActivated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/login', { email, password });
      const { success, role, mfa_required } = response.data;

      if (success) {
        if (role !== 'institution') {
          setError('This account is not an institution account. Please use the Company Portal.');
          return;
        }
        // MFA enabled → go to OTP step
        if (mfa_required) {
          navigate('/verify-mfa', { state: { email, role } });
          return;
        }
        // No MFA → log in directly
        login('institution');
        navigate('/institutions');
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left branding panel */}
      <div className="hidden md:flex flex-1 flex-col justify-center p-12 lg:p-24 bg-gradient-to-br from-slate-900 via-teal-900 to-cyan-900 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6 opacity-80">
            <Building2 className="h-6 w-6" />
            <span className="text-sm font-medium uppercase tracking-widest">Institution Portal</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 tracking-tight">Welcome back,<br />Institution Admin</h1>
          <p className="text-lg text-teal-100 max-w-md leading-relaxed">
            Manage your student records, upload certificate data, and monitor real-time verification activity.
          </p>
          <ul className="mt-8 space-y-3 text-teal-200 text-sm">
            <li className="flex items-center gap-2">✓ Full database access</li>
            <li className="flex items-center gap-2">✓ Upload & manage records</li>
            <li className="flex items-center gap-2">✓ Admin dashboard</li>
            <li className="flex items-center gap-2">🔐 MFA protected</li>
          </ul>
        </div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-card">
        <div className="w-full max-w-md">
          <Link to="/signin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Portal Selection
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Institution Sign In</h2>
          </div>
          <p className="text-muted-foreground mb-8">Sign in to manage your institution's certificate records.</p>

          {/* MFA activated success banner */}
          {mfaActivated && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              MFA activated! Sign in with your email, password and authenticator code.
            </div>
          )}

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2" htmlFor="email">Institutional Email</label>
              <input type="email" id="email"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:bg-card focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground"
                placeholder="admin@university.edu" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2" htmlFor="password">Password</label>
              <input type="password" id="password"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:bg-card focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground"
                placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 px-4 bg-accent hover:opacity-90 disabled:opacity-50 text-accent-foreground font-semibold rounded-lg shadow-md transition-all">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Don't have an account?{' '}
              <Link to="/signup/institution" className="font-bold text-accent hover:underline">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionSignIn;
