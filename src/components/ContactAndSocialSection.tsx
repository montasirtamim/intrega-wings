import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock,
  Headphones,
  Mail,
  Phone,
  Send,
} from 'lucide-react';

const GLOBAL_OFFICES = [
  { city: 'Zurich (Global HQ)', address: 'Bahnhofstrasse 42, 8001 Zürich, Switzerland', phone: '+41 44 580 92 00' },
  { city: 'Dubai Aviation Hub', address: 'Emaar Square, Building 4, Downtown Dubai, UAE', phone: '+971 4 512 8800' },
  { city: 'Singapore Changi Desk', address: 'Jewel Changi Airport, Level 3, Singapore', phone: '+65 6812 4400' },
  { city: 'London Mayfair Desk', address: '28 Grosvenor Street, Mayfair, London W1K', phone: '+44 20 7946 0920' },
];

const SOCIAL_CHANNELS = [
  {
    name: 'Facebook',
    handle: '@IntregaWingsOfficial',
    followers: '420K Followers',
    href: 'https://facebook.com',
    abbr: 'FB',
  },
  {
    name: 'Instagram',
    handle: '@intregawings',
    followers: '685K Followers',
    href: 'https://instagram.com',
    abbr: 'IG',
  },
  {
    name: 'X (Twitter)',
    handle: '@IntregaWings',
    followers: '290K Followers',
    href: 'https://x.com',
    abbr: 'X',
  },
  {
    name: 'YouTube',
    handle: 'Intrega Wings Aviation',
    followers: '195K Subscribers',
    href: 'https://youtube.com',
    abbr: 'YT',
  },
  {
    name: 'LinkedIn',
    handle: 'Intrega Wings Group',
    followers: '140K Connections',
    href: 'https://linkedin.com',
    abbr: 'IN',
  },
  {
    name: 'TikTok',
    handle: '@intregawings',
    followers: '510K Followers',
    href: 'https://tiktok.com',
    abbr: 'TT',
  },
];

export const ContactAndSocialSection: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('Flight Reservation & PNR');
  const [message, setMessage] = useState('');
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) return;
    const refId = `IW-CS-${Math.floor(100000 + Math.random() * 900000)}`;
    setSubmittedRef(refId);
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <section id="contact" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
      {/* Contact & 24/7 International Concierge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-5 space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9E7E3E] dark:text-[#D8B774]">
              24/7 Global Aviation Concierge
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#0B1F3A] dark:text-white mt-2">
              At Your Service Worldwide
            </h2>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
              Whether arranging multi-continent itineraries, verifying a Binance Pay settlement, or
              coordinating private transfers, our multilingual aviation specialists respond within
              minutes.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0B1F3A] text-white space-y-3 border border-[#C5A059]/30">
            <div className="flex items-center gap-3">
              <Headphones className="w-5 h-5 text-[#D8B774]" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D8B774]">
                24/7 Priority Helpline
              </span>
            </div>
            <p className="font-display text-2xl font-bold tracking-tight tabular-nums">
              +41 44 580 92 00
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-300 pt-1">
              <span className="inline-flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#C5A059]" />
                concierge@intregawings.com
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#C5A059]" />
                Avg. Response: 4 mins
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {GLOBAL_OFFICES.map((office) => (
              <div
                key={office.city}
                className="p-4 rounded-xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/10 dark:border-white/10"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0B1F3A] dark:text-white">
                  <Building2 className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>{office.city}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                  {office.address}
                </p>
                <p className="text-xs font-medium text-[#9E7E3E] dark:text-[#D8B774] mt-2 inline-flex items-center gap-1 tabular-nums">
                  <Phone className="w-3 h-3" />
                  {office.phone}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Interactive Inquiry Form */}
        <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/12 dark:border-white/10 p-6 sm:p-8 shadow-sm">
          <h3 className="font-serif text-2xl text-[#0B1F3A] dark:text-white">
            Direct Concierge Inquiry
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Submit your message and receive an instant reference ticket from our global desk.
          </p>

          {submittedRef ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/25 space-y-3"
            >
              <div className="flex items-center gap-2.5 text-emerald-700 dark:text-emerald-300 font-semibold">
                <CheckCircle2 className="w-5 h-5" />
                <span>Inquiry Received — Reference {submittedRef}</span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Thank you for contacting Intrega Wings. A dedicated international travel advisor has
                been assigned to your ticket and will respond shortly.
              </p>
              <button
                type="button"
                onClick={() => setSubmittedRef(null)}
                className="text-xs font-semibold uppercase tracking-wider text-[#0B1F3A] dark:text-[#D8B774] underline cursor-pointer"
              >
                Send Another Message
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
                  >
                    Full Name *
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="w-full px-4 py-3 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-sm text-[#0B1F3A] dark:text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
                  >
                    Email Address *
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full px-4 py-3 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-sm text-[#0B1F3A] dark:text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="contact-topic"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
                >
                  Department
                </label>
                <select
                  id="contact-topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-sm text-[#0B1F3A] dark:text-white focus:outline-none focus:border-[#C5A059]"
                >
                  <option>Flight Reservation &amp; PNR</option>
                  <option>Crypto / Binance Pay Verification</option>
                  <option>Official Tourist Spot Partner Handoff</option>
                  <option>Corporate &amp; Private Charter</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="contact-message"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5"
                >
                  Message *
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share your flight route, PNR, or concierge request..."
                  className="w-full px-4 py-3 rounded-xl border border-[#0B1F3A]/15 dark:border-white/15 bg-[#F8FAFC] dark:bg-[#070F1D] text-sm text-[#0B1F3A] dark:text-white focus:outline-none focus:border-[#C5A059] resize-none"
                />
              </div>

              <button
                id="contact-submit-btn"
                type="submit"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#0B1F3A] hover:bg-[#132E54] dark:bg-[#C5A059] dark:hover:bg-[#D8B774] text-white dark:text-[#070F1D] text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Send to Global Concierge
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Dedicated Social Media Hub */}
      <div className="pt-12 border-t border-[#0B1F3A]/10 dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#9E7E3E] dark:text-[#D8B774]">
              Global Community &amp; Fleet Dispatches
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-[#0B1F3A] dark:text-white mt-1.5">
              Connect with Intrega Wings
            </h2>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Follow cabin reveals, new international routes, and travel stories worldwide.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {SOCIAL_CHANNELS.map((social, idx) => (
            <motion.a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              whileHover={{ y: -4 }}
              className="group p-4 rounded-2xl bg-white dark:bg-[#111C2E] border border-[#0B1F3A]/10 dark:border-white/10 hover:border-[#C5A059] transition-all flex flex-col justify-between min-h-[132px]"
            >
              <div className="flex items-center justify-between">
                <span className="w-9 h-9 rounded-xl bg-[#0B1F3A]/6 dark:bg-[#D8B774]/12 text-[#0B1F3A] dark:text-[#D8B774] font-display font-bold text-xs flex items-center justify-center group-hover:bg-[#0B1F3A] group-hover:text-[#D8B774] dark:group-hover:bg-[#C5A059] dark:group-hover:text-[#070F1D] transition-colors">
                  {social.abbr}
                </span>
                <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-[#C5A059] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>

              <div className="mt-4">
                <p className="font-semibold text-sm text-[#0B1F3A] dark:text-white">
                  {social.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  {social.handle}
                </p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#9E7E3E] dark:text-[#D8B774] mt-1.5">
                  {social.followers}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
};
