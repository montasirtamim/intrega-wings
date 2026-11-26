import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  Check,
  Code2,
  ExternalLink,
  MapPin,
  Sparkles,
  Star,
  Users,
  X,
} from 'lucide-react';
import {
  buildOfficialPartnerDeepLink,
  buildPartnerApiHandoffPayload,
  getMergedTouristSpots,
} from '../data/touristSpots';
import type { CurrencyCode, TouristSpot } from '../types';
import { formatPrice } from '../utils/currency';

interface TouristSpotsSectionProps {
  currency: CurrencyCode;
}

const CATEGORIES = [
  'All',
  'Bangladesh',
  'Theme Park',
  'Landmark',
  'Nature & Culture',
  'Coastal Heritage',
] as const;

export const TouristSpotsSection: React.FC<TouristSpotsSectionProps> = ({ currency }) => {
  const [activeCategory, setActiveCategory] = useState<(typeof CATEGORIES)[number]>('All');
  const [selectedSpot, setSelectedSpot] = useState<TouristSpot | null>(null);
  const [visitDate, setVisitDate] = useState('2026-12-18');
  const [guests, setGuests] = useState(2);
  const [packageId, setPackageId] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [showDevPayload, setShowDevPayload] = useState(false);
  const [handoffTriggered, setHandoffTriggered] = useState(false);

  const allSpots = useMemo(() => getMergedTouristSpots(), []);

  const visibleSpots = useMemo(() => {
    if (activeCategory === 'All') return allSpots;
    if (activeCategory === 'Bangladesh') {
      return allSpots.filter((s) => s.country === 'Bangladesh');
    }
    return allSpots.filter((s) => s.category === activeCategory);
  }, [activeCategory, allSpots]);

  const openSpotModal = (spot: TouristSpot) => {
    setSelectedSpot(spot);
    setPackageId(spot.packages[0].id);
    setGuests(2);
    setShowDevPayload(false);
    setHandoffTriggered(false);
  };

  const activePackage = useMemo(() => {
    if (!selectedSpot) return null;
    return selectedSpot.packages.find((p) => p.id === packageId) || selectedSpot.packages[0];
  }, [selectedSpot, packageId]);

  const officialDeepLink = useMemo(() => {
    if (!selectedSpot || !activePackage) return '';
    return buildOfficialPartnerDeepLink(selectedSpot, {
      visitDate,
      guests,
      packageId: activePackage.id,
      guestEmail: guestEmail.trim() || undefined,
    });
  }, [selectedSpot, activePackage, visitDate, guests, guestEmail]);

  const apiPayloadPreview = useMemo(() => {
    if (!selectedSpot || !activePackage) return '';
    return JSON.stringify(
      buildPartnerApiHandoffPayload(selectedSpot, {
        visitDate,
        guests,
        packageId: activePackage.id,
        guestEmail: guestEmail.trim() || undefined,
      }),
      null,
      2
    );
  }, [selectedSpot, activePackage, visitDate, guests, guestEmail]);

  return (
    <section id="tourist-spots" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Heading */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9E7E3E] dark:text-[#D8B774]">
            Direct-to-Official Partner Access
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#0B1F3A] dark:text-white mt-2">
            Curated International Destinations
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
            Pair your flight with official dated admission to the world’s most sought-after
            landmarks and resorts. Every reservation routes directly to the official provider’s
            booking portal with your itinerary pre-filled.
          </p>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeCategory === cat
                  ? 'bg-[#0B1F3A] text-white dark:bg-[#C5A059] dark:text-[#070F1D]'
                  : 'bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/12 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:border-[#C5A059]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Editorial Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {visibleSpots.map((spot, idx) => (
          <motion.article
            key={spot.id}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.45, delay: idx * 0.06 }}
            className="group rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/10 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#C5A059]/60 transition-all duration-300 flex flex-col"
          >
            {/* Destination Photograph */}
            <div className="relative h-56 overflow-hidden bg-[#0B1F3A]">
              <img
                src={spot.imageUrl}
                alt={`${spot.name} in ${spot.city}, ${spot.country}`}
                loading="lazy"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070F1D]/80 via-[#070F1D]/15 to-transparent" />

              <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-[#0B1F3A]/85 backdrop-blur-sm text-[10px] font-semibold uppercase tracking-wider text-[#D8B774] border border-[#C5A059]/30">
                  {spot.category}
                </span>
              </div>

              <div className="absolute top-3.5 right-3.5">
                <span className="px-2.5 py-1 rounded-md bg-white/95 dark:bg-[#070F1D]/90 text-[10px] font-bold uppercase tracking-wider text-[#0B1F3A] dark:text-emerald-300">
                  {spot.availability}
                </span>
              </div>

              <div className="absolute bottom-3.5 left-4 right-4 flex items-end justify-between text-white">
                <div className="flex items-center gap-1.5 text-xs font-medium text-slate-200">
                  <MapPin className="w-3.5 h-3.5 text-[#D8B774]" />
                  <span>
                    {spot.city}, {spot.country} ({spot.nearestAirportCode})
                  </span>
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-semibold">
                  <Star className="w-3.5 h-3.5 fill-[#C5A059] text-[#C5A059]" />
                  <span>{spot.rating}</span>
                </div>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
              <div>
                <h3 className="font-serif text-xl font-medium text-[#0B1F3A] dark:text-white group-hover:text-[#9E7E3E] dark:group-hover:text-[#D8B774] transition-colors">
                  {spot.name}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                  {spot.summary}
                </p>

                <ul className="mt-4 space-y-1.5">
                  {spot.highlights.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300"
                    >
                      <Check className="w-3.5 h-3.5 text-[#C5A059] shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-4 border-t border-[#0B1F3A]/10 dark:border-white/10 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Official From
                  </p>
                  <p className="font-display text-xl font-bold text-[#0B1F3A] dark:text-white tabular-nums">
                    {formatPrice(spot.basePriceUsd, currency)}
                    <span className="text-xs font-normal text-slate-500"> / guest</span>
                  </p>
                </div>

                <button
                  id={`book-spot-${spot.id}`}
                  type="button"
                  onClick={() => openSpotModal(spot)}
                  className="px-4 py-2.5 rounded-xl bg-[#0B1F3A] hover:bg-[#132E54] dark:bg-[#C5A059] dark:hover:bg-[#D8B774] text-white dark:text-[#070F1D] text-xs font-semibold uppercase tracking-wider inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span>Reserve Official</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {/* Direct-to-Official Booking Handoff Modal */}
      <AnimatePresence>
        {selectedSpot && activePackage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#070F1D]/75 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="spot-handoff-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-2xl rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/15 dark:border-[#D8B774]/25 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
            >
              {/* Header */}
              <div className="px-6 py-4 bg-[#0B1F3A] text-white flex items-center justify-between border-b border-[#C5A059]/30 shrink-0">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#D8B774] font-semibold">
                    Direct Partner Handoff &bull; {selectedSpot.officialProviderName}
                  </p>
                  <h3 id="spot-handoff-title" className="font-serif text-xl mt-0.5">
                    {selectedSpot.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedSpot(null)}
                  aria-label="Close modal"
                  className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-5">
                {/* Date & Guest Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Visit Date
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-[#C5A059] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="date"
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-sm text-[#0B1F3A] dark:text-white focus:outline-none focus:border-[#C5A059]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Guests
                    </label>
                    <div className="relative">
                      <Users className="w-4 h-4 text-[#C5A059] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-sm text-[#0B1F3A] dark:text-white focus:outline-none focus:border-[#C5A059]"
                      >
                        {[1, 2, 3, 4, 5, 6, 8].map((n) => (
                          <option key={n} value={n}>
                            {n} Guest{n > 1 ? 's' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                      Pre-fill Email (Optional)
                    </label>
                    <input
                      type="email"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      placeholder="guest@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-sm text-[#0B1F3A] dark:text-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>

                {/* Package Selector */}
                <div className="space-y-2.5">
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Select Official Admission Package
                  </p>
                  {selectedSpot.packages.map((pkg) => {
                    const isSelected = pkg.id === activePackage.id;
                    return (
                      <button
                        key={pkg.id}
                        type="button"
                        onClick={() => setPackageId(pkg.id)}
                        className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between gap-4 cursor-pointer ${
                          isSelected
                            ? 'border-[#C5A059] bg-[#C5A059]/10'
                            : 'border-[#0B1F3A]/12 dark:border-white/10 hover:border-[#C5A059]/50'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#0B1F3A] dark:text-white">
                            {pkg.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                            {pkg.perks.join(' • ')}
                          </p>
                        </div>
                        <p className="font-display font-bold text-base text-[#0B1F3A] dark:text-[#D8B774] tabular-nums shrink-0">
                          {formatPrice(pkg.priceUsd, currency)}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Pre-filled Deep-Link Preview */}
                <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#070F1D] border border-[#0B1F3A]/10 dark:border-white/10 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#9E7E3E] dark:text-[#D8B774]">
                      <Sparkles className="w-3.5 h-3.5" />
                      Pre-Filled Official Booking URL
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowDevPayload((prev) => !prev)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-[#0B1F3A] dark:hover:text-white cursor-pointer"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      {showDevPayload ? 'Hide Partner API Hook' : 'Inspect Partner API Hook'}
                    </button>
                  </div>
                  <p className="text-[11px] font-mono text-slate-600 dark:text-slate-400 break-all">
                    {officialDeepLink}
                  </p>

                  {showDevPayload && (
                    <pre className="mt-3 p-3 rounded-lg bg-[#0B1F3A] text-[#D8B774] text-[11px] font-mono overflow-x-auto leading-relaxed">
                      {apiPayloadPreview}
                    </pre>
                  )}
                </div>

                {handoffTriggered && (
                  <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>
                      Official partner portal opened with your pre-filled date ({visitDate}) and{' '}
                      {guests} guest(s). Complete checkout directly on{' '}
                      <strong>{selectedSpot.officialProviderName}</strong>.
                    </span>
                  </div>
                )}

                {/* Footer Total & Launch CTA */}
                <div className="pt-3 border-t border-[#0B1F3A]/10 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Estimated Official Total ({guests} guest{guests > 1 ? 's' : ''})
                    </p>
                    <p className="font-display text-2xl font-bold text-[#0B1F3A] dark:text-white tabular-nums">
                      {formatPrice(activePackage.priceUsd * guests, currency)}
                    </p>
                  </div>

                  <a
                    href={officialDeepLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setHandoffTriggered(true)}
                    className="px-6 py-3 rounded-xl bg-[#0B1F3A] hover:bg-[#132E54] dark:bg-[#C5A059] dark:hover:bg-[#D8B774] text-white dark:text-[#070F1D] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shadow-lg transition-colors"
                  >
                    <span>Continue to Official Portal</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
