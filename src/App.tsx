import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { BookingCheckoutModal } from './components/BookingCheckoutModal';
import { ContactAndSocialSection } from './components/ContactAndSocialSection';
import { FlightResults } from './components/FlightResults';
import { FlightSearchEngine } from './components/FlightSearchEngine';
import { Footer } from './components/Footer';
import { HeroHeader } from './components/HeroHeader';
import { MyBookingsSection } from './components/MyBookingsSection';
import { Navbar } from './components/Navbar';
import { TouristSpotsSection } from './components/TouristSpotsSection';
import { searchInternationalFlights } from './services/flightApiService';
import type {
  Booking,
  CurrencyCode,
  Flight,
  FlightSearchParams,
  ThemeMode,
} from './types';

const DEFAULT_SEARCH: FlightSearchParams = {
  tripType: 'round-trip',
  origin: 'LHR',
  destination: 'DXB',
  departureDate: '2026-12-15',
  returnDate: '2026-12-22',
  passengers: { adults: 1, children: 0, infants: 0 },
  cabinClass: 'Business',
};

const BOOKINGS_STORAGE_KEY = 'intrega-wings-bookings-v1';
const THEME_STORAGE_KEY = 'intrega-wings-theme';
const CURRENCY_STORAGE_KEY = 'intrega-wings-currency';

export function App() {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    try {
      const saved = localStorage.getItem(CURRENCY_STORAGE_KEY) as CurrencyCode | null;
      return saved || 'USD';
    } catch {
      return 'USD';
    }
  });

  const [searchParams, setSearchParams] = useState<FlightSearchParams>(DEFAULT_SEARCH);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isSearching, setIsSearching] = useState(true);

  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Booking[]) : [];
    } catch {
      return [];
    }
  });

  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);
  const [verifyingBooking, setVerifyingBooking] = useState<Booking | null>(null);

  // Sync Dark / Light theme class and localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore storage errors
    }
  }, [theme]);

  // Sync Currency preference
  useEffect(() => {
    try {
      localStorage.setItem(CURRENCY_STORAGE_KEY, currency);
    } catch {
      // ignore
    }
  }, [currency]);

  // Sync Bookings ledger
  useEffect(() => {
    try {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
    } catch {
      // ignore
    }
  }, [bookings]);

  const executeSearch = useCallback(async (params: FlightSearchParams) => {
    setSearchParams(params);
    setIsSearching(true);
    try {
      const results = await searchInternationalFlights(params);
      setFlights(results);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Load initial flagship corridor (London LHR -> Dubai DXB)
  useEffect(() => {
    executeSearch(DEFAULT_SEARCH);
  }, [executeSearch]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  /**
   * STRICT NO AUTO-BOOKING RULE:
   * Every newly submitted booking enters the ledger in `PENDING_VERIFICATION` status.
   */
  const handleCreatePendingBooking = (booking: Booking) => {
    setBookings((prev) => [booking, ...prev]);
  };

  /**
   * Transitions a booking from PENDING_VERIFICATION -> CONFIRMED ONLY upon explicit
   * payment verification webhook confirmation.
   */
  const handleVerifyBookingPayment = (bookingId: string, txId: string): Booking | undefined => {
    let confirmedBooking: Booking | undefined;
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id !== bookingId) return b;
        confirmedBooking = {
          ...b,
          status: 'CONFIRMED',
          payment: {
            ...b.payment,
            txId,
            verifiedAt: new Date().toISOString(),
            webhookEventId: `WH-BNP-${Math.floor(100000 + Math.random() * 900000)}`,
          },
        };
        return confirmedBooking;
      })
    );
    return confirmedBooking;
  };

  const pendingCount = bookings.filter((b) => b.status === 'PENDING_VERIFICATION').length;

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#070F1D] text-[#1E293B] dark:text-[#F1F5F9] transition-colors duration-300">
      <Navbar
        theme={theme}
        onToggleTheme={handleToggleTheme}
        currency={currency}
        onChangeCurrency={setCurrency}
        bookingsCount={bookings.length}
        pendingCount={pendingCount}
      />

      <main className="flex-1">
        <HeroHeader />

        <FlightSearchEngine
          initialParams={searchParams}
          onSearch={executeSearch}
          isSearching={isSearching}
        />

        <FlightResults
          flights={flights}
          searchParams={searchParams}
          currency={currency}
          isLoading={isSearching}
          onSelectFlight={(flight) => {
            setVerifyingBooking(null);
            setSelectedFlight(flight);
          }}
        />

        <TouristSpotsSection currency={currency} />

        <MyBookingsSection
          bookings={bookings}
          currency={currency}
          onOpenVerification={(booking) => {
            setSelectedFlight(null);
            setVerifyingBooking(booking);
          }}
        />

        <ContactAndSocialSection />
      </main>

      <Footer />

      {/* Passenger Details + Crypto/Binance Pay + Strict Verification Gate Modal */}
      <AnimatePresence>
        {(selectedFlight || verifyingBooking) && (
          <BookingCheckoutModal
            flight={selectedFlight}
            existingPendingBooking={verifyingBooking}
            searchParams={searchParams}
            currency={currency}
            onClose={() => {
              setSelectedFlight(null);
              setVerifyingBooking(null);
            }}
            onCreatePendingBooking={handleCreatePendingBooking}
            onVerifyBookingPayment={handleVerifyBookingPayment}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
