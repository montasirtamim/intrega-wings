import { getAirportByCode } from '../data/airports';
import { getIntregaWingsInjectedFlights } from '../data/intregaWingsFlights';
import type { CabinClass, Flight, FlightSearchParams } from '../types';

/**
 * External Global Flight API Integration Layer (Amadeus / Duffel / Skyscanner ready).
 *
 * Phase 2 Backend Wiring:
 * Replace `fetchExternalPartnerFlights` body with a fetch() call to your backend proxy
 * pointing to Amadeus Flight Offers Search (`POST /v2/shopping/flight-offers`) or Duffel
 * (`POST /air/offer_requests`), while preserving the exact `Flight[]` return contract.
 * Intrega Wings's own fleet (`intregaWingsFlights.ts`) is merged independently afterwards.
 */

export const EXTERNAL_FLIGHT_API_CONFIG = {
  provider: 'AMADEUS_DUFFEL_BRIDGE',
  endpoint: '/api/v1/flights/search', // Future backend proxy endpoint
  mode: 'SIMULATED_GDS_FEED' as 'SIMULATED_GDS_FEED' | 'LIVE_API',
};

interface PartnerCarrier {
  name: string;
  code: string;
  hub: string;
  aircraft: string[];
  priceFactor: number;
}

const PARTNER_CARRIERS: PartnerCarrier[] = [
  { name: 'Emirates', code: 'EK', hub: 'Dubai', aircraft: ['Airbus A380-800', 'Boeing 777-300ER'], priceFactor: 1.08 },
  { name: 'Qatar Airways', code: 'QR', hub: 'Doha', aircraft: ['Airbus A350-1000', 'Boeing 787-9'], priceFactor: 1.05 },
  { name: 'Singapore Airlines', code: 'SQ', hub: 'Singapore', aircraft: ['Airbus A350-900', 'Boeing 777-300ER'], priceFactor: 1.12 },
  { name: 'Turkish Airlines', code: 'TK', hub: 'Istanbul', aircraft: ['Airbus A350-900', 'Boeing 787-9'], priceFactor: 0.94 },
  { name: 'Lufthansa', code: 'LH', hub: 'Frankfurt', aircraft: ['Boeing 747-8', 'Airbus A350-900'], priceFactor: 1.02 },
  { name: 'SWISS International', code: 'LX', hub: 'Zurich', aircraft: ['Boeing 777-300ER', 'Airbus A330-300'], priceFactor: 1.07 },
  { name: 'British Airways', code: 'BA', hub: 'London', aircraft: ['Airbus A350-1000', 'Boeing 787-10'], priceFactor: 1.01 },
  { name: 'ANA All Nippon', code: 'NH', hub: 'Tokyo', aircraft: ['Boeing 787-9 Dreamliner', 'Boeing 777-300ER'], priceFactor: 1.09 },
];

const CABIN_MULTIPLIER: Record<CabinClass, number> = {
  Economy: 1,
  Business: 2.75,
  'First Class': 5.1,
};

function deterministicSeed(input: string): number {
  let hash = 7;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 37 + input.charCodeAt(i)) % 10007;
  }
  return hash;
}

