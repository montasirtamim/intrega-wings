import React from 'react';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import { AVIATION_EASE } from '../components/PageTransition';
import { TouristSpotsSection } from '../components/TouristSpotsSection';
import { useApp } from '../context/AppContext';

export const ToursPage: React.FC = () => {
  const { currency } = useApp();

  return (
    <div className="min-h-screen">
      {/* Editorial Tours Page Header with Animated Reveal */}
      <section className="relative overflow-hidden bg-[#0B1F3A] dark:bg-[#070F1D] text-white pt-12 pb-14 border-b border-[#C5A059]/25">
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0, rotate: -18, scale: 0.92 }}
          animate={{ opacity: 0.08, rotate: 0, scale: 1 }}
          transition={{ duration: 1.1, ease: AVIATION_EASE }}
          className="absolute -right-12 -top-10 pointer-events-none text-[#D8B774]"
        >
          <Compass className="w-72 h-72" strokeWidth={0.75} />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: AVIATION_EASE }}
            className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D8B774]"
          >
            Global Experiences &amp; Official Partner Ticketing
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08, ease: AVIATION_EASE }}
            className="font-serif text-3xl sm:text-5xl font-medium mt-2"
          >
            International Tours &amp; Tourist Spots
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16, ease: AVIATION_EASE }}
            className="text-sm sm:text-base text-slate-300 mt-3 max-w-2xl"
          >
            Curated international landmarks, Bangladesh natural wonders, theme parks, and luxury
            cultural expeditions with pre-filled Direct-to-Official Partner booking handoffs.
          </motion.p>
        </div>
      </section>

      <TouristSpotsSection currency={currency} />
    </div>
  );
};
