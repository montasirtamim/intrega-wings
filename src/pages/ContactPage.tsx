import React from 'react';
import { motion } from 'framer-motion';
import { Headphones } from 'lucide-react';
import { ContactAndSocialSection } from '../components/ContactAndSocialSection';
import { AVIATION_EASE } from '../components/PageTransition';

export const ContactPage: React.FC = () => {
  return (
    <div className="min-h-screen">
      {/* Dedicated Contact Page Header (No Ticketing System) */}
      <section className="relative overflow-hidden bg-[#0B1F3A] dark:bg-[#070F1D] text-white pt-12 pb-14 border-b border-[#C5A059]/25">
        <motion.div
          aria-hidden="true"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 0.08, scale: 1 }}
          transition={{ duration: 1, ease: AVIATION_EASE }}
          className="absolute -right-8 -top-8 pointer-events-none text-[#D8B774]"
        >
          <Headphones className="w-64 h-64" strokeWidth={0.75} />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: AVIATION_EASE }}
            className="text-xs font-semibold uppercase tracking-[0.24em] text-[#D8B774]"
          >
            24/7 Global Support &amp; Media Channels
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: AVIATION_EASE }}
            className="font-serif text-3xl sm:text-5xl font-medium mt-2"
          >
            Contact Intrega Wings
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.16, ease: AVIATION_EASE }}
            className="text-sm sm:text-base text-slate-300 mt-3 max-w-2xl"
          >
            Reach our international offices, 24/7 global helpline, or connect with our team directly
            across social channels.
          </motion.p>
        </div>
      </section>

      <ContactAndSocialSection />
    </div>
  );
};
