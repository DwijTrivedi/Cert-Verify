import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../lib/api';
import { KeyRound, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const MFAVerifyPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const email: string = (location.state as any)?.email ?? '';
  const role: string = (location.state as any)?.role ?? '';
  const destination = role === 'institution' ? '/institutions' : '/verify';

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { navigate('/signin'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/verify-mfa`, { email, code });
      if (res.data.success) {
        login(res.data.role as 'institution' | 'company');
        navigate(destination);
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Invalid or expired code. Please try again.');
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm animate-slide-up">
        {/* Back link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <KeyRound className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Two-Factor Verification</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Open <strong>Google Authenticator</strong> and enter the 6-digit code for <br />
            <span className="font-semibold text-foreground">{email}</span>
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text" inputMode="numeric" maxLength={6} autoFocus
              className="w-full px-4 py-4 rounded-xl border border-border bg-background text-center text-3xl font-mono tracking-[0.5em] text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="000000"
              value={code}
              onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              required
            />
            <button
              type="submit" disabled={loading || code.length !== 6}
              className="w-full py-3 bg-accent text-accent-foreground font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {loading ? 'Verifying…' : 'Verify & Sign In'}
            </button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-4">
            Code refreshes every 30 seconds. Make sure your device time is correct.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MFAVerifyPage;
