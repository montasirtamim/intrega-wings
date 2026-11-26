import React from 'react';
import { motion } from 'framer-motion';
import { Compass, ShieldCheck, Sparkles } from 'lucide-react';

export const HeroHeader: React.FC = () => {
  return (
    <section
      id="top"
      className="relative overflow-hidden bg-[#0B1F3A] dark:bg-[#070F1D] text-white pt-14 pb-32 sm:pt-20 sm:pb-40"
    >
      {/* Subtle Architectural Sky Horizon Layers (no neon gradients) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 85% 65% at 50% 10%, rgba(30, 58, 95, 0.55) 0%, rgba(11, 31, 58, 0.92) 60%, rgba(7, 15, 29, 1) 100%)',
        }}
      />

      {/* Horizon Warm Gold Glow Line */}
      <div
        className="absolute inset-x-0 bottom-0 h-44 pointer-events-none opacity-45"
        style={{
          background:
            'linear-gradient(to top, rgba(197, 160, 89, 0.14) 0%, rgba(197, 160, 89, 0.03) 45%, transparent 100%)',
        }}
      />

      {/* Layered Atmospheric Clouds & Curved Contrail Flight Path */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        {/* Soft High-Altitude Cloud Banks */}
        <svg
          viewBox="0 0 1440 420"
          fill="none"
          preserveAspectRatio="none"
          className="w-full h-full opacity-35"
        >
          <g className="animate-cloud-slow">
            <ellipse cx="220" cy="120" rx="220" ry="34" fill="white" fillOpacity="0.06" />
            <ellipse cx="320" cy="130" rx="160" ry="26" fill="white" fillOpacity="0.05" />
            <ellipse cx="1140" cy="95" rx="260" ry="38" fill="white" fillOpacity="0.05" />
          </g>
          <g className="animate-cloud-reverse">
            <ellipse cx="760" cy="210" rx="310" ry="42" fill="#D8B774" fillOpacity="0.045" />
            <ellipse cx="1290" cy="240" rx="240" ry="32" fill="white" fillOpacity="0.045" />
          </g>

          {/* Subtle Great-Circle Horizon Arc & Contrail */}
          <path
            d="M -60 275 Q 480 120 1520 72"
            stroke="url(#contrailGradient)"
            strokeWidth="2.2"
            strokeLinecap="round"
            className="animate-contrail"
          />
          <path
            d="M -60 282 Q 480 128 1520 80"
            stroke="url(#contrailSecondary)"
            strokeWidth="1"
            strokeDasharray="6 8"
            opacity="0.45"
          />
          <defs>
            <linearGradient id="contrailGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="35%" stopColor="#D8B774" stopOpacity="0.45" />
              <stop offset="80%" stopColor="#FFFFFF" stopOpacity="0.65" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
            <linearGradient id="contrailSecondary" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C5A059" stopOpacity="0" />
              <stop offset="50%" stopColor="#C5A059" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#C5A059" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Custom Branded "INTREGA WINGS" Widebody Aircraft Animating Smoothly Across the Sky */}
        <motion.div
          initial={{ x: '-22vw', y: 150, rotate: -7, opacity: 0 }}
          animate={{
            x: ['-20vw', '30vw', '78vw', '118vw'],
            y: [165, 88, 42, 14],
            rotate: [-9, -6, -4, -3],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'easeInOut',
            times: [0, 0.35, 0.78, 1],
          }}
          className="absolute top-6 left-0 z-10 w-[230px] sm:w-[300px] md:w-[340px] drop-shadow-[0_14px_24px_rgba(0,0,0,0.45)]"
        >
          <svg viewBox="0 0 360 110" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
            {/* Soft Engine Contrail Plume Behind Aircraft */}
            <path
              d="M 4 68 L 95 66"
              stroke="url(#engineTrail)"
              strokeWidth="4.5"
              strokeLinecap="round"
            />
            <path
              d="M 18 76 L 130 74"
              stroke="url(#engineTrail)"
              strokeWidth="3"
              strokeLinecap="round"
              opacity="0.7"
            />

            {/* Tail Fin (Deep Aviation Navy + Gold Wing Emblem) */}
            <path
              d="M 68 58 L 42 18 C 40 15 43 12 47 12 L 62 12 C 66 12 70 15 73 19 L 106 54 Z"
              fill="#0E2A4D"
              stroke="#C5A059"
              strokeWidth="1.2"
            />
            {/* Gold Heraldic Wing Stripe on Tailfin */}
            <path d="M 52 24 L 84 44 L 78 47 L 50 30 Z" fill="#C5A059" />
            <path d="M 56 35 L 82 49 L 76 52 L 54 40 Z" fill="#D8B774" />

            {/* Horizontal Stabilizer */}
            <path d="M 58 62 L 32 56 L 38 64 L 76 66 Z" fill="#CBD5E1" />

            {/* Far Wing Silhouette */}
            <path d="M 176 52 L 146 28 L 160 28 L 204 52 Z" fill="#94A3B8" opacity="0.65" />

            {/* Sleek Alabaster Fuselage */}
            <path
              d="M 54 62 C 66 53 96 49 145 49 L 288 49 C 316 49 338 56 348 64 C 352 67 350 72 342 73 L 104 73 C 76 73 59 68 54 62 Z"
              fill="url(#fuselageGrad)"
            />

            {/* Belly Shadow Shading */}
            <path
              d="M 86 67 L 344 67 C 346 70 344 73 336 73 L 104 73 C 92 73 86 70 86 67 Z"
              fill="#CBD5E1"
              opacity="0.75"
            />

            {/* Signature Warm Metallic Gold Cheatline */}
            <path
              d="M 78 63 L 336 63"
              stroke="#C5A059"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M 84 66 L 326 66"
              stroke="#0B1F3A"
              strokeWidth="1.2"
              strokeLinecap="round"
              opacity="0.85"
            />

            {/* Cockpit Windshield */}
            <path
              d="M 314 53 L 330 57 L 326 60 L 311 58 Z"
              fill="#0B1F3A"
            />

            {/* Cabin Windows Row */}
            <g fill="#0B1F3A" opacity="0.72">
              <rect x="130" y="55" width="4" height="3" rx="1" />
              <rect x="139" y="55" width="4" height="3" rx="1" />
              <rect x="148" y="55" width="4" height="3" rx="1" />
              <rect x="157" y="55" width="4" height="3" rx="1" />
              <rect x="255" y="55" width="4" height="3" rx="1" />
              <rect x="264" y="55" width="4" height="3" rx="1" />
              <rect x="273" y="55" width="4" height="3" rx="1" />
              <rect x="282" y="55" width="4" height="3" rx="1" />
              <rect x="291" y="55" width="4" height="3" rx="1" />
            </g>

            {/* Fuselage Brand Title: INTREGA WINGS */}
            <text
              x="167"
              y="60"
              fill="#0B1F3A"
              fontFamily="Playfair Display, Georgia, serif"
              fontWeight="700"
              fontSize="8.8"
              letterSpacing="1.4"
            >
              INTREGA WINGS
            </text>

            {/* Swept Main Near Wing */}
            <path
              d="M 168 65 L 116 92 C 113 94 116 97 121 96 L 214 70 L 168 65 Z"
              fill="url(#wingGrad)"
              stroke="#94A3B8"
              strokeWidth="0.6"
            />

            {/* Turbofan Engine Nacelle with Gold Intake Ring */}
            <rect x="164" y="74" width="28" height="12" rx="6" fill="#1E293B" />
            <ellipse cx="192" cy="80" rx="2.5" ry="6" fill="#C5A059" />

            {/* Wingtip Navigation Light */}
            <circle cx="118" cy="94" r="2.2" fill="#D8B774" />

            <defs>
              <linearGradient id="fuselageGrad" x1="0" y1="49" x2="0" y2="73" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="70%" stopColor="#F1F5F9" />
                <stop offset="100%" stopColor="#CBD5E1" />
              </linearGradient>
              <linearGradient id="wingGrad" x1="116" y1="96" x2="214" y2="65" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#CBD5E1" />
                <stop offset="100%" stopColor="#F8FAFC" />
              </linearGradient>
              <linearGradient id="engineTrail" x1="4" y1="68" x2="130" y2="68" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                <stop offset="100%" stopColor="#F8FAFC" stopOpacity="0.55" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>
      </div>

      {/* Main Editorial Hero Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-xs sm:text-sm font-semibold uppercase tracking-[0.28em] text-[#D8B774] mb-4"
          >
            Official International Carrier &bull; Global Air Concierge
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-medium leading-[1.1] tracking-tight text-white"
          >
            Sovereign Precision Across Every Horizon.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.18 }}
            className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl font-light"
          >
            Reserve flights aboard the flagship Intrega Wings fleet or connect seamlessly across
            160+ partner international destinations—paired with direct-to-official attraction access
            and verified digital E-Ticketing.
          </motion.p>

          {/* Editorial Aviation Trust Strip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.28 }}
            className="mt-9 flex flex-wrap items-center gap-x-8 gap-y-3 text-xs sm:text-sm text-slate-300 border-t border-white/15 pt-6"
          >
            <div className="flex items-center gap-2.5">
              <Compass className="w-4 h-4 text-[#C5A059]" />
              <span>Official Intrega Fleet &amp; Global Partner GDS</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
              <span>Verified Crypto &amp; Binance Pay Gate</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#C5A059]" />
              <span>Instant Official PDF E-Ticket Issuance</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
