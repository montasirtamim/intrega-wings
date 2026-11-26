import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Award, Compass, Globe2, Plane, ShieldCheck } from 'lucide-react';
import { ContactAndSocialSection } from '../components/ContactAndSocialSection';
import { FlightSearchEngine } from '../components/FlightSearchEngine';
import { HeroHeader } from '../components/HeroHeader';
import { useApp } from '../context/AppContext';
import type { FlightSearchParams } from '../types';
import { formatPrice } from '../utils/currency';

const FEATURED_CORRIDORS = [
  {
    from: 'LHR',
    to: 'DAC',
    fromCity: 'London',
    toCity: 'Dhaka',
    flightNo: 'IW-525',
    aircraft: 'Airbus A350-1000',
    fromUsd: 765,
    duration: '9h 30m',
  },
  {
    from: 'DAC',
    to: 'DXB',
    fromCity: 'Dhaka',
    toCity: 'Dubai',
    flightNo: 'IW-518',
    aircraft: 'Boeing 787-9 Dreamliner',
    fromUsd: 420,
    duration: '5h 30m',
  },
  {
    from: 'DAC',
    to: 'CXB',
    fromCity: 'Dhaka',
    toCity: "Cox's Bazar",
    flightNo: 'IW-011',
    aircraft: 'Airbus A220-300',
    fromUsd: 72,
    duration: '1h 00m',
  },
  {
    from: 'DAC',
    to: 'SIN',
    fromCity: 'Dhaka',
    toCity: 'Singapore',
    flightNo: 'IW-546',
    aircraft: 'Airbus A350-900',
    fromUsd: 365,
    duration: '4h 15m',
  },
  {
    from: 'DXB',
    to: 'DAC',
    fromCity: 'Dubai',
    toCity: 'Dhaka',
    flightNo: 'IW-519',
    aircraft: 'Boeing 787-9 Dreamliner',
    fromUsd: 410,
    duration: '4h 45m',
  },
  {
    from: 'LHR',
    to: 'DXB',
    fromCity: 'London',
    toCity: 'Dubai',
    flightNo: 'IW-101',
    aircraft: 'Airbus A350-1000',
    fromUsd: 590,
    duration: '6h 45m',
  },
  {
    from: 'DXB',
    to: 'HND',
    fromCity: 'Dubai',
    toCity: 'Tokyo',
    flightNo: 'IW-204',
    aircraft: 'Airbus A350-1000',
    fromUsd: 780,
    duration: '9h 35m',
  },
  {
    from: 'JFK',
    to: 'CDG',
    fromCity: 'New York',
    toCity: 'Paris',
    flightNo: 'IW-308',
    aircraft: 'Boeing 787-9 Dreamliner',
    fromUsd: 615,
    duration: '7h 25m',
  },
];

const AIRLINE_PILLARS = [
  {
    icon: Award,
    title: 'Official Intrega Wings Fleet',
    description:
      'Fly non-stop aboard our Airbus A350-1000 and Boeing 787-9 flagship aircraft with Starlink Wi-Fi, lie-flat Horizon Suites, and flexible fare protection.',
  },
  {
    icon: Globe2,
    title: 'Unified Global GDS Access',
    description:
      'Compare our official fleet side-by-side with Emirates, Qatar Airways, Singapore Airlines, SWISS, Lufthansa, and Turkish Airlines in one interface.',
  },
  {
    icon: ShieldCheck,
    title: 'Verified Crypto & Binance Pay Gate',
    description:
      'Settle international fares via Binance Pay (UID 570428214) or USDT/BTC/ETH with strict deposit verification and instant downloadable PDF E-Tickets.',
  },
];

