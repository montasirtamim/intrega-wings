import type { TouristSpot } from '../types';

export const TOURIST_SPOTS: TouristSpot[] = [
  {
    id: 'disneyland-paris',
    name: 'Disneyland Paris Resort',
    city: 'Paris',
    country: 'France',
    nearestAirportCode: 'CDG',
    category: 'Theme Park',
    imageUrl: '/images/spot-eiffel-tower.jpg',
    rating: 4.9,
    reviewCount: 18420,
    basePriceUsd: 112,
    availability: 'Instant Confirmation',
    summary:
      'Step into two world-renowned parks—Disneyland Park and Walt Disney Studios—with official dated admission synced directly to Disney’s reservation portal.',
    highlights: [
      'Direct official Disney barcode ticket issuance',
      'Optional Premier Access fast-lane pass',
      'Complimentary shuttle options from Paris CDG',
    ],
    officialProviderName: 'Disneyland Paris Official Portal',
    officialBookingBaseUrl: 'https://www.disneylandparis.com/en-usd/tickets/',
    partnerApiEndpoint: 'https://api.partner.disneylandparis.com/v2/reservations/handoff',
    partnerCode: 'IW-DLP-OFFICIAL-2026',
    packages: [
      {
        id: 'dlp-1day-1park',
        name: '1-Day / 1-Park Dated Ticket',
        priceUsd: 112,
        perks: ['Direct park entry', 'Official Disney mobile QR'],
      },
      {
        id: 'dlp-1day-2parks',
        name: '1-Day / 2-Parks Hopper Pass',
        priceUsd: 148,
        perks: ['Both Disneyland & Studios Parks', 'Evening Illuminations show'],
      },
      {
        id: 'dlp-vip-premier',
        name: '2-Parks + Disney Premier Access Ultimate',
        priceUsd: 265,
        perks: ['Fast-track 12+ flagship attractions', 'Priority parade viewing'],
      },
    ],
  },
  {
    id: 'burj-khalifa-sky',
    name: 'Burj Khalifa — At The Top SKY',
    city: 'Dubai',
    country: 'United Arab Emirates',
    nearestAirportCode: 'DXB',
    category: 'Landmark',
    imageUrl: '/images/spot-burj-khalifa.jpg',
    rating: 4.9,
    reviewCount: 24910,
    basePriceUsd: 58,
    availability: 'Available Today',
    summary:
      'Ascend 555 meters to the world’s highest observation deck on Level 148 with private lounge refreshments and panoramic views across the Arabian Gulf.',
    highlights: [
      'Official Emaar At The Top timed-entry slot',
      'Dedicated high-speed elevator & SKY Lounge',
      'Sunset golden-hour availability',
    ],
    officialProviderName: 'Emaar At The Top Official',
    officialBookingBaseUrl: 'https://tickets.atthetop.ae/atthetop/en-us',
    partnerApiEndpoint: 'https://api.emaar.ae/atthetop/v1/partner-handoff',
    partnerCode: 'IW-DXB-EMAAR-01',
    packages: [
      {
        id: 'bk-124-125',
        name: 'Levels 124 & 125 Non-Prime Entry',
        priceUsd: 58,
        perks: ['360° observation deck', 'Interactive telescope access'],
      },
      {
        id: 'bk-sunset',
        name: 'Levels 124 & 125 Prime Sunset Slot',
        priceUsd: 89,
        perks: ['Golden hour panorama', 'Dubai Fountain aerial view'],
      },
      {
        id: 'bk-sky-148',
        name: 'Level 148 SKY VIP Lounge Experience',
        priceUsd: 159,
        perks: ['Skip-the-line escort', 'Arabic coffee & signature pastries'],
      },
    ],
  },
  {
    id: 'eiffel-tower-summit',
    name: 'Eiffel Tower Summit & Champagne',
    city: 'Paris',
    country: 'France',
    nearestAirportCode: 'CDG',
    category: 'Landmark',
    imageUrl: '/images/spot-eiffel-tower.jpg',
    rating: 4.8,
    reviewCount: 31200,
    basePriceUsd: 49,
    availability: 'Limited Slots',
    summary:
      'Reserved elevator access to the 2nd floor and Summit of the Iron Lady, routed directly through the official Société d’Exploitation de la Tour Eiffel (SETE).',
    highlights: [
      'Official SETE timed summit elevator reservation',
      'Optional Seine River sunset cruise pairing',
      'Champagne Bar voucher at 276 meters',
    ],
    officialProviderName: 'La Tour Eiffel Official Ticketing',
    officialBookingBaseUrl: 'https://ticket.toureiffel.paris/en',
    partnerApiEndpoint: 'https://api.toureiffel.paris/v1/affiliate/booking-intent',
    partnerCode: 'IW-PAR-SETE-88',
    packages: [
      {
        id: 'et-2nd-lift',
        name: '2nd Floor Reserved Elevator Access',
        priceUsd: 49,
        perks: ['Timed elevator entry', 'Audio guide app included'],
      },
      {
        id: 'et-summit-lift',
        name: 'Summit Reserved Elevator Access',
        priceUsd: 78,
        perks: ['2nd Floor + 276m Summit', 'Gustave Eiffel office access'],
      },
      {
        id: 'et-champagne',
        name: 'Summit + Champagne Bar & Seine Cruise',
        priceUsd: 124,
        perks: ['Glass of rosé or white champagne', '1-hour panoramic Seine cruise'],
      },
    ],
  },
  {
    id: 'mount-fuji-private',
    name: 'Mount Fuji & Hakone Curated Expedition',
    city: 'Tokyo / Yamanashi',
    country: 'Japan',
    nearestAirportCode: 'HND',
    category: 'Nature & Culture',
    imageUrl: '/images/spot-mount-fuji.jpg',
    rating: 4.9,
    reviewCount: 9840,
    basePriceUsd: 135,
    availability: 'Instant Confirmation',
    summary:
      'Experience Mount Fuji’s 5th Station, Lake Kawaguchi reflections, and the Hakone Ropeway with an official Japan Tourism licensed concierge.',
    highlights: [
      'Direct Japan National Tourism partner reservation',
      'Shinkansen bullet train return option to Tokyo',
      'Small-group or private executive vehicle',
    ],
    officialProviderName: 'Japan Experience & JR Official Partner',
    officialBookingBaseUrl: 'https://www.japan-experience.com/activities',
    partnerApiEndpoint: 'https://api.jnto-partner.jp/v2/tours/handoff',
    partnerCode: 'IW-TYO-FUJI-09',
    packages: [
      {
        id: 'fuji-day-luxury',
        name: 'Executive Coach Day Expedition',
        priceUsd: 135,
        perks: ['Lake Kawaguchi & Oshino Hakkai', 'Traditional Kaiseki lunch'],
      },
      {
        id: 'fuji-shinkansen',
        name: 'Fuji + Hakone Cruise + Shinkansen Return',
        priceUsd: 198,
        perks: ['Lake Ashi boat cruise', 'Reserved bullet train seat'],
      },
      {
        id: 'fuji-private-chauffeur',
        name: 'Private Alphard Chauffeur & Guide',
        priceUsd: 380,
        perks: ['Door-to-door Tokyo hotel pickup', 'Flexible photography itinerary'],
      },
    ],
  },
  {
    id: 'universal-studios-singapore',
    name: 'Universal Studios Singapore',
    city: 'Sentosa, Singapore',
    country: 'Singapore',
    nearestAirportCode: 'SIN',
    category: 'Theme Park',
    imageUrl: '/images/spot-universal-studios.jpg',
    rating: 4.8,
    reviewCount: 16750,
    basePriceUsd: 68,
    availability: 'Instant Confirmation',
    summary:
      'Direct reservation handoff to Resorts World Sentosa for Southeast Asia’s premier cinematic theme park with express lane and VIP studio tour upgrades.',
    highlights: [
      'Official Resorts World Sentosa dated e-ticket',
      'Universal Express Unlimited option',
      'Direct Changi Airport transit connectivity',
    ],
    officialProviderName: 'Resorts World Sentosa Official',
    officialBookingBaseUrl: 'https://www.rwsentosa.com/en/attractions/universal-studios-singapore',
    partnerApiEndpoint: 'https://api.rwsentosa.com/partner/v1/uss/booking-handoff',
    partnerCode: 'IW-SIN-RWS-44',
    packages: [
      {
        id: 'uss-1day',
        name: 'One-Day Dated Admission',
        priceUsd: 68,
        perks: ['All 6 themed zones', 'Instant official QR pass'],
      },
      {
        id: 'uss-express',
        name: 'One-Day + Universal Express Pass',
        priceUsd: 138,
        perks: ['Priority boarding on major rides', 'SGD 15 dining voucher'],
      },
      {
        id: 'uss-vip',
        name: 'USS VIP Guided Experience',
        priceUsd: 268,
        perks: ['5-hour private tour escort', 'Unlimited Express + lounge'],
      },
    ],
  },
  {
    id: 'santorini-oia-caldera',
    name: 'Santorini Oia Caldera & Sunset Catamaran',
    city: 'Santorini',
    country: 'Greece',
    nearestAirportCode: 'JTR',
    category: 'Coastal Heritage',
    imageUrl: '/images/spot-santorini-oia.jpg',
    rating: 4.9,
    reviewCount: 7340,
    basePriceUsd: 145,
    availability: 'Limited Slots',
    summary:
      'Sail the volcanic caldera aboard a boutique Lagoon catamaran with hot springs access, Mediterranean dining, and front-row Oia cliffside sunset views.',
    highlights: [
      'Direct Aegean Yachting Official Charter slot',
      'Complimentary island hotel transfer',
      'Santorini Assyrtiko wine tasting on board',
    ],
    officialProviderName: 'Santorini Caldera Yachting Official',
    officialBookingBaseUrl: 'https://www.santorini-yachting.com/cruises',
    partnerApiEndpoint: 'https://api.aegean-charters.gr/v1/partner/handoff',
    partnerCode: 'IW-JTR-CALDERA-12',
    packages: [
      {
        id: 'jtr-semi-private',
        name: 'Semi-Private Sunset Catamaran',
        priceUsd: 145,
        perks: ['Max 14 guests', 'Fresh grilled seafood dinner & wine'],
      },
      {
        id: 'jtr-private-yacht',
        name: 'Private Luxury Caldera Charter (Per Guest)',
        priceUsd: 310,
        perks: ['Exclusive yacht & captain', 'Custom Oia & Red Beach route'],
      },
    ],
  },
];

