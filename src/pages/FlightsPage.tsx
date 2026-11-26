import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Award,
  Check,
  ChevronDown,
  Clock,
  Filter,
  Luggage,
  Plane,
  Server,
  SlidersHorizontal,
} from 'lucide-react';
import { FlightSearchEngine } from '../components/FlightSearchEngine';
import { useApp } from '../context/AppContext';
import type { CabinClass, Flight, FlightSearchParams, TripType } from '../types';
import { formatDuration, formatPrice } from '../utils/currency';

type StopsFilter = 'ALL' | 'NON_STOP' | 'ONE_STOP';
type SortMode = 'RECOMMENDED' | 'PRICE_ASC' | 'DURATION_ASC' | 'DEPARTURE_ASC';

export const FlightsPage: React.FC = () => {
  const {
    searchParams: ctxSearchParams,
    flights,
    isSearching,
    executeSearch,
    currency,
    setSelectedFlight,
  } = useApp();

  const [urlParams, setUrlParams] = useSearchParams();
  const navigate = useNavigate();

  // Filter states
  const [stopsFilter, setStopsFilter] = useState<StopsFilter>('ALL');
  const [airlineFilter, setAirlineFilter] = useState<string>('ALL');
  const [sortMode, setSortMode] = useState<SortMode>('RECOMMENDED');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const maxAvailablePriceUsd = useMemo(() => {
    if (flights.length === 0) return 5000;
    return Math.ceil(Math.max(...flights.map((f) => f.priceUsd)) / 50) * 50;
  }, [flights]);

  const [maxPriceUsd, setMaxPriceUsd] = useState<number>(maxAvailablePriceUsd);

  useEffect(() => {
    setMaxPriceUsd(maxAvailablePriceUsd);
  }, [maxAvailablePriceUsd]);

  // Sync URL query params -> search execution on arrival from HomePage or direct link
  useEffect(() => {
    const from = urlParams.get('from');
    const to = urlParams.get('to');
    if (!from || !to) return;

    const parsed: FlightSearchParams = {
      tripType: (urlParams.get('trip') as TripType) || 'round-trip',
      origin: from,
      destination: to,
      departureDate: urlParams.get('dep') || ctxSearchParams.departureDate,
      returnDate: urlParams.get('ret') || ctxSearchParams.returnDate,
      cabinClass: (urlParams.get('cabin') as CabinClass) || ctxSearchParams.cabinClass,
      passengers: {
        adults: Math.max(1, Number(urlParams.get('adults')) || 1),
        children: Math.max(0, Number(urlParams.get('children')) || 0),
        infants: Math.max(0, Number(urlParams.get('infants')) || 0),
      },
    };
    executeSearch(parsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlParams.toString()]);

  const handleSearchSubmit = (params: FlightSearchParams) => {
    const next = new URLSearchParams({
      trip: params.tripType,
      from: params.origin,
      to: params.destination,
      dep: params.departureDate,
      cabin: params.cabinClass,
      adults: String(params.passengers.adults),
      children: String(params.passengers.children),
      infants: String(params.passengers.infants),
    });
    if (params.returnDate) next.set('ret', params.returnDate);
    setUrlParams(next);
    executeSearch(params);
  };

  const uniqueAirlines = useMemo(() => {
    const names = Array.from(new Set(flights.map((f) => f.airline)));
    return names.sort((a, b) => (a === 'Intrega Wings' ? -1 : b === 'Intrega Wings' ? 1 : a.localeCompare(b)));
  }, [flights]);

  const totalPassengers =
    ctxSearchParams.passengers.adults +
    ctxSearchParams.passengers.children +
    ctxSearchParams.passengers.infants;

  const filteredFlights = useMemo(() => {
    let list = flights.filter((f) => f.priceUsd <= maxPriceUsd);

    if (stopsFilter === 'NON_STOP') {
      list = list.filter((f) => f.stops === 0);
    } else if (stopsFilter === 'ONE_STOP') {
      list = list.filter((f) => f.stops >= 1);
    }

    if (airlineFilter === 'INTREGA_ONLY') {
      list = list.filter((f) => f.isOfficialIntrega);
    } else if (airlineFilter !== 'ALL') {
      list = list.filter((f) => f.airline === airlineFilter);
    }

    if (sortMode === 'PRICE_ASC') {
      list.sort((a, b) => a.priceUsd - b.priceUsd);
    } else if (sortMode === 'DURATION_ASC') {
      list.sort((a, b) => a.durationMinutes - b.durationMinutes);
    } else if (sortMode === 'DEPARTURE_ASC') {
      list.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    }
    return list;
  }, [flights, maxPriceUsd, stopsFilter, airlineFilter, sortMode]);

  const handleSelectFlight = (flight: Flight) => {
    setSelectedFlight(flight);
    navigate(`/booking/${encodeURIComponent(flight.id)}`);
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Editorial Page Header */}
      <section className="bg-[#0B1F3A] dark:bg-[#070F1D] text-white pt-12 pb-28 border-b border-[#C5A059]/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D8B774]">
            International Ticketing &amp; Live GDS Inventory
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl font-medium mt-2">
            Search &amp; Compare Global Flights
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-3 max-w-2xl">
            Compare official Intrega Wings fleet departures alongside global partner airlines.
            Select any flight to proceed to dedicated seat selection and verified checkout.
          </p>
        </div>
      </section>

      {/* Search Console */}
      <FlightSearchEngine
        initialParams={ctxSearchParams}
        onSearch={handleSearchSubmit}
        isSearching={isSearching}
      />

      {/* Main Results + Sidebar Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Filter Sidebar */}
          <aside className="lg:col-span-3 rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/10 dark:border-white/10 p-5 space-y-6 lg:sticky lg:top-24">
            <div className="flex items-center justify-between border-b border-[#0B1F3A]/10 dark:border-white/10 pb-3.5">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#0B1F3A] dark:text-[#D8B774]">
                <Filter className="w-3.5 h-3.5" />
                Refine Flights
              </span>
              <button
                type="button"
                onClick={() => {
                  setStopsFilter('ALL');
                  setAirlineFilter('ALL');
                  setMaxPriceUsd(maxAvailablePriceUsd);
                }}
                className="text-[11px] font-semibold text-slate-500 hover:text-[#C5A059] cursor-pointer"
              >
                Reset
              </button>
            </div>

            {/* Stops Filter */}
            <div className="space-y-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Stops
              </p>
              <div className="flex flex-col gap-1.5">
                {(
                  [
                    { id: 'ALL', label: 'Any Number of Stops' },
                    { id: 'NON_STOP', label: 'Non-Stop Only' },
                    { id: 'ONE_STOP', label: '1 Stop Connections' },
                  ] as { id: StopsFilter; label: string }[]
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setStopsFilter(opt.id)}
                    className={`w-full px-3 py-2 rounded-lg text-left text-xs font-semibold transition-colors cursor-pointer ${
                      stopsFilter === opt.id
                        ? 'bg-[#0B1F3A] text-white dark:bg-[#C5A059] dark:text-[#070F1D]'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-[#0B1F3A]/5 dark:hover:bg-white/5'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range Slider */}
            <div className="space-y-2.5 pt-4 border-t border-[#0B1F3A]/10 dark:border-white/10">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Max Fare / Pax
                </span>
                <span className="font-bold text-[#0B1F3A] dark:text-[#D8B774] tabular-nums">
                  {formatPrice(maxPriceUsd, currency)}
                </span>
              </div>
              <input
                type="range"
                min={200}
                max={Math.max(500, maxAvailablePriceUsd)}
                step={25}
                value={maxPriceUsd}
                onChange={(e) => setMaxPriceUsd(Number(e.target.value))}
                className="w-full accent-[#C5A059] cursor-pointer"
              />
            </div>

            {/* Airline Carrier Filter */}
            <div className="space-y-2.5 pt-4 border-t border-[#0B1F3A]/10 dark:border-white/10">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Airlines
              </p>
              <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => setAirlineFilter('ALL')}
                  className={`w-full px-3 py-2 rounded-lg text-left text-xs font-semibold transition-colors cursor-pointer ${
                    airlineFilter === 'ALL'
                      ? 'bg-[#0B1F3A] text-white dark:bg-[#C5A059] dark:text-[#070F1D]'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-[#0B1F3A]/5 dark:hover:bg-white/5'
                  }`}
                >
                  All Carriers ({flights.length})
                </button>
                <button
                  type="button"
                  onClick={() => setAirlineFilter('INTREGA_ONLY')}
                  className={`w-full px-3 py-2 rounded-lg text-left text-xs font-semibold transition-colors cursor-pointer ${
                    airlineFilter === 'INTREGA_ONLY'
                      ? 'bg-[#C5A059] text-[#070F1D]'
                      : 'text-[#9E7E3E] dark:text-[#D8B774] hover:bg-[#C5A059]/10'
                  }`}
                >
                  Official Intrega Wings Only
                </button>
                {uniqueAirlines
                  .filter((name) => name !== 'Intrega Wings')
                  .map((airline) => (
                    <button
                      key={airline}
                      type="button"
                      onClick={() => setAirlineFilter(airline)}
                      className={`w-full px-3 py-2 rounded-lg text-left text-xs font-medium transition-colors cursor-pointer ${
                        airlineFilter === airline
                          ? 'bg-[#0B1F3A] text-white dark:bg-[#C5A059] dark:text-[#070F1D] font-semibold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-[#0B1F3A]/5 dark:hover:bg-white/5'
                      }`}
                    >
                      {airline}
                    </button>
                  ))}
              </div>
            </div>
          </aside>

          {/* Right Flight Results List */}
          <div className="lg:col-span-9 space-y-5">
            {/* Sort & Count Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-serif text-2xl text-[#0B1F3A] dark:text-white">
                  {flights[0]
                    ? `${flights[0].origin.city} (${flights[0].origin.code}) → ${flights[0].destination.city} (${flights[0].destination.code})`
                    : 'Available International Flights'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  Showing <strong>{filteredFlights.length}</strong> of {flights.length} departures
                  &bull; {ctxSearchParams.cabinClass} &bull; {totalPassengers} passenger
                  {totalPassengers > 1 ? 's' : ''}
                </p>
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
                  <option value="DURATION_ASC">Sort: Shortest Duration</option>
                  <option value="DEPARTURE_ASC">Sort: Earliest Departure</option>
                </select>
              </div>
            </div>

            {isSearching ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-36 rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/10 dark:border-white/10 animate-pulse"
                  />
                ))}
              </div>
            ) : filteredFlights.length === 0 ? (
              <div className="rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/10 dark:border-white/10 p-10 text-center">
                <p className="font-serif text-xl text-[#0B1F3A] dark:text-white">
                  No flights match your active filter criteria.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStopsFilter('ALL');
                    setAirlineFilter('ALL');
                    setMaxPriceUsd(maxAvailablePriceUsd);
                  }}
                  className="mt-4 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider rounded-xl bg-[#0B1F3A] text-white dark:bg-[#C5A059] dark:text-[#070F1D] cursor-pointer"
                >
                  Clear All Filters
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
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.25) }}
                      className={`rounded-2xl bg-white dark:bg-[#111C2E] transition-all overflow-hidden ${
                        flight.isOfficialIntrega
                          ? 'border border-[#C5A059]/65 dark:border-[#D8B774]/45 shadow-[0_10px_28px_-14px_rgba(197,160,89,0.28)]'
                          : 'border border-[#0B1F3A]/10 dark:border-white/10 hover:border-[#0B1F3A]/25'
                      }`}
                    >
                      {flight.isOfficialIntrega && (
                        <div className="px-5 py-2 bg-[#0B1F3A] dark:bg-[#0A1629] border-b border-[#C5A059]/30 flex flex-wrap items-center justify-between gap-2">
                          <div className="inline-flex items-center gap-2 text-[#D8B774] text-xs font-semibold tracking-[0.14em] uppercase">
                            <Award className="w-3.5 h-3.5" />
                            <span>Official Intrega Wings Flight</span>
                          </div>
                          <span className="text-[11px] text-slate-300">
                            Operated by Intrega Wings Fleet &bull; Flexible Refund &amp; Priority Baggage
                          </span>
                        </div>
                      )}

                      <div className="p-5 sm:p-6">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                          {/* Airline */}
                          <div className="md:col-span-3 flex items-center gap-3.5">
                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center font-serif font-bold text-sm shrink-0 ${
                                flight.isOfficialIntrega
                                  ? 'bg-[#0B1F3A] text-[#D8B774] border border-[#C5A059]/40'
                                  : 'bg-[#F8FAFC] dark:bg-[#070F1D] text-[#0B1F3A] dark:text-slate-200 border border-[#0B1F3A]/10 dark:border-white/10'
                              }`}
                            >
                              {flight.airlineCode}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-sm sm:text-base text-[#0B1F3A] dark:text-white truncate">
                                {flight.airline}
                              </h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                {flight.flightNumber} &bull; {flight.aircraft}
                              </p>
                            </div>
                          </div>

                          {/* Route Timeline */}
                          <div className="md:col-span-6 flex items-center justify-between gap-3">
                            <div>
                              <p className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] dark:text-white tabular-nums">
                                {flight.departureTime}
                              </p>
                              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                {flight.origin.code} &bull; {flight.origin.city}
                              </p>
                            </div>

                            <div className="flex-1 flex flex-col items-center px-2">
                              <span className="text-[11px] font-medium text-slate-500 inline-flex items-center gap-1 tabular-nums">
                                <Clock className="w-3 h-3 text-[#C5A059]" />
                                {formatDuration(flight.durationMinutes)}
                              </span>
                              <div className="w-full flex items-center gap-1 my-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#0B1F3A] dark:bg-[#D8B774]" />
                                <div className="flex-1 h-[1.5px] bg-[#0B1F3A]/20 dark:bg-white/20 relative">
                                  <Plane className="w-3.5 h-3.5 text-[#C5A059] absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-[#111C2E] px-0.5" />
                                </div>
                                <span className="w-1.5 h-1.5 rounded-full border-2 border-[#0B1F3A] dark:border-[#D8B774]" />
                              </div>
                              <span
                                className={`text-[11px] font-semibold ${
                                  flight.stops === 0
                                    ? 'text-emerald-700 dark:text-emerald-400'
                                    : 'text-amber-700 dark:text-amber-400'
                                }`}
                              >
                                {flight.stops === 0 ? 'Non-Stop' : `1 Stop (${flight.stopoverCity})`}
                              </span>
                            </div>

                            <div className="text-right">
                              <p className="font-display text-xl sm:text-2xl font-bold text-[#0B1F3A] dark:text-white tabular-nums">
                                {flight.arrivalTime}
                                {flight.nextDayArrival && (
                                  <sup className="text-[10px] font-semibold text-[#C5A059] ml-0.5">
                                    +1
                                  </sup>
                                )}
                              </p>
                              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                                {flight.destination.code} &bull; {flight.destination.city}
                              </p>
                            </div>
                          </div>

                          {/* Fare & Book */}
                          <div className="md:col-span-3 flex md:flex-col items-center md:items-end justify-between gap-2 pt-3 md:pt-0 border-t md:border-t-0 md:border-l border-[#0B1F3A]/10 dark:border-white/10 md:pl-5">
                            <div className="md:text-right">
                              <p className="text-[10px] uppercase tracking-wider text-slate-500">
                                {totalPassengers > 1 ? `Total (${totalPassengers} pax)` : flight.cabinClass}
                              </p>
                              <p className="font-display text-2xl font-bold text-[#0B1F3A] dark:text-white tabular-nums">
                                {formatPrice(totalFareUsd, currency)}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setExpandedId(isExpanded ? null : flight.id)}
                                aria-label="Toggle flight details"
                                className="p-2 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:border-[#C5A059] cursor-pointer"
                              >
                                <ChevronDown
                                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                />
                              </button>
                              <button
                                id={`book-flight-${flight.flightNumber}`}
                                type="button"
                                onClick={() => handleSelectFlight(flight)}
                                className={`px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                                  flight.isOfficialIntrega
                                    ? 'bg-[#C5A059] hover:bg-[#D8B774] text-[#070F1D]'
                                    : 'bg-[#0B1F3A] hover:bg-[#132E54] dark:bg-white dark:hover:bg-slate-200 text-white dark:text-[#070F1D]'
                                }`}
                              >
                                Book Flight
                              </button>
                            </div>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-5 pt-5 border-t border-[#0B1F3A]/10 dark:border-white/10 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                                <div className="space-y-1">
                                  <p className="font-semibold uppercase tracking-wider text-slate-500">
                                    Terminals &amp; Baggage
                                  </p>
                                  <p className="text-[#0B1F3A] dark:text-slate-200">
                                    Dep: {flight.origin.name} ({flight.terminalDep})
                                  </p>
                                  <p className="text-[#0B1F3A] dark:text-slate-200">
                                    Arr: {flight.destination.name} ({flight.terminalArr})
                                  </p>
                                  <p className="inline-flex items-center gap-1.5 text-[#9E7E3E] dark:text-[#D8B774] font-medium pt-1">
                                    <Luggage className="w-3.5 h-3.5" />
                                    {flight.baggageAllowance}
                                  </p>
                                </div>
                                <div className="space-y-1">
                                  <p className="font-semibold uppercase tracking-wider text-slate-500">
                                    Amenities
                                  </p>
                                  {flight.amenities.map((a) => (
                                    <p key={a} className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                                      <Check className="w-3.5 h-3.5 text-[#C5A059]" />
                                      {a}
                                    </p>
                                  ))}
                                </div>
                                <div className="space-y-1">
                                  <p className="font-semibold uppercase tracking-wider text-slate-500">
                                    Source Feed
                                  </p>
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#F8FAFC] dark:bg-[#070F1D] border border-[#0B1F3A]/10 dark:border-white/10 text-slate-600 dark:text-slate-300">
                                    <Server className="w-3.5 h-3.5 text-[#C5A059]" />
                                    {flight.source === 'INTREGA_FLEET'
                                      ? 'Intrega Wings Fleet Config'
                                      : 'External Global GDS API'}
                                  </span>
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
          </div>
        </div>
      </section>
    </div>
  );
};
