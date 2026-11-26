import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Lock,
  Radio,
  ShieldCheck,
  Smartphone,
  Wallet,
  X,
} from 'lucide-react';
import type {
  Booking,
  CryptoPaymentMethod,
  CurrencyCode,
  Flight,
  FlightSearchParams,
  PassengerInfo,
} from '../types';
import { formatPrice } from '../utils/currency';
import { generateETicketPdf } from '../utils/pdfGenerator';

interface BookingCheckoutModalProps {
  flight: Flight | null;
  existingPendingBooking?: Booking | null;
  searchParams: FlightSearchParams;
  currency: CurrencyCode;
  onClose: () => void;
  onCreatePendingBooking: (booking: Booking) => void;
  onVerifyBookingPayment: (bookingId: string, txId: string) => Booking | undefined;
}

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
    depositTarget: 'TRiPSVGuujXngzf72CAaiRLbhenLW66oqh',
    targetLabel: 'USDT TRC20 Deposit Address',
  },
  {
    id: 'USDT_BEP20',
    label: 'USDT (BEP20)',
    network: 'BNB Smart Chain',
    symbol: 'USDT',
    usdRate: 1,
    decimals: 2,
    depositTarget: '0x84792f8081d8e5106094014021c282e980e7bdc2',
    targetLabel: 'USDT BEP20 Deposit Address',
  },
  {
    id: 'BTC',
    label: 'Bitcoin (BTC)',
    network: 'Bitcoin Mainnet',
    symbol: 'BTC',
    usdRate: 92500,
    decimals: 6,
    depositTarget: '19FiZ5Eh2xcupwpbRCcaDxS5GGouhPJ2sV',
    targetLabel: 'BTC Treasury Address',
  },
  {
    id: 'ETH',
    label: 'Ethereum (ETH)',
    network: 'Ethereum ERC20',
    symbol: 'ETH',
    usdRate: 3420,
    decimals: 5,
    depositTarget: '0x84792f8081d8e5106094014021c282e980e7bdc2',
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

function generateSeat(cabin: Flight['cabinClass']): string {
  if (cabin === 'First Class') return `${1 + Math.floor(Math.random() * 2)}A`;
  if (cabin === 'Business') return `${4 + Math.floor(Math.random() * 6)}K`;
  return `${14 + Math.floor(Math.random() * 20)}F`;
}

export const BookingCheckoutModal: React.FC<BookingCheckoutModalProps> = ({
  flight,
  existingPendingBooking,
  searchParams,
  currency,
  onClose,
  onCreatePendingBooking,
  onVerifyBookingPayment,
}) => {
  const activeFlight = existingPendingBooking?.flight || flight;
  const totalPassengers = existingPendingBooking
    ? existingPendingBooking.passengers.adults +
      existingPendingBooking.passengers.children +
      existingPendingBooking.passengers.infants
    : searchParams.passengers.adults +
      searchParams.passengers.children +
      searchParams.passengers.infants;

  const totalPriceUsd = existingPendingBooking
    ? existingPendingBooking.totalPriceUsd
    : (activeFlight?.priceUsd || 0) * totalPassengers;

  const [step, setStep] = useState<'PASSENGER' | 'PAYMENT' | 'VERIFICATION_GATE'>(
    existingPendingBooking ? 'VERIFICATION_GATE' : 'PASSENGER'
  );

  const [passenger, setPassenger] = useState<PassengerInfo>(
    existingPendingBooking?.primaryPassenger || {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      passportNumber: '',
      nationality: 'United Kingdom',
      seatPreference: 'Window',
    }
  );

  const [selectedMethod, setSelectedMethod] = useState<CryptoPaymentMethod>(
    existingPendingBooking?.payment.method || 'BINANCE_PAY'
  );
  const [txIdInput, setTxIdInput] = useState(existingPendingBooking?.payment.txId || '');
  const [orderRef] = useState(
    existingPendingBooking?.payment.orderReference ||
      `IWORD-${Date.now().toString().slice(-6)}`
  );
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(
    existingPendingBooking || null
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [validationError, setValidationError] = useState('');
  const [binanceLaunched, setBinanceLaunched] = useState(false);

  const methodMeta = useMemo(
    () => CRYPTO_METHODS.find((m) => m.id === selectedMethod) || CRYPTO_METHODS[0],
    [selectedMethod]
  );

  const cryptoAmount = useMemo(() => {
    return (totalPriceUsd / methodMeta.usdRate).toFixed(methodMeta.decimals);
  }, [totalPriceUsd, methodMeta]);

  // Generate dynamic QR code for selected crypto wallet / Binance Pay ID
  useEffect(() => {
    if (!activeFlight) return;
    const qrContent =
      selectedMethod === 'BINANCE_PAY'
        ? `binancepay://pay?merchant=INTREGA_WINGS&payId=${methodMeta.depositTarget}&amount=${cryptoAmount}&currency=USDT&ref=${orderRef}`
        : `${methodMeta.symbol.toLowerCase()}:${methodMeta.depositTarget}?amount=${cryptoAmount}&label=IntregaWings-${orderRef}`;

    QRCode.toDataURL(qrContent, {
      width: 220,
      margin: 1,
      color: { dark: '#0B1F3A', light: '#FFFFFF' },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''));
  }, [activeFlight, selectedMethod, methodMeta, cryptoAmount, orderRef]);

  // Countdown timer for payment window
  useEffect(() => {
    if (step === 'PASSENGER' || activeBooking?.status === 'CONFIRMED') return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [step, activeBooking?.status]);

  if (!activeFlight) return null;

  const minutesStr = Math.floor(secondsLeft / 60)
    .toString()
    .padStart(2, '0');
  const secsStr = (secondsLeft % 60).toString().padStart(2, '0');

  const handleCopyTarget = async () => {
    try {
      await navigator.clipboard.writeText(methodMeta.depositTarget);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleContinueToPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !passenger.firstName.trim() ||
      !passenger.lastName.trim() ||
      !passenger.email.trim() ||
      !passenger.passportNumber.trim()
    ) {
      setValidationError('Please complete all required passenger fields.');
      return;
    }
    setValidationError('');
    setStep('PAYMENT');
  };

  /**
   * CRITICAL: Strictly creates booking in `PENDING_VERIFICATION` status.
   * NEVER auto-confirms or unlocks E-Ticket generation upon clicking submit.
   */
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
      seatNumber: generateSeat(activeFlight.cabinClass),
      totalPriceUsd,
      currencyAtBooking: currency,
      payment: {
        method: selectedMethod,
        amountUsd: totalPriceUsd,
        cryptoAmount,
        cryptoSymbol: methodMeta.symbol,
        depositTarget: methodMeta.depositTarget,
        orderReference: orderRef,
        txId: cleanedTx,
        initiatedAt: new Date().toISOString(),
      },
    };

    onCreatePendingBooking(newBooking);
    setActiveBooking(newBooking);
    setStep('VERIFICATION_GATE');
  };

  /**
   * Developer / Verification Webhook Simulator:
   * Explicitly mimics an incoming Binance Pay / Blockchain deposit webhook confirmation.
   * Transitions booking from PENDING_VERIFICATION -> CONFIRMED and unlocks PDF E-Ticket.
   */
  const handleSimulateWebhookVerification = () => {
    if (!activeBooking || activeBooking.status === 'CONFIRMED') return;
    setIsVerifying(true);
    setTimeout(() => {
      const updated = onVerifyBookingPayment(
        activeBooking.id,
        txIdInput.trim() || activeBooking.payment.txId
      );
      if (updated) {
        setActiveBooking(updated);
      }
      setIsVerifying(false);
    }, 950);
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#070F1D]/75 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-modal-title"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-3xl rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/15 dark:border-[#D8B774]/25 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 bg-[#0B1F3A] text-white flex items-center justify-between border-b border-[#C5A059]/30 shrink-0">
          <div>
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#D8B774] font-semibold">
              {activeFlight.airline} &bull; {activeFlight.flightNumber}
            </p>
            <h3 id="checkout-modal-title" className="font-serif text-xl font-medium mt-0.5">
              {activeFlight.origin.code} &rarr; {activeFlight.destination.code} &bull;{' '}
              {formatPrice(totalPriceUsd, currency)}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close booking modal"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Bar */}
        <div className="px-6 py-3 bg-[#F8FAFC] dark:bg-[#0A1526] border-b border-[#0B1F3A]/10 dark:border-white/10 flex items-center justify-between text-xs font-semibold shrink-0">
          {(
            [
              { id: 'PASSENGER', num: '01', label: 'Passenger Details' },
              { id: 'PAYMENT', num: '02', label: 'Crypto / Binance Pay' },
              { id: 'VERIFICATION_GATE', num: '03', label: 'Verification & E-Ticket' },
            ] as const
          ).map((s) => {
            const isActive = step === s.id;
            return (
              <div
                key={s.id}
                className={`flex items-center gap-2 ${
                  isActive
                    ? 'text-[#0B1F3A] dark:text-[#D8B774]'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                    isActive
                      ? 'bg-[#0B1F3A] text-white dark:bg-[#C5A059] dark:text-[#070F1D]'
                      : 'border border-current'
                  }`}
                >
                  {s.num}
                </span>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            );
          })}
        </div>

        {/* Scrollable Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {validationError && (
            <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 text-xs font-medium text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* STEP 1: PASSENGER DETAILS */}
          {step === 'PASSENGER' && (
            <form onSubmit={handleContinueToPayment} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    First Name (As on Passport) *
                  </label>
                  <input
                    id="pax-first-name"
                    type="text"
                    required
                    value={passenger.firstName}
                    onChange={(e) => setPassenger({ ...passenger, firstName: e.target.value })}
                    placeholder="e.g., Elena"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-sm text-[#0B1F3A] dark:text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                    Last Name (As on Passport) *
                  </label>
                  <input
                    id="pax-last-name"
                    type="text"
                    required
                    value={passenger.lastName}
                    onChange={(e) => setPassenger({ ...passenger, lastName: e.target.value })}
                    placeholder="e.g., Lindqvist"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-sm text-[#0B1F3A] dark:text-white focus:outline-none focus:border-[#C5A059]"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-sm text-[#0B1F3A] dark:text-white focus:outline-none focus:border-[#C5A059]"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-sm text-[#0B1F3A] dark:text-white focus:outline-none focus:border-[#C5A059] uppercase"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-sm text-[#0B1F3A] dark:text-white focus:outline-none focus:border-[#C5A059]"
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-sm text-[#0B1F3A] dark:text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#070F1D] border border-[#0B1F3A]/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <p className="font-semibold text-[#0B1F3A] dark:text-white">
                    {activeFlight.origin.city} ({activeFlight.origin.code}) &rarr;{' '}
                    {activeFlight.destination.city} ({activeFlight.destination.code})
                  </p>
                  <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                    {activeFlight.departureDate} &bull; {activeFlight.departureTime} &bull;{' '}
                    {activeFlight.cabinClass} &bull; {totalPassengers} Passenger
                    {totalPassengers > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 dark:text-slate-400">Total Payable</p>
                  <p className="font-display text-lg font-bold text-[#0B1F3A] dark:text-[#D8B774] tabular-nums">
                    {formatPrice(totalPriceUsd, currency)}
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="continue-to-crypto-payment"
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#132E54] dark:bg-[#C5A059] dark:hover:bg-[#D8B774] text-white dark:text-[#070F1D] text-xs font-semibold uppercase tracking-wider cursor-pointer"
                >
                  Proceed to Crypto / Binance Pay
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: CRYPTO / BINANCE PAY INTERFACE */}
          {step === 'PAYMENT' && (
            <form onSubmit={handleSubmitPendingPayment} className="space-y-6">
              {/* Strict Verification Notice */}
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-300/60 dark:border-amber-400/25 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong>Strict Verification Gate:</strong> Submitting a payment reference holds
                  your seat in <code className="font-bold">PENDING_VERIFICATION</code> status.
                  Your E-Ticket PDF remains locked until blockchain or Binance Pay confirmation is
                  explicitly verified.
                </div>
              </div>

              {/* Payment Asset Selector */}
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 mb-2.5">
                  Select Cryptocurrency or Binance Pay
                </p>
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
              </div>

              {/* Dynamic Amount + QR Code + Copyable Wallet */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 p-5 rounded-2xl bg-[#F8FAFC] dark:bg-[#070F1D] border border-[#0B1F3A]/12 dark:border-[#D8B774]/20">
                <div className="md:col-span-4 flex flex-col items-center justify-center bg-white rounded-xl p-3 border border-slate-200">
                  {selectedMethod === 'BINANCE_PAY' ? (
                    <img
                      src="./images/binance-pay-qr.jpg"
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
                        Equivalent to {formatPrice(totalPriceUsd, currency)} ({orderRef})
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

                  {/* Live Open Binance Pay Portal Bar */}
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
                          Live Binance Pay page opened. Send <strong>{cryptoAmount} USDT</strong> to
                          UID <strong>570428214</strong>, then enter your Binance Pay Order ID below.
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
                      placeholder="e.g., 0x9f3a84... or BNP-20261125-8841"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-white dark:bg-[#111C2E] text-sm font-mono text-[#0B1F3A] dark:text-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('PASSENGER')}
                  className="px-4 py-2.5 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 cursor-pointer"
                >
                  Back
                </button>
                <button
                  id="submit-pending-payment-btn"
                  type="submit"
                  className="px-6 py-3 rounded-xl bg-[#0B1F3A] hover:bg-[#132E54] dark:bg-[#C5A059] dark:hover:bg-[#D8B774] text-white dark:text-[#070F1D] text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
                >
                  <Wallet className="w-4 h-4" />
                  Submit Payment Reference (Pending Verification)
                </button>
              </div>
            </form>
          )}

          {/* STEP 3: STRICT VERIFICATION GATE & E-TICKET UNLOCK */}
          {step === 'VERIFICATION_GATE' && activeBooking && (
            <div className="space-y-6">
              {activeBooking.status === 'PENDING_VERIFICATION' ? (
                <>
                  {/* Waiting for Payment Detection Status Monitor */}
                  <div className="p-6 rounded-2xl bg-[#F8FAFC] dark:bg-[#070F1D] border border-amber-400/50 dark:border-amber-400/30 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-600 dark:text-amber-400">
                          <Radio className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-300">
                            STATUS: PENDING_VERIFICATION
                          </span>
                          <h4 className="font-serif text-xl text-[#0B1F3A] dark:text-white mt-0.5">
                            Waiting for Payment Detection...
                          </h4>
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

                  {/* Strictly Locked E-Ticket Notice */}
                  <div className="p-4 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
                      <Lock className="w-5 h-5 text-slate-400 shrink-0" />
                      <div>
                        <p className="font-semibold text-[#0B1F3A] dark:text-white">
                          E-Ticket PDF Generation is Locked
                        </p>
                        <p>
                          Per Intrega Wings compliance policy, tickets are never auto-issued until
                          deposit confirmation is verified.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled
                      className="px-4 py-2.5 rounded-xl bg-slate-300 dark:bg-slate-700 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-2 cursor-not-allowed shrink-0"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Ticket Locked
                    </button>
                  </div>

                  {/* Explicit Frontend Verification Webhook Simulator */}
                  <div className="p-5 rounded-2xl border border-dashed border-[#C5A059] bg-[#C5A059]/8 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#9E7E3E] dark:text-[#D8B774]">
                        Verification Trigger (Frontend Webhook Simulator)
                      </p>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        POST /webhooks/binance-pay/confirmed
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      In production Phase 2, your backend webhook confirms this deposit
                      automatically. Click below to simulate an incoming verified Binance Pay /
                      blockchain confirmation event and transition this booking to{' '}
                      <strong className="text-[#0B1F3A] dark:text-white">CONFIRMED</strong>.
                    </p>
                    <button
                      id="simulate-verify-payment-btn"
                      type="button"
                      disabled={isVerifying}
                      onClick={handleSimulateWebhookVerification}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0B1F3A] hover:bg-[#132E54] dark:bg-[#C5A059] dark:hover:bg-[#D8B774] text-white dark:text-[#070F1D] text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      {isVerifying
                        ? 'Verifying Blockchain / Binance Webhook...'
                        : 'Simulate / Verify Payment'}
                    </button>
                  </div>
                </>
              ) : (
                /* CONFIRMED STATE — UNLOCKS AUTOMATIC E-TICKET PDF */
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
                        <h4 className="font-serif text-2xl text-[#0B1F3A] dark:text-white mt-1">
                          Your Intrega Wings E-Ticket is Ready
                        </h4>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-emerald-200 dark:border-emerald-500/20 text-xs">
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">PNR Code</p>
                        <p className="font-mono font-bold text-base text-[#0B1F3A] dark:text-white">
                          {activeBooking.pnr}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Passenger</p>
                        <p className="font-semibold text-[#0B1F3A] dark:text-white">
                          {activeBooking.primaryPassenger.firstName}{' '}
                          {activeBooking.primaryPassenger.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Assigned Seat</p>
                        <p className="font-bold text-[#0B1F3A] dark:text-white">
                          {activeBooking.seatNumber} ({activeBooking.flight.cabinClass})
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500 dark:text-slate-400">Webhook ID</p>
                        <p className="font-mono text-[#0B1F3A] dark:text-emerald-300">
                          {activeBooking.payment.webhookEventId}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-3 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 cursor-pointer"
                    >
                      View in My Bookings
                    </button>
                    <button
                      id="download-eticket-pdf-btn"
                      type="button"
                      disabled={isDownloadingPdf}
                      onClick={handleDownloadTicket}
                      className="px-6 py-3 rounded-xl bg-[#C5A059] hover:bg-[#D8B774] text-[#070F1D] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-lg cursor-pointer disabled:opacity-60"
                    >
                      <Download className="w-4 h-4" />
                      {isDownloadingPdf ? 'Generating PDF...' : 'Download E-Ticket (PDF)'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
