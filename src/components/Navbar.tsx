import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Globe, Menu, Moon, Sun, Ticket, X } from 'lucide-react';
import type { CurrencyCode, ThemeMode } from '../types';
import { CURRENCIES } from '../utils/currency';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  currency: CurrencyCode;
  onChangeCurrency: (currency: CurrencyCode) => void;
  bookingsCount: number;
  pendingCount: number;
}

const NAV_LINKS = [
  { label: 'Flights', href: '#flights' },
  { label: 'Tourist Spots', href: '#tourist-spots' },
  { label: 'My Bookings', href: '#my-bookings' },
  { label: 'Contact', href: '#contact' },
];

export const Navbar: React.FC<NavbarProps> = ({
  theme,
  onToggleTheme,
  currency,
  onChangeCurrency,
  bookingsCount,
  pendingCount,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#F8FAFC]/95 dark:bg-[#070F1D]/95 backdrop-blur-md border-b border-[#0B1F3A]/10 dark:border-[#D8B774]/15 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <a href="#top" className="focus:outline-none" aria-label="Intrega Wings Home">
            <BrandLogo />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8" aria-label="Primary Navigation">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative text-sm font-medium tracking-wide text-[#334155] hover:text-[#0B1F3A] dark:text-[#CBD5E1] dark:hover:text-[#F8FAFC] transition-colors py-2 group"
              >
                <span className="inline-flex items-center gap-2">
                  {link.label}
                  {link.href === '#my-bookings' && bookingsCount > 0 && (
                    <span
                      className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-semibold rounded-full tabular-nums ${
                        pendingCount > 0
                          ? 'bg-[#C5A059] text-[#0B1F3A]'
                          : 'bg-[#0B1F3A] text-white dark:bg-[#D8B774] dark:text-[#070F1D]'
                      }`}
                    >
                      {bookingsCount}
                    </span>
                  )}
                </span>
                <span className="absolute inset-x-0 bottom-0 h-[1.5px] bg-[#C5A059] scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
              </a>
            ))}
          </nav>

          {/* Desktop Controls */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Currency Selector */}
            <div className="relative flex items-center">
              <Globe className="w-4 h-4 text-[#9E7E3E] dark:text-[#D8B774] absolute left-3 pointer-events-none" />
              <select
                id="currency-selector-desktop"
                aria-label="Select Currency"
                value={currency}
                onChange={(e) => onChangeCurrency(e.target.value as CurrencyCode)}
                className="pl-9 pr-3 py-2 text-xs font-semibold tracking-wider uppercase rounded-lg border border-[#0B1F3A]/15 dark:border-[#D8B774]/20 bg-white dark:bg-[#111C2E] text-[#0B1F3A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#C5A059] cursor-pointer transition-colors"
              >
                {Object.values(CURRENCIES).map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol.trim()})
                  </option>
                ))}
              </select>
            </div>

            {/* Theme Toggle */}
            <button
              id="theme-toggle-desktop"
              type="button"
              onClick={onToggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              className="p-2.5 rounded-lg border border-[#0B1F3A]/15 dark:border-[#D8B774]/20 bg-white dark:bg-[#111C2E] text-[#0B1F3A] dark:text-[#D8B774] hover:border-[#C5A059] transition-colors cursor-pointer"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </button>

            {/* Quick CTA to My Bookings */}
            <a
              href="#my-bookings"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0B1F3A] hover:bg-[#132E54] dark:bg-[#C5A059] dark:hover:bg-[#D8B774] text-white dark:text-[#070F1D] text-xs font-semibold tracking-wider uppercase transition-colors"
            >
              <Ticket className="w-3.5 h-3.5" />
              Manage Trip
            </a>
          </div>

          {/* Mobile Controls */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              id="theme-toggle-mobile"
              type="button"
              onClick={onToggleTheme}
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
            transition={{ duration: 0.25 }}
            className="lg:hidden overflow-hidden border-t border-[#0B1F3A]/10 dark:border-[#D8B774]/15 bg-[#F8FAFC] dark:bg-[#0B1628]"
          >
            <div className="px-4 py-5 space-y-4">
              <div className="flex flex-col space-y-1">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-[#0B1F3A] dark:text-[#F8FAFC] hover:bg-[#0B1F3A]/5 dark:hover:bg-white/5"
                  >
                    <span>{link.label}</span>
                    {link.href === '#my-bookings' && bookingsCount > 0 && (
                      <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-[#C5A059] text-[#0B1F3A]">
                        {bookingsCount}
                      </span>
                    )}
                  </a>
                ))}
              </div>

              <div className="pt-3 border-t border-[#0B1F3A]/10 dark:border-white/10 flex items-center justify-between gap-3">
                <span className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Currency
                </span>
                <select
                  aria-label="Select Currency Mobile"
                  value={currency}
                  onChange={(e) => onChangeCurrency(e.target.value as CurrencyCode)}
                  className="px-3 py-2 text-xs font-semibold uppercase rounded-lg border border-[#0B1F3A]/15 dark:border-[#D8B774]/20 bg-white dark:bg-[#111C2E] text-[#0B1F3A] dark:text-[#F8FAFC]"
                >
                  {Object.values(CURRENCIES).map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.code} — {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
