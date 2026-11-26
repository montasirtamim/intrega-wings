import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Award,
  Check,
  ChevronDown,
  Clock,
  Luggage,
  Plane,
  Server,
  SlidersHorizontal,
} from 'lucide-react';
import type { CurrencyCode, Flight, FlightSearchParams } from '../types';
import { formatDuration, formatPrice } from '../utils/currency';

interface FlightResultsProps {
  flights: Flight[];
  searchParams: FlightSearchParams;
  currency: CurrencyCode;
  isLoading: boolean;
  onSelectFlight: (flight: Flight) => void;
}

type FilterMode = 'ALL' | 'INTREGA_ONLY' | 'NON_STOP';
type SortMode = 'RECOMMENDED' | 'PRICE_ASC' | 'DURATION_ASC' | 'DEPARTURE_ASC';

export const FlightResults: React.FC<FlightResultsProps> = ({
  flights,
  searchParams,
  currency,
  isLoading,
  onSelectFlight,
}) => {
  const [filterMode, setFilterMode] = useState<FilterMode>('ALL');
  const [sortMode, setSortMode] = useState<SortMode>('RECOMMENDED');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalPassengers =
    searchParams.passengers.adults +
    searchParams.passengers.children +
    searchParams.passengers.infants;

  const filteredFlights = useMemo(() => {
    let list = [...flights];
    if (filterMode === 'INTREGA_ONLY') {
      list = list.filter((f) => f.isOfficialIntrega);
    } else if (filterMode === 'NON_STOP') {
      list = list.filter((f) => f.stops === 0);
    }

    if (sortMode === 'PRICE_ASC') {
      list.sort((a, b) => a.priceUsd - b.priceUsd);
    } else if (sortMode === 'DURATION_ASC') {
      list.sort((a, b) => a.durationMinutes - b.durationMinutes);
    } else if (sortMode === 'DEPARTURE_ASC') {
      list.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    }
    return list;
  }, [flights, filterMode, sortMode]);

  const intregaCount = flights.filter((f) => f.isOfficialIntrega).length;
  const partnerCount = flights.length - intregaCount;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
      {/* Results Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9E7E3E] dark:text-[#D8B774]">
            Live International Availability
          </p>
          <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#0B1F3A] dark:text-white mt-1.5">
            {flights[0]
              ? `${flights[0].origin.city} (${flights[0].origin.code}) to ${flights[0].destination.city} (${flights[0].destination.code})`
              : 'Available International Flights'}
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Showing <strong className="text-[#0B1F3A] dark:text-white">{intregaCount}</strong>{' '}
            Official Intrega Wings Fleet departures &amp;{' '}
            <strong className="text-[#0B1F3A] dark:text-white">{partnerCount}</strong> Global
            Partner Airline offers ({searchParams.cabinClass}, {totalPassengers} passenger
            {totalPassengers > 1 ? 's' : ''}).
          </p>
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-xl bg-white dark:bg-[#111C2E] p-1 border border-[#0B1F3A]/12 dark:border-white/10">
            {(
              [
                { id: 'ALL', label: `All (${flights.length})` },
                { id: 'INTREGA_ONLY', label: `Intrega Wings (${intregaCount})` },
                { id: 'NON_STOP', label: 'Non-Stop' },
              ] as { id: FilterMode; label: string }[]
            ).map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setFilterMode(btn.id)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  filterMode === btn.id
                    ? 'bg-[#0B1F3A] text-white dark:bg-[#C5A059] dark:text-[#070F1D]'
                    : 'text-slate-600 dark:text-slate-300 hover:text-[#0B1F3A] dark:hover:text-white'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          <div className="relative flex items-center">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#C5A059] absolute left-3 pointer-events-none" />
            <select
              aria-label="Sort flights"
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="pl-8 pr-3 py-2 text-xs font-semibold rounded-xl border border-[#0B1F3A]/12 dark:border-white/10 bg-white dark:bg-[#111C2E] text-[#0B1F3A] dark:text-white focus:outline-none focus:border-[#C5A059] cursor-pointer"
            >
              <option value="RECOMMENDED">Sort: Recommended</option>
              <option value="PRICE_ASC">Sort: Lowest Fare</option>
              <option value="DURATION_ASC">Sort: Shortest Flight</option>
              <option value="DEPARTURE_ASC">Sort: Earliest Departure</option>
            </select>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/10 dark:border-white/10 animate-pulse p-6"
            />
          ))}
        </div>
      ) : filteredFlights.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/10 dark:border-white/10 p-10 text-center">
          <p className="font-serif text-xl text-[#0B1F3A] dark:text-white">
            No flights match the active filter.
          </p>
          <button
            type="button"
            onClick={() => setFilterMode('ALL')}
            className="mt-4 px-4 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg bg-[#0B1F3A] text-white dark:bg-[#C5A059] dark:text-[#070F1D] cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFlights.map((flight, index) => {
            const isExpanded = expandedId === flight.id;
            const totalFareUsd = flight.priceUsd * totalPassengers;

            return (
              <motion.article
                key={flight.id}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: Math.min(index * 0.05, 0.3) }}
                className={`rounded-2xl bg-white dark:bg-[#111C2E] transition-all overflow-hidden ${
                  flight.isOfficialIntrega
                    ? 'border border-[#C5A059]/60 dark:border-[#D8B774]/45 shadow-[0_10px_30px_-14px_rgba(197,160,89,0.28)]'
                    : 'border border-[#0B1F3A]/10 dark:border-white/10 hover:border-[#0B1F3A]/25 dark:hover:border-white/20'
                }`}
              >
                {/* Official Intrega Wings Top Accent Ribbon */}
                {flight.isOfficialIntrega && (
                  <div className="px-5 py-2 bg-[#0B1F3A] dark:bg-[#0A1629] border-b border-[#C5A059]/30 flex flex-wrap items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-2 text-[#D8B774] text-xs font-semibold tracking-[0.14em] uppercase">
                      <Award className="w-3.5 h-3.5" />
                      <span>Official Intrega Wings Flight</span>
                    </div>
                    <span className="text-[11px] text-slate-300 tracking-wide">
                      Operated by Intrega Wings Fleet &bull; Priority Baggage &amp; Flexible Refund
                    </span>
                  </div>
                )}

                <div className="p-5 sm:p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                    {/* Airline Identity */}
                    <div className="lg:col-span-3 flex items-center gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center font-serif font-bold text-base shrink-0 ${
                          flight.isOfficialIntrega
                            ? 'bg-[#0B1F3A] text-[#D8B774] border border-[#C5A059]/40'
                            : 'bg-[#F8FAFC] dark:bg-[#070F1D] text-[#0B1F3A] dark:text-slate-200 border border-[#0B1F3A]/10 dark:border-white/10'
                        }`}
                      >
                        {flight.airlineCode}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-base text-[#0B1F3A] dark:text-white truncate">
                          {flight.airline}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {flight.flightNumber} &bull; {flight.aircraft}
                        </p>
                      </div>
                    </div>

                    {/* Flight Timeline */}
                    <div className="lg:col-span-6 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-display text-2xl font-bold text-[#0B1F3A] dark:text-white tabular-nums">
                          {flight.departureTime}
                        </p>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                          {flight.origin.code} &bull; {flight.origin.city}
                        </p>
                      </div>

                      <div className="flex-1 flex flex-col items-center px-2">
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 inline-flex items-center gap-1 tabular-nums">
                          <Clock className="w-3 h-3 text-[#C5A059]" />
                          {formatDuration(flight.durationMinutes)}
                        </span>
                        <div className="w-full flex items-center gap-1.5 my-2">
                          <span className="w-2 h-2 rounded-full bg-[#0B1F3A] dark:bg-[#D8B774]" />
                          <div className="flex-1 h-[1.5px] bg-[#0B1F3A]/20 dark:bg-white/20 relative">
                            <Plane className="w-3.5 h-3.5 text-[#C5A059] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#111C2E] px-0.5" />
                          </div>
                          <span className="w-2 h-2 rounded-full border-2 border-[#0B1F3A] dark:border-[#D8B774]" />
                        </div>
                        <span
                          className={`text-[11px] font-semibold ${
                            flight.stops === 0
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          {flight.stops === 0 ? 'Non-Stop' : `1 Stop via ${flight.stopoverCity}`}
                        </span>
                      </div>

                      <div className="text-right">
                        <p className="font-display text-2xl font-bold text-[#0B1F3A] dark:text-white tabular-nums">
                          {flight.arrivalTime}
                          {flight.nextDayArrival && (
                            <sup className="text-[10px] font-semibold text-[#C5A059] ml-0.5">+1</sup>
                          )}
                        </p>
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                          {flight.destination.code} &bull; {flight.destination.city}
                        </p>
                      </div>
                    </div>

                    {/* Fare & Book Action */}
                    <div className="lg:col-span-3 flex lg:flex-col items-center lg:items-end justify-between gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 lg:border-l border-[#0B1F3A]/10 dark:border-white/10 lg:pl-6">
                      <div className="lg:text-right">
                        <p className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          {totalPassengers > 1
                            ? `Total (${totalPassengers} pax)`
                            : `${flight.cabinClass} Fare`}
                        </p>
                        <p className="font-display text-2xl font-bold text-[#0B1F3A] dark:text-white tabular-nums">
                          {formatPrice(totalFareUsd, currency)}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {flight.seatsAvailable} seats left
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setExpandedId(isExpanded ? null : flight.id)}
                          aria-label="Toggle flight details"
                          className="p-2.5 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:border-[#C5A059] transition-colors cursor-pointer"
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </button>
                        <button
                          id={`select-flight-${flight.flightNumber}`}
                          type="button"
                          onClick={() => onSelectFlight(flight)}
                          className={`px-5 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                            flight.isOfficialIntrega
                              ? 'bg-[#C5A059] hover:bg-[#D8B774] text-[#070F1D]'
                              : 'bg-[#0B1F3A] hover:bg-[#132E54] dark:bg-white dark:hover:bg-slate-200 text-white dark:text-[#070F1D]'
                          }`}
                        >
                          Select Flight
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Fare & Architecture Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-5 pt-5 border-t border-[#0B1F3A]/10 dark:border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                          <div className="space-y-1.5">
                            <p className="font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              Terminals &amp; Baggage
                            </p>
                            <p className="text-[#0B1F3A] dark:text-slate-200">
                              Departure: {flight.origin.name} ({flight.terminalDep})
                            </p>
                            <p className="text-[#0B1F3A] dark:text-slate-200">
                              Arrival: {flight.destination.name} ({flight.terminalArr})
                            </p>
                            <p className="inline-flex items-center gap-1.5 text-[#9E7E3E] dark:text-[#D8B774] font-medium pt-1">
                              <Luggage className="w-3.5 h-3.5" />
                              {flight.baggageAllowance}
                            </p>
                          </div>

                          <div className="space-y-1.5">
                            <p className="font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              Onboard Experience
                            </p>
                            <ul className="space-y-1">
                              {flight.amenities.map((a) => (
                                <li
                                  key={a}
                                  className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300"
                                >
                                  <Check className="w-3.5 h-3.5 text-[#C5A059]" />
                                  {a}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="space-y-1.5">
                            <p className="font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              Inventory Source
                            </p>
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F8FAFC] dark:bg-[#070F1D] border border-[#0B1F3A]/10 dark:border-white/10 text-slate-600 dark:text-slate-300">
                              <Server className="w-3.5 h-3.5 text-[#C5A059]" />
                              <span>
                                {flight.source === 'INTREGA_FLEET'
                                  ? 'Direct Intrega Wings Fleet Config'
                                  : 'External Global GDS API Bridge'}
                              </span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 pt-1">
                              {flight.refundable
                                ? 'Flexible ticket — refundable prior to departure.'
                                : 'Standard fare — date change available with fee.'}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </section>
  );
};
