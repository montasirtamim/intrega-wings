import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  Download,
  Lock,
  Plane,
  ShieldCheck,
  Ticket,
} from 'lucide-react';
import type { Booking, CurrencyCode } from '../types';
import { formatPrice } from '../utils/currency';
import { generateETicketPdf } from '../utils/pdfGenerator';

interface MyBookingsSectionProps {
  bookings: Booking[];
  currency: CurrencyCode;
  onOpenVerification: (booking: Booking) => void;
}

export const MyBookingsSection: React.FC<MyBookingsSectionProps> = ({
  bookings,
  currency,
  onOpenVerification,
}) => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (booking: Booking) => {
    if (booking.status !== 'CONFIRMED') return;
    setDownloadingId(booking.id);
    try {
      await generateETicketPdf(booking);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <section
      id="my-bookings"
      className="py-20 bg-[#F1F5F9]/70 dark:bg-[#0A1424] border-y border-[#0B1F3A]/10 dark:border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9E7E3E] dark:text-[#D8B774]">
              Passenger Vault &amp; Verification Ledger
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#0B1F3A] dark:text-white mt-2">
              My Bookings &amp; E-Tickets
            </h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
            Every reservation starts in <strong className="text-[#0B1F3A] dark:text-white">PENDING_VERIFICATION</strong>.
            Downloadable PDF E-Tickets unlock strictly after payment confirmation.
          </p>
        </div>

        {bookings.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/10 dark:border-white/10 p-12 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#0B1F3A]/6 dark:bg-[#D8B774]/10 text-[#9E7E3E] dark:text-[#D8B774] flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-7 h-7" />
            </div>
            <h3 className="font-serif text-xl text-[#0B1F3A] dark:text-white">
              No Reservations Yet
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
              Select any Official Intrega Wings or Partner flight above to begin your reservation
              and experience our verified Crypto / Binance Pay checkout.
            </p>
            <a
              href="#flights"
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-[#0B1F3A] dark:bg-[#C5A059] text-white dark:text-[#070F1D] text-xs font-semibold uppercase tracking-wider"
            >
              <Plane className="w-3.5 h-3.5" />
              Browse International Flights
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {bookings.map((booking) => {
              const isConfirmed = booking.status === 'CONFIRMED';

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/12 dark:border-white/10 overflow-hidden shadow-sm flex flex-col justify-between"
                >
                  {/* Top Status Bar */}
                  <div
                    className={`px-5 py-3 flex items-center justify-between text-xs font-semibold border-b ${
                      isConfirmed
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                        : 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5 uppercase tracking-wider">
                      {isConfirmed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <Clock className="w-4 h-4" />
                      )}
                      {booking.status}
                    </span>
                    <span className="font-mono font-bold">PNR: {booking.pnr}</span>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#9E7E3E] dark:text-[#D8B774]">
                          {booking.flight.airline} &bull; {booking.flight.flightNumber}
                        </p>
                        <h3 className="font-serif text-2xl text-[#0B1F3A] dark:text-white mt-0.5">
                          {booking.flight.origin.code} &rarr; {booking.flight.destination.code}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {booking.flight.origin.city} to {booking.flight.destination.city} &bull;{' '}
                          {booking.flight.departureDate} at {booking.flight.departureTime}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-lg font-bold text-[#0B1F3A] dark:text-white tabular-nums">
                          {formatPrice(booking.totalPriceUsd, currency)}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Seat {booking.seatNumber} &bull; {booking.flight.cabinClass}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#070F1D] border border-[#0B1F3A]/8 dark:border-white/8 text-xs">
                      <div>
                        <p className="text-slate-500">Passenger</p>
                        <p className="font-semibold text-[#0B1F3A] dark:text-white mt-0.5">
                          {booking.primaryPassenger.firstName} {booking.primaryPassenger.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">Payment Ref ({booking.payment.method.replace('_', ' ')})</p>
                        <p className="font-mono text-[#0B1F3A] dark:text-slate-200 mt-0.5 truncate">
                          {booking.payment.txId}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Footer */}
                  <div className="px-5 py-4 bg-[#F8FAFC]/80 dark:bg-[#0B1628] border-t border-[#0B1F3A]/8 dark:border-white/8 flex flex-wrap items-center justify-between gap-3">
                    {isConfirmed ? (
                      <>
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                          <ShieldCheck className="w-4 h-4" />
                          Verified {booking.payment.webhookEventId}
                        </span>
                        <button
                          type="button"
                          disabled={downloadingId === booking.id}
                          onClick={() => handleDownload(booking)}
                          className="px-4 py-2 rounded-xl bg-[#C5A059] hover:bg-[#D8B774] text-[#070F1D] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer disabled:opacity-60"
                        >
                          <Download className="w-3.5 h-3.5" />
                          {downloadingId === booking.id ? 'Generating...' : 'Download E-Ticket (PDF)'}
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <Lock className="w-3.5 h-3.5" />
                          PDF locked until payment verified
                        </span>
                        <button
                          type="button"
                          onClick={() => onOpenVerification(booking)}
                          className="px-4 py-2 rounded-xl bg-[#0B1F3A] hover:bg-[#132E54] dark:bg-[#C5A059] dark:hover:bg-[#D8B774] text-white dark:text-[#070F1D] text-xs font-semibold uppercase tracking-wider cursor-pointer"
                        >
                          Open Verification Gate
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
