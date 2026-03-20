import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import axios from 'axios';
import { API_BASE } from '../lib/api';
import { ShieldCheck, Copy, Check, Smartphone } from 'lucide-react';

const MFASetupPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email: string = (location.state as any)?.email ?? '';
  const role: string = (location.state as any)?.role ?? 'institution';

  const [totpUri, setTotpUri] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!email) { navigate('/signin'); return; }
    axios.get(`${API_BASE}/setup-mfa/${encodeURIComponent(email)}`)
      .then(res => {
        setTotpUri(res.data.totp_uri);
        setSecret(res.data.secret);
        setLoading(false);
      })
      .catch(() => {
        setError('Could not load MFA setup. Please try again.');
        setLoading(false);
      });
  }, [email, navigate]);

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setVerifying(true);
    try {
      const res = await axios.post(`${API_BASE}/confirm-mfa`, { email, code });
      if (res.data.success) {
        // MFA activated — go to signin
        navigate(`/signin/${role}`, { state: { mfaActivated: true } });
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Invalid code. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Set Up Two-Factor Auth</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Scan the QR code with <strong>Google Authenticator</strong> or <strong>Authy</strong>
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
          {/* Step 1: QR Code */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">1</span>
              <span className="text-sm font-semibold text-foreground">Scan this QR code</span>
            </div>
            <div className="flex justify-center p-4 bg-white rounded-xl">
              {loading ? (
                <div className="w-[200px] h-[200px] bg-muted animate-pulse rounded" />
              ) : (
                <QRCode value={totpUri} size={200} />
              )}
            </div>
          </div>

          {/* Step 2: Manual secret */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">2</span>
              <span className="text-sm font-semibold text-foreground">Or enter this key manually</span>
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2">
              <code className="flex-1 text-xs font-mono text-foreground break-all">{secret || '...'}</code>
              <button onClick={copySecret} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                {copied ? <Check className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Step 3: Confirm OTP */}
          <form onSubmit={handleConfirm}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">3</span>
              <span className="text-sm font-semibold text-foreground">Enter the 6-digit code to confirm</span>
            </div>
            {error && (
              <div className="mb-3 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
            <input
              type="text" inputMode="numeric" maxLength={6}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-center text-2xl font-mono tracking-widest text-foreground focus:outline-none focus:ring-2 focus:ring-accent mb-4"
              placeholder="000000"
              value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
              required
            />
            <button
              type="submit" disabled={verifying || code.length !== 6}
              className="w-full py-3 bg-accent text-accent-foreground font-semibold rounded-lg hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {verifying ? 'Activating MFA…' : 'Activate Two-Factor Auth'}
            </button>
          </form>

          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
            <Smartphone className="h-4 w-4 shrink-0" />
            <span>Once activated, you'll need this 6-digit code every time you sign in.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MFASetupPage;
