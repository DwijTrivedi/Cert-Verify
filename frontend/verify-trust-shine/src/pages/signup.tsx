import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const signUp = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    console.log('Registering:', { fullName, email, password });
    // Add your registration logic here
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Right Side: Form (Flipped for variation) */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h2>
          <p className="text-slate-500 mb-8">Register your institution to access verification tools.</p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="fullName">
                Full Name / Department
              </label>
              <input 
                type="text" 
                id="fullName" 
                className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all"
                placeholder="e.g. Office of the Registrar" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="email">
                Institutional Email
              </label>
              <input 
                type="email" 
                id="email" 
                className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all"
                placeholder="admin@university.edu" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="password">
                Password
              </label>
              <input 
                type="password" 
                id="password" 
                className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all"
                placeholder="Create a strong password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input 
                type="password" 
                id="confirmPassword" 
                className="w-full px-4 py-3 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:border-transparent transition-all"
                placeholder="Confirm your password" 
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required 
              />
            </div>
            
            <button 
              type="submit" 
              className="w-full py-3 px-4 bg-teal-700 hover:bg-teal-800 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2 transition-all mt-4"
            >
              Register Institution
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            <p>
              Already have an account?{' '}
              <Link to="/signin" className="font-bold text-slate-900 hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Left Side: Branding */}
      <div className="hidden md:flex flex-1 flex-col justify-center p-12 lg:p-24 bg-slate-100 text-slate-900 border-l border-slate-200">
        <h1 className="text-4xl lg:text-5xl font-bold mb-4 tracking-tight text-teal-800">Join the Network</h1>
        <p className="text-lg text-slate-600 max-w-md leading-relaxed mb-8">
          By registering your institution, you contribute to a global standard of academic verification and secure credentialing.
        </p>
        <ul className="space-y-4 text-slate-700 font-medium">
          <li className="flex items-center gap-3">
             <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold">✓</span>
             Instant degree validation
          </li>
          <li className="flex items-center gap-3">
             <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold">✓</span>
             Secure alumni record management
          </li>
          <li className="flex items-center gap-3">
             <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold">✓</span>
             API access for automated checks
          </li>
        </ul>
      </div>
    </div>
  );
};

export default signUp;