import { getAirportByCode } from '../data/airports';
import { getIntregaWingsInjectedFlights } from '../data/intregaWingsFlights';
import type { Airport, CabinClass, Flight, FlightSearchParams } from '../types';

export const EXTERNAL_FLIGHT_API_CONFIG = {
  provider: 'AMADEUS_DUFFEL_BRIDGE',
  endpoint: '/api/v1/flights/search',
  mode: 'SIMULATED_GDS_FEED' as 'SIMULATED_GDS_FEED' | 'LIVE_API',
};

interface PartnerCarrier {
  name: string;
  code: string;
  hub: string;
  regions: Airport['region'][];
  aircraft: string[];
  priceFactor: number;
  bangladeshSpecialist?: boolean;
  domesticBangladesh?: boolean;
}

const PARTNER_CARRIERS: PartnerCarrier[] = [
  // Bangladesh & South Asia
  { name: 'Biman Bangladesh Airlines', code: 'BG', hub: 'Dhaka', regions: ['Asia-Pacific', 'Middle East', 'Europe'], aircraft: ['Boeing 787-9 Dreamliner', 'Boeing 777-300ER'], priceFactor: 0.92, bangladeshSpecialist: true, domesticBangladesh: true },
  { name: 'US-Bangla Airlines', code: 'BS', hub: 'Dhaka', regions: ['Asia-Pacific', 'Middle East'], aircraft: ['Airbus A330-300', 'Boeing 737-800'], priceFactor: 0.89, bangladeshSpecialist: true, domesticBangladesh: true },
  { name: 'NOVOAIR', code: 'VQ', hub: 'Dhaka', regions: ['Asia-Pacific'], aircraft: ['ATR 72-500'], priceFactor: 0.87, bangladeshSpecialist: true, domesticBangladesh: true },
  { name: 'Air India', code: 'AI', hub: 'New Delhi', regions: ['Asia-Pacific', 'Europe', 'North America', 'Middle East'], aircraft: ['Airbus A350-900', 'Boeing 787-8'], priceFactor: 0.93 },
  { name: 'SriLankan Airlines', code: 'UL', hub: 'Colombo', regions: ['Asia-Pacific', 'Middle East', 'Europe'], aircraft: ['Airbus A330-300', 'Airbus A321neo'], priceFactor: 0.91 },

  // Middle East Global Connectors
  { name: 'Emirates', code: 'EK', hub: 'Dubai', regions: ['Middle East', 'Europe', 'Asia-Pacific', 'North America', 'South America', 'Africa'], aircraft: ['Airbus A380-800', 'Boeing 777-300ER'], priceFactor: 1.08, bangladeshSpecialist: true },
  { name: 'Qatar Airways', code: 'QR', hub: 'Doha', regions: ['Middle East', 'Europe', 'Asia-Pacific', 'North America', 'South America', 'Africa'], aircraft: ['Airbus A350-1000', 'Boeing 787-9'], priceFactor: 1.05, bangladeshSpecialist: true },
  { name: 'Etihad Airways', code: 'EY', hub: 'Abu Dhabi', regions: ['Middle East', 'Europe', 'Asia-Pacific', 'North America', 'Africa'], aircraft: ['Airbus A350-1000', 'Boeing 787-10'], priceFactor: 1.03, bangladeshSpecialist: true },
  { name: 'Saudia', code: 'SV', hub: 'Jeddah', regions: ['Middle East', 'Asia-Pacific', 'Europe', 'Africa', 'North America'], aircraft: ['Boeing 787-9', 'Boeing 777-300ER'], priceFactor: 0.96, bangladeshSpecialist: true },
  { name: 'Oman Air', code: 'WY', hub: 'Muscat', regions: ['Middle East', 'Asia-Pacific', 'Europe'], aircraft: ['Boeing 787-9 Dreamliner'], priceFactor: 0.95 },

  // Europe
  { name: 'Turkish Airlines', code: 'TK', hub: 'Istanbul', regions: ['Europe', 'Middle East', 'Asia-Pacific', 'North America', 'South America', 'Africa'], aircraft: ['Airbus A350-900', 'Boeing 787-9'], priceFactor: 0.95, bangladeshSpecialist: true },
  { name: 'Lufthansa', code: 'LH', hub: 'Frankfurt', regions: ['Europe', 'North America', 'South America', 'Asia-Pacific', 'Africa', 'Middle East'], aircraft: ['Boeing 747-8', 'Airbus A350-900'], priceFactor: 1.02 },
  { name: 'SWISS International', code: 'LX', hub: 'Zurich', regions: ['Europe', 'North America', 'Asia-Pacific', 'Africa', 'Middle East'], aircraft: ['Boeing 777-300ER', 'Airbus A330-300'], priceFactor: 1.07 },
  { name: 'British Airways', code: 'BA', hub: 'London', regions: ['Europe', 'North America', 'South America', 'Asia-Pacific', 'Africa', 'Middle East'], aircraft: ['Airbus A350-1000', 'Boeing 787-10'], priceFactor: 1.01 },
  { name: 'Air France', code: 'AF', hub: 'Paris', regions: ['Europe', 'North America', 'South America', 'Asia-Pacific', 'Africa'], aircraft: ['Airbus A350-900', 'Boeing 777-300ER'], priceFactor: 1.02 },
  { name: 'KLM Royal Dutch', code: 'KL', hub: 'Amsterdam', regions: ['Europe', 'North America', 'South America', 'Asia-Pacific', 'Africa'], aircraft: ['Boeing 787-10', 'Boeing 777-300ER'], priceFactor: 1.0 },
  { name: 'ITA Airways', code: 'AZ', hub: 'Rome', regions: ['Europe', 'North America', 'South America', 'Asia-Pacific'], aircraft: ['Airbus A350-900', 'Airbus A330neo'], priceFactor: 0.97 },

  // Asia-Pacific
  { name: 'Singapore Airlines', code: 'SQ', hub: 'Singapore', regions: ['Asia-Pacific', 'Europe', 'North America', 'Middle East', 'Africa'], aircraft: ['Airbus A350-900', 'Boeing 777-300ER'], priceFactor: 1.12, bangladeshSpecialist: true },
  { name: 'ANA All Nippon', code: 'NH', hub: 'Tokyo', regions: ['Asia-Pacific', 'North America', 'Europe'], aircraft: ['Boeing 787-9 Dreamliner', 'Boeing 777-300ER'], priceFactor: 1.09 },
  { name: 'Japan Airlines', code: 'JL', hub: 'Tokyo', regions: ['Asia-Pacific', 'North America', 'Europe'], aircraft: ['Airbus A350-1000', 'Boeing 787-9'], priceFactor: 1.08 },
  { name: 'Korean Air', code: 'KE', hub: 'Seoul', regions: ['Asia-Pacific', 'North America', 'Europe', 'Middle East'], aircraft: ['Boeing 787-10', 'Airbus A380-800'], priceFactor: 1.04 },
  { name: 'Cathay Pacific', code: 'CX', hub: 'Hong Kong', regions: ['Asia-Pacific', 'Europe', 'North America', 'Middle East', 'Africa'], aircraft: ['Airbus A350-1000', 'Boeing 777-300ER'], priceFactor: 1.06, bangladeshSpecialist: true },
  { name: 'Malaysia Airlines', code: 'MH', hub: 'Kuala Lumpur', regions: ['Asia-Pacific', 'Europe', 'Middle East'], aircraft: ['Airbus A350-900', 'Airbus A330-300'], priceFactor: 0.93, bangladeshSpecialist: true },
  { name: 'Thai Airways', code: 'TG', hub: 'Bangkok', regions: ['Asia-Pacific', 'Europe', 'Middle East'], aircraft: ['Airbus A350-900', 'Boeing 777-300ER'], priceFactor: 0.95, bangladeshSpecialist: true },
  { name: 'Qantas', code: 'QF', hub: 'Sydney', regions: ['Asia-Pacific', 'Europe', 'North America', 'South America', 'Africa'], aircraft: ['Boeing 787-9 Dreamliner', 'Airbus A380-800'], priceFactor: 1.1 },

  // Americas & Africa
  { name: 'Delta Air Lines', code: 'DL', hub: 'Atlanta', regions: ['North America', 'Europe', 'South America', 'Asia-Pacific', 'Africa'], aircraft: ['Airbus A350-900', 'Airbus A330-900neo'], priceFactor: 1.03 },
  { name: 'United Airlines', code: 'UA', hub: 'New York', regions: ['North America', 'Europe', 'South America', 'Asia-Pacific', 'Africa'], aircraft: ['Boeing 787-10', 'Boeing 777-300ER'], priceFactor: 1.01 },
  { name: 'Air Canada', code: 'AC', hub: 'Toronto', regions: ['North America', 'Europe', 'South America', 'Asia-Pacific', 'Middle East'], aircraft: ['Boeing 787-9 Dreamliner', 'Boeing 777-300ER'], priceFactor: 0.99 },
  { name: 'LATAM Airlines', code: 'LA', hub: 'São Paulo', regions: ['South America', 'North America', 'Europe', 'Asia-Pacific'], aircraft: ['Boeing 787-9 Dreamliner', 'Boeing 777-300ER'], priceFactor: 0.98 },
  { name: 'Ethiopian Airlines', code: 'ET', hub: 'Addis Ababa', regions: ['Africa', 'Europe', 'Asia-Pacific', 'Middle East', 'North America', 'South America'], aircraft: ['Airbus A350-1000', 'Boeing 787-9'], priceFactor: 0.94, bangladeshSpecialist: true },
  { name: 'EgyptAir', code: 'MS', hub: 'Cairo', regions: ['Africa', 'Middle East', 'Europe', 'North America', 'Asia-Pacific'], aircraft: ['Boeing 787-9 Dreamliner', 'Airbus A330-300'], priceFactor: 0.93 },
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
  await new Promise((resolve) => setTimeout(resolve, 340));

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

  let pool: PartnerCarrier[];
  if (isDomesticBD) {
    pool = PARTNER_CARRIERS.filter((c) => c.domesticBangladesh);
  } else if (involvesBD) {
    pool = PARTNER_CARRIERS.filter((c) => c.bangladeshSpecialist && c.code !== 'VQ');
  } else {
    pool = PARTNER_CARRIERS.filter(
      (c) =>
        !c.domesticBangladesh &&
        (c.regions.includes(origin.region) || c.regions.includes(destination.region))
    );
  }

  if (pool.length < 4) {
    pool = PARTNER_CARRIERS.filter((c) => !c.domesticBangladesh);
  }

  const count = isDomesticBD ? pool.length : Math.min(8, pool.length);
  const selectedCarriers: PartnerCarrier[] = [];
  for (let i = 0; i < count; i++) {
    const candidate = pool[(seed + i) % pool.length];
    if (!selectedCarriers.some((c) => c.code === candidate.code)) {
      selectedCarriers.push(candidate);
    }
  }

  return selectedCarriers.map((carrier, idx) => {
    const isDirect = isDomesticBD || idx < 4 || (seed + idx) % 3 === 0;
    const stops = isDirect ? 0 : 1;
    const extraStopMinutes = stops === 1 ? 115 + ((seed + idx * 17) % 80) : 0;
    const durationMinutes = baseDur + extraStopMinutes + (isDomesticBD ? idx * 5 : (idx * 15) % 45);

    const depMinutes = ((6 + idx * 2 + (seed % 3)) % 22) * 60 + ((idx * 15) % 60);
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
