import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertTriangle, Eye, EyeOff, Lock, Mail, Phone, User } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { useApp } from '../context/AppContext';

export const SignUpPage: React.FC = () => {
  const { signup } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (location.state as { from?: string } | null)?.from || '/my-bookings';

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    const res = signup(fullName, email, phone, password);
    if (!res.ok) {
      setError(res.error || 'Could not create account.');
      return;
    }
    navigate(fromPath, { replace: true });
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-14 bg-[#F8FAFC] dark:bg-[#070D19]">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-md rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/12 dark:border-[#D4AF37]/25 shadow-2xl overflow-hidden"
      >
        {/* Top Luxury Aviation Header */}
        <div className="px-7 py-7 bg-[#070D19] text-white border-b border-[#D4AF37]/30 text-center space-y-3">
          <div className="flex justify-center">
            <BrandLogo inverted compact />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-medium">
            Join Intrega Wings
          </h1>
          <p className="text-xs text-slate-300">
            Create your traveler profile for faster checkout, saved itineraries, and E-Ticket access.
          </p>
        </div>

        <div className="p-7 space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="signup-name"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
              >
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#C5A059] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="signup-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., Montasir Tamim"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070D19] text-sm text-[#0B1F3A] dark:text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="signup-email"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
              >
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#C5A059] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="signup-email"
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
                htmlFor="signup-phone"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
              >
                Phone Number *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#C5A059] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="signup-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+880 1700 000000"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070D19] text-sm text-[#0B1F3A] dark:text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="signup-password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
              >
                Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#C5A059] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
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

            <div>
              <label
                htmlFor="signup-confirm-password"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
              >
                Confirm Password *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#C5A059] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="signup-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full pl-10 pr-3.5 py-3 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070D19] text-sm text-[#0B1F3A] dark:text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <button
              id="signup-submit-btn"
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#0B1F3A] hover:bg-[#132E54] dark:bg-[#D4AF37] dark:hover:bg-[#E0BE52] text-white dark:text-[#070D19] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              Create Account
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
            Already have an account?{' '}
            <Link
              to="/login"
              state={{ from: fromPath }}
              className="font-semibold text-[#0B1F3A] dark:text-[#D4AF37] hover:underline"
            >
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
