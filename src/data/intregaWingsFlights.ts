import type { CabinClass, Flight } from '../types';
import { getAirportByCode } from './airports';

/**
 * Dedicated local configuration module for Intrega Wings's own operated fleet.
 * Includes full Bangladesh domestic & international routes (inbound and outbound)
 * alongside global flagship corridors.
 */

export interface IntregaFleetRouteConfig {
  flightNumber: string;
  originCode: string;
  destinationCode: string;
  aircraft: string;
  departureTime: string;
  arrivalTime: string;
  nextDayArrival?: boolean;
  durationMinutes: number;
  stops: number;
  stopoverCity?: string;
  baseEconomyUsd: number;
  terminalDep: string;
  terminalArr: string;
}

export const INTREGA_WINGS_SCHEDULE: IntregaFleetRouteConfig[] = [
  // Bangladesh <-> Middle East & Europe Flagship Corridors
  { flightNumber: 'IW-518', originCode: 'DAC', destinationCode: 'DXB', aircraft: 'Boeing 787-9 Dreamliner', departureTime: '10:15', arrivalTime: '13:45', durationMinutes: 330, stops: 0, baseEconomyUsd: 420, terminalDep: 'Terminal 2', terminalArr: 'Terminal 3' },
  { flightNumber: 'IW-519', originCode: 'DXB', destinationCode: 'DAC', aircraft: 'Boeing 787-9 Dreamliner', departureTime: '15:30', arrivalTime: '22:15', durationMinutes: 285, stops: 0, baseEconomyUsd: 410, terminalDep: 'Terminal 3', terminalArr: 'Terminal 2' },
  { flightNumber: 'IW-524', originCode: 'DAC', destinationCode: 'LHR', aircraft: 'Airbus A350-1000', departureTime: '11:30', arrivalTime: '17:55', durationMinutes: 625, stops: 0, baseEconomyUsd: 790, terminalDep: 'Terminal 2', terminalArr: 'Terminal 4' },
  { flightNumber: 'IW-525', originCode: 'LHR', destinationCode: 'DAC', aircraft: 'Airbus A350-1000', departureTime: '20:45', arrivalTime: '12:15', nextDayArrival: true, durationMinutes: 570, stops: 0, baseEconomyUsd: 765, terminalDep: 'Terminal 4', terminalArr: 'Terminal 2' },
  { flightNumber: 'IW-530', originCode: 'DAC', destinationCode: 'DOH', aircraft: 'Boeing 787-9 Dreamliner', departureTime: '03:20', arrivalTime: '06:35', durationMinutes: 375, stops: 0, baseEconomyUsd: 445, terminalDep: 'Terminal 2', terminalArr: 'Terminal 1' },
  { flightNumber: 'IW-531', originCode: 'DOH', destinationCode: 'DAC', aircraft: 'Boeing 787-9 Dreamliner', departureTime: '19:10', arrivalTime: '03:45', nextDayArrival: true, durationMinutes: 335, stops: 0, baseEconomyUsd: 435, terminalDep: 'Terminal 1', terminalArr: 'Terminal 2' },
  { flightNumber: 'IW-540', originCode: 'DAC', destinationCode: 'JED', aircraft: 'Airbus A350-900', departureTime: '14:15', arrivalTime: '18:45', durationMinutes: 450, stops: 0, baseEconomyUsd: 495, terminalDep: 'Terminal 2', terminalArr: 'Terminal 1' },
  { flightNumber: 'IW-541', originCode: 'JED', destinationCode: 'DAC', aircraft: 'Airbus A350-900', departureTime: '21:10', arrivalTime: '06:55', nextDayArrival: true, durationMinutes: 405, stops: 0, baseEconomyUsd: 485, terminalDep: 'Terminal 1', terminalArr: 'Terminal 2' },
  { flightNumber: 'IW-546', originCode: 'DAC', destinationCode: 'SIN', aircraft: 'Airbus A350-900', departureTime: '23:55', arrivalTime: '06:10', nextDayArrival: true, durationMinutes: 255, stops: 0, baseEconomyUsd: 365, terminalDep: 'Terminal 2', terminalArr: 'Terminal 3' },
  { flightNumber: 'IW-547', originCode: 'SIN', destinationCode: 'DAC', aircraft: 'Airbus A350-900', departureTime: '08:40', arrivalTime: '11:05', durationMinutes: 265, stops: 0, baseEconomyUsd: 355, terminalDep: 'Terminal 3', terminalArr: 'Terminal 2' },
  { flightNumber: 'IW-552', originCode: 'DAC', destinationCode: 'KUL', aircraft: 'Boeing 787-9 Dreamliner', departureTime: '09:10', arrivalTime: '15:05', durationMinutes: 235, stops: 0, baseEconomyUsd: 315, terminalDep: 'Terminal 2', terminalArr: 'Terminal 1' },
  { flightNumber: 'IW-553', originCode: 'KUL', destinationCode: 'DAC', aircraft: 'Boeing 787-9 Dreamliner', departureTime: '16:50', arrivalTime: '18:55', durationMinutes: 245, stops: 0, baseEconomyUsd: 310, terminalDep: 'Terminal 1', terminalArr: 'Terminal 2' },
  { flightNumber: 'IW-560', originCode: 'DAC', destinationCode: 'IST', aircraft: 'Airbus A350-1000', departureTime: '06:40', arrivalTime: '12:50', durationMinutes: 550, stops: 0, baseEconomyUsd: 640, terminalDep: 'Terminal 2', terminalArr: 'Main Terminal' },
  { flightNumber: 'IW-561', originCode: 'IST', destinationCode: 'DAC', aircraft: 'Airbus A350-1000', departureTime: '18:20', arrivalTime: '05:10', nextDayArrival: true, durationMinutes: 470, stops: 0, baseEconomyUsd: 625, terminalDep: 'Main Terminal', terminalArr: 'Terminal 2' },
  { flightNumber: 'IW-568', originCode: 'DAC', destinationCode: 'JFK', aircraft: 'Airbus A350-1000 ULR', departureTime: '01:30', arrivalTime: '09:15', durationMinutes: 945, stops: 0, baseEconomyUsd: 1090, terminalDep: 'Terminal 2', terminalArr: 'Terminal 1' },
  { flightNumber: 'IW-569', originCode: 'JFK', destinationCode: 'DAC', aircraft: 'Airbus A350-1000 ULR', departureTime: '13:45', arrivalTime: '15:20', nextDayArrival: true, durationMinutes: 935, stops: 0, baseEconomyUsd: 1050, terminalDep: 'Terminal 1', terminalArr: 'Terminal 2' },
  { flightNumber: 'IW-572', originCode: 'CGP', destinationCode: 'DXB', aircraft: 'Boeing 787-9 Dreamliner', departureTime: '19:45', arrivalTime: '23:10', durationMinutes: 325, stops: 0, baseEconomyUsd: 405, terminalDep: 'International', terminalArr: 'Terminal 3' },
  { flightNumber: 'IW-573', originCode: 'DXB', destinationCode: 'CGP', aircraft: 'Boeing 787-9 Dreamliner', departureTime: '01:15', arrivalTime: '08:05', durationMinutes: 290, stops: 0, baseEconomyUsd: 395, terminalDep: 'Terminal 3', terminalArr: 'International' },
  { flightNumber: 'IW-576', originCode: 'ZYL', destinationCode: 'LHR', aircraft: 'Boeing 787-9 Dreamliner', departureTime: '12:15', arrivalTime: '18:25', durationMinutes: 610, stops: 0, baseEconomyUsd: 785, terminalDep: 'International', terminalArr: 'Terminal 4' },
  { flightNumber: 'IW-577', originCode: 'LHR', destinationCode: 'ZYL', aircraft: 'Boeing 787-9 Dreamliner', departureTime: '21:30', arrivalTime: '12:45', nextDayArrival: true, durationMinutes: 555, stops: 0, baseEconomyUsd: 760, terminalDep: 'Terminal 4', terminalArr: 'International' },

  // Bangladesh Domestic Express Fleet (Dhaka <-> Cox's Bazar, Chattogram, Sylhet, Jashore, Saidpur, Rajshahi)
  { flightNumber: 'IW-011', originCode: 'DAC', destinationCode: 'CXB', aircraft: 'Airbus A220-300', departureTime: '08:15', arrivalTime: '09:15', durationMinutes: 60, stops: 0, baseEconomyUsd: 72, terminalDep: 'Domestic', terminalArr: 'Main Terminal' },
  { flightNumber: 'IW-012', originCode: 'CXB', destinationCode: 'DAC', aircraft: 'Airbus A220-300', departureTime: '10:00', arrivalTime: '11:00', durationMinutes: 60, stops: 0, baseEconomyUsd: 72, terminalDep: 'Main Terminal', terminalArr: 'Domestic' },
  { flightNumber: 'IW-015', originCode: 'DAC', destinationCode: 'CXB', aircraft: 'Airbus A220-300', departureTime: '15:30', arrivalTime: '16:30', durationMinutes: 60, stops: 0, baseEconomyUsd: 78, terminalDep: 'Domestic', terminalArr: 'Main Terminal' },
  { flightNumber: 'IW-021', originCode: 'DAC', destinationCode: 'CGP', aircraft: 'Airbus A220-300', departureTime: '09:00', arrivalTime: '09:50', durationMinutes: 50, stops: 0, baseEconomyUsd: 62, terminalDep: 'Domestic', terminalArr: 'Domestic' },
  { flightNumber: 'IW-022', originCode: 'CGP', destinationCode: 'DAC', aircraft: 'Airbus A220-300', departureTime: '11:15', arrivalTime: '12:05', durationMinutes: 50, stops: 0, baseEconomyUsd: 62, terminalDep: 'Domestic', terminalArr: 'Domestic' },
  { flightNumber: 'IW-031', originCode: 'DAC', destinationCode: 'ZYL', aircraft: 'Airbus A220-300', departureTime: '08:45', arrivalTime: '09:35', durationMinutes: 50, stops: 0, baseEconomyUsd: 59, terminalDep: 'Domestic', terminalArr: 'Domestic' },
  { flightNumber: 'IW-032', originCode: 'ZYL', destinationCode: 'DAC', aircraft: 'Airbus A220-300', departureTime: '10:40', arrivalTime: '11:30', durationMinutes: 50, stops: 0, baseEconomyUsd: 59, terminalDep: 'Domestic', terminalArr: 'Domestic' },
  { flightNumber: 'IW-041', originCode: 'DAC', destinationCode: 'JSR', aircraft: 'ATR 72-600 Executive', departureTime: '09:30', arrivalTime: '10:15', durationMinutes: 45, stops: 0, baseEconomyUsd: 55, terminalDep: 'Domestic', terminalArr: 'Main Terminal' },
  { flightNumber: 'IW-042', originCode: 'JSR', destinationCode: 'DAC', aircraft: 'ATR 72-600 Executive', departureTime: '11:00', arrivalTime: '11:45', durationMinutes: 45, stops: 0, baseEconomyUsd: 55, terminalDep: 'Main Terminal', terminalArr: 'Domestic' },
  { flightNumber: 'IW-051', originCode: 'DAC', destinationCode: 'SPD', aircraft: 'ATR 72-600 Executive', departureTime: '13:15', arrivalTime: '14:10', durationMinutes: 55, stops: 0, baseEconomyUsd: 60, terminalDep: 'Domestic', terminalArr: 'Main Terminal' },

  // Global International Flagship Routes
  { flightNumber: 'IW-101', originCode: 'LHR', destinationCode: 'DXB', aircraft: 'Airbus A350-1000', departureTime: '09:30', arrivalTime: '20:15', durationMinutes: 405, stops: 0, baseEconomyUsd: 645, terminalDep: 'Terminal 4', terminalArr: 'Terminal 3' },
  { flightNumber: 'IW-102', originCode: 'LHR', destinationCode: 'DXB', aircraft: 'Boeing 787-9 Dreamliner', departureTime: '21:15', arrivalTime: '08:05', nextDayArrival: true, durationMinutes: 410, stops: 0, baseEconomyUsd: 590, terminalDep: 'Terminal 4', terminalArr: 'Terminal 3' },
  { flightNumber: 'IW-204', originCode: 'DXB', destinationCode: 'HND', aircraft: 'Airbus A350-1000', departureTime: '02:45', arrivalTime: '17:20', durationMinutes: 575, stops: 0, baseEconomyUsd: 780, terminalDep: 'Terminal 3', terminalArr: 'Terminal 3' },
  { flightNumber: 'IW-308', originCode: 'JFK', destinationCode: 'CDG', aircraft: 'Boeing 787-9 Dreamliner', departureTime: '18:40', arrivalTime: '08:05', nextDayArrival: true, durationMinutes: 445, stops: 0, baseEconomyUsd: 615, terminalDep: 'Terminal 1', terminalArr: 'Terminal 2E' },
  { flightNumber: 'IW-412', originCode: 'SIN', destinationCode: 'ZRH', aircraft: 'Airbus A350-900 ULR', departureTime: '23:35', arrivalTime: '06:25', nextDayArrival: true, durationMinutes: 770, stops: 0, baseEconomyUsd: 890, terminalDep: 'Terminal 3', terminalArr: 'Dock E' },
  { flightNumber: 'IW-620', originCode: 'LHR', destinationCode: 'JFK', aircraft: 'Airbus A350-1000', departureTime: '11:20', arrivalTime: '14:15', durationMinutes: 475, stops: 0, baseEconomyUsd: 575, terminalDep: 'Terminal 4', terminalArr: 'Terminal 1' },
  { flightNumber: 'IW-702', originCode: 'ZRH', destinationCode: 'SIN', aircraft: 'Airbus A350-900 ULR', departureTime: '22:45', arrivalTime: '17:10', nextDayArrival: true, durationMinutes: 745, stops: 0, baseEconomyUsd: 865, terminalDep: 'Dock E', terminalArr: 'Terminal 3' },
  { flightNumber: 'IW-815', originCode: 'DXB', destinationCode: 'CDG', aircraft: 'Airbus A350-1000', departureTime: '08:20', arrivalTime: '13:30', durationMinutes: 430, stops: 0, baseEconomyUsd: 625, terminalDep: 'Terminal 3', terminalArr: 'Terminal 2E' },
];