export interface OfficialHandoffParams {
  visitDate: string;
  guests: number;
  packageId: string;
  guestEmail?: string;
}

/**
 * Builds a pre-filled Direct-to-Official Partner Deep-Link URL so the user's selected
 * date, guest count, and package are pre-populated on the official provider's website.
 */
export function buildOfficialPartnerDeepLink(
  spot: TouristSpot,
  params: OfficialHandoffParams
): string {
  const url = new URL(spot.officialBookingBaseUrl);
  url.searchParams.set('date', params.visitDate);
  url.searchParams.set('guests', String(params.guests));
  url.searchParams.set('package', params.packageId);
  url.searchParams.set('partner_id', spot.partnerCode);
  url.searchParams.set('utm_source', 'intrega_wings');
  url.searchParams.set('utm_medium', 'direct_partner_handoff');
  if (params.guestEmail) {
    url.searchParams.set('email', params.guestEmail);
  }
  return url.toString();
}

/**
 * Generates the API-Ready Partner Handoff Payload structure for Phase 2 backend webhooks
 * and server-to-server affiliate API keys (e.g., Disney / Emaar / SETE Partner API).
 */
export function buildPartnerApiHandoffPayload(
  spot: TouristSpot,
  params: OfficialHandoffParams
) {
  const pkg = spot.packages.find((p) => p.id === params.packageId) || spot.packages[0];
  return {
    agency: 'INTREGA_WINGS_GLOBAL',
    partnerCode: spot.partnerCode,
    endpoint: spot.partnerApiEndpoint,
    reservationIntent: {
      attractionId: spot.id,
      packageId: pkg.id,
      packageName: pkg.name,
      visitDate: params.visitDate,
      guestCount: params.guests,
      estimatedTotalUsd: pkg.priceUsd * params.guests,
      currency: 'USD',
      guestEmail: params.guestEmail || null,
    },
    webhookCallbackUrl: 'https://api.intregawings.com/webhooks/partner-confirmation',
    authMode: 'BEARER_PARTNER_API_KEY_ENV',
    timestamp: new Date().toISOString(),
  };
}
