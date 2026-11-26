import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Globe, LogIn, LogOut, Menu, Moon, ShieldCheck, Sun, UserPlus, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { CurrencyCode } from '../types';
import { CURRENCIES } from '../utils/currency';
import { BrandLogo } from './BrandLogo';

export const Navbar: React.FC = () => {
  const {
    theme,
    toggleTheme,
    currency,
    setCurrency,
    activeBookingsCount,
    user,
    isAdmin,
    logout,
  } = useApp();

  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  // Automatically close mobile drawer whenever the route or hash changes
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.hash]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative text-sm font-medium tracking-wide transition-colors py-2 group ${
      isActive
        ? 'text-[#0B1F3A] dark:text-[#D8B774] font-semibold'
        : 'text-[#334155] hover:text-[#0B1F3A] dark:text-[#CBD5E1] dark:hover:text-[#F8FAFC]'
    }`;

  const initials = user
    ? user.fullName
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '';

  return (
    <header className="sticky top-0 z-50 bg-[#F8FAFC]/95 dark:bg-[#070F1D]/95 backdrop-blur-md border-b border-[#0B1F3A]/10 dark:border-[#D8B774]/15 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Brand Logo -> Home */}
          <Link
            to="/"
            onClick={() => {
              setMobileOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="focus:outline-none shrink-0 cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all"
            aria-label="Intrega Wings Home"
          >
            <BrandLogo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7" aria-label="Primary Navigation">
            <NavLink to="/" end className={navLinkClass}>
              {({ isActive }) => (
                <>
                  <span>Home</span>
                  <span
                    className={`absolute inset-x-0 bottom-0 h-[1.5px] bg-[#C5A059] transition-transform origin-left duration-300 ${
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </>
              )}
            </NavLink>

            <NavLink to="/flights" className={navLinkClass}>
              {({ isActive }) => (
                <>
                  <span>Flights</span>
                  <span
                    className={`absolute inset-x-0 bottom-0 h-[1.5px] bg-[#C5A059] transition-transform origin-left duration-300 ${
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </>
              )}
            </NavLink>

            <NavLink to="/tours" className={navLinkClass}>
              {({ isActive }) => (
                <>
                  <span>Tours</span>
                  <span
                    className={`absolute inset-x-0 bottom-0 h-[1.5px] bg-[#C5A059] transition-transform origin-left duration-300 ${
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </>
              )}
            </NavLink>

            <NavLink to="/my-bookings" className={navLinkClass}>
              {({ isActive }) => (
                <>
                  <span className="inline-flex items-center gap-2">
                    <span>My Bookings</span>
                    {activeBookingsCount > 0 && (
                      <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold rounded-full tabular-nums bg-[#C5A059] text-[#070F1D]">
                        {activeBookingsCount}
                      </span>
                    )}
                  </span>
                  <span
                    className={`absolute inset-x-0 bottom-0 h-[1.5px] bg-[#C5A059] transition-transform origin-left duration-300 ${
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </>
              )}
            </NavLink>

            <NavLink to="/contact" className={navLinkClass}>
              {({ isActive }) => (
                <>
                  <span>Contact</span>
                  <span
                    className={`absolute inset-x-0 bottom-0 h-[1.5px] bg-[#C5A059] transition-transform origin-left duration-300 ${
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </>
              )}
            </NavLink>

            <NavLink to="/admin" className={navLinkClass}>
              {({ isActive }) => (
                <>
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>Admin</span>
                  </span>
                  <span
                    className={`absolute inset-x-0 bottom-0 h-[1.5px] bg-[#C5A059] transition-transform origin-left duration-300 ${
                      isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                    }`}
                  />
                </>
              )}
            </NavLink>
          </nav>

          {/* Desktop Controls: Currency, Theme, Auth */}
          <div className="hidden lg:flex items-center gap-2.5">
            <div className="relative flex items-center">
              <Globe className="w-3.5 h-3.5 text-[#9E7E3E] dark:text-[#D8B774] absolute left-2.5 pointer-events-none" />
              <select
                id="currency-selector-desktop"
                aria-label="Select Currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                className="pl-8 pr-2.5 py-2 text-xs font-semibold tracking-wider uppercase rounded-lg border border-[#0B1F3A]/15 dark:border-[#D8B774]/20 bg-white dark:bg-[#111C2E] text-[#0B1F3A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#C5A059] cursor-pointer transition-colors"
              >
                {Object.values(CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol.trim()})
                  </option>
                ))}
              </select>
            </div>

            <button
              id="theme-toggle-desktop"
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              className="p-2 rounded-lg border border-[#0B1F3A]/15 dark:border-[#D8B774]/20 bg-white dark:bg-[#111C2E] text-[#0B1F3A] dark:text-[#D8B774] hover:border-[#C5A059] transition-colors cursor-pointer"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            <div className="h-5 w-[1px] bg-[#0B1F3A]/15 dark:bg-white/15 mx-0.5" />

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  to={isAdmin ? '/admin' : '/my-bookings'}
                  className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#0B1F3A]/6 dark:bg-[#111C2E] border border-[#0B1F3A]/10 dark:border-[#D8B774]/25"
                >
                  <span className="w-6 h-6 rounded-full bg-[#C5A059] text-[#070F1D] text-[10px] font-bold flex items-center justify-center">
                    {initials}
                  </span>
                  <span className="text-xs font-semibold text-[#0B1F3A] dark:text-white max-w-[110px] truncate">
                    {user.fullName.split(' ')[0]}
                  </span>
                </Link>
                <button
                  id="logout-btn-desktop"
                  type="button"
                  onClick={logout}
                  title="Log Out"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-[#0B1F3A]/15 dark:border-white/15 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:border-red-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-lg border border-[#0B1F3A]/15 dark:border-[#D8B774]/25 text-xs font-semibold tracking-wider uppercase text-[#0B1F3A] dark:text-[#F8FAFC] hover:border-[#C5A059] transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded-lg bg-[#0B1F3A] hover:bg-[#132E54] dark:bg-[#C5A059] dark:hover:bg-[#D8B774] text-white dark:text-[#070F1D] text-xs font-semibold tracking-wider uppercase transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="flex lg:hidden items-center gap-2">
            {activeBookingsCount > 0 && (
              <Link
                to="/my-bookings"
                aria-label="My Bookings"
                className="px-2.5 py-1.5 rounded-lg bg-[#C5A059] text-[#070F1D] text-xs font-bold tabular-nums"
              >
                {activeBookingsCount}
              </Link>
            )}
            <button
              id="theme-toggle-mobile"
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              className="p-2 rounded-lg border border-[#0B1F3A]/15 dark:border-[#D8B774]/20 bg-white dark:bg-[#111C2E] text-[#0B1F3A] dark:text-[#D8B774]"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>
            <button
              id="mobile-menu-toggle"
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle Menu"
              className="p-2 rounded-lg border border-[#0B1F3A]/15 dark:border-[#D8B774]/20 bg-white dark:bg-[#111C2E] text-[#0B1F3A] dark:text-[#F8FAFC]"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22 }}
            className="lg:hidden overflow-hidden border-t border-[#0B1F3A]/10 dark:border-[#D8B774]/15 bg-[#F8FAFC] dark:bg-[#0B1628]"
          >
            <div className="px-4 py-5 space-y-4">
              <div className="flex flex-col space-y-1">
                {[
                  { label: 'Home', to: '/', end: true },
                  { label: 'Flights (Ticketing)', to: '/flights', end: false },
                  { label: 'Tours & Attractions', to: '/tours', end: false },
                  { label: 'My Bookings', to: '/my-bookings', end: false },
                  { label: 'Contact', to: '/contact', end: false },
                  { label: 'Admin Panel', to: '/admin', end: false },
                ].map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#0B1F3A] text-white dark:bg-[#C5A059] dark:text-[#070F1D] font-semibold'
                          : 'text-[#0B1F3A] dark:text-[#F8FAFC] hover:bg-[#0B1F3A]/5 dark:hover:bg-white/5'
                      }`
                    }
                  >
                    <span>{item.label}</span>
                    {item.to === '/my-bookings' && activeBookingsCount > 0 && (
                      <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#C5A059] text-[#070F1D]">
                        {activeBookingsCount}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>

              {/* Mobile Currency Selector */}
              <div className="pt-3 border-t border-[#0B1F3A]/10 dark:border-white/10 flex items-center justify-between gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Currency
                </span>
                <select
                  aria-label="Select Currency Mobile"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                  className="px-3 py-2 text-xs font-semibold uppercase rounded-lg border border-[#0B1F3A]/15 dark:border-[#D8B774]/20 bg-white dark:bg-[#111C2E] text-[#0B1F3A] dark:text-[#F8FAFC]"
                >
                  {Object.values(CURRENCIES).map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile Auth Actions */}
              <div className="pt-3 border-t border-[#0B1F3A]/10 dark:border-white/10">
                {user ? (
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-8 h-8 rounded-full bg-[#C5A059] text-[#070F1D] text-xs font-bold flex items-center justify-center shrink-0">
                        {initials}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#0B1F3A] dark:text-white truncate">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={logout}
                      className="px-3.5 py-2 rounded-lg border border-red-400/40 text-xs font-semibold text-red-600 dark:text-red-400 inline-flex items-center gap-1.5 shrink-0"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2.5">
                    <Link
                      to="/login"
                      className="py-2.5 px-4 rounded-xl border border-[#0B1F3A]/15 dark:border-[#D8B774]/25 text-center text-xs font-semibold uppercase tracking-wider text-[#0B1F3A] dark:text-white inline-flex items-center justify-center gap-1.5"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="py-2.5 px-4 rounded-xl bg-[#0B1F3A] dark:bg-[#C5A059] text-center text-xs font-semibold uppercase tracking-wider text-white dark:text-[#070F1D] inline-flex items-center justify-center gap-1.5"
                    >
                      <UserPlus className="w-3.5 h-3.5" />
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
