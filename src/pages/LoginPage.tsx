import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Eye, EyeOff, Lock, Mail, Sparkles } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { useApp } from '../context/AppContext';

export const LoginPage: React.FC = () => {
  const { login } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as { from?: string; authMessage?: string } | null;
  const fromPath = locationState?.from || '/my-bookings';
  const authMessage = locationState?.authMessage;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  const handleDemoFill = () => {
    setEmail('elena@intregawings.com');
    setPassword('Intrega2026!');
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = login(email, password);
    if (!res.ok) {
      setError(res.error || 'Unable to sign in.');
      return;
    }
    navigate(fromPath, { replace: true });
  };

  return (
    <div className="relative overflow-hidden min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-14 bg-[#F8FAFC] dark:bg-[#070D19]">
      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 0.45, scale: 1 }}
        transition={{ duration: 1.1 }}
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[320px] rounded-full bg-[#C5A059]/10 blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/12 dark:border-[#D4AF37]/25 shadow-2xl overflow-hidden"
      >
        {/* Top Luxury Aviation Header */}
        <div className="px-7 py-7 bg-[#070D19] text-white border-b border-[#D4AF37]/30 text-center space-y-3">
          <div className="flex justify-center">
            <BrandLogo inverted compact />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium">
            Welcome Back
          </h1>
          <p className="text-xs text-slate-300">
            Access your Intrega Wings itineraries, verified E-Tickets, and member privileges.
          </p>
        </div>

        <div className="p-7 space-y-5">
          {authMessage && !error && (
            <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-[#D4AF37]/12 border border-amber-300/70 dark:border-[#D4AF37]/35 text-xs font-medium text-amber-900 dark:text-[#F3D77D] flex items-center gap-2">
              <Lock className="w-4 h-4 shrink-0" />
              <span>{authMessage}</span>
            </div>
          )}
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Demo Quick-Fill Option */}
          <button
            id="demo-login-fill"
            type="button"
            onClick={handleDemoFill}
            className="w-full py-2.5 px-4 rounded-xl border border-dashed border-[#C5A059] bg-[#C5A059]/10 text-[#9E7E3E] dark:text-[#D8B774] text-xs font-semibold inline-flex items-center justify-center gap-2 hover:bg-[#C5A059]/15 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Demo Quick-Fill (Elena Lindqvist)</span>
          </button>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#C5A059] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@domain.com"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070D19] text-sm text-[#0B1F3A] dark:text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#C5A059] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-10 py-3 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070D19] text-sm text-[#0B1F3A] dark:text-white focus:outline-none focus:border-[#D4AF37]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#C5A059] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded accent-[#C5A059]"
                />
                <span>Remember me</span>
              </label>
              <Link
                to="/#contact"
                className="text-[#9E7E3E] dark:text-[#D8B774] hover:underline font-medium"
              >
                Need assistance?
              </Link>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#0B1F3A] hover:bg-[#132E54] dark:bg-[#D4AF37] dark:hover:bg-[#E0BE52] text-white dark:text-[#070D19] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Sign In to Intrega Wings
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
            New to Intrega Wings?{' '}
            <Link
              to="/signup"
              state={{ from: fromPath }}
              className="font-semibold text-[#0B1F3A] dark:text-[#D4AF37] hover:underline"
            >
              Create an Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
