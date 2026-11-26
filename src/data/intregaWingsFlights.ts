import type { CabinClass, Flight } from '../types';
import { getAirportByCode } from './airports';

/**
 * Dedicated local configuration module for Intrega Wings's own operated fleet.
 * These flights are injected independently of external GDS APIs (Amadeus / Duffel / Skyscanner)
 * so passengers can book Intrega Wings's flagship international routes seamlessly alongside partner airlines.
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
  {
    flightNumber: 'IW-101',
    originCode: 'LHR',
    destinationCode: 'DXB',
    aircraft: 'Airbus A350-1000',
    departureTime: '09:30',
    arrivalTime: '20:15',
    durationMinutes: 405,
    stops: 0,
    baseEconomyUsd: 645,
    terminalDep: 'Terminal 4',
    terminalArr: 'Terminal 3',
  },
  {
    flightNumber: 'IW-102',
    originCode: 'LHR',
    destinationCode: 'DXB',
    aircraft: 'Boeing 787-9 Dreamliner',
    departureTime: '21:15',
    arrivalTime: '08:05',
    nextDayArrival: true,
    durationMinutes: 410,
    stops: 0,
    baseEconomyUsd: 590,
    terminalDep: 'Terminal 4',
    terminalArr: 'Terminal 3',
  },
  {
    flightNumber: 'IW-204',
    originCode: 'DXB',
    destinationCode: 'HND',
    aircraft: 'Airbus A350-1000',
    departureTime: '02:45',
    arrivalTime: '17:20',
    durationMinutes: 575,
    stops: 0,
    baseEconomyUsd: 780,
    terminalDep: 'Terminal 3',
    terminalArr: 'Terminal 3',
  },
  {
    flightNumber: 'IW-308',
    originCode: 'JFK',
    destinationCode: 'CDG',
    aircraft: 'Boeing 787-9 Dreamliner',
    departureTime: '18:40',
    arrivalTime: '08:05',
    nextDayArrival: true,
    durationMinutes: 445,
    stops: 0,
    baseEconomyUsd: 615,
    terminalDep: 'Terminal 1',
    terminalArr: 'Terminal 2E',
  },
  {
    flightNumber: 'IW-412',
    originCode: 'SIN',
    destinationCode: 'ZRH',
    aircraft: 'Airbus A350-900 ULR',
    departureTime: '23:35',
    arrivalTime: '06:25',
    nextDayArrival: true,
    durationMinutes: 770,
    stops: 0,
    baseEconomyUsd: 890,
    terminalDep: 'Terminal 3',
    terminalArr: 'Dock E',
  },
  {
    flightNumber: 'IW-518',
    originCode: 'DAC',
    destinationCode: 'DXB',
    aircraft: 'Boeing 787-9 Dreamliner',
    departureTime: '10:15',
    arrivalTime: '13:45',
    durationMinutes: 330,
    stops: 0,
    baseEconomyUsd: 420,
    terminalDep: 'Terminal 2',
    terminalArr: 'Terminal 3',
  },
  {
    flightNumber: 'IW-620',
    originCode: 'LHR',
    destinationCode: 'JFK',
    aircraft: 'Airbus A350-1000',
    departureTime: '11:20',
    arrivalTime: '14:15',
    durationMinutes: 475,
    stops: 0,
    baseEconomyUsd: 575,
    terminalDep: 'Terminal 4',
    terminalArr: 'Terminal 1',
  },
  {
    flightNumber: 'IW-702',
    originCode: 'ZRH',
    destinationCode: 'SIN',
    aircraft: 'Airbus A350-900 ULR',
    departureTime: '22:45',
    arrivalTime: '17:10',
    nextDayArrival: true,
    durationMinutes: 745,
    stops: 0,
    baseEconomyUsd: 865,
    terminalDep: 'Dock E',
    terminalArr: 'Terminal 3',
  },
  {
    flightNumber: 'IW-815',
    originCode: 'DXB',
    destinationCode: 'CDG',
    aircraft: 'Airbus A350-1000',
    departureTime: '08:20',
    arrivalTime: '13:30',
    durationMinutes: 430,
    stops: 0,
    baseEconomyUsd: 625,
    terminalDep: 'Terminal 3',
    terminalArr: 'Terminal 2E',
  },
];

const CABIN_MULTIPLIER: Record<CabinClass, number> = {
  Economy: 1,
  Business: 2.65,
  'First Class': 4.8,
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

/**
 * Returns Intrega Wings's manually injected flights for the requested route.
 * Matches explicit fleet routes first, and synthesizes flagship Intrega Wings charter/code-operated
 * departures on any international corridor so Intrega Wings is always bookable globally.
 */
export function getIntregaWingsInjectedFlights(
  originCode: string,
  destinationCode: string,
  departureDate: string,
  cabinClass: CabinClass
): Flight[] {
  const origin = getAirportByCode(originCode);
  const destination = getAirportByCode(destinationCode);
  const multiplier = CABIN_MULTIPLIER[cabinClass];

  const exactMatches = INTREGA_WINGS_SCHEDULE.filter(
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

  // Synthesize two official Intrega Wings fleet departures for any global corridor
  const seed = hashRoute(origin.code, destination.code);
  const sameRegion = origin.region === destination.region;
  const baseDuration = sameRegion ? 175 + (seed % 140) : 410 + (seed % 320);
  const basePrice = sameRegion ? 310 + (seed % 180) : 580 + (seed % 340);

  const depHour1 = 8 + (seed % 4);
  const depMin1 = (seed % 4) * 15;
  const arrTotal1 = depHour1 * 60 + depMin1 + baseDuration;
  const arrHour1 = Math.floor(arrTotal1 / 60) % 24;
  const arrMin1 = arrTotal1 % 60;

  const depHour2 = 19 + (seed % 4);
  const depMin2 = ((seed + 2) % 4) * 15;
  const dur2 = baseDuration + 25;
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
      aircraft: 'Airbus A350-1000',
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
      terminalDep: 'Terminal 1',
      terminalArr: 'Terminal 3',
    },
    {
      id: `iw-flagship-2-${origin.code}-${destination.code}-${departureDate}`,
      source: 'INTREGA_FLEET',
      isOfficialIntrega: true,
      airline: 'Intrega Wings',
      airlineCode: 'IW',
      flightNumber: `IW-${220 + (seed % 650)}`,
      aircraft: 'Boeing 787-9 Dreamliner',
      origin,
      destination,
      departureDate,
      departureTime: fmt(depHour2, depMin2),
      arrivalTime: fmt(arrHour2, arrMin2),
      nextDayArrival: arrTotal2 >= 1440,
      durationMinutes: dur2,
      stops: 0,
      cabinClass,
      priceUsd: Math.round((basePrice - 35) * multiplier),
      seatsAvailable: 11,
      baggageAllowance: CABIN_BAGGAGE[cabinClass],
      amenities: CABIN_AMENITIES[cabinClass],
      refundable: true,
      terminalDep: 'Terminal 1',
      terminalArr: 'Terminal 2',
    },
  ];
}
