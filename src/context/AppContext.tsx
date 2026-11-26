import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { searchInternationalFlights } from '../services/flightApiService';
import type {
  Booking,
  CurrencyCode,
  Flight,
  FlightSearchParams,
  ThemeMode,
  UserProfile,
} from '../types';

export const DEFAULT_SEARCH_PARAMS: FlightSearchParams = {
  tripType: 'round-trip',
  origin: 'LHR',
  destination: 'DXB',
  departureDate: '2026-12-15',
  returnDate: '2026-12-22',
  passengers: { adults: 1, children: 0, infants: 0 },
  cabinClass: 'Business',
};

const STORAGE_KEYS = {
  THEME: 'intrega-wings-theme',
  CURRENCY: 'intrega-wings-currency',
  BOOKINGS: 'intrega-wings-bookings-v1',
  AUTH_USER: 'intrega-wings-auth-user-v1',
  ACCOUNTS: 'intrega-wings-accounts-v1',
  SELECTED_FLIGHT: 'intrega-wings-selected-flight',
};

interface StoredAccount extends UserProfile {
  password: string;
}

interface AuthResult {
  ok: boolean;
  error?: string;
}

interface AppContextValue {
  theme: ThemeMode;
  toggleTheme: () => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  searchParams: FlightSearchParams;
  flights: Flight[];
  isSearching: boolean;
  executeSearch: (params: FlightSearchParams) => Promise<void>;
  selectedFlight: Flight | null;
  setSelectedFlight: (flight: Flight | null) => void;
  bookings: Booking[];
  activeBookingsCount: number;
  pendingBookingsCount: number;
  createPendingBooking: (booking: Booking) => void;
  verifyBookingPayment: (bookingId: string, txId: string) => Booking | undefined;
  cancelBooking: (bookingId: string) => void;
  user: UserProfile | null;
  login: (email: string, password: string) => AuthResult;
  signup: (fullName: string, email: string, phone: string, password: string) => AuthResult;
  logout: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

function getStoredAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
    return raw ? (JSON.parse(raw) as StoredAccount[]) : [];
  } catch {
    return [];
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CURRENCY) as CurrencyCode | null;
      return saved || 'USD';
    } catch {
      return 'USD';
    }
  });

  const [searchParams, setSearchParams] = useState<FlightSearchParams>(DEFAULT_SEARCH_PARAMS);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isSearching, setIsSearching] = useState(true);

  const [selectedFlight, setSelectedFlightState] = useState<Flight | null>(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEYS.SELECTED_FLIGHT);
      return raw ? (JSON.parse(raw) as Flight) : null;
    } catch {
      return null;
    }
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
      return raw ? (JSON.parse(raw) as Booking[]) : [];
    } catch {
      return [];
    }
  });

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      return raw ? (JSON.parse(raw) as UserProfile) : null;
    } catch {
      return null;
    }
  });

  // Sync theme to documentElement & localStorage
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch {
      // ignore
    }
  }, [theme]);

  // Sync currency
  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENCY, c);
    } catch {
      // ignore
    }
  }, []);

  // Sync bookings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
    } catch {
      // ignore
    }
  }, [bookings]);

  // Sync selected flight to sessionStorage
  const setSelectedFlight = useCallback((flight: Flight | null) => {
    setSelectedFlightState(flight);
    try {
      if (flight) {
        sessionStorage.setItem(STORAGE_KEYS.SELECTED_FLIGHT, JSON.stringify(flight));
      } else {
        sessionStorage.removeItem(STORAGE_KEYS.SELECTED_FLIGHT);
      }
    } catch {
      // ignore
    }
  }, []);

  // Execute global dual-source flight search
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

  // Initial flagship flight inventory load
  useEffect(() => {
    executeSearch(DEFAULT_SEARCH_PARAMS);
  }, [executeSearch]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const createPendingBooking = useCallback((booking: Booking) => {
    setBookings((prev) => [booking, ...prev]);
  }, []);

  const verifyBookingPayment = useCallback((bookingId: string, txId: string): Booking | undefined => {
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
  }, []);

  const cancelBooking = useCallback((bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId
          ? { ...b, status: 'CANCELLED', cancelledAt: new Date().toISOString() }
          : b
      )
    );
  }, []);

  const login = useCallback((email: string, password: string): AuthResult => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return { ok: false, error: 'Please enter both email and password.' };
    }

    // Support built-in demo traveler account
    if (normalizedEmail === 'elena@intregawings.com' && password === 'Intrega2026!') {
      const demoUser: UserProfile = {
        id: 'usr-demo-elena',
        fullName: 'Elena Lindqvist',
        email: 'elena@intregawings.com',
        phone: '+41 44 580 92 14',
        createdAt: '2026-01-10T09:00:00.000Z',
      };
      setUser(demoUser);
      try {
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(demoUser));
      } catch {
        // ignore
      }
      return { ok: true };
    }

    const accounts = getStoredAccounts();
    const match = accounts.find((a) => a.email.toLowerCase() === normalizedEmail);
    if (!match) {
      return {
        ok: false,
        error: 'No account found with that email. Use Demo Quick-Fill or create an account.',
      };
    }
    if (match.password !== password) {
      return { ok: false, error: 'Incorrect password. Please try again.' };
    }

    const profile: UserProfile = {
      id: match.id,
      fullName: match.fullName,
      email: match.email,
      phone: match.phone,
      createdAt: match.createdAt,
    };
    setUser(profile);
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(profile));
    } catch {
      // ignore
    }
    return { ok: true };
  }, []);

  const signup = useCallback(
    (fullName: string, email: string, phone: string, password: string): AuthResult => {
      const normalizedEmail = email.trim().toLowerCase();
      const accounts = getStoredAccounts();
      if (accounts.some((a) => a.email.toLowerCase() === normalizedEmail)) {
        return { ok: false, error: 'An account with this email already exists. Please log in.' };
      }

      const newAccount: StoredAccount = {
        id: `usr-${Date.now()}`,
        fullName: fullName.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        password,
        createdAt: new Date().toISOString(),
      };

      const nextAccounts = [...accounts, newAccount];
      const profile: UserProfile = {
        id: newAccount.id,
        fullName: newAccount.fullName,
        email: newAccount.email,
        phone: newAccount.phone,
        createdAt: newAccount.createdAt,
      };

      setUser(profile);
      try {
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(nextAccounts));
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(profile));
      } catch {
        // ignore
      }
      return { ok: true };
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    } catch {
      // ignore
    }
  }, []);

  const activeBookingsCount = bookings.filter((b) => b.status !== 'CANCELLED').length;
  const pendingBookingsCount = bookings.filter((b) => b.status === 'PENDING_VERIFICATION').length;

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        currency,
        setCurrency,
        searchParams,
        flights,
        isSearching,
        executeSearch,
        selectedFlight,
        setSelectedFlight,
        bookings,
        activeBookingsCount,
        pendingBookingsCount,
        createPendingBooking,
        verifyBookingPayment,
        cancelBooking,
        user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}
