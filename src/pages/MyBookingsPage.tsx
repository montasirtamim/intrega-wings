import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Clock,
  Download,
  Lock,
  Plane,
  ShieldCheck,
  Ticket,
  XCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Booking } from '../types';
import { formatPrice } from '../utils/currency';
import { generateETicketPdf } from '../utils/pdfGenerator';

type StatusTab = 'ALL' | 'CONFIRMED' | 'PENDING_VERIFICATION' | 'CANCELLED';

export const MyBookingsPage: React.FC = () => {
  const { bookings, currency, cancelBooking, user } = useApp();
  const [activeTab, setActiveTab] = useState<StatusTab>('ALL');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);
  const navigate = useNavigate();

  const counts = useMemo(
    () => ({
      ALL: bookings.length,
      CONFIRMED: bookings.filter((b) => b.status === 'CONFIRMED').length,
      PENDING_VERIFICATION: bookings.filter((b) => b.status === 'PENDING_VERIFICATION').length,
      CANCELLED: bookings.filter((b) => b.status === 'CANCELLED').length,
    }),
    [bookings]
  );

  const visibleBookings = useMemo(() => {
    if (activeTab === 'ALL') return bookings;
    return bookings.filter((b) => b.status === activeTab);
  }, [bookings, activeTab]);

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
    <div className="min-h-screen pb-20">
      {/* Page Header */}
      <section className="bg-[#0B1F3A] dark:bg-[#070F1D] text-white pt-12 pb-14 border-b border-[#C5A059]/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D8B774]">
              Passenger Ledger &amp; E-Ticket Vault
            </p>
            <h1 className="font-serif text-3xl sm:text-5xl font-medium mt-2">
              My Bookings
            </h1>
            <p className="text-sm sm:text-base text-slate-300 mt-2 max-w-2xl">
              {user
                ? `Welcome back, ${user.fullName}. Track payment verification status, manage reservations, and download verified PDF E-Tickets.`
                : 'Track payment verification status, manage reservations, and download verified PDF E-Tickets.'}
            </p>
          </div>

          <Link
            to="/flights"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#C5A059] hover:bg-[#D8B774] text-[#070F1D] text-xs font-bold uppercase tracking-wider shrink-0 transition-colors"
          >
            <Plane className="w-4 h-4" />
            Book New Flight
          </Link>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 space-y-8">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: 'ALL', label: `All Bookings (${counts.ALL})` },
              { id: 'CONFIRMED', label: `Confirmed (${counts.CONFIRMED})` },
              { id: 'PENDING_VERIFICATION', label: `Pending Verification (${counts.PENDING_VERIFICATION})` },
              { id: 'CANCELLED', label: `Past / Cancelled (${counts.CANCELLED})` },
            ] as { id: StatusTab; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#0B1F3A] text-white dark:bg-[#C5A059] dark:text-[#070F1D]'
                  : 'bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/12 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-[#C5A059]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bookings Grid */}
        {visibleBookings.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/10 dark:border-white/10 p-14 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#0B1F3A]/6 dark:bg-[#D8B774]/10 text-[#9E7E3E] dark:text-[#D8B774] flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-7 h-7" />
            </div>
            <h2 className="font-serif text-2xl text-[#0B1F3A] dark:text-white">
              No Reservations Found
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-md mx-auto">
              Search our international flights and book with Binance Pay or crypto to see your
              reservations and downloadable PDF E-Tickets here.
            </p>
            <Link
              to="/flights"
              className="inline-flex items-center gap-2 mt-6 px-6 py-3 rounded-xl bg-[#0B1F3A] dark:bg-[#C5A059] text-white dark:text-[#070F1D] text-xs font-bold uppercase tracking-wider"
            >
              <Plane className="w-4 h-4" />
              Search Flights
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {visibleBookings.map((booking) => {
              const isConfirmed = booking.status === 'CONFIRMED';
              const isPending = booking.status === 'PENDING_VERIFICATION';
              const isCancelled = booking.status === 'CANCELLED';

              return (
                <motion.article
                  key={booking.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/12 dark:border-white/10 overflow-hidden shadow-sm flex flex-col justify-between"
                >
                  {/* Top Status Banner */}
                  <div
                    className={`px-5 py-3 flex items-center justify-between text-xs font-semibold border-b ${
                      isConfirmed
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                        : isPending
                          ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300'
                          : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    <span className="inline-flex items-center gap-1.5 uppercase tracking-wider">
                      {isConfirmed ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isPending ? (
                        <Clock className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}
                      {booking.status}
                    </span>
                    <span className="font-mono font-bold">PNR: {booking.pnr}</span>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-5">
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
                        <p className="font-display text-xl font-bold text-[#0B1F3A] dark:text-white tabular-nums">
                          {formatPrice(booking.totalPriceUsd, currency)}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          Seat {booking.seatNumber} &bull; {booking.flight.cabinClass}
                        </p>
                      </div>
                    </div>

                    {/* Live 3-Stage Status Tracker */}
                    {!isCancelled && (
                      <div className="grid grid-cols-3 gap-2 text-[10px] font-semibold uppercase tracking-wider">
                        <div className="space-y-1">
                          <div className="h-1.5 rounded-full bg-emerald-500" />
                          <span className="text-emerald-700 dark:text-emerald-400">1. Reserved</span>
                        </div>
                        <div className="space-y-1">
                          <div
                            className={`h-1.5 rounded-full ${
                              isConfirmed ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'
                            }`}
                          />
                          <span
                            className={
                              isConfirmed
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : 'text-amber-600 dark:text-amber-300'
                            }
                          >
                            2. Verification
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div
                            className={`h-1.5 rounded-full ${
                              isConfirmed ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
                            }`}
                          />
                          <span
                            className={
                              isConfirmed ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-400'
                            }
                          >
                            3. E-Ticket Issued
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#070F1D] border border-[#0B1F3A]/8 dark:border-white/8 text-xs">
                      <div>
                        <p className="text-slate-500">Passenger</p>
                        <p className="font-semibold text-[#0B1F3A] dark:text-white mt-0.5">
                          {booking.primaryPassenger.firstName} {booking.primaryPassenger.lastName}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-500">
                          Payment ({booking.payment.method.replace('_', ' ')})
                        </p>
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
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                            <ShieldCheck className="w-4 h-4" />
                            Verified
                          </span>
                          {confirmCancelId === booking.id ? (
                            <button
                              type="button"
                              onClick={() => {
                                cancelBooking(booking.id);
                                setConfirmCancelId(null);
                              }}
                              className="text-xs font-bold text-red-600 dark:text-red-400 underline cursor-pointer"
                            >
                              Confirm Cancel?
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmCancelId(booking.id)}
                              className="text-xs font-medium text-slate-500 hover:text-red-500 cursor-pointer"
                            >
                              Cancel Trip
                            </button>
                          )}
                        </div>
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
                    ) : isPending ? (
                      <>
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                            <Lock className="w-3.5 h-3.5" />
                            PDF Locked
                          </span>
                          <button
                            type="button"
                            onClick={() => cancelBooking(booking.id)}
                            className="text-xs font-medium text-slate-500 hover:text-red-500 cursor-pointer"
                          >
                            Cancel Hold
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => navigate(`/booking?verifyBookingId=${booking.id}`)}
                          className="px-4 py-2 rounded-xl bg-[#0B1F3A] hover:bg-[#132E54] dark:bg-[#C5A059] dark:hover:bg-[#D8B774] text-white dark:text-[#070F1D] text-xs font-semibold uppercase tracking-wider cursor-pointer"
                        >
                          Verify Payment
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-500">
                        Cancelled on{' '}
                        {new Date(booking.cancelledAt || booking.createdAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
