import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck, Star } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

const RATING_LABELS = ['', 'Needs Improvement', 'Fair', 'Good', 'Very Good', 'Five-Star Excellence'];

export const Footer: React.FC = () => {
  const [rating, setRating] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('intrega-wings-service-rating');
      return saved ? Number(saved) : 0;
    } catch {
      return 0;
    }
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState<boolean>(() => {
    try {
      return Boolean(localStorage.getItem('intrega-wings-service-rating'));
    } catch {
      return false;
    }
  });

  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;
    try {
      localStorage.setItem('intrega-wings-service-rating', String(rating));
    } catch {
      // ignore storage errors
    }
    setSubmitted(true);
  };

  return (
    <footer className="bg-[#0B1F3A] dark:bg-[#050B16] text-slate-200 border-t border-[#C5A059]/30">
      {/* Signature Aviation Staff Banner + Interactive "Rate Our Service" Widget */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-12">
        <div className="rounded-2xl overflow-hidden bg-[#102849] dark:bg-[#0D1729] border border-[#C5A059]/25 grid grid-cols-1 lg:grid-cols-12">
          {/* Two Friendly Intrega Wings Aviation Staff Banner */}
          <div className="lg:col-span-7 relative min-h-[260px] sm:min-h-[320px] overflow-hidden">
            <img
              src={`${import.meta.env.BASE_URL}images/intrega-staff-banner.jpg`}
              alt="Two friendly Intrega Wings aviation cabin managers wearing official deep navy and gold Intrega Wings uniforms in the airport lounge"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#070F1D]/85 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-[#102849] dark:lg:to-[#0D1729]" />
            <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#D8B774]">
                  Intrega Wings Cabin &amp; Ground Hospitality
                </p>
                <p className="font-serif text-lg sm:text-xl text-white mt-0.5">
                  Warmth, Precision &amp; Care at Every Gate
                </p>
              </div>
            </div>
          </div>

          {/* Interactive 5-Star "Rate our service" Widget */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#D8B774]">
              Passenger Feedback
            </p>
            <h3 className="font-serif text-2xl text-white mt-1">Rate our service</h3>
            <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
              Your impressions help our flight crew and international concierge team uphold
              five-star standards.
            </p>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 p-5 rounded-xl bg-emerald-500/12 border border-emerald-400/30 space-y-2.5"
              >
                <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  <span>Thank you for your {rating}-star rating!</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  We deeply appreciate your feedback and look forward to welcoming you aboard
                  Intrega Wings.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-[11px] font-semibold uppercase tracking-wider text-[#D8B774] hover:underline cursor-pointer"
                >
                  Update Rating
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmitRating} className="mt-5 space-y-4">
                <div>
                  <div className="flex items-center gap-2" role="radiogroup" aria-label="Rate our service">
                    {[1, 2, 3, 4, 5].map((star) => {
                      const active = star <= (hoverRating || rating);
                      return (
                        <button
                          key={star}
                          id={`rate-star-${star}`}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                          aria-label={`Rate ${star} out of 5 stars`}
                          className="p-1 transition-transform hover:scale-110 focus:outline-none cursor-pointer"
                        >
                          <Star
                            className={`w-7 h-7 transition-colors ${
                              active
                                ? 'fill-[#C5A059] text-[#C5A059]'
                                : 'text-slate-500 hover:text-[#D8B774]'
                            }`}
                          />
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-xs text-[#D8B774] font-medium h-4 mt-1.5">
                    {RATING_LABELS[hoverRating || rating]}
                  </p>
                </div>

                <div>
                  <input
                    id="service-feedback-input"
                    type="text"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Optional short note for our crew..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#071426] dark:bg-[#070F1D] border border-white/15 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-[#C5A059]"
                  />
                </div>

                <button
                  id="submit-service-rating"
                  type="submit"
                  disabled={rating === 0}
                  className="w-full py-2.5 px-5 rounded-xl bg-[#C5A059] hover:bg-[#D8B774] text-[#070F1D] text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed"
                >
                  Submit Rating
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer Navigation Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-4 space-y-4">
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="Intrega Wings Home"
              className="inline-block hover:opacity-90 transition-opacity"
            >
              <BrandLogo inverted />
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Intrega Wings operates as an official international airline and accredited global air
              agency, uniting flagship long-haul aviation with direct destination access.
            </p>
            <div className="inline-flex items-center gap-2 text-xs text-[#D8B774] pt-1">
              <ShieldCheck className="w-4 h-4" />
              <span>IATA Accredited Agency &bull; ISO 27001 Payment Security</span>
            </div>
          </div>

          <div className="md:col-span-2 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D8B774]">
              Book &amp; Fly
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              <li><Link to="/flights" className="hover:text-white transition-colors">International Flights</Link></li>
              <li><Link to="/tours" className="hover:text-white transition-colors">Tours &amp; Attractions</Link></li>
              <li><Link to="/my-bookings" className="hover:text-white transition-colors">My Bookings</Link></li>
              <li><Link to="/admin" className="text-[#D8B774] hover:text-white transition-colors">Admin Panel</Link></li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D8B774]">
              Settlement &amp; Compliance
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              <li>Binance Pay (UID: 570428214)</li>
              <li>USDT (TRC20 / BEP20), BTC &amp; ETH</li>
              <li>Strict Payment Verification Gate</li>
              <li>Verified PDF E-Ticket Issuance</li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D8B774]">
              Global Support
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
              <li><Link to="/contact" className="hover:text-white transition-colors">24/7 Concierge Desk</Link></li>
              <li>Zurich &bull; Dubai &bull; Singapore &bull; London</li>
              <li className="tabular-nums">+41 44 580 92 00</li>
              <li>concierge@intregawings.com</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>&copy; {new Date().getFullYear()} Intrega Wings International Air Agency &amp; Airline. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/flights" className="hover:text-white transition-colors">Conditions of Carriage</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Partner API Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
