import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import {
  AlertTriangle,
  Armchair,
  ArrowLeft,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Lock,
  Luggage,
  Plane,
  Radio,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Wallet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type {
  Booking,
  BookingAddOns,
  CryptoPaymentMethod,
  Flight,
  PassengerInfo,
} from '../types';
import { formatDuration, formatPrice } from '../utils/currency';
import { generateETicketPdf } from '../utils/pdfGenerator';

interface CryptoMethodMeta {
  id: CryptoPaymentMethod;
  label: string;
  network: string;
  symbol: string;
  usdRate: number;
  decimals: number;
  depositTarget: string;
  targetLabel: string;
}

const BINANCE_LIVE_WEB_URL = 'https://www.binance.com/en/my/wallet/account/payment/send';
const BINANCE_APP_DEEP_LINK = 'bnc://app.binance.com/payment/secpay';

const CRYPTO_METHODS: CryptoMethodMeta[] = [
  {
    id: 'BINANCE_PAY',
    label: 'Binance Pay',
    network: 'UID: 570428214',
    symbol: 'USDT',
    usdRate: 1,
    decimals: 2,
    depositTarget: '570428214',
    targetLabel: 'Official Binance Pay UID',
  },
  {
    id: 'USDT_TRC20',
    label: 'USDT (TRC20)',
    network: 'TRON Network',
    symbol: 'USDT',
    usdRate: 1,
    decimals: 2,
    depositTarget: 'TW9xIntregaWingsOfficialTRC20Treasury7Kp9q',
    targetLabel: 'USDT TRC20 Deposit Address',
  },
  {
    id: 'USDT_BEP20',
    label: 'USDT (BEP20)',
    network: 'BNB Smart Chain',
    symbol: 'USDT',
    usdRate: 1,
    decimals: 2,
    depositTarget: '0x71C9IntregaWingsBEP20Treasury92A4F8e1',
    targetLabel: 'USDT BEP20 Deposit Address',
  },
  {
    id: 'BTC',
    label: 'Bitcoin (BTC)',
    network: 'Bitcoin Mainnet',
    symbol: 'BTC',
    usdRate: 92500,
    decimals: 6,
    depositTarget: 'bc1qintregawings88globalairtreasury9xk2m',
    targetLabel: 'BTC Treasury Address',
  },
  {
    id: 'ETH',
    label: 'Ethereum (ETH)',
    network: 'Ethereum ERC20',
    symbol: 'ETH',
    usdRate: 3420,
    decimals: 5,
    depositTarget: '0x71C9IntregaWingsETHMainnetTreasury4E2b',
    targetLabel: 'ETH Treasury Address',
  },
];

function generatePnr(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let res = 'IW';
  for (let i = 0; i < 4; i++) {
    res += chars[Math.floor(Math.random() * chars.length)];
  }
  return res;
}

function getSeatsForCabin(cabin: Flight['cabinClass']): { rows: number[]; cols: string[]; occupied: string[] } {
  if (cabin === 'First Class') {
    return { rows: [1, 2], cols: ['A', 'D', 'G', 'K'], occupied: ['1D', '2G'] };
  }
  if (cabin === 'Business') {
    return { rows: [4, 5, 6, 7], cols: ['A', 'C', 'H', 'K'], occupied: ['4C', '5A', '6H'] };
  }
  return { rows: [14, 15, 16, 17, 18], cols: ['A', 'B', 'C', 'D', 'E', 'F'], occupied: ['14B', '15E', '16C', '17D'] };
}

export const BookingPage: React.FC = () => {
  const {
    flights,
    selectedFlight,
    setSelectedFlight,
    searchParams,
    currency,
    bookings,
    createPendingBooking,
    verifyBookingPayment,
    user,
    showToast,
  } = useApp();

  const { flightId } = useParams<{ flightId?: string }>();
  const [urlSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Strict Guest / Demo Mode Guard: block direct access to booking & payment checkout
  useEffect(() => {
    if (!user) {
      const msg = 'Please create an account or log in to book a ticket.';
      showToast(msg);
      navigate('/login', {
        replace: true,
        state: {
          from: `${location.pathname}${location.search}`,
          authMessage: msg,
        },
      });
    }
  }, [user, navigate, location.pathname, location.search, showToast]);

  const verifyBookingId = urlSearchParams.get('verifyBookingId');
  const existingPendingBooking = useMemo(
    () => (verifyBookingId ? bookings.find((b) => b.id === verifyBookingId) || null : null),
    [verifyBookingId, bookings]
  );

  // Resolve active flight from existing booking, selectedFlight, URL param, or first available flight
  const activeFlight: Flight | null = useMemo(() => {
    if (existingPendingBooking) return existingPendingBooking.flight;
    if (selectedFlight && (!flightId || selectedFlight.id === decodeURIComponent(flightId))) {
      return selectedFlight;
    }
    if (flightId) {
      const decoded = decodeURIComponent(flightId);
      const found = flights.find((f) => f.id === decoded);
      if (found) return found;
    }
    return selectedFlight || flights[0] || null;
  }, [existingPendingBooking, selectedFlight, flightId, flights]);

  useEffect(() => {
    if (activeFlight && !selectedFlight) {
      setSelectedFlight(activeFlight);
    }
  }, [activeFlight, selectedFlight, setSelectedFlight]);

  const [step, setStep] = useState<1 | 2 | 3>(existingPendingBooking ? 3 : 1);
  const [paymentSubmitted, setPaymentSubmitted] = useState<boolean>(Boolean(existingPendingBooking));
  const [activeBooking, setActiveBooking] = useState<Booking | null>(existingPendingBooking);

  // Sync if resuming a pending booking via query param
  useEffect(() => {
    if (existingPendingBooking) {
      setActiveBooking(existingPendingBooking);
      setStep(3);
      setPaymentSubmitted(true);
    }
  }, [existingPendingBooking]);

  const [passenger, setPassenger] = useState<PassengerInfo>(() => {
    if (existingPendingBooking) return existingPendingBooking.primaryPassenger;
    const nameParts = user?.fullName.trim().split(' ') || [];
    return {
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: user?.email || '',
      phone: user?.phone || '',
      passportNumber: '',
      nationality: 'United Kingdom',
      seatPreference: 'Window',
    };
  });

  // Step 2: Seat & Add-ons
  const seatConfig = useMemo(
    () => getSeatsForCabin(activeFlight?.cabinClass || 'Business'),
    [activeFlight?.cabinClass]
  );
  const [selectedSeat, setSelectedSeat] = useState<string>(
    existingPendingBooking?.seatNumber ||
      (activeFlight?.cabinClass === 'First Class'
        ? '1A'
        : activeFlight?.cabinClass === 'Business'
          ? '4A'
          : '14A')
  );
  const [extraBaggageKg, setExtraBaggageKg] = useState<number>(
    existingPendingBooking?.addOns?.extraBaggageKg || 0
  );
  const [loungeAccess, setLoungeAccess] = useState<boolean>(
    existingPendingBooking?.addOns?.loungeAccess || false
  );
  const [priorityBoarding, setPriorityBoarding] = useState<boolean>(
    existingPendingBooking?.addOns?.priorityBoarding || false
  );

  // Step 3: Payment & Verification Gate
  const [selectedMethod, setSelectedMethod] = useState<CryptoPaymentMethod>(
    existingPendingBooking?.payment.method || 'BINANCE_PAY'
  );
  const [txIdInput, setTxIdInput] = useState(existingPendingBooking?.payment.txId || '');
  const [orderRef] = useState(
    existingPendingBooking?.payment.orderReference || `IWORD-${Date.now().toString().slice(-6)}`
  );
  const [copied, setCopied] = useState(false);
  const [binanceLaunched, setBinanceLaunched] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [validationError, setValidationError] = useState('');

  const totalPassengers = existingPendingBooking
    ? existingPendingBooking.passengers.adults +
      existingPendingBooking.passengers.children +
      existingPendingBooking.passengers.infants
    : searchParams.passengers.adults +
      searchParams.passengers.children +
      searchParams.passengers.infants;

  const baggageCostUsd = extraBaggageKg === 15 ? 45 : extraBaggageKg === 30 ? 85 : 0;
  const loungeCostUsd = loungeAccess ? 65 : 0;
  const priorityCostUsd = priorityBoarding ? 28 : 0;
  const addOnsTotalUsd = baggageCostUsd + loungeCostUsd + priorityCostUsd;

  const baseFareTotalUsd = (activeFlight?.priceUsd || 0) * totalPassengers;
  const grandTotalUsd = existingPendingBooking
    ? existingPendingBooking.totalPriceUsd
    : baseFareTotalUsd + addOnsTotalUsd;

  const methodMeta = useMemo(
    () => CRYPTO_METHODS.find((m) => m.id === selectedMethod) || CRYPTO_METHODS[0],
    [selectedMethod]
  );

  const cryptoAmount = useMemo(
    () => (grandTotalUsd / methodMeta.usdRate).toFixed(methodMeta.decimals),
    [grandTotalUsd, methodMeta]
  );

  useEffect(() => {
    if (!activeFlight || selectedMethod === 'BINANCE_PAY') return;
    const qrContent = `${methodMeta.symbol.toLowerCase()}:${methodMeta.depositTarget}?amount=${cryptoAmount}&label=IntregaWings-${orderRef}`;
    QRCode.toDataURL(qrContent, {
      width: 220,
      margin: 1,
      color: { dark: '#0B1F3A', light: '#FFFFFF' },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [activeFlight, selectedMethod, methodMeta, cryptoAmount, orderRef]);

  useEffect(() => {
    if (step !== 3 || activeBooking?.status === 'CONFIRMED') return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [step, activeBooking?.status]);

  if (!user) {
    return null;
  }

  if (!activeFlight) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center space-y-5">
        <h1 className="font-serif text-3xl text-[#0B1F3A] dark:text-white">
          No Flight Selected
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Please choose an international flight from our live ticketing inventory first.
        </p>
        <Link
          to="/flights"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0B1F3A] dark:bg-[#C5A059] text-white dark:text-[#070F1D] text-xs font-bold uppercase tracking-wider"
        >
          <Plane className="w-4 h-4" />
          Browse Flights
        </Link>
      </div>
    );
  }

  const minutesStr = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const secsStr = (secondsLeft % 60).toString().padStart(2, '0');

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !passenger.firstName.trim() ||
      !passenger.lastName.trim() ||
      !passenger.email.trim() ||
      !passenger.passportNumber.trim()
    ) {
      setValidationError('Please complete all required passenger & passport fields.');
      return;
    }
    setValidationError('');
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCopyTarget = async () => {
    try {
      await navigator.clipboard.writeText(methodMeta.depositTarget);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleSubmitPendingPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedTx = txIdInput.trim();
    if (cleanedTx.length < 6) {
      setValidationError(
        'Please enter your Blockchain TxID or Binance Pay Order Reference (minimum 6 characters).'
      );
      return;
    }
    setValidationError('');

    const addOns: BookingAddOns = {
      extraBaggageKg,
      loungeAccess,
      priorityBoarding,
      addOnsTotalUsd,
    };

    const newBooking: Booking = {
      id: `bk-${Date.now()}`,
      pnr: generatePnr(),
      status: 'PENDING_VERIFICATION',
      createdAt: new Date().toISOString(),
      flight: activeFlight,
      tripType: searchParams.tripType,
      returnDate: searchParams.returnDate,
      passengers: searchParams.passengers,
      primaryPassenger: passenger,
      seatNumber: selectedSeat,
      addOns,
      totalPriceUsd: grandTotalUsd,
      currencyAtBooking: currency,
      payment: {
        method: selectedMethod,
        amountUsd: grandTotalUsd,
        cryptoAmount,
        cryptoSymbol: methodMeta.symbol,
        depositTarget: methodMeta.depositTarget,
        orderReference: orderRef,
        txId: cleanedTx,
        initiatedAt: new Date().toISOString(),
      },
    };

    createPendingBooking(newBooking);
    setActiveBooking(newBooking);
    setPaymentSubmitted(true);
  };

  const handleSimulateWebhookVerification = () => {
    if (!activeBooking || activeBooking.status === 'CONFIRMED') return;
    setIsVerifying(true);
    setTimeout(() => {
      const updated = verifyBookingPayment(
        activeBooking.id,
        txIdInput.trim() || activeBooking.payment.txId
      );
      if (updated) {
        setActiveBooking(updated);
      }
      setIsVerifying(false);
    }, 900);
  };

  const handleDownloadTicket = async () => {
    if (!activeBooking || activeBooking.status !== 'CONFIRMED') return;
    setIsDownloadingPdf(true);
    try {
      await generateETicketPdf(activeBooking);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Page Header */}
      <section className="bg-[#0B1F3A] dark:bg-[#070F1D] text-white py-10 border-b border-[#C5A059]/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate('/flights')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#D8B774] hover:text-white mb-4 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Flight Search
          </button>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#D8B774]">
                {activeFlight.airline} &bull; Flight {activeFlight.flightNumber}
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl font-medium mt-1">
                Complete Your Reservation
              </h1>
            </div>

            {/* 3-Step Indicator */}
            <div className="flex items-center gap-3 sm:gap-5 text-xs font-semibold">
              {[
                { num: 1 as const, label: 'Passenger' },
                { num: 2 as const, label: 'Seat & Add-ons' },
                { num: 3 as const, label: 'Payment & Ticket' },
              ].map((s) => (
                <div
                  key={s.num}
                  className={`flex items-center gap-2 ${
                    step === s.num
                      ? 'text-[#D8B774]'
                      : step > s.num
                        ? 'text-emerald-400'
                        : 'text-slate-400'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                      step === s.num
                        ? 'bg-[#C5A059] text-[#070F1D]'
                        : step > s.num
                          ? 'bg-emerald-500 text-white'
                          : 'border border-slate-500'
                    }`}
                  >
                    {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content + Sticky Itinerary Sidebar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Main Step Content */}
          <div className="lg:col-span-8 space-y-6">
            {validationError && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs font-medium text-red-700 dark:text-red-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{validationError}</span>
              </div>
            )}

            {/* STEP 1: PASSENGER & PASSPORT DETAILS */}
            {step === 1 && (
              <motion.form
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                onSubmit={handleStep1Next}
                className="rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/12 dark:border-white/10 p-6 sm:p-8 space-y-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#0B1F3A]/10 dark:border-white/10 pb-4">
                  <div>
                    <h2 className="font-serif text-2xl text-[#0B1F3A] dark:text-white">
                      Step 1: Passenger &amp; Passport Details
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Enter details exactly as printed on your international travel passport.
                    </p>
                  </div>
                  {!user && (
                    <Link
                      to="/login"
                      state={{ from: location.pathname }}
                      className="text-xs font-semibold text-[#9E7E3E] dark:text-[#D8B774] hover:underline"
                    >
                      Have an account? Sign in to auto-fill &rarr;
                    </Link>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      First Name *
                    </label>
                    <input
                      id="pax-first-name"
                      type="text"
                      required
                      value={passenger.firstName}
                      onChange={(e) => setPassenger({ ...passenger, firstName: e.target.value })}
                      placeholder="e.g., Elena"
                      className="w-full px-3.5 py-3 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-sm text-[#0B1F3A] dark:text-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Last Name *
                    </label>
                    <input
                      id="pax-last-name"
                      type="text"
                      required
                      value={passenger.lastName}
                      onChange={(e) => setPassenger({ ...passenger, lastName: e.target.value })}
                      placeholder="e.g., Lindqvist"
                      className="w-full px-3.5 py-3 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-sm text-[#0B1F3A] dark:text-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Email for E-Ticket *
                    </label>
                    <input
                      id="pax-email"
                      type="email"
                      required
                      value={passenger.email}
                      onChange={(e) => setPassenger({ ...passenger, email: e.target.value })}
                      placeholder="elena@example.com"
                      className="w-full px-3.5 py-3 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-sm text-[#0B1F3A] dark:text-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Passport Number *
                    </label>
                    <input
                      id="pax-passport"
                      type="text"
                      required
                      value={passenger.passportNumber}
                      onChange={(e) =>
                        setPassenger({ ...passenger, passportNumber: e.target.value.toUpperCase() })
                      }
                      placeholder="e.g., GBR8492014"
                      className="w-full px-3.5 py-3 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-sm text-[#0B1F3A] dark:text-white focus:outline-none focus:border-[#C5A059] uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={passenger.phone}
                      onChange={(e) => setPassenger({ ...passenger, phone: e.target.value })}
                      placeholder="+44 20 7946 0192"
                      className="w-full px-3.5 py-3 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-sm text-[#0B1F3A] dark:text-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Nationality
                    </label>
                    <input
                      type="text"
                      value={passenger.nationality}
                      onChange={(e) => setPassenger({ ...passenger, nationality: e.target.value })}
                      className="w-full px-3.5 py-3 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-sm text-[#0B1F3A] dark:text-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    id="booking-step1-next"
                    type="submit"
                    className="px-7 py-3 rounded-xl bg-[#0B1F3A] hover:bg-[#132E54] dark:bg-[#C5A059] dark:hover:bg-[#D8B774] text-white dark:text-[#070F1D] text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Continue to Seat &amp; Add-ons
                  </button>
                </div>
              </motion.form>
            )}

            {/* STEP 2: SEAT SELECTION & BAGGAGE / LOUNGE ADD-ONS */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/12 dark:border-white/10 p-6 sm:p-8 space-y-8"
              >
                <div className="border-b border-[#0B1F3A]/10 dark:border-white/10 pb-4">
                  <h2 className="font-serif text-2xl text-[#0B1F3A] dark:text-white">
                    Step 2: Cabin Seat &amp; Journey Add-ons
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Select your complimentary {activeFlight.cabinClass} seat on{' '}
                    {activeFlight.aircraft} and customize baggage or lounge privileges.
                  </p>
                </div>

                {/* Visual Cabin Seat Picker */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0B1F3A] dark:text-[#D8B774]">
                      <Armchair className="w-4 h-4" />
                      Selected Seat: {selectedSeat}
                    </span>
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-[#C5A059]" /> Selected
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded border border-slate-400" /> Available
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-slate-300 dark:bg-slate-700" /> Occupied
                      </span>
                    </div>
                  </div>

                  <div className="p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#070F1D] border border-[#0B1F3A]/10 dark:border-white/10 overflow-x-auto">
                    <div className="space-y-2.5 min-w-[280px] max-w-md mx-auto">
                      {seatConfig.rows.map((row) => (
                        <div key={row} className="flex items-center justify-center gap-2">
                          <span className="w-6 text-xs font-mono text-slate-400">{row}</span>
                          {seatConfig.cols.map((col, idx) => {
                            const code = `${row}${col}`;
                            const isOccupied = seatConfig.occupied.includes(code);
                            const isSelected = selectedSeat === code;
                            const isAisleAfter = idx === Math.floor(seatConfig.cols.length / 2) - 1;
                            return (
                              <React.Fragment key={code}>
                                <button
                                  type="button"
                                  disabled={isOccupied}
                                  onClick={() => setSelectedSeat(code)}
                                  className={`w-10 h-10 rounded-lg text-xs font-bold transition-all ${
                                    isOccupied
                                      ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                      : isSelected
                                        ? 'bg-[#C5A059] text-[#070F1D] shadow-md scale-105 cursor-pointer'
                                        : 'bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/15 dark:border-white/15 text-[#0B1F3A] dark:text-slate-200 hover:border-[#C5A059] cursor-pointer'
                                  }`}
                                >
                                  {code}
                                </button>
                                {isAisleAfter && <span className="w-5" />}
                              </React.Fragment>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Baggage & Lounge Add-ons */}
                <div className="space-y-4">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Optional Baggage &amp; Lounge Enhancements
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { kg: 0, label: 'Included Allowance', sub: activeFlight.baggageAllowance, price: 0 },
                      { kg: 15, label: '+15 kg Checked Bag', sub: 'Additional hold luggage', price: 45 },
                      { kg: 30, label: '+30 kg Checked Bag', sub: 'Priority luggage tag', price: 85 },
                    ].map((bag) => (
                      <button
                        key={bag.kg}
                        type="button"
                        onClick={() => setExtraBaggageKg(bag.kg)}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                          extraBaggageKg === bag.kg
                            ? 'border-[#C5A059] bg-[#C5A059]/10'
                            : 'border-[#0B1F3A]/12 dark:border-white/10 hover:border-[#C5A059]/50'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <Luggage className="w-4 h-4 text-[#C5A059]" />
                          <span className="text-xs font-bold text-[#0B1F3A] dark:text-[#D8B774] tabular-nums">
                            {bag.price === 0 ? 'Included' : `+${formatPrice(bag.price, currency)}`}
                          </span>
                        </div>
                        <p className="text-sm font-semibold text-[#0B1F3A] dark:text-white mt-2">
                          {bag.label}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {bag.sub}
                        </p>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setLoungeAccess((prev) => !prev)}
                      className={`p-4 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                        loungeAccess
                          ? 'border-[#C5A059] bg-[#C5A059]/10'
                          : 'border-[#0B1F3A]/12 dark:border-white/10 hover:border-[#C5A059]/50'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#0B1F3A] dark:text-white inline-flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-[#C5A059]" />
                          Intrega Horizon Lounge Pass
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Fine dining, showers &amp; quiet workspaces
                        </p>
                      </div>
                      <span className="text-xs font-bold text-[#0B1F3A] dark:text-[#D8B774] tabular-nums shrink-0">
                        +{formatPrice(65, currency)}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPriorityBoarding((prev) => !prev)}
                      className={`p-4 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                        priorityBoarding
                          ? 'border-[#C5A059] bg-[#C5A059]/10'
                          : 'border-[#0B1F3A]/12 dark:border-white/10 hover:border-[#C5A059]/50'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-semibold text-[#0B1F3A] dark:text-white">
                          Priority Fast-Track Boarding
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Dedicated security &amp; Zone 1 boarding
                        </p>
                      </div>
                      <span className="text-xs font-bold text-[#0B1F3A] dark:text-[#D8B774] tabular-nums shrink-0">
                        +{formatPrice(28, currency)}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-2.5 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    id="booking-step2-next"
                    type="button"
                    onClick={() => {
                      setStep(3);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="px-7 py-3 rounded-xl bg-[#0B1F3A] hover:bg-[#132E54] dark:bg-[#C5A059] dark:hover:bg-[#D8B774] text-white dark:text-[#070F1D] text-xs font-bold uppercase tracking-wider cursor-pointer"
                  >
                    Proceed to Binance Pay / Crypto Checkout
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3: BINANCE PAY / CRYPTO CHECKOUT & STRICT VERIFICATION GATE */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/12 dark:border-white/10 p-6 sm:p-8 space-y-6"
              >
                {!paymentSubmitted ? (
                  <form onSubmit={handleSubmitPendingPayment} className="space-y-6">
                    <div className="border-b border-[#0B1F3A]/10 dark:border-white/10 pb-4">
                      <h2 className="font-serif text-2xl text-[#0B1F3A] dark:text-white">
                        Step 3: Binance Pay &amp; Crypto Settlement
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Strict Verification Gate: Reservations begin in{' '}
                        <strong>PENDING_VERIFICATION</strong> until payment confirmation is verified.
                      </p>
                    </div>

                    {/* Asset Selector */}
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {CRYPTO_METHODS.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedMethod(m.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                            selectedMethod === m.id
                              ? 'border-[#C5A059] bg-[#C5A059]/12 text-[#0B1F3A] dark:text-white'
                              : 'border-[#0B1F3A]/12 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-[#C5A059]/50'
                          }`}
                        >
                          <p className="text-xs font-bold">{m.label}</p>
                          <p className="text-[10px] opacity-75 truncate mt-0.5">{m.network}</p>
                        </button>
                      ))}
                    </div>

                    {/* QR + UID + Live Binance Launcher */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#070F1D] border border-[#0B1F3A]/12 dark:border-[#D8B774]/20">
                      <div className="md:col-span-4 flex flex-col items-center justify-center bg-white rounded-xl p-3 border border-slate-200">
                        {selectedMethod === 'BINANCE_PAY' ? (
                          <img
                            src={`${import.meta.env.BASE_URL}images/binance-pay-qr.jpg`}
                            alt="Official Intrega Wings Binance Pay QR Code (UID 570428214)"
                            className="w-44 h-44 object-contain rounded"
                          />
                        ) : qrDataUrl ? (
                          <img
                            src={qrDataUrl}
                            alt={`QR Code for ${methodMeta.label}`}
                            className="w-40 h-40 object-contain"
                          />
                        ) : (
                          <div className="w-40 h-40 bg-slate-100 animate-pulse rounded" />
                        )}
                        <span className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600 text-center">
                          {selectedMethod === 'BINANCE_PAY'
                            ? 'Scan in Binance App • UID 570428214'
                            : `Scan via ${methodMeta.label}`}
                        </span>
                      </div>

                      <div className="md:col-span-8 flex flex-col justify-between space-y-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              Exact Amount Due
                            </p>
                            <p className="font-display text-2xl sm:text-3xl font-bold text-[#0B1F3A] dark:text-[#D8B774] tabular-nums">
                              {cryptoAmount} {methodMeta.symbol}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              Equivalent to {formatPrice(grandTotalUsd, currency)} ({orderRef})
                            </p>
                          </div>
                          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B1F3A] text-[#D8B774] text-xs font-bold tabular-nums">
                            <Clock className="w-3.5 h-3.5" />
                            {minutesStr}:{secsStr}
                          </div>
                        </div>

                        <div>
                          <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                            {methodMeta.targetLabel}
                          </p>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 px-3 py-2.5 rounded-lg bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/12 dark:border-white/10 text-sm font-mono font-bold text-[#0B1F3A] dark:text-[#D8B774] break-all">
                              {methodMeta.depositTarget}
                            </code>
                            <button
                              type="button"
                              onClick={handleCopyTarget}
                              className="px-3 py-2.5 rounded-lg border border-[#0B1F3A]/15 dark:border-[#D8B774]/25 bg-white dark:bg-[#111C2E] text-xs font-semibold text-[#0B1F3A] dark:text-[#D8B774] hover:border-[#C5A059] inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                            >
                              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                              {copied ? 'Copied' : 'Copy UID'}
                            </button>
                          </div>
                        </div>

                        {selectedMethod === 'BINANCE_PAY' && (
                          <div className="p-3.5 rounded-xl bg-[#FCD535]/15 dark:bg-[#FCD535]/10 border border-[#FCD535]/50 space-y-2.5">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0B1F3A] dark:text-[#FCD535]">
                                Live Binance Pay Checkout
                              </span>
                              <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300">
                                UID: 570428214
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                              <a
                                id="open-live-binance-web"
                                href={BINANCE_LIVE_WEB_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setBinanceLaunched(true)}
                                className="flex-1 min-w-[180px] px-4 py-2.5 rounded-lg bg-[#FCD535] hover:bg-[#f0c71e] text-[#0B1F3A] text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 shadow-sm transition-colors"
                              >
                                <span>Open Live Binance Pay</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                              <a
                                id="open-live-binance-app"
                                href={BINANCE_APP_DEEP_LINK}
                                onClick={() => setBinanceLaunched(true)}
                                className="px-3.5 py-2.5 rounded-lg border border-[#0B1F3A]/20 dark:border-[#FCD535]/40 bg-white dark:bg-[#111C2E] text-[#0B1F3A] dark:text-[#FCD535] text-xs font-semibold inline-flex items-center justify-center gap-1.5 hover:border-[#FCD535] transition-colors"
                              >
                                <Smartphone className="w-3.5 h-3.5" />
                                <span>Binance App</span>
                              </a>
                            </div>
                            {binanceLaunched && (
                              <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                                Live Binance Pay opened. Send <strong>{cryptoAmount} USDT</strong> to
                                UID <strong>570428214</strong>, then submit your Order ID below.
                              </p>
                            )}
                          </div>
                        )}

                        <div>
                          <label
                            htmlFor="crypto-txid-input"
                            className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1"
                          >
                            Transaction ID (TxID) or Binance Pay Order Reference *
                          </label>
                          <input
                            id="crypto-txid-input"
                            type="text"
                            required
                            value={txIdInput}
                            onChange={(e) => setTxIdInput(e.target.value)}
                            placeholder="e.g., BNP-20261125-8841 or 0x9f3a84..."
                            className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-white dark:bg-[#111C2E] text-sm font-mono text-[#0B1F3A] dark:text-white focus:outline-none focus:border-[#C5A059]"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="px-5 py-2.5 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 cursor-pointer"
                      >
                        Back
                      </button>
                      <button
                        id="submit-pending-payment-btn"
                        type="submit"
                        className="px-6 py-3 rounded-xl bg-[#0B1F3A] hover:bg-[#132E54] dark:bg-[#C5A059] dark:hover:bg-[#D8B774] text-white dark:text-[#070F1D] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Wallet className="w-4 h-4" />
                        Submit Payment Reference (Pending Verification)
                      </button>
                    </div>
                  </form>
                ) : activeBooking && activeBooking.status === 'PENDING_VERIFICATION' ? (
                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-[#F8FAFC] dark:bg-[#070F1D] border border-amber-400/50 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400">
                            <Radio className="w-5 h-5 animate-pulse" />
                          </div>
                          <div>
                            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-300">
                              STATUS: PENDING_VERIFICATION
                            </span>
                            <h3 className="font-serif text-2xl text-[#0B1F3A] dark:text-white mt-0.5">
                              Waiting for Payment Detection...
                            </h3>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] uppercase tracking-wider text-slate-500">
                            Verification Window
                          </p>
                          <p className="font-mono text-lg font-bold text-[#0B1F3A] dark:text-[#D8B774] tabular-nums">
                            {minutesStr}:{secsStr}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-[#0B1F3A]/10 dark:border-white/10 text-xs">
                        <div>
                          <p className="text-slate-500">PNR Hold Reference</p>
                          <p className="font-mono font-bold text-[#0B1F3A] dark:text-white mt-0.5">
                            {activeBooking.pnr}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Submitted TxID</p>
                          <p className="font-mono font-bold text-[#0B1F3A] dark:text-white mt-0.5 truncate">
                            {activeBooking.payment.txId}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Expected Deposit</p>
                          <p className="font-mono font-bold text-[#0B1F3A] dark:text-[#D8B774] mt-0.5">
                            {activeBooking.payment.cryptoAmount} {activeBooking.payment.cryptoSymbol}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                        <Lock className="w-5 h-5 text-slate-400 shrink-0" />
                        <div>
                          <p className="font-semibold text-[#0B1F3A] dark:text-white">
                            E-Ticket PDF Generation is Locked
                          </p>
                          <p>
                            Tickets are strictly locked until payment confirmation is verified.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled
                        className="px-4 py-2.5 rounded-xl bg-slate-300 dark:bg-slate-700 text-slate-500 text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2 cursor-not-allowed shrink-0"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        Ticket Locked
                      </button>
                    </div>

                    <div className="p-5 rounded-2xl border border-dashed border-[#C5A059] bg-[#C5A059]/8 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9E7E3E] dark:text-[#D8B774]">
                          Verification Trigger (Frontend Webhook Simulator)
                        </p>
                        <span className="text-[10px] font-mono text-slate-500">
                          POST /webhooks/binance-pay/confirmed
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300">
                        Click below to simulate an incoming Binance Pay / blockchain deposit
                        confirmation webhook and transition this reservation to{' '}
                        <strong>CONFIRMED</strong>.
                      </p>
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          id="simulate-verify-payment-btn"
                          type="button"
                          disabled={isVerifying}
                          onClick={handleSimulateWebhookVerification}
                          className="px-6 py-3 rounded-xl bg-[#0B1F3A] hover:bg-[#132E54] dark:bg-[#C5A059] dark:hover:bg-[#D8B774] text-white dark:text-[#070F1D] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          {isVerifying
                            ? 'Verifying Binance Webhook...'
                            : 'Simulate / Verify Payment'}
                        </button>
                        <Link
                          to="/my-bookings"
                          className="px-5 py-3 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
                        >
                          View Pending in My Bookings
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : activeBooking ? (
                  <div className="space-y-6">
                    <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-300 dark:border-emerald-500/30 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white">
                            STATUS: CONFIRMED &bull; PAYMENT VERIFIED
                          </span>
                          <h3 className="font-serif text-2xl text-[#0B1F3A] dark:text-white mt-1">
                            Your Intrega Wings E-Ticket is Issued
                          </h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-emerald-200 dark:border-emerald-500/20 text-xs">
                        <div>
                          <p className="text-slate-500">PNR Code</p>
                          <p className="font-mono font-bold text-base text-[#0B1F3A] dark:text-white">
                            {activeBooking.pnr}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Passenger</p>
                          <p className="font-semibold text-[#0B1F3A] dark:text-white">
                            {activeBooking.primaryPassenger.firstName}{' '}
                            {activeBooking.primaryPassenger.lastName}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Seat</p>
                          <p className="font-bold text-[#0B1F3A] dark:text-white">
                            {activeBooking.seatNumber} ({activeBooking.flight.cabinClass})
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-500">Webhook ID</p>
                          <p className="font-mono text-emerald-700 dark:text-emerald-300">
                            {activeBooking.payment.webhookEventId}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <Link
                        to="/my-bookings"
                        className="px-6 py-3 rounded-xl border border-[#0B1F3A]/15 dark:border-[#D8B774]/30 text-xs font-bold uppercase tracking-wider text-[#0B1F3A] dark:text-[#D8B774] hover:border-[#C5A059]"
                      >
                        View in My Bookings
                      </Link>
                      <button
                        id="download-eticket-pdf-btn"
                        type="button"
                        disabled={isDownloadingPdf}
                        onClick={handleDownloadTicket}
                        className="px-7 py-3 rounded-xl bg-[#C5A059] hover:bg-[#D8B774] text-[#070F1D] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-60"
                      >
                        <Download className="w-4 h-4" />
                        {isDownloadingPdf ? 'Generating PDF...' : 'Download E-Ticket (PDF)'}
                      </button>
                    </div>
                  </div>
                ) : null}
              </motion.div>
            )}
          </div>

          {/* Right Sticky Itinerary & Fare Summary */}
          <motion.aside
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="lg:col-span-4 rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/12 dark:border-[#D8B774]/20 p-6 space-y-5 lg:sticky lg:top-24"
          >
            <div className="border-b border-[#0B1F3A]/10 dark:border-white/10 pb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9E7E3E] dark:text-[#D8B774]">
                Itinerary Summary
              </p>
              <h3 className="font-serif text-2xl text-[#0B1F3A] dark:text-white mt-1">
                {activeFlight.origin.code} &rarr; {activeFlight.destination.code}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {activeFlight.origin.city} to {activeFlight.destination.city}
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Carrier</span>
                <span className="font-semibold text-[#0B1F3A] dark:text-white">
                  {activeFlight.airline} ({activeFlight.flightNumber})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Departure</span>
                <span className="font-semibold text-[#0B1F3A] dark:text-white tabular-nums">
                  {activeFlight.departureDate} &bull; {activeFlight.departureTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Duration</span>
                <span className="font-semibold text-[#0B1F3A] dark:text-white">
                  {formatDuration(activeFlight.durationMinutes)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cabin &amp; Seat</span>
                <span className="font-semibold text-[#0B1F3A] dark:text-white">
                  {activeFlight.cabinClass} &bull; {selectedSeat}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#0B1F3A]/10 dark:border-white/10 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">
                  Base Fare ({totalPassengers} pax)
                </span>
                <span className="font-semibold text-[#0B1F3A] dark:text-white tabular-nums">
                  {formatPrice(baseFareTotalUsd, currency)}
                </span>
              </div>
              {addOnsTotalUsd > 0 && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Seat / Baggage / Lounge Add-ons</span>
                  <span className="font-semibold text-[#0B1F3A] dark:text-white tabular-nums">
                    +{formatPrice(addOnsTotalUsd, currency)}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-3 border-t border-[#0B1F3A]/10 dark:border-white/10">
                <span className="font-bold uppercase tracking-wider text-[#0B1F3A] dark:text-white">
                  Total Payable
                </span>
                <span className="font-display text-2xl font-bold text-[#0B1F3A] dark:text-[#D8B774] tabular-nums">
                  {formatPrice(grandTotalUsd, currency)}
                </span>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
};
