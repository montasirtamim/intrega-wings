import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeftRight,
  Calendar,
  ChevronDown,
  MapPin,
  Minus,
  PlaneTakeoff,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { getAirportByCode, searchAirports } from '../data/airports';
import type { CabinClass, FlightSearchParams, MultiCityLeg, TripType } from '../types';

interface FlightSearchEngineProps {
  initialParams: FlightSearchParams;
  onSearch: (params: FlightSearchParams) => void;
  isSearching: boolean;
}

interface AirportPickerProps {
  id: string;
  label: string;
  value: string;
  onChange: (code: string) => void;
}

const AirportPicker: React.FC<AirportPickerProps> = ({ id, label, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const selected = getAirportByCode(value);
  const matches = searchAirports(query).slice(0, 30);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <label
        htmlFor={id}
        className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 mb-1.5"
      >
        {label}
      </label>
      <button
        id={id}
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          setQuery('');
        }}
        className="w-full text-left px-3.5 py-3 rounded-xl border border-[#0B1F3A]/15 dark:border-[#D8B774]/20 bg-[#F8FAFC] dark:bg-[#0B1628] hover:border-[#C5A059] transition-colors flex items-center justify-between gap-2 cursor-pointer"
      >
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold text-lg text-[#0B1F3A] dark:text-white tracking-tight">
              {selected.code}
            </span>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">
              {selected.city}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
            {selected.country} &bull; {selected.name}
          </p>
        </div>
        <MapPin className="w-4 h-4 text-[#C5A059] shrink-0" />
      </button>

      {open && (
        <div className="absolute left-0 right-0 mt-2 z-50 rounded-xl border border-[#0B1F3A]/15 dark:border-[#D8B774]/25 bg-white dark:bg-[#111C2E] shadow-2xl overflow-hidden">
          <div className="p-2.5 border-b border-[#0B1F3A]/10 dark:border-white/10">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search city, country, or IATA code..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-[#F8FAFC] dark:bg-[#070F1D] border border-[#0B1F3A]/10 dark:border-white/10 text-[#0B1F3A] dark:text-white focus:outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>
          <ul className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
            {matches.length === 0 ? (
              <li className="px-4 py-4 text-sm text-slate-500 text-center">
                No matching international airports found.
              </li>
            ) : (
              matches.map((airport) => (
                <li key={airport.code}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(airport.code);
                      setOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left flex items-center justify-between gap-3 hover:bg-[#0B1F3A]/5 dark:hover:bg-white/5 transition-colors cursor-pointer ${
                      airport.code === value ? 'bg-[#C5A059]/10' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#0B1F3A] dark:text-white truncate">
                        {airport.city}, {airport.country}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {airport.name}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 text-xs font-bold tracking-wider rounded bg-[#0B1F3A]/8 dark:bg-[#D8B774]/15 text-[#0B1F3A] dark:text-[#D8B774] shrink-0">
                      {airport.code}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

const POPULAR_ROUTES = [
  { origin: 'DAC', destination: 'DXB', label: 'Dhaka → Dubai' },
  { origin: 'LHR', destination: 'DAC', label: 'London → Dhaka' },
  { origin: 'DAC', destination: 'CXB', label: "Dhaka → Cox's Bazar" },
  { origin: 'DAC', destination: 'SIN', label: 'Dhaka → Singapore' },
  { origin: 'LHR', destination: 'DXB', label: 'London → Dubai' },
];

export const FlightSearchEngine: React.FC<FlightSearchEngineProps> = ({
  initialParams,
  onSearch,
  isSearching,
}) => {
  const [tripType, setTripType] = useState<TripType>(initialParams.tripType);
  const [origin, setOrigin] = useState(initialParams.origin);
  const [destination, setDestination] = useState(initialParams.destination);
  const [departureDate, setDepartureDate] = useState(initialParams.departureDate);
  const [returnDate, setReturnDate] = useState(initialParams.returnDate || '2026-12-22');
  const [multiCityLegs, setMultiCityLegs] = useState<MultiCityLeg[]>(
    initialParams.multiCityLegs || [
      { id: 'leg-1', origin: 'LHR', destination: 'DXB', departureDate: initialParams.departureDate },
      { id: 'leg-2', origin: 'DXB', destination: 'HND', departureDate: '2026-12-19' },
    ]
  );
  const [passengers, setPassengers] = useState(initialParams.passengers);
  const [cabinClass, setCabinClass] = useState<CabinClass>(initialParams.cabinClass);
  const [paxOpen, setPaxOpen] = useState(false);
  const paxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (paxRef.current && !paxRef.current.contains(e.target as Node)) {
        setPaxOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const totalPassengers = passengers.adults + passengers.children + passengers.infants;

  const handleSwap = () => {
    setOrigin(destination);
    setDestination(origin);
  };

  const updatePax = (key: keyof typeof passengers, delta: number) => {
    setPassengers((prev) => {
      const next = prev[key] + delta;
      if (key === 'adults') return { ...prev, adults: Math.max(1, Math.min(9, next)) };
      if (key === 'children') return { ...prev, children: Math.max(0, Math.min(6, next)) };
      return { ...prev, infants: Math.max(0, Math.min(prev.adults, next)) };
    });
  };

  const handleAddLeg = () => {
    if (multiCityLegs.length >= 4) return;
    const lastLeg = multiCityLegs[multiCityLegs.length - 1];
    setMultiCityLegs([
      ...multiCityLegs,
      {
        id: `leg-${Date.now()}`,
        origin: lastLeg.destination,
        destination: lastLeg.destination === 'SIN' ? 'ZRH' : 'SIN',
        departureDate: '2026-12-24',
      },
    ]);
  };

  const handleRemoveLeg = (id: string) => {
    if (multiCityLegs.length <= 2) return;
    setMultiCityLegs(multiCityLegs.filter((l) => l.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      tripType,
      origin,
      destination,
      departureDate,
      returnDate: tripType === 'round-trip' ? returnDate : undefined,
      multiCityLegs: tripType === 'multi-city' ? multiCityLegs : undefined,
      passengers,
      cabinClass,
    });
  };

  const handleQuickRoute = (orig: string, dest: string) => {
    setTripType('round-trip');
    setOrigin(orig);
    setDestination(dest);
    onSearch({
      tripType: 'round-trip',
      origin: orig,
      destination: dest,
      departureDate,
      returnDate,
      passengers,
      cabinClass,
    });
  };

  return (
    <section id="flights" className="relative z-30 -mt-20 sm:-mt-24 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="max-w-7xl mx-auto rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/12 dark:border-[#D8B774]/20 shadow-[0_24px_60px_-20px_rgba(11,31,58,0.22)] dark:shadow-[0_24px_60px_-20px_rgba(0,0,0,0.65)] p-5 sm:p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Trip Type Tabs & Cabin Quick Summary */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#0B1F3A]/10 dark:border-white/10 pb-4">
            <div className="inline-flex rounded-xl bg-[#F8FAFC] dark:bg-[#070F1D] p-1 border border-[#0B1F3A]/10 dark:border-white/10">
              {(
                [
                  { id: 'round-trip', label: 'Round-Trip' },
                  { id: 'one-way', label: 'One-Way' },
                  { id: 'multi-city', label: 'Multi-City' },
                ] as { id: TripType; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.id}
                  id={`trip-tab-${tab.id}`}
                  type="button"
                  onClick={() => setTripType(tab.id)}
                  className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all cursor-pointer ${
                    tripType === tab.id
                      ? 'bg-[#0B1F3A] text-white dark:bg-[#C5A059] dark:text-[#070F1D] shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-[#0B1F3A] dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium uppercase tracking-wider text-[#9E7E3E] dark:text-[#D8B774]">
                Popular:
              </span>
              {POPULAR_ROUTES.map((route) => (
                <button
                  key={route.label}
                  type="button"
                  onClick={() => handleQuickRoute(route.origin, route.destination)}
                  className="px-2.5 py-1 rounded-md border border-[#0B1F3A]/10 dark:border-white/10 hover:border-[#C5A059] text-slate-600 dark:text-slate-300 hover:text-[#0B1F3A] dark:hover:text-white transition-colors cursor-pointer"
                >
                  {route.label}
                </button>
              ))}
            </div>
          </div>

          {/* Standard One-Way / Round-Trip Fields */}
          {tripType !== 'multi-city' ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
              {/* Origin */}
              <div className="md:col-span-3">
                <AirportPicker
                  id="flight-origin"
                  label="Departure From"
                  value={origin}
                  onChange={setOrigin}
                />
              </div>

              {/* Swap Button */}
              <div className="hidden md:flex md:col-span-1 justify-center pb-3">
                <button
                  type="button"
                  onClick={handleSwap}
                  aria-label="Swap Origin and Destination"
                  className="p-2.5 rounded-full border border-[#0B1F3A]/15 dark:border-[#D8B774]/25 bg-[#F8FAFC] dark:bg-[#0B1628] text-[#0B1F3A] dark:text-[#D8B774] hover:border-[#C5A059] hover:rotate-180 transition-all duration-300 cursor-pointer"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                </button>
              </div>

              {/* Destination */}
              <div className="md:col-span-3">
                <AirportPicker
                  id="flight-destination"
                  label="Arrival To"
                  value={destination}
                  onChange={setDestination}
                />
              </div>

              {/* Departure Date */}
              <div className={tripType === 'round-trip' ? 'md:col-span-2' : 'md:col-span-3'}>
                <label
                  htmlFor="flight-departure-date"
                  className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 mb-1.5"
                >
                  Departure
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-[#C5A059] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="flight-departure-date"
                    type="date"
                    required
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-3.5 rounded-xl border border-[#0B1F3A]/15 dark:border-[#D8B774]/20 bg-[#F8FAFC] dark:bg-[#0B1628] text-sm font-medium text-[#0B1F3A] dark:text-white focus:outline-none focus:border-[#C5A059] tabular-nums"
                  />
                </div>
              </div>

              {/* Return Date (Round-Trip) */}
              {tripType === 'round-trip' && (
                <div className="md:col-span-3">
                  <label
                    htmlFor="flight-return-date"
                    className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 mb-1.5"
                  >
                    Return
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-[#C5A059] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      id="flight-return-date"
                      type="date"
                      required
                      min={departureDate}
                      value={returnDate}
                      onChange={(e) => setReturnDate(e.target.value)}
                      className="w-full pl-10 pr-3 py-3.5 rounded-xl border border-[#0B1F3A]/15 dark:border-[#D8B774]/20 bg-[#F8FAFC] dark:bg-[#0B1628] text-sm font-medium text-[#0B1F3A] dark:text-white focus:outline-none focus:border-[#C5A059] tabular-nums"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Multi-City Legs Builder */
            <div className="space-y-3">
              {multiCityLegs.map((leg, idx) => (
                <div
                  key={leg.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end p-3.5 rounded-xl bg-[#F8FAFC]/80 dark:bg-[#070F1D]/60 border border-[#0B1F3A]/10 dark:border-white/10"
                >
                  <div className="md:col-span-4">
                    <AirportPicker
                      id={`multi-origin-${leg.id}`}
                      label={`Flight ${idx + 1} — From`}
                      value={leg.origin}
                      onChange={(code) =>
                        setMultiCityLegs((prev) =>
                          prev.map((l) => (l.id === leg.id ? { ...l, origin: code } : l))
                        )
                      }
                    />
                  </div>
                  <div className="md:col-span-4">
                    <AirportPicker
                      id={`multi-dest-${leg.id}`}
                      label={`Flight ${idx + 1} — To`}
                      value={leg.destination}
                      onChange={(code) =>
                        setMultiCityLegs((prev) =>
                          prev.map((l) => (l.id === leg.id ? { ...l, destination: code } : l))
                        )
                      }
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 mb-1.5">
                      Date
                    </label>
                    <input
                      type="date"
                      required
                      value={leg.departureDate}
                      onChange={(e) =>
                        setMultiCityLegs((prev) =>
                          prev.map((l) =>
                            l.id === leg.id ? { ...l, departureDate: e.target.value } : l
                          )
                        )
                      }
                      className="w-full px-3.5 py-3.5 rounded-xl border border-[#0B1F3A]/15 dark:border-[#D8B774]/20 bg-white dark:bg-[#0B1628] text-sm font-medium text-[#0B1F3A] dark:text-white focus:outline-none focus:border-[#C5A059] tabular-nums"
                    />
                  </div>
                  <div className="md:col-span-1 flex justify-end pb-2">
                    {multiCityLegs.length > 2 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLeg(leg.id)}
                        aria-label="Remove flight leg"
                        className="p-2.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {multiCityLegs.length < 4 && (
                <button
                  type="button"
                  onClick={handleAddLeg}
                  className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#9E7E3E] dark:text-[#D8B774] hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Another International Flight Leg
                </button>
              )}
            </div>
          )}

          {/* Bottom Row: Passengers, Cabin Class, and Submit */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end pt-2">
            {/* Passengers & Cabin Selector */}
            <div ref={paxRef} className="md:col-span-5 relative">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 mb-1.5">
                Passengers &amp; Cabin Class
              </label>
              <button
                id="passengers-cabin-trigger"
                type="button"
                onClick={() => setPaxOpen((prev) => !prev)}
                className="w-full px-4 py-3.5 rounded-xl border border-[#0B1F3A]/15 dark:border-[#D8B774]/20 bg-[#F8FAFC] dark:bg-[#0B1628] hover:border-[#C5A059] transition-colors flex items-center justify-between text-left cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-[#C5A059]" />
                  <span className="text-sm font-semibold text-[#0B1F3A] dark:text-white">
                    {totalPassengers} Passenger{totalPassengers > 1 ? 's' : ''} &bull;{' '}
                    <span className="text-[#9E7E3E] dark:text-[#D8B774]">{cabinClass}</span>
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${paxOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {paxOpen && (
                <div className="absolute left-0 right-0 mt-2 z-50 rounded-xl border border-[#0B1F3A]/15 dark:border-[#D8B774]/25 bg-white dark:bg-[#111C2E] shadow-2xl p-5 space-y-5">
                  <div className="space-y-3">
                    {(
                      [
                        { key: 'adults', label: 'Adults', sub: '12+ years' },
                        { key: 'children', label: 'Children', sub: '2 – 11 years' },
                        { key: 'infants', label: 'Infants', sub: 'Under 2 years' },
                      ] as const
                    ).map((item) => (
                      <div key={item.key} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[#0B1F3A] dark:text-white">
                            {item.label}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{item.sub}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => updatePax(item.key, -1)}
                            className="w-8 h-8 rounded-lg border border-[#0B1F3A]/15 dark:border-white/15 flex items-center justify-center text-[#0B1F3A] dark:text-white hover:border-[#C5A059] cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-5 text-center text-sm font-bold tabular-nums text-[#0B1F3A] dark:text-white">
                            {passengers[item.key]}
                          </span>
                          <button
                            type="button"
                            onClick={() => updatePax(item.key, 1)}
                            className="w-8 h-8 rounded-lg border border-[#0B1F3A]/15 dark:border-white/15 flex items-center justify-center text-[#0B1F3A] dark:text-white hover:border-[#C5A059] cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-[#0B1F3A]/10 dark:border-white/10">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 mb-2.5">
                      Cabin Class
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Economy', 'Business', 'First Class'] as CabinClass[]).map((cabin) => (
                        <button
                          key={cabin}
                          type="button"
                          onClick={() => setCabinClass(cabin)}
                          className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer ${
                            cabinClass === cabin
                              ? 'bg-[#0B1F3A] text-white border-[#0B1F3A] dark:bg-[#C5A059] dark:text-[#070F1D] dark:border-[#C5A059]'
                              : 'border-[#0B1F3A]/15 dark:border-white/15 text-slate-600 dark:text-slate-300 hover:border-[#C5A059]'
                          }`}
                        >
                          {cabin}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Cabin Pills (Desktop) */}
            <div className="hidden md:flex md:col-span-4 items-center gap-2">
              {(['Economy', 'Business', 'First Class'] as CabinClass[]).map((cabin) => (
                <button
                  key={cabin}
                  type="button"
                  onClick={() => setCabinClass(cabin)}
                  className={`flex-1 py-3.5 px-2 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                    cabinClass === cabin
                      ? 'border-[#C5A059] bg-[#C5A059]/12 text-[#0B1F3A] dark:text-[#D8B774]'
                      : 'border-[#0B1F3A]/10 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:border-[#C5A059]/50'
                  }`}
                >
                  {cabin}
                </button>
              ))}
            </div>

            {/* Search Flights Button */}
            <div className="md:col-span-3">
              <button
                id="search-flights-submit"
                type="submit"
                disabled={isSearching}
                className="w-full py-3.5 px-6 rounded-xl bg-[#0B1F3A] hover:bg-[#132E54] dark:bg-[#C5A059] dark:hover:bg-[#D8B774] text-white dark:text-[#070F1D] font-semibold text-sm tracking-wide flex items-center justify-center gap-2.5 shadow-lg shadow-[#0B1F3A]/15 dark:shadow-black/30 transition-all cursor-pointer disabled:opacity-60"
              >
                <PlaneTakeoff className="w-4 h-4" />
                <span>{isSearching ? 'Searching Global GDS...' : 'Search Flights'}</span>
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </section>
  );
};
