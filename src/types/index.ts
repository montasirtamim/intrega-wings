export type ThemeMode = 'light' | 'dark';

export type CurrencyCode = 'USD' | 'BDT' | 'EUR' | 'GBP' | 'AED' | 'JPY' | 'SGD' | 'CHF';

export type TripType = 'one-way' | 'round-trip' | 'multi-city';

export type CabinClass = 'Economy' | 'Business' | 'First Class';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  region: 'Europe' | 'Middle East' | 'Asia-Pacific' | 'North America' | 'South America' | 'Africa';
  timezone: string;
}

export interface MultiCityLeg {
  id: string;
  origin: string;
  destination: string;
  departureDate: string;
}

export interface PassengerCounts {
  adults: number;
  children: number;
  infants: number;
}

export interface FlightSearchParams {
  tripType: TripType;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  multiCityLegs?: MultiCityLeg[];
  passengers: PassengerCounts;
  cabinClass: CabinClass;
}

export interface Flight {
  id: string;
  source: 'INTREGA_FLEET' | 'EXTERNAL_GDS_API';
  isOfficialIntrega: boolean;
  airline: string;
  airlineCode: string;
  flightNumber: string;
  aircraft: string;
  origin: Airport;
  destination: Airport;
  departureDate: string;
  departureTime: string;
  arrivalTime: string;
  nextDayArrival?: boolean;
  durationMinutes: number;
  stops: number;
  stopoverCity?: string;
  cabinClass: CabinClass;
  priceUsd: number;
  seatsAvailable: number;
  baggageAllowance: string;
  amenities: string[];
  refundable: boolean;
  terminalDep: string;
  terminalArr: string;
}

export type BookingStatus = 'PENDING_VERIFICATION' | 'CONFIRMED' | 'CANCELLED';

export type CryptoPaymentMethod = 'BINANCE_PAY' | 'USDT_TRC20' | 'USDT_BEP20' | 'BTC' | 'ETH';

export interface PassengerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  passportNumber: string;
  nationality: string;
  seatPreference: string;
}

export interface BookingAddOns {
  extraBaggageKg: number;
  loungeAccess: boolean;
  priorityBoarding: boolean;
  addOnsTotalUsd: number;
}

export interface PaymentRecord {
  method: CryptoPaymentMethod;
  amountUsd: number;
  cryptoAmount: string;
  cryptoSymbol: string;
  depositTarget: string;
  orderReference: string;
  txId: string;
  initiatedAt: string;
  verifiedAt?: string;
  webhookEventId?: string;
}

export interface Booking {
  id: string;
  pnr: string;
  status: BookingStatus;
  createdAt: string;
  cancelledAt?: string;
  flight: Flight;
  tripType: TripType;
  returnDate?: string;
  passengers: PassengerCounts;
  primaryPassenger: PassengerInfo;
  seatNumber: string;
  addOns?: BookingAddOns;
  totalPriceUsd: number;
  currencyAtBooking: CurrencyCode;
  payment: PaymentRecord;
}

export interface TouristSpotPackage {
  id: string;
  name: string;
  priceUsd: number;
  perks: string[];
}

export interface TouristSpot {
  id: string;
  name: string;
  city: string;
  country: string;
  nearestAirportCode: string;
  category: 'Theme Park' | 'Landmark' | 'Nature & Culture' | 'Coastal Heritage';
  imageUrl: string;
  rating: number;
  reviewCount: number;
  basePriceUsd: number;
  availability: 'Available Today' | 'Limited Slots' | 'Instant Confirmation';
  summary: string;
  highlights: string[];
  officialProviderName: string;
  officialBookingBaseUrl: string;
  partnerApiEndpoint: string;
  partnerCode: string;
  packages: TouristSpotPackage[];
}
