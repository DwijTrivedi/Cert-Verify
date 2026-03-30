import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE } from '../lib/api';
import { Building2, ArrowLeft } from 'lucide-react';

const InstitutionSignUp = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE}/register`, {
        name, email, password, role: 'institution',
      });
      if (response.data.success) {
        // Institutions must set up MFA after registration
        navigate('/setup-mfa', { state: { email, role: 'institution' } });
      } else {
        setError(response.data.message ?? 'Registration failed. Please try again.');
      }
    } catch (err: any) {
      const data = err?.response?.data;
      setError(data?.message ?? data?.detail ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-card">
        <div className="w-full max-w-md">
          <Link to="/signin" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Portal Selection
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-accent" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Register Institution</h2>
          </div>
          <p className="text-muted-foreground mb-1">Create an account for your institution.</p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mb-6 font-medium">
            🔐 You will be required to set up Two-Factor Authentication after registration.
          </p>

          {error && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2" htmlFor="name">Institution Name</label>
              <input type="text" id="name"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:bg-card focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground"
                placeholder="e.g. Gujarat University" value={name} onChange={e => setName(e.target.value)} required />
            </div>
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
                placeholder="Create a strong password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2" htmlFor="confirmPassword">Confirm Password</label>
              <input type="password" id="confirmPassword"
                className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:bg-card focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-foreground placeholder:text-muted-foreground"
                placeholder="Confirm your password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 px-4 bg-accent hover:opacity-90 disabled:opacity-50 text-accent-foreground font-semibold rounded-lg shadow-md transition-all">
              {loading ? 'Registering…' : 'Register & Set Up MFA →'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Already have an account?{' '}
              <Link to="/signin/institution" className="font-bold text-accent hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Branding panel */}
      <div className="hidden md:flex flex-1 flex-col justify-center p-12 lg:p-24 bg-gradient-to-br from-slate-900 via-teal-900 to-cyan-900 text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-4xl font-bold mb-4">Join the Verified<br />Institution Network</h2>
          <p className="text-teal-100 leading-relaxed mb-8 max-w-md">
            Become part of a trusted ecosystem of academic institutions committed to eradicating certificate fraud.
          </p>
          <ul className="space-y-4 text-teal-200 text-sm">
            {[
              'Bulk upload up to 50,000 records at once',
              'Real-time sync with verification API',
              'Admin dashboard with live fraud alerts',
              'MFA protection for all institution accounts',
              'Secure alumni record management',
            ].map(item => (
              <li key={item} className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-teal-400/20 flex items-center justify-center text-teal-300 text-xs font-bold">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20" />
      </div>
    </div>
  );
};

export default InstitutionSignUp;
