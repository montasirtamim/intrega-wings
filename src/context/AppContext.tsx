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
  LEGACY_SHARED_BOOKINGS: 'intrega-wings-bookings-v1',
  AUTH_USER: 'intrega-wings-auth-user-v1',
  ACCOUNTS: 'intrega-wings-accounts-v1',
  SELECTED_FLIGHT: 'intrega-wings-selected-flight',
};

const USER_BOOKINGS_PREFIX = 'intrega_bookings_';

function getUserBookingsKey(email: string): string {
  return `${USER_BOOKINGS_PREFIX}${email.trim().toLowerCase()}`;
}

function loadBookingsForUser(email: string): Booking[] {
  try {
    const raw = localStorage.getItem(getUserBookingsKey(email));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Booking[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveBookingsForUser(email: string, bookings: Booking[]): void {
  try {
    localStorage.setItem(getUserBookingsKey(email), JSON.stringify(bookings));
  } catch {
    // ignore storage errors
  }
}

interface StoredAccount extends UserProfile {
  password: string;
}

interface AuthResult {
  ok: boolean;
  role?: 'admin' | 'user';
  error?: string;
}

export interface SystemBookingEntry extends Booking {
  ownerEmail: string;
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
  createPendingBooking: (booking: Booking) => boolean;
  verifyBookingPayment: (bookingId: string, txId: string) => Booking | undefined;
  cancelBooking: (bookingId: string) => void;
  user: UserProfile | null;
  isAdmin: boolean;
  login: (email: string, password: string) => AuthResult;
  signup: (fullName: string, email: string, phone: string, password: string) => AuthResult;
  logout: () => void;
  // Admin-exclusive operations
  getAllSystemBookings: () => SystemBookingEntry[];
  adminVerifySystemBooking: (ownerEmail: string, bookingId: string) => void;
  adminCancelSystemBooking: (ownerEmail: string, bookingId: string) => void;
  getRegisteredUsers: () => UserProfile[];
  toastMessage: string | null;
  showToast: (msg: string) => void;
  clearToast: () => void;
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

  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      return raw ? (JSON.parse(raw) as UserProfile) : null;
    } catch {
      return null;
    }
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      localStorage.removeItem(STORAGE_KEYS.LEGACY_SHARED_BOOKINGS);
      const rawUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (!rawUser) return [];
      const currentUser = JSON.parse(rawUser) as UserProfile;
      return currentUser?.email ? loadBookingsForUser(currentUser.email) : [];
    } catch {
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  const clearToast = useCallback(() => {
    setToastMessage(null);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const t = window.setTimeout(() => setToastMessage(null), 5000);
    return () => window.clearTimeout(t);
  }, [toastMessage]);

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

  const setCurrency = useCallback((c: CurrencyCode) => {
    setCurrencyState(c);
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENCY, c);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setBookings([]);
    } else {
      setBookings(loadBookingsForUser(user.email));
    }
  }, [user]);

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

  useEffect(() => {
    executeSearch(DEFAULT_SEARCH_PARAMS);
  }, [executeSearch]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const createPendingBooking = useCallback(
    (booking: Booking): boolean => {
      if (!user) return false;
      const ownedBooking: Booking = {
        ...booking,
        userId: user.id,
        userEmail: user.email,
      };
      setBookings((prev) => {
        const next = [ownedBooking, ...prev];
        saveBookingsForUser(user.email, next);
        return next;
      });
      return true;
    },
    [user]
  );

  const verifyBookingPayment = useCallback(
    (bookingId: string, txId: string): Booking | undefined => {
      if (!user) return undefined;
      let confirmedBooking: Booking | undefined;
      setBookings((prev) => {
        const next = prev.map((b) => {
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
        });
        saveBookingsForUser(user.email, next);
        return next;
      });
      return confirmedBooking;
    },
    [user]
  );

  const cancelBooking = useCallback(
    (bookingId: string) => {
      if (!user) return;
      setBookings((prev) => {
        const next = prev.map((b) =>
          b.id === bookingId
            ? { ...b, status: 'CANCELLED' as const, cancelledAt: new Date().toISOString() }
            : b
        );
        saveBookingsForUser(user.email, next);
        return next;
      });
    },
    [user]
  );

  const login = useCallback((email: string, password: string): AuthResult => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      return { ok: false, error: 'Please enter both email and password.' };
    }

    // Official Intrega Wings Admin Account
    if (normalizedEmail === 'admin@intregawings.com' && password === 'Admin2026!') {
      const adminUser: UserProfile = {
        id: 'usr-admin-01',
        fullName: 'Chief Aviation Admin',
        email: 'admin@intregawings.com',
        phone: '+41 44 580 92 00',
        role: 'admin',
        createdAt: '2026-01-01T00:00:00.000Z',
      };
      setUser(adminUser);
      setBookings(loadBookingsForUser(adminUser.email));
      try {
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(adminUser));
      } catch {
        // ignore
      }
      return { ok: true, role: 'admin' };
    }

    // Demo Traveler Account
    if (normalizedEmail === 'elena@intregawings.com' && password === 'Intrega2026!') {
      const demoUser: UserProfile = {
        id: 'usr-demo-elena',
        fullName: 'Elena Lindqvist',
        email: 'elena@intregawings.com',
        phone: '+41 44 580 92 14',
        role: 'user',
        createdAt: '2026-01-10T09:00:00.000Z',
      };
      setUser(demoUser);
      setBookings(loadBookingsForUser(demoUser.email));
      try {
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(demoUser));
      } catch {
        // ignore
      }
      return { ok: true, role: 'user' };
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
      role: match.role || 'user',
      createdAt: match.createdAt,
    };
    setUser(profile);
    setBookings(loadBookingsForUser(profile.email));
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(profile));
    } catch {
      // ignore
    }
    return { ok: true, role: profile.role };
  }, []);

  const signup = useCallback(
    (fullName: string, email: string, phone: string, password: string): AuthResult => {
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail === 'admin@intregawings.com') {
        return { ok: false, error: 'This email is reserved for Intrega Wings administration.' };
      }

      const accounts = getStoredAccounts();
      if (accounts.some((a) => a.email.toLowerCase() === normalizedEmail)) {
        return { ok: false, error: 'An account with this email already exists. Please log in.' };
      }

      const newAccount: StoredAccount = {
        id: `usr-${Date.now()}`,
        fullName: fullName.trim(),
        email: normalizedEmail,
        phone: phone.trim(),
        role: 'user',
        password,
        createdAt: new Date().toISOString(),
      };

      const nextAccounts = [...accounts, newAccount];
      const profile: UserProfile = {
        id: newAccount.id,
        fullName: newAccount.fullName,
        email: newAccount.email,
        phone: newAccount.phone,
        role: 'user',
        createdAt: newAccount.createdAt,
      };

      setUser(profile);
      setBookings([]);
      try {
        localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(nextAccounts));
        localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(profile));
      } catch {
        // ignore
      }
      return { ok: true, role: 'user' };
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    setBookings([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    } catch {
      // ignore
    }
  }, []);

  const isAdmin = user?.role === 'admin';

  // Admin-exclusive: aggregates bookings across all user-specific keys (`intrega_bookings_*`)
  const getAllSystemBookings = useCallback((): SystemBookingEntry[] => {
    if (!isAdmin) return [];
    const results: SystemBookingEntry[] = [];
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith(USER_BOOKINGS_PREFIX)) continue;
        const ownerEmail = key.slice(USER_BOOKINGS_PREFIX.length);
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw) as Booking[];
        if (Array.isArray(parsed)) {
          parsed.forEach((b) => {
            results.push({ ...b, ownerEmail });
          });
        }
      }
    } catch {
      // ignore
    }
    return results.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [isAdmin]);

  const adminVerifySystemBooking = useCallback(
    (ownerEmail: string, bookingId: string) => {
      if (!isAdmin) return;
      const list = loadBookingsForUser(ownerEmail);
      const next = list.map((b) =>
        b.id === bookingId
          ? {
              ...b,
              status: 'CONFIRMED' as const,
              payment: {
                ...b.payment,
                verifiedAt: new Date().toISOString(),
                webhookEventId: `ADMIN-VERIFIED-${Math.floor(100000 + Math.random() * 900000)}`,
              },
            }
          : b
      );
      saveBookingsForUser(ownerEmail, next);
      if (user?.email.toLowerCase() === ownerEmail.toLowerCase()) {
        setBookings(next);
      }
    },
    [isAdmin, user?.email]
  );

  const adminCancelSystemBooking = useCallback(
    (ownerEmail: string, bookingId: string) => {
      if (!isAdmin) return;
      const list = loadBookingsForUser(ownerEmail);
      const next = list.map((b) =>
        b.id === bookingId
          ? { ...b, status: 'CANCELLED' as const, cancelledAt: new Date().toISOString() }
          : b
      );
      saveBookingsForUser(ownerEmail, next);
      if (user?.email.toLowerCase() === ownerEmail.toLowerCase()) {
        setBookings(next);
      }
    },
    [isAdmin, user?.email]
  );

  const getRegisteredUsers = useCallback((): UserProfile[] => {
    if (!isAdmin) return [];
    const stored = getStoredAccounts().map(({ password: _pw, ...profile }) => profile);
    const demoTraveler: UserProfile = {
      id: 'usr-demo-elena',
      fullName: 'Elena Lindqvist (Demo)',
      email: 'elena@intregawings.com',
      phone: '+41 44 580 92 14',
      role: 'user',
      createdAt: '2026-01-10T09:00:00.000Z',
    };
    return [demoTraveler, ...stored];
  }, [isAdmin]);

  const activeBookingsCount = user
    ? bookings.filter((b) => b.status !== 'CANCELLED').length
    : 0;
  const pendingBookingsCount = user
    ? bookings.filter((b) => b.status === 'PENDING_VERIFICATION').length
    : 0;

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
        bookings: user ? bookings : [],
        activeBookingsCount,
        pendingBookingsCount,
        createPendingBooking,
        verifyBookingPayment,
        cancelBooking,
        user,
        isAdmin,
        login,
        signup,
        logout,
        getAllSystemBookings,
        adminVerifySystemBooking,
        adminCancelSystemBooking,
        getRegisteredUsers,
        toastMessage,
        showToast,
        clearToast,
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