function formatTime(totalMinutes: number): { time: string; nextDay: boolean } {
  const nextDay = totalMinutes >= 1440;
  const wrapped = totalMinutes % 1440;
  const h = Math.floor(wrapped / 60);
  const m = wrapped % 60;
  return {
    time: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`,
    nextDay,
  };
}

/**
 * Simulated External GDS API call returning realistic international partner airline offers.
 */
export async function fetchExternalPartnerFlights(
  originCode: string,
  destinationCode: string,
  departureDate: string,
  cabinClass: CabinClass
): Promise<Flight[]> {
  // Subtle realistic network latency for smooth UX feedback
  await new Promise((resolve) => setTimeout(resolve, 420));

  const origin = getAirportByCode(originCode);
  const destination = getAirportByCode(destinationCode);
  const seed = deterministicSeed(`${origin.code}-${destination.code}-${departureDate}`);
  const sameRegion = origin.region === destination.region;
  const baseDur = sameRegion ? 185 + (seed % 130) : 420 + (seed % 340);
  const baseFare = sameRegion ? 295 + (seed % 165) : 565 + (seed % 320);

  // Pick 6 distinct partner airlines deterministically for the corridor
  const selectedCarriers = Array.from({ length: 6 }, (_, i) => {
    return PARTNER_CARRIERS[(seed + i) % PARTNER_CARRIERS.length];
  });

  return selectedCarriers.map((carrier, idx) => {
    const isDirect = idx < 3 || (seed + idx) % 3 === 0;
    const stops = isDirect ? 0 : 1;
    const extraStopMinutes = stops === 1 ? 115 + ((seed + idx * 17) % 80) : 0;
    const durationMinutes = baseDur + extraStopMinutes + ((idx * 15) % 45);

    const depMinutes = ((6 + idx * 3 + (seed % 2)) % 22) * 60 + ((idx * 15) % 60);
    const depFmt = formatTime(depMinutes);
    const arrFmt = formatTime(depMinutes + durationMinutes);

    const priceUsd = Math.round(
      baseFare * carrier.priceFactor * (isDirect ? 1.06 : 0.91) * CABIN_MULTIPLIER[cabinClass]
    );

    const baggageByCabin: Record<CabinClass, string> = {
      Economy: '30 kg Checked + 7 kg Cabin',
      Business: '40 kg Checked + 12 kg Cabin',
      'First Class': '50 kg Checked + Lounge Access',
    };

    const amenitiesByCabin: Record<CabinClass, string[]> = {
      Economy: ['In-Flight Meal', 'Personal Entertainment', 'USB Power'],
      Business: ['Flat-Bed Seat', 'Gourmet Dining', 'Business Lounge'],
      'First Class': ['Private Cabin', 'Fine Dining & Vintage Cellar', 'First Class Lounge'],
    };

    const stopCity =
      stops === 1 && carrier.hub !== origin.city && carrier.hub !== destination.city
        ? carrier.hub
        : stops === 1
          ? 'Istanbul'
          : undefined;

    return {
      id: `gds-${carrier.code}-${origin.code}-${destination.code}-${departureDate}-${idx}`,
      source: 'EXTERNAL_GDS_API',
      isOfficialIntrega: false,
      airline: carrier.name,
      airlineCode: carrier.code,
      flightNumber: `${carrier.code}-${200 + ((seed + idx * 73) % 780)}`,
      aircraft: carrier.aircraft[idx % carrier.aircraft.length],
      origin,
      destination,
      departureDate,
      departureTime: depFmt.time,
      arrivalTime: arrFmt.time,
      nextDayArrival: arrFmt.nextDay,
      durationMinutes,
      stops,
      stopoverCity: stopCity,
      cabinClass,
      priceUsd,
      seatsAvailable: 3 + ((seed + idx * 5) % 14),
      baggageAllowance: baggageByCabin[cabinClass],
      amenities: amenitiesByCabin[cabinClass],
      refundable: cabinClass !== 'Economy',
      terminalDep: `Terminal ${1 + (idx % 4)}`,
      terminalArr: `Terminal ${1 + ((idx + 1) % 3)}`,
    };
  });
}

/**
 * Dual-Source Flight Search Orchestrator:
 * 1. Fetches external global airline inventory from `fetchExternalPartnerFlights` (API-ready).
 * 2. Independently injects official Intrega Wings fleet flights from `data/intregaWingsFlights.ts`.
 * 3. Returns unified, sorted inventory with Intrega Wings official flights featured cleanly.
 */
export async function searchInternationalFlights(params: FlightSearchParams): Promise<Flight[]> {
  const activeOrigin =
    params.tripType === 'multi-city' && params.multiCityLegs && params.multiCityLegs.length > 0
      ? params.multiCityLegs[0].origin
      : params.origin;

  const activeDestination =
    params.tripType === 'multi-city' && params.multiCityLegs && params.multiCityLegs.length > 0
      ? params.multiCityLegs[0].destination
      : params.destination;

  const activeDate =
    params.tripType === 'multi-city' && params.multiCityLegs && params.multiCityLegs.length > 0
      ? params.multiCityLegs[0].departureDate
      : params.departureDate;

  const [partnerFlights, intregaFlights] = await Promise.all([
    fetchExternalPartnerFlights(activeOrigin, activeDestination, activeDate, params.cabinClass),
    Promise.resolve(
      getIntregaWingsInjectedFlights(activeOrigin, activeDestination, activeDate, params.cabinClass)
    ),
  ]);

  // Place official Intrega Wings flights prominently at the top, followed by partner carriers by price
  const sortedPartners = [...partnerFlights].sort((a, b) => a.priceUsd - b.priceUsd);
  return [...intregaFlights, ...sortedPartners];
}
