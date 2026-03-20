import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../lib/api';
import { Briefcase, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const CompanySignIn = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/login`, { email, password });
      if (response.data.success) {
        const role = response.data.role;
        if (role !== 'company') {
          setError('This account is not a company account. Please use the Institution Portal.');
          setLoading(false);
          return;
        }
        login('company');
        navigate('/verify');
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Left branding */}
      <div className="hidden md:flex flex-1 flex-col justify-center p-12 lg:p-24 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6 opacity-80">
            <Briefcase className="h-6 w-6" />
            <span className="text-sm font-medium uppercase tracking-widest">Company Portal</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold mb-4 tracking-tight">Verify Candidate<br />Credentials Instantly</h1>
          <p className="text-lg text-blue-100 max-w-md leading-relaxed">
            Upload any certificate or degree document and get an AI-powered authenticity verdict in seconds.
          </p>
          <ul className="mt-8 space-y-3 text-blue-200 text-sm">
            <li className="flex items-center gap-2">✓ AI-powered verification</li>
            <li className="flex items-center gap-2">✓ Instant results</li>
            <li className="flex items-center gap-2">✓ Secure & confidential</li>
          </ul>
        </div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-card">
        <div className="w-full max-w-md">
          <Link to="/signin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Portal Selection
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Company Sign In</h2>
          </div>
          <p className="text-muted-foreground mb-8">Sign in to start verifying candidate documents.</p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2" htmlFor="email">
                Company Email
              </label>
              <input
                type="email" id="email"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground"
                placeholder="hr@yourcompany.com"
                value={email} onChange={e => setEmail(e.target.value)} required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2" htmlFor="password">
                Password
              </label>
              <input
                type="password" id="password"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground"
                placeholder="••••••••"
                value={password} onChange={e => setPassword(e.target.value)} required
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full py-3 px-4 bg-primary hover:opacity-90 disabled:opacity-50 text-primary-foreground font-semibold rounded-lg shadow-md transition-all"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Don't have an account?{' '}
              <Link to="/signup/company" className="font-bold text-primary hover:underline">Register here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanySignIn;
