import React from 'react';
import { TouristSpotsSection } from '../components/TouristSpotsSection';
import { useApp } from '../context/AppContext';

export const ToursPage: React.FC = () => {
  const { currency } = useApp();

  return (
    <div className="min-h-screen">
      {/* Editorial Tours Page Header */}
      <section className="bg-[#0B1F3A] dark:bg-[#070F1D] text-white pt-12 pb-14 border-b border-[#C5A059]/25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D8B774]">
            Global Experiences &amp; Official Partner Ticketing
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl font-medium mt-2">
            International Tours &amp; Tourist Spots
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-3 max-w-2xl">
            Curated international landmarks, theme parks, and luxury cultural expeditions with
            pre-filled Direct-to-Official Partner booking handoffs.
          </p>
        </div>
      </section>

      <TouristSpotsSection currency={currency} />
    </div>
  );
};