export const HomePage: React.FC = () => {
  const { searchParams, currency, isSearching } = useApp();
  const navigate = useNavigate();

  const handleQuickSearch = (params: FlightSearchParams) => {
    const query = new URLSearchParams({
      trip: params.tripType,
      from: params.origin,
      to: params.destination,
      dep: params.departureDate,
      cabin: params.cabinClass,
      adults: String(params.passengers.adults),
      children: String(params.passengers.children),
      infants: String(params.passengers.infants),
    });
    if (params.returnDate) {
      query.set('ret', params.returnDate);
    }
    navigate(`/flights?${query.toString()}`);
  };

  const handleFeaturedRouteClick = (from: string, to: string) => {
    const query = new URLSearchParams({
      trip: 'round-trip',
      from,
      to,
      dep: searchParams.departureDate,
      ret: searchParams.returnDate || '2026-12-22',
      cabin: searchParams.cabinClass,
      adults: '1',
      children: '0',
      infants: '0',
    });
    navigate(`/flights?${query.toString()}`);
  };

  return (
    <div>
      <HeroHeader />

      {/* Quick Flight Search Widget -> Redirects to /flights with query params */}
      <FlightSearchEngine
        initialParams={searchParams}
        onSearch={handleQuickSearch}
        isSearching={isSearching}
      />

      {/* Featured Official Intrega Wings Routes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9E7E3E] dark:text-[#D8B774]">
              Flagship International Corridors
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#0B1F3A] dark:text-white mt-2">
              Featured Intrega Wings Routes
            </h2>
          </div>
          <Link
            to="/flights"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0B1F3A] dark:text-[#D8B774] hover:text-[#9E7E3E] transition-colors"
          >
            <span>Explore All Flights</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURED_CORRIDORS.map((route, idx) => (
            <motion.button
              key={route.flightNo}
              type="button"
              onClick={() => handleFeaturedRouteClick(route.from, route.to)}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.06 }}
              whileHover={{ y: -4 }}
              className="group text-left p-6 rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/10 dark:border-white/10 hover:border-[#C5A059] transition-all shadow-sm hover:shadow-lg cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-[#9E7E3E] dark:text-[#D8B774]">
                  <span>{route.flightNo} &bull; Non-Stop</span>
                  <span>{route.duration}</span>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <span className="font-display text-2xl font-bold text-[#0B1F3A] dark:text-white">
                    {route.from}
                  </span>
                  <Plane className="w-4 h-4 text-[#C5A059] group-hover:translate-x-1 transition-transform" />
                  <span className="font-display text-2xl font-bold text-[#0B1F3A] dark:text-white">
                    {route.to}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                  {route.fromCity} to {route.toCity}
                </p>
                <p className="text-xs text-slate-400 mt-1">{route.aircraft}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#0B1F3A]/8 dark:border-white/10 flex items-end justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">From</p>
                  <p className="font-display text-xl font-bold text-[#0B1F3A] dark:text-[#D8B774] tabular-nums">
                    {formatPrice(route.fromUsd, currency)}
                  </p>
                </div>
                <span className="text-xs font-semibold text-[#0B1F3A] dark:text-white group-hover:text-[#C5A059] inline-flex items-center gap-1">
                  Book <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Airline Standards / Editorial Highlights */}
      <section className="py-16 bg-[#F1F5F9]/75 dark:bg-[#0A1424] border-y border-[#0B1F3A]/10 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {AIRLINE_PILLARS.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <motion.div
                  key={pillar.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.08 }}
                  className="p-7 rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/10 dark:border-white/10"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#0B1F3A] dark:bg-[#C5A059]/15 text-[#D8B774] flex items-center justify-center mb-5">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif text-xl font-medium text-[#0B1F3A] dark:text-white">
                    {pillar.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2.5 leading-relaxed">
                    {pillar.description}
                  </p>
                </motion.div>
              );
            })}
          </div>

          {/* Curated Tours Teaser CTA */}
          <div className="mt-10 p-7 sm:p-8 rounded-2xl bg-[#0B1F3A] text-white border border-[#C5A059]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#D8B774] inline-flex items-center gap-2">
                <Compass className="w-4 h-4" />
                Direct-to-Official Partner Access
              </p>
              <h3 className="font-serif text-2xl sm:text-3xl font-medium mt-2">
                Pair Your Flight With Iconic Global Attractions
              </h3>
              <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                Reserve official dated entry for Disneyland Paris, Burj Khalifa SKY, Eiffel Tower
                Summit, Mount Fuji Expeditions, Universal Studios, and Santorini Catamarans.
              </p>
            </div>
            <Link
              to="/tours"
              className="px-6 py-3.5 rounded-xl bg-[#C5A059] hover:bg-[#D8B774] text-[#070F1D] text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 shrink-0 transition-colors"
            >
              <span>Explore Tours &amp; Spots</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Contact & Social Media Section (#contact) */}
      <ContactAndSocialSection />
    </div>
  );
};
