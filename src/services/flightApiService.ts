import { getAirportByCode } from '../data/airports';
import { getIntregaWingsInjectedFlights } from '../data/intregaWingsFlights';
import type { CabinClass, Flight, FlightSearchParams } from '../types';

export const EXTERNAL_FLIGHT_API_CONFIG = {
  provider: 'AMADEUS_DUFFEL_BRIDGE',
  endpoint: '/api/v1/flights/search',
  mode: 'SIMULATED_GDS_FEED' as 'SIMULATED_GDS_FEED' | 'LIVE_API',
};

interface PartnerCarrier {
  name: string;
  code: string;
  hub: string;
  aircraft: string[];
  priceFactor: number;
  bangladeshSpecialist?: boolean;
  domesticBangladesh?: boolean;
}

const PARTNER_CARRIERS: PartnerCarrier[] = [
  { name: 'Biman Bangladesh Airlines', code: 'BG', hub: 'Dhaka', aircraft: ['Boeing 787-9 Dreamliner', 'Boeing 777-300ER'], priceFactor: 0.92, bangladeshSpecialist: true, domesticBangladesh: true },
  { name: 'US-Bangla Airlines', code: 'BS', hub: 'Dhaka', aircraft: ['Airbus A330-300', 'Boeing 737-800'], priceFactor: 0.89, bangladeshSpecialist: true, domesticBangladesh: true },
  { name: 'NOVOAIR', code: 'VQ', hub: 'Dhaka', aircraft: ['ATR 72-500'], priceFactor: 0.87, bangladeshSpecialist: true, domesticBangladesh: true },
  { name: 'Emirates', code: 'EK', hub: 'Dubai', aircraft: ['Airbus A380-800', 'Boeing 777-300ER'], priceFactor: 1.08, bangladeshSpecialist: true },
  { name: 'Qatar Airways', code: 'QR', hub: 'Doha', aircraft: ['Airbus A350-1000', 'Boeing 787-9'], priceFactor: 1.05, bangladeshSpecialist: true },
  { name: 'Singapore Airlines', code: 'SQ', hub: 'Singapore', aircraft: ['Airbus A350-900', 'Boeing 777-300ER'], priceFactor: 1.12, bangladeshSpecialist: true },
  { name: 'Turkish Airlines', code: 'TK', hub: 'Istanbul', aircraft: ['Airbus A350-900', 'Boeing 787-9'], priceFactor: 0.95, bangladeshSpecialist: true },
  { name: 'Lufthansa', code: 'LH', hub: 'Frankfurt', aircraft: ['Boeing 747-8', 'Airbus A350-900'], priceFactor: 1.02 },
  { name: 'SWISS International', code: 'LX', hub: 'Zurich', aircraft: ['Boeing 777-300ER', 'Airbus A330-300'], priceFactor: 1.07 },
  { name: 'British Airways', code: 'BA', hub: 'London', aircraft: ['Airbus A350-1000', 'Boeing 787-10'], priceFactor: 1.01 },
  { name: 'ANA All Nippon', code: 'NH', hub: 'Tokyo', aircraft: ['Boeing 787-9 Dreamliner', 'Boeing 777-300ER'], priceFactor: 1.09 },
];

const CABIN_MULTIPLIER: Record<CabinClass, number> = {
  Economy: 1,
  Business: 2.55,
  'First Class': 4.85,
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

export async function fetchExternalPartnerFlights(
  originCode: string,
  destinationCode: string,
  departureDate: string,
  cabinClass: CabinClass
): Promise<Flight[]> {
  await new Promise((resolve) => setTimeout(resolve, 380));

  const origin = getAirportByCode(originCode);
  const destination = getAirportByCode(destinationCode);
  const seed = deterministicSeed(`${origin.code}-${destination.code}-${departureDate}`);
  const isDomesticBD = origin.country === 'Bangladesh' && destination.country === 'Bangladesh';
  const involvesBD = origin.country === 'Bangladesh' || destination.country === 'Bangladesh';
  const sameRegion = origin.region === destination.region;

  const baseDur = isDomesticBD
    ? 48 + (seed % 18)
    : sameRegion
      ? 185 + (seed % 130)
      : 420 + (seed % 340);

  const baseFare = isDomesticBD
    ? 55 + (seed % 24)
    : sameRegion
      ? 295 + (seed % 165)
      : 545 + (seed % 320);

  const pool = isDomesticBD
    ? PARTNER_CARRIERS.filter((c) => c.domesticBangladesh)
    : involvesBD
      ? PARTNER_CARRIERS.filter((c) => c.bangladeshSpecialist && c.code !== 'VQ')
      : PARTNER_CARRIERS.filter((c) => !c.domesticBangladesh);

  const count = isDomesticBD ? pool.length : Math.min(6, pool.length);
  const selectedCarriers = Array.from({ length: count }, (_, i) => {
    return pool[(seed + i) % pool.length];
  });

  return selectedCarriers.map((carrier, idx) => {
    const isDirect = isDomesticBD || idx < 3 || (seed + idx) % 3 === 0;
    const stops = isDirect ? 0 : 1;
    const extraStopMinutes = stops === 1 ? 115 + ((seed + idx * 17) % 80) : 0;
    const durationMinutes = baseDur + extraStopMinutes + (isDomesticBD ? idx * 5 : (idx * 15) % 45);

    const depMinutes = ((7 + idx * 3 + (seed % 2)) % 21) * 60 + ((idx * 15) % 60);
    const depFmt = formatTime(depMinutes);
    const arrFmt = formatTime(depMinutes + durationMinutes);

    const priceUsd = Math.round(
      baseFare * carrier.priceFactor * (isDirect ? 1.05 : 0.91) * CABIN_MULTIPLIER[cabinClass]
    );

    const baggageByCabin: Record<CabinClass, string> = {
      Economy: isDomesticBD ? '20 kg Checked + 7 kg Cabin' : '30 kg Checked + 7 kg Cabin',
      Business: isDomesticBD ? '30 kg Checked + 10 kg Cabin' : '40 kg Checked + 12 kg Cabin',
      'First Class': '50 kg Checked + Lounge Access',
    };

    const amenitiesByCabin: Record<CabinClass, string[]> = {
      Economy: ['In-Flight Refreshments', 'Personal Entertainment', 'USB Power'],
      Business: ['Flat-Bed / Executive Seat', 'Gourmet Dining', 'Business Lounge'],
      'First Class': ['Private Cabin', 'Fine Dining & Vintage Cellar', 'First Class Lounge'],
    };

    const stopCity =
      stops === 1 && carrier.hub !== origin.city && carrier.hub !== destination.city
        ? carrier.hub
        : stops === 1
          ? 'Dubai'
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
      terminalDep: isDomesticBD ? 'Domestic' : `Terminal ${1 + (idx % 4)}`,
      terminalArr: isDomesticBD ? 'Domestic' : `Terminal ${1 + ((idx + 1) % 3)}`,
    };
  });
}

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

  const sortedPartners = [...partnerFlights].sort((a, b) => a.priceUsd - b.priceUsd);
  return [...intregaFlights, ...sortedPartners];
}
