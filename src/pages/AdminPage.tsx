import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Compass,
  DollarSign,
  Download,
  Lock,
  Plane,
  Plus,
  Search,
  ShieldCheck,
  Sparkles,
  Ticket,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { useApp, type SystemBookingEntry } from '../context/AppContext';
import { GLOBAL_AIRPORTS } from '../data/airports';
import {
  INTREGA_WINGS_SCHEDULE,
  getCustomAdminFleetRoutes,
  saveCustomAdminFleetRoutes,
  type IntregaFleetRouteConfig,
} from '../data/intregaWingsFlights';
import {
  getCustomAdminTours,
  getMergedTouristSpots,
  getTourOverrides,
  saveCustomAdminTours,
  saveTourOverrides,
} from '../data/touristSpots';
import type { TouristSpot } from '../types';
import { formatPrice } from '../utils/currency';
import { generateETicketPdf } from '../utils/pdfGenerator';

type AdminTab = 'OVERVIEW' | 'BOOKINGS' | 'FLEET' | 'TOURS' | 'USERS';
type BookingFilter = 'ALL' | 'PENDING_VERIFICATION' | 'CONFIRMED' | 'CANCELLED';

export const AdminPage: React.FC = () => {
  const {
    user,
    isAdmin,
    login,
    logout,
    currency,
    searchParams,
    executeSearch,
    getAllSystemBookings,
    adminVerifySystemBooking,
    adminCancelSystemBooking,
    getRegisteredUsers,
    showToast,
  } = useApp();

  // Admin Login Gate state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Active Admin Tab & Refresh counter
  const [activeTab, setActiveTab] = useState<AdminTab>('OVERVIEW');
  const [refreshTick, setRefreshTick] = useState(0);

  // Bookings Filter & Search
  const [bookingFilter, setBookingFilter] = useState<BookingFilter>('ALL');
  const [bookingQuery, setBookingQuery] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Custom Fleet Form State
  const [customRoutes, setCustomRoutes] = useState<IntregaFleetRouteConfig[]>(() =>
    getCustomAdminFleetRoutes()
  );
  const [flightNumber, setFlightNumber] = useState('IW-901');
  const [originCode, setOriginCode] = useState('DAC');
  const [destinationCode, setDestinationCode] = useState('CDG');
  const [aircraft, setAircraft] = useState('Airbus A350-1000');
  const [departureTime, setDepartureTime] = useState('10:30');
  const [arrivalTime, setArrivalTime] = useState('17:45');
  const [durationMinutes, setDurationMinutes] = useState(615);
  const [baseEconomyUsd, setBaseEconomyUsd] = useState(690);

  // Tours Management State
  const [mergedTours, setMergedTours] = useState<TouristSpot[]>(() => getMergedTouristSpots());
  const [customTours, setCustomTours] = useState<TouristSpot[]>(() => getCustomAdminTours());
  const [newTourName, setNewTourName] = useState('');
  const [newTourCity, setNewTourCity] = useState('');
  const [newTourCountry, setNewTourCountry] = useState('Bangladesh');
  const [newTourAirport, setNewTourAirport] = useState('DAC');
  const [newTourCategory, setNewTourCategory] =
    useState<TouristSpot['category']>('Nature & Culture');
  const [newTourPrice, setNewTourPrice] = useState(120);
  const [newTourSummary, setNewTourSummary] = useState('');

  useEffect(() => {
    setCustomRoutes(getCustomAdminFleetRoutes());
    setCustomTours(getCustomAdminTours());
    setMergedTours(getMergedTouristSpots());
  }, [refreshTick]);

  const systemBookings = useMemo(() => {
    void refreshTick;
    return getAllSystemBookings();
  }, [getAllSystemBookings, refreshTick]);

  const registeredUsers = useMemo(() => {
    void refreshTick;
    return getRegisteredUsers();
  }, [getRegisteredUsers, refreshTick]);

  const handleAdminQuickFill = () => {
    setAdminEmail('admin@intregawings.com');
    setAdminPassword('Admin2026!');
    setAuthError('');
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const res = login(adminEmail, adminPassword);
    if (!res.ok) {
      setAuthError(res.error || 'Invalid administrator credentials.');
      return;
    }
    if (res.role !== 'admin') {
      setAuthError('Access denied: This account does not have Administrator privileges.');
      return;
    }
    setAuthError('');
    showToast('Signed in to Intrega Wings Executive Admin Console.');
  };

  // Dedicated Admin Gate if not signed in as Administrator
  if (!isAdmin) {
    return (
      <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center px-4 py-14 bg-[#F8FAFC] dark:bg-[#070D19]">
        <motion.div
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/15 dark:border-[#C5A059]/30 shadow-2xl overflow-hidden"
        >
          <div className="px-7 py-7 bg-[#070D19] text-white border-b border-[#C5A059]/30 text-center space-y-3">
            <div className="flex justify-center">
              <Link to="/" aria-label="Intrega Wings Home">
                <BrandLogo inverted compact />
              </Link>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A059]/15 border border-[#C5A059]/35 text-[10px] font-bold uppercase tracking-[0.2em] text-[#D8B774]">
              <ShieldCheck className="w-3.5 h-3.5" />
              Restricted Operations Console
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-medium">Admin Portal Login</h1>
            <p className="text-xs text-slate-300">
              Sign in with official Intrega Wings administrator credentials to manage bookings,
              payment verifications, fleet routes, and destinations.
            </p>
          </div>

          <div className="p-7 space-y-5">
            {user && user.role !== 'admin' && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300/60 dark:border-amber-400/30 text-xs text-amber-900 dark:text-amber-200 space-y-2">
                <p>
                  Currently signed in as traveler <strong>{user.email}</strong>. Switch to an
                  administrator account to access the Admin Panel.
                </p>
              </div>
            )}

            {authError && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              id="admin-demo-fill-btn"
              type="button"
              onClick={handleAdminQuickFill}
              className="w-full py-2.5 px-4 rounded-xl border border-dashed border-[#C5A059] bg-[#C5A059]/10 text-[#9E7E3E] dark:text-[#D8B774] text-xs font-semibold inline-flex items-center justify-center gap-2 hover:bg-[#C5A059]/15 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Admin Quick-Fill (admin@intregawings.com)</span>
            </button>

            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Administrator Email
                </label>
                <input
                  id="admin-login-email"
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  placeholder="admin@intregawings.com"
                  className="w-full px-3.5 py-3 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070D19] text-sm text-[#0B1F3A] dark:text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                  Security Passkey
                </label>
                <input
                  id="admin-login-password"
                  type="password"
                  required
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-3.5 py-3 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070D19] text-sm text-[#0B1F3A] dark:text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <button
                id="admin-login-submit"
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#0B1F3A] hover:bg-[#132E54] dark:bg-[#C5A059] dark:hover:bg-[#D8B774] text-white dark:text-[#070D19] text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Lock className="w-4 h-4" />
                Enter Admin Command Center
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  // KPI Metrics Calculation
  const confirmedBookings = systemBookings.filter((b) => b.status === 'CONFIRMED');
  const pendingBookings = systemBookings.filter((b) => b.status === 'PENDING_VERIFICATION');
  const verifiedRevenueUsd = confirmedBookings.reduce((sum, b) => sum + b.totalPriceUsd, 0);
  const pendingVolumeUsd = pendingBookings.reduce((sum, b) => sum + b.totalPriceUsd, 0);
  const totalFleetCount = customRoutes.length + INTREGA_WINGS_SCHEDULE.length;

  const filteredBookings = systemBookings.filter((b) => {
    if (bookingFilter !== 'ALL' && b.status !== bookingFilter) return false;
    const q = bookingQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      b.pnr.toLowerCase().includes(q) ||
      b.ownerEmail.toLowerCase().includes(q) ||
      `${b.primaryPassenger.firstName} ${b.primaryPassenger.lastName}`.toLowerCase().includes(q) ||
      b.payment.txId.toLowerCase().includes(q) ||
      b.flight.flightNumber.toLowerCase().includes(q)
    );
  });

  const handleVerifyAction = (entry: SystemBookingEntry) => {
    adminVerifySystemBooking(entry.ownerEmail, entry.id);
    setRefreshTick((t) => t + 1);
    showToast(`Verified payment & unlocked E-Ticket for PNR ${entry.pnr}.`);
  };

  const handleCancelAction = (entry: SystemBookingEntry) => {
    adminCancelSystemBooking(entry.ownerEmail, entry.id);
    setRefreshTick((t) => t + 1);
    showToast(`Booking PNR ${entry.pnr} marked as CANCELLED.`);
  };

  const handleDownloadPdf = async (entry: SystemBookingEntry) => {
    if (entry.status !== 'CONFIRMED') return;
    setDownloadingId(entry.id);
    try {
      await generateETicketPdf(entry);
    } finally {
      setDownloadingId(null);
    }
  };

  // Add Custom Official Intrega Wings Route
  const handleAddFleetRoute = (e: React.FormEvent) => {
    e.preventDefault();
    if (originCode === destinationCode) {
      showToast('Origin and Destination airports must be different.');
      return;
    }
    const newRoute: IntregaFleetRouteConfig = {
      flightNumber: flightNumber.trim().toUpperCase() || `IW-${Math.floor(800 + Math.random() * 190)}`,
      originCode,
      destinationCode,
      aircraft: aircraft.trim() || 'Airbus A350-1000',
      departureTime,
      arrivalTime,
      durationMinutes: Math.max(35, Number(durationMinutes) || 180),
      stops: 0,
      baseEconomyUsd: Math.max(45, Number(baseEconomyUsd) || 350),
      terminalDep: 'Terminal 1',
      terminalArr: 'Terminal 2',
    };

    const next = [newRoute, ...customRoutes];
    saveCustomAdminFleetRoutes(next);
    setCustomRoutes(next);
    executeSearch(searchParams);
    showToast(`Added official route ${newRoute.flightNumber} (${originCode} → ${destinationCode}).`);
    setFlightNumber(`IW-${Math.floor(810 + Math.random() * 180)}`);
  };

  const handleDeleteCustomRoute = (flightNo: string) => {
    const next = customRoutes.filter((r) => r.flightNumber !== flightNo);
    saveCustomAdminFleetRoutes(next);
    setCustomRoutes(next);
    executeSearch(searchParams);
    showToast(`Removed custom route ${flightNo}.`);
  };

  // Update Tour Availability or Base Price Override
  const handleUpdateTourOverride = (
    spotId: string,
    patch: { basePriceUsd?: number; availability?: TouristSpot['availability'] }
  ) => {
    const current = getTourOverrides();
    const updated = {
      ...current,
      [spotId]: {
        ...current[spotId],
        ...patch,
      },
    };
    saveTourOverrides(updated);
    setRefreshTick((t) => t + 1);
    showToast('Updated destination configuration.');
  };

  // Add New International Tour Spot
  const handleAddCustomTour = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTourName.trim() || !newTourCity.trim()) return;
    const id = `custom-tour-${Date.now()}`;
    const defaultImg =
      newTourCountry.toLowerCase() === 'bangladesh'
        ? `${import.meta.env.BASE_URL}images/spot-coxs-bazar.jpg`
        : `${import.meta.env.BASE_URL}images/spot-burj-khalifa.jpg`;

    const newSpot: TouristSpot = {
      id,
      name: newTourName.trim(),
      city: newTourCity.trim(),
      country: newTourCountry.trim(),
      nearestAirportCode: newTourAirport,
      category: newTourCategory,
      imageUrl: defaultImg,
      rating: 4.9,
      reviewCount: 120,
      basePriceUsd: Math.max(25, Number(newTourPrice) || 100),
      availability: 'Instant Confirmation',
      summary:
        newTourSummary.trim() ||
        `Curated luxury international experience in ${newTourCity.trim()}, ${newTourCountry.trim()} with official partner booking handoff.`,
      highlights: [
        'Official priority dated entry pass',
        `Direct ${newTourAirport} airport concierge connectivity`,
      ],
      officialProviderName: `${newTourCity.trim()} Official Tourism Partner`,
      officialBookingBaseUrl: 'https://beautifulbangladesh.gov.bd/',
      partnerApiEndpoint: 'https://api.intregawings.com/v1/partner/handoff',
      partnerCode: `IW-${newTourAirport}-ADMIN`,
      packages: [
        {
          id: `${id}-std`,
          name: 'Executive Official Entry Package',
          priceUsd: Math.max(25, Number(newTourPrice) || 100),
          perks: ['Direct official mobile pass', 'Concierge support'],
        },
      ],
    };

    const next = [newSpot, ...customTours];
    saveCustomAdminTours(next);
    setNewTourName('');
    setNewTourCity('');
    setNewTourSummary('');
    setRefreshTick((t) => t + 1);
    showToast(`Published new tour destination: ${newSpot.name}.`);
  };

  const handleDeleteCustomTour = (spotId: string) => {
    const next = customTours.filter((s) => s.id !== spotId);
    saveCustomAdminTours(next);
    setRefreshTick((t) => t + 1);
    showToast('Removed custom tour destination.');
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Executive Admin Header */}
      <section className="bg-[#0B1F3A] dark:bg-[#070F1D] text-white pt-10 pb-8 border-b border-[#C5A059]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-[#D8B774]">
                <ShieldCheck className="w-4 h-4" />
                Executive Aviation Command Center
              </span>
              <h1 className="font-serif text-3xl sm:text-4xl font-medium mt-1.5">
                Intrega Wings Admin Panel
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Signed in as <strong>{user?.fullName}</strong> ({user?.email}) &bull; Binance Pay
                UID: <code className="text-[#D8B774]">570428214</code>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to="/flights"
                className="px-4 py-2 rounded-xl border border-white/20 hover:border-[#C5A059] text-xs font-semibold uppercase tracking-wider text-white transition-colors"
              >
                View Live Flights
              </Link>
              <button
                type="button"
                onClick={logout}
                className="px-4 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-400/30 text-xs font-semibold uppercase tracking-wider text-red-200 cursor-pointer"
              >
                Lock Admin Session
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-8 flex flex-wrap gap-2">
            {(
              [
                { id: 'OVERVIEW', label: 'Overview', icon: BarChart3 },
                {
                  id: 'BOOKINGS',
                  label: `Bookings & Payments (${systemBookings.length})`,
                  icon: Ticket,
                  badge: pendingBookings.length,
                },
                { id: 'FLEET', label: `Intrega Fleet (${totalFleetCount})`, icon: Plane },
                { id: 'TOURS', label: `Tours & Spots (${mergedTours.length})`, icon: Compass },
                { id: 'USERS', label: `Users (${registeredUsers.length})`, icon: Users },
              ] as const
            ).map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`admin-tab-${tab.id.toLowerCase()}`}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-semibold inline-flex items-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#C5A059] text-[#070F1D] shadow-md'
                      : 'bg-white/8 text-slate-200 hover:bg-white/15'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {'badge' in tab && tab.badge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-[#070F1D]">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'OVERVIEW' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-6 rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/10 dark:border-white/10">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <span>Verified Revenue</span>
                  <DollarSign className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="font-display text-3xl font-bold text-[#0B1F3A] dark:text-white mt-3 tabular-nums">
                  {formatPrice(verifiedRevenueUsd, currency)}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                  {confirmedBookings.length} confirmed E-Tickets
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-[#111C2E] border border-amber-400/40">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <span>Pending Verification</span>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <p className="font-display text-3xl font-bold text-[#0B1F3A] dark:text-[#D8B774] mt-3 tabular-nums">
                  {pendingBookings.length}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 tabular-nums">
                  {formatPrice(pendingVolumeUsd, currency)} awaiting approval
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/10 dark:border-white/10">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <span>Official Fleet Routes</span>
                  <Plane className="w-4 h-4 text-[#C5A059]" />
                </div>
                <p className="font-display text-3xl font-bold text-[#0B1F3A] dark:text-white mt-3 tabular-nums">
                  {totalFleetCount}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {customRoutes.length} custom + {INTREGA_WINGS_SCHEDULE.length} core schedules
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/10 dark:border-white/10">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <span>Travelers &amp; Tours</span>
                  <Users className="w-4 h-4 text-[#C5A059]" />
                </div>
                <p className="font-display text-3xl font-bold text-[#0B1F3A] dark:text-white mt-3 tabular-nums">
                  {registeredUsers.length}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {mergedTours.length} active global &amp; BD tour spots
                </p>
              </div>
            </div>

            {/* Actionable Pending Payment Verification Queue */}
            <div className="rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/12 dark:border-white/10 p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#0B1F3A]/10 dark:border-white/10 pb-4">
                <div>
                  <h2 className="font-serif text-2xl text-[#0B1F3A] dark:text-white">
                    Binance Pay &amp; Crypto Verification Queue
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Approve incoming TxIDs / Binance Pay references to unlock passenger E-Ticket PDFs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('BOOKINGS')}
                  className="text-xs font-semibold uppercase tracking-wider text-[#9E7E3E] dark:text-[#D8B774] hover:underline cursor-pointer"
                >
                  Open Full Bookings Ledger &rarr;
                </button>
              </div>

              {pendingBookings.length === 0 ? (
                <div className="py-10 text-center text-sm text-slate-500 dark:text-slate-400">
                  All submitted Binance Pay &amp; cryptocurrency bookings are verified and up to date.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingBookings.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#070F1D] border border-amber-400/40 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-300">
                            PNR: {entry.pnr}
                          </span>
                          <span className="font-semibold text-[#0B1F3A] dark:text-white">
                            {entry.primaryPassenger.firstName} {entry.primaryPassenger.lastName}
                          </span>
                          <span className="text-slate-400">({entry.ownerEmail})</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          {entry.flight.airline} {entry.flight.flightNumber} &bull;{' '}
                          {entry.flight.origin.code} &rarr; {entry.flight.destination.code} &bull;{' '}
                          <strong>
                            {entry.payment.cryptoAmount} {entry.payment.cryptoSymbol}
                          </strong>{' '}
                          via {entry.payment.method.replace('_', ' ')}
                        </p>
                        <p className="text-[11px] font-mono text-slate-500">
                          TxID / Order Ref: {entry.payment.txId}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleVerifyAction(entry)}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verify &amp; Issue E-Ticket
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCancelAction(entry)}
                          className="px-3.5 py-2 rounded-xl border border-red-400/40 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-500/10 cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 2: ALL SYSTEM BOOKINGS & PAYMENT VERIFICATION */}
        {activeTab === 'BOOKINGS' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { id: 'ALL', label: `All (${systemBookings.length})` },
                    { id: 'PENDING_VERIFICATION', label: `Pending (${pendingBookings.length})` },
                    { id: 'CONFIRMED', label: `Confirmed (${confirmedBookings.length})` },
                    {
                      id: 'CANCELLED',
                      label: `Cancelled (${systemBookings.filter((b) => b.status === 'CANCELLED').length})`,
                    },
                  ] as const
                ).map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setBookingFilter(tab.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                      bookingFilter === tab.id
                        ? 'bg-[#0B1F3A] text-white dark:bg-[#C5A059] dark:text-[#070F1D]'
                        : 'bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/12 dark:border-white/10 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={bookingQuery}
                  onChange={(e) => setBookingQuery(e.target.value)}
                  placeholder="Search PNR, passenger, email, TxID..."
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/15 dark:border-white/15 text-xs sm:text-sm text-[#0B1F3A] dark:text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <div className="rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/10 dark:border-white/10 p-12 text-center text-sm text-slate-500">
                No bookings found matching the active filter.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBookings.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/12 dark:border-white/10 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5"
                  >
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2.5 text-xs">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${
                            entry.status === 'CONFIRMED'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                              : entry.status === 'PENDING_VERIFICATION'
                                ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
                                : 'bg-slate-200 dark:bg-white/10 text-slate-500'
                          }`}
                        >
                          {entry.status}
                        </span>
                        <span className="font-mono font-bold text-[#0B1F3A] dark:text-[#D8B774]">
                          PNR: {entry.pnr}
                        </span>
                        <span className="text-slate-500">Account: {entry.ownerEmail}</span>
                      </div>

                      <h3 className="font-serif text-xl text-[#0B1F3A] dark:text-white">
                        {entry.flight.origin.code} &rarr; {entry.flight.destination.code} &bull;{' '}
                        {entry.flight.airline} ({entry.flight.flightNumber})
                      </h3>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Passenger: <strong>{entry.primaryPassenger.firstName} {entry.primaryPassenger.lastName}</strong>{' '}
                        (Passport: {entry.primaryPassenger.passportNumber}) &bull; Seat {entry.seatNumber} &bull;{' '}
                        {entry.flight.departureDate}
                      </p>
                      <p className="text-xs font-mono text-slate-600 dark:text-slate-300">
                        {formatPrice(entry.totalPriceUsd, currency)} ({entry.payment.cryptoAmount}{' '}
                        {entry.payment.cryptoSymbol} • {entry.payment.method}) &bull; TxID:{' '}
                        {entry.payment.txId}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      {entry.status === 'PENDING_VERIFICATION' && (
                        <button
                          type="button"
                          onClick={() => handleVerifyAction(entry)}
                          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Verify Payment
                        </button>
                      )}

                      {entry.status === 'CONFIRMED' && (
                        <button
                          type="button"
                          disabled={downloadingId === entry.id}
                          onClick={() => handleDownloadPdf(entry)}
                          className="px-4 py-2.5 rounded-xl bg-[#C5A059] hover:bg-[#D8B774] text-[#070F1D] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {downloadingId === entry.id ? 'Generating...' : 'E-Ticket PDF'}
                        </button>
                      )}

                      {entry.status !== 'CANCELLED' && (
                        <button
                          type="button"
                          onClick={() => handleCancelAction(entry)}
                          className="px-3.5 py-2.5 rounded-xl border border-red-400/40 text-red-600 dark:text-red-400 text-xs font-semibold hover:bg-red-500/10 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* TAB 3: OFFICIAL INTREGA WINGS FLEET MANAGER */}
        {activeTab === 'FLEET' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Add Route Form */}
            <form
              onSubmit={handleAddFleetRoute}
              className="lg:col-span-4 rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/12 dark:border-white/10 p-6 space-y-4 lg:sticky lg:top-24"
            >
              <h2 className="font-serif text-xl text-[#0B1F3A] dark:text-white">
                Add Official Fleet Flight
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Injects directly into live <code>/flights</code> search results with the Official
                Intrega Wings badge.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Flight No.
                  </label>
                  <input
                    type="text"
                    required
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-sm text-[#0B1F3A] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Base USD
                  </label>
                  <input
                    type="number"
                    required
                    min={45}
                    value={baseEconomyUsd}
                    onChange={(e) => setBaseEconomyUsd(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-sm text-[#0B1F3A] dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Origin
                  </label>
                  <select
                    value={originCode}
                    onChange={(e) => setOriginCode(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-xs font-semibold text-[#0B1F3A] dark:text-white"
                  >
                    {GLOBAL_AIRPORTS.map((a) => (
                      <option key={a.code} value={a.code}>
                        {a.code} — {a.city}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Destination
                  </label>
                  <select
                    value={destinationCode}
                    onChange={(e) => setDestinationCode(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-xs font-semibold text-[#0B1F3A] dark:text-white"
                  >
                    {GLOBAL_AIRPORTS.map((a) => (
                      <option key={a.code} value={a.code}>
                        {a.code} — {a.city}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Aircraft
                </label>
                <input
                  type="text"
                  required
                  value={aircraft}
                  onChange={(e) => setAircraft(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-sm text-[#0B1F3A] dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                    Dep Time
                  </label>
                  <input
                    type="time"
                    value={departureTime}
                    onChange={(e) => setDepartureTime(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-xs text-[#0B1F3A] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                    Arr Time
                  </label>
                  <input
                    type="time"
                    value={arrivalTime}
                    onChange={(e) => setArrivalTime(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-xs text-[#0B1F3A] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                    Duration (m)
                  </label>
                  <input
                    type="number"
                    min={30}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-2 py-2 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-xs text-[#0B1F3A] dark:text-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0B1F3A] hover:bg-[#132E54] dark:bg-[#C5A059] dark:hover:bg-[#D8B774] text-white dark:text-[#070F1D] text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Publish Official Route
              </button>
            </form>

            {/* Fleet Schedule Table */}
            <div className="lg:col-span-8 space-y-4">
              {customRoutes.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#9E7E3E] dark:text-[#D8B774]">
                    Admin-Added Custom Fleet Routes ({customRoutes.length})
                  </h3>
                  {customRoutes.map((r) => (
                    <div
                      key={r.flightNumber}
                      className="p-4 rounded-xl bg-white dark:bg-[#111C2E] border border-[#C5A059]/50 flex items-center justify-between gap-4"
                    >
                      <div>
                        <p className="text-sm font-bold text-[#0B1F3A] dark:text-white">
                          {r.flightNumber} &bull; {r.originCode} &rarr; {r.destinationCode}
                        </p>
                        <p className="text-xs text-slate-500">
                          {r.aircraft} &bull; {r.departureTime} – {r.arrivalTime} &bull; Economy Base:{' '}
                          {formatPrice(r.baseEconomyUsd, currency)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteCustomRoute(r.flightNumber)}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 cursor-pointer"
                        aria-label="Delete route"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/10 dark:border-white/10 overflow-hidden">
                <div className="px-5 py-4 border-b border-[#0B1F3A]/10 dark:border-white/10">
                  <h3 className="font-serif text-lg text-[#0B1F3A] dark:text-white">
                    Core Intrega Wings Scheduled Routes ({INTREGA_WINGS_SCHEDULE.length})
                  </h3>
                </div>
                <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-[540px] overflow-y-auto">
                  {INTREGA_WINGS_SCHEDULE.map((r) => (
                    <div
                      key={r.flightNumber}
                      className="px-5 py-3.5 flex items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <span className="font-mono font-bold text-[#0B1F3A] dark:text-[#D8B774] mr-2">
                          {r.flightNumber}
                        </span>
                        <span className="font-semibold text-[#0B1F3A] dark:text-white">
                          {r.originCode} &rarr; {r.destinationCode}
                        </span>
                        <span className="text-slate-500 ml-2">({r.aircraft})</span>
                      </div>
                      <div className="text-right tabular-nums">
                        <span className="text-slate-500 mr-3">
                          {r.departureTime} – {r.arrivalTime}
                        </span>
                        <span className="font-bold text-[#0B1F3A] dark:text-white">
                          {formatPrice(r.baseEconomyUsd, currency)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* TAB 4: TOURS & DESTINATIONS MANAGER */}
        {activeTab === 'TOURS' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            <form
              onSubmit={handleAddCustomTour}
              className="lg:col-span-4 rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/12 dark:border-white/10 p-6 space-y-4 lg:sticky lg:top-24"
            >
              <h2 className="font-serif text-xl text-[#0B1F3A] dark:text-white">
                Add Tour Destination
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Publish a new international or Bangladesh attraction directly to <code>/tours</code>.
              </p>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Attraction Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTourName}
                  onChange={(e) => setNewTourName(e.target.value)}
                  placeholder="e.g., Saint Martin Coral Retreat"
                  className="w-full px-3 py-2 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-sm text-[#0B1F3A] dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTourCity}
                    onChange={(e) => setNewTourCity(e.target.value)}
                    placeholder="Teknaf / Bay"
                    className="w-full px-3 py-2 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-sm text-[#0B1F3A] dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTourCountry}
                    onChange={(e) => setNewTourCountry(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-sm text-[#0B1F3A] dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                    Airport
                  </label>
                  <select
                    value={newTourAirport}
                    onChange={(e) => setNewTourAirport(e.target.value)}
                    className="w-full px-2 py-2 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-xs text-[#0B1F3A] dark:text-white"
                  >
                    {GLOBAL_AIRPORTS.map((a) => (
                      <option key={a.code} value={a.code}>
                        {a.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                    Category
                  </label>
                  <select
                    value={newTourCategory}
                    onChange={(e) =>
                      setNewTourCategory(e.target.value as TouristSpot['category'])
                    }
                    className="w-full px-2 py-2 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-xs text-[#0B1F3A] dark:text-white"
                  >
                    <option value="Nature & Culture">Nature &amp; Culture</option>
                    <option value="Coastal Heritage">Coastal Heritage</option>
                    <option value="Landmark">Landmark</option>
                    <option value="Theme Park">Theme Park</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase text-slate-500 mb-1">
                    USD / Guest
                  </label>
                  <input
                    type="number"
                    min={20}
                    value={newTourPrice}
                    onChange={(e) => setNewTourPrice(Number(e.target.value))}
                    className="w-full px-2 py-2 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-xs text-[#0B1F3A] dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Editorial Summary
                </label>
                <textarea
                  rows={3}
                  value={newTourSummary}
                  onChange={(e) => setNewTourSummary(e.target.value)}
                  placeholder="Short description of the destination..."
                  className="w-full px-3 py-2 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-xs text-[#0B1F3A] dark:text-white resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#0B1F3A] hover:bg-[#132E54] dark:bg-[#C5A059] dark:hover:bg-[#D8B774] text-white dark:text-[#070F1D] text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Publish Tour Spot
              </button>
            </form>

            <div className="lg:col-span-8 space-y-3">
              {mergedTours.map((spot) => {
                const isCustom = customTours.some((c) => c.id === spot.id);
                return (
                  <div
                    key={spot.id}
                    className="p-4 rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/10 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-sm font-bold text-[#0B1F3A] dark:text-white">
                        {spot.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {spot.city}, {spot.country} ({spot.nearestAirportCode}) &bull;{' '}
                        {spot.category}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5">
                      <select
                        aria-label="Availability status"
                        value={spot.availability}
                        onChange={(e) =>
                          handleUpdateTourOverride(spot.id, {
                            availability: e.target.value as TouristSpot['availability'],
                          })
                        }
                        className="px-2.5 py-1.5 rounded-lg border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-xs font-semibold text-[#0B1F3A] dark:text-white"
                      >
                        <option value="Instant Confirmation">Instant Confirmation</option>
                        <option value="Available Today">Available Today</option>
                        <option value="Limited Slots">Limited Slots</option>
                      </select>

                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-400">$</span>
                        <input
                          type="number"
                          min={20}
                          value={spot.basePriceUsd}
                          onChange={(e) =>
                            handleUpdateTourOverride(spot.id, {
                              basePriceUsd: Math.max(20, Number(e.target.value) || 20),
                            })
                          }
                          className="w-20 px-2 py-1.5 rounded-lg border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-xs font-bold text-[#0B1F3A] dark:text-[#D8B774] tabular-nums"
                        />
                      </div>

                      {isCustom && (
                        <button
                          type="button"
                          onClick={() => handleDeleteCustomTour(spot.id)}
                          className="p-2 rounded-lg text-red-500 hover:bg-red-500/10 cursor-pointer"
                          aria-label="Delete custom tour"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* TAB 5: REGISTERED USERS DIRECTORY */}
        {activeTab === 'USERS' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/12 dark:border-white/10 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-[#0B1F3A]/10 dark:border-white/10">
              <h2 className="font-serif text-xl text-[#0B1F3A] dark:text-white">
                Registered Traveler Accounts ({registeredUsers.length})
              </h2>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {registeredUsers.map((u) => {
                const userBookingCount = systemBookings.filter(
                  (b) => b.ownerEmail.toLowerCase() === u.email.toLowerCase()
                ).length;

                return (
                  <div
                    key={u.id}
                    className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm"
                  >
                    <div>
                      <p className="font-semibold text-[#0B1F3A] dark:text-white">{u.fullName}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {u.email} &bull; {u.phone}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <span className="text-slate-500">
                        Joined {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                      <span className="px-3 py-1 rounded-full bg-[#0B1F3A]/8 dark:bg-[#C5A059]/15 text-[#0B1F3A] dark:text-[#D8B774] font-bold tabular-nums">
                        {userBookingCount} Booking{userBookingCount === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
