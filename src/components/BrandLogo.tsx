import React from 'react';

interface BrandLogoProps {
  inverted?: boolean;
  compact?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ inverted = false, compact = false }) => {
  return (
    <div className="inline-flex items-center gap-3 select-none">
      {/* Bespoke Intrega Wings Heraldic Wing Emblem */}
      <svg
        width={compact ? 34 : 40}
        height={compact ? 34 : 40}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        <rect
          x="1"
          y="1"
          width="42"
          height="42"
          rx="10"
          className={
            inverted
              ? 'fill-white/10 stroke-[#D8B774]/40'
              : 'fill-[#0B1F3A] dark:fill-[#111C2E] stroke-[#C5A059]/45'
          }
          strokeWidth="1.2"
        />
        {/* Sculpted Triple Wing Feathers */}
        <path
          d="M9 26.5C15.5 23.5 23.5 18.5 34.5 11.5C31.2 16.8 25.8 21.8 18.5 25.5L9 26.5Z"
          fill="#C5A059"
        />
        <path
          d="M12.5 30.2C18.5 27.6 25.2 23.6 33.8 18.2C30.8 22.8 26.2 26.7 19.8 29.8L12.5 30.2Z"
          fill="#D8B774"
        />
        <path
          d="M17.5 33.2C22.2 31.3 27.2 28.4 32.5 24.8C30.2 28.2 26.8 30.9 22.4 33L17.5 33.2Z"
          fill="#C5A059"
          fillOpacity="0.78"
        />
      </svg>

      <div className="flex flex-col leading-none">
        <span
          className={`font-serif font-semibold tracking-[0.14em] ${
            compact ? 'text-base' : 'text-lg sm:text-xl'
          } ${inverted ? 'text-white' : 'text-[#0B1F3A] dark:text-[#F8FAFC]'}`}
        >
          INTREGA WINGS
        </span>
        {!compact && (
          <span
            className={`text-[10px] uppercase tracking-[0.26em] font-medium mt-1 ${
              inverted ? 'text-[#D8B774]' : 'text-[#9E7E3E] dark:text-[#D8B774]'
            }`}
          >
            International Air Agency
          </span>
        )}
      </div>
    </div>
  );
};