const CABIN_MULTIPLIER: Record<CabinClass, number> = {
  Economy: 1,
  Business: 2.35,
  'First Class': 4.4,
};

const CABIN_BAGGAGE: Record<CabinClass, string> = {
  Economy: '35 kg Checked + 10 kg Cabin',
  Business: '50 kg Checked + 14 kg Cabin + Lounge',
  'First Class': '65 kg Checked + Private Suite + Chauffeur',
};

const CABIN_AMENITIES: Record<CabinClass, string[]> = {
  Economy: ['Starlink High-Speed Wi-Fi', 'Chef-Curated Hot Dining', '4K Seatback Cinema'],
  Business: ['Lie-Flat Horizon Suite', 'A la Carte Fine Dining', 'Priority Lounge & Fast Track', 'Complimentary Wi-Fi'],
  'First Class': ['Private Enclosed Suite', 'Dedicated In-Flight Sommelier', 'Chauffeur Airport Transfer', 'Unlimited Wi-Fi'],
};

function hashRoute(origin: string, destination: string): number {
  const str = `${origin}-${destination}`;
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) % 997;
  }
  return h;
}

const ADMIN_CUSTOM_FLEET_KEY = 'intrega_admin_custom_flights_v1';

export function getCustomAdminFleetRoutes(): IntregaFleetRouteConfig[] {
  try {
    const raw = localStorage.getItem(ADMIN_CUSTOM_FLEET_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as IntregaFleetRouteConfig[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCustomAdminFleetRoutes(routes: IntregaFleetRouteConfig[]): void {
  try {
    localStorage.setItem(ADMIN_CUSTOM_FLEET_KEY, JSON.stringify(routes));
  } catch {
    // ignore storage errors
  }
}

export function getAllIntregaFleetRoutes(): IntregaFleetRouteConfig[] {
  return [...getCustomAdminFleetRoutes(), ...INTREGA_WINGS_SCHEDULE];
}

export function getIntregaWingsInjectedFlights(
  originCode: string,
  destinationCode: string,
  departureDate: string,
  cabinClass: CabinClass
): Flight[] {
  const origin = getAirportByCode(originCode);
  const destination = getAirportByCode(destinationCode);
  const multiplier = CABIN_MULTIPLIER[cabinClass];

  const allRoutes = getAllIntregaFleetRoutes();
  const exactMatches = allRoutes.filter(
    (r) => r.originCode === origin.code && r.destinationCode === destination.code
  );

  if (exactMatches.length > 0) {
    return exactMatches.map((route, idx) => ({
      id: `iw-direct-${route.flightNumber}-${departureDate}-${idx}`,
      source: 'INTREGA_FLEET',
      isOfficialIntrega: true,
      airline: 'Intrega Wings',
      airlineCode: 'IW',
      flightNumber: route.flightNumber,
      aircraft: route.aircraft,
      origin,
      destination,
      departureDate,
      departureTime: route.departureTime,
      arrivalTime: route.arrivalTime,
      nextDayArrival: route.nextDayArrival,
      durationMinutes: route.durationMinutes,
      stops: route.stops,
      stopoverCity: route.stopoverCity,
      cabinClass,
      priceUsd: Math.round(route.baseEconomyUsd * multiplier),
      seatsAvailable: 6 + ((idx * 3 + 4) % 9),
      baggageAllowance: CABIN_BAGGAGE[cabinClass],
      amenities: CABIN_AMENITIES[cabinClass],
      refundable: true,
      terminalDep: route.terminalDep,
      terminalArr: route.terminalArr,
    }));
  }

  // Synthesize two official Intrega Wings departures for any domestic or global corridor
  const seed = hashRoute(origin.code, destination.code);
  const isDomesticBD = origin.country === 'Bangladesh' && destination.country === 'Bangladesh';
  const sameRegion = origin.region === destination.region;

  const baseDuration = isDomesticBD
    ? 45 + (seed % 20)
    : sameRegion
      ? 175 + (seed % 140)
      : 410 + (seed % 320);

  const basePrice = isDomesticBD
    ? 58 + (seed % 22)
    : sameRegion
      ? 310 + (seed % 180)
      : 560 + (seed % 340);

  const depHour1 = 8 + (seed % 4);
  const depMin1 = (seed % 4) * 15;
  const arrTotal1 = depHour1 * 60 + depMin1 + baseDuration;
  const arrHour1 = Math.floor(arrTotal1 / 60) % 24;
  const arrMin1 = arrTotal1 % 60;

  const depHour2 = 18 + (seed % 4);
  const depMin2 = ((seed + 2) % 4) * 15;
  const dur2 = baseDuration + (isDomesticBD ? 5 : 25);
  const arrTotal2 = depHour2 * 60 + depMin2 + dur2;
  const arrHour2 = Math.floor(arrTotal2 / 60) % 24;
  const arrMin2 = arrTotal2 % 60;

  const fmt = (h: number, m: number) =>
    `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

  return [
    {
      id: `iw-flagship-1-${origin.code}-${destination.code}-${departureDate}`,
      source: 'INTREGA_FLEET',
      isOfficialIntrega: true,
      airline: 'Intrega Wings',
      airlineCode: 'IW',
      flightNumber: `IW-${110 + (seed % 780)}`,
      aircraft: isDomesticBD ? 'Airbus A220-300' : 'Airbus A350-1000',
      origin,
      destination,
      departureDate,
      departureTime: fmt(depHour1, depMin1),
      arrivalTime: fmt(arrHour1, arrMin1),
      nextDayArrival: arrTotal1 >= 1440,
      durationMinutes: baseDuration,
      stops: 0,
      cabinClass,
      priceUsd: Math.round(basePrice * multiplier),
      seatsAvailable: 7,
      baggageAllowance: CABIN_BAGGAGE[cabinClass],
      amenities: CABIN_AMENITIES[cabinClass],
      refundable: true,
      terminalDep: isDomesticBD ? 'Domestic Terminal' : 'Terminal 1',
      terminalArr: isDomesticBD ? 'Main Terminal' : 'Terminal 3',
    },
    {
      id: `iw-flagship-2-${origin.code}-${destination.code}-${departureDate}`,
      source: 'INTREGA_FLEET',
      isOfficialIntrega: true,
      airline: 'Intrega Wings',
      airlineCode: 'IW',
      flightNumber: `IW-${220 + (seed % 650)}`,
      aircraft: isDomesticBD ? 'ATR 72-600 Executive' : 'Boeing 787-9 Dreamliner',
      origin,
      destination,
      departureDate,
      departureTime: fmt(depHour2, depMin2),
      arrivalTime: fmt(arrHour2, arrMin2),
      nextDayArrival: arrTotal2 >= 1440,
      durationMinutes: dur2,
      stops: 0,
      cabinClass,
      priceUsd: Math.round(Math.max(48, basePrice - (isDomesticBD ? 6 : 35)) * multiplier),
      seatsAvailable: 11,
      baggageAllowance: CABIN_BAGGAGE[cabinClass],
      amenities: CABIN_AMENITIES[cabinClass],
      refundable: true,
      terminalDep: isDomesticBD ? 'Domestic Terminal' : 'Terminal 1',
      terminalArr: isDomesticBD ? 'Main Terminal' : 'Terminal 2',
    },
  ];
}
