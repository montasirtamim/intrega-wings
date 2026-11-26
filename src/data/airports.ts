import type { Airport } from '../types';

export const GLOBAL_AIRPORTS: Airport[] = [
  // Europe
  { code: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom', region: 'Europe', timezone: 'GMT' },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', region: 'Europe', timezone: 'CET' },
  { code: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', region: 'Europe', timezone: 'CET' },
  { code: 'GVA', name: 'Geneva Airport', city: 'Geneva', country: 'Switzerland', region: 'Europe', timezone: 'CET' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', region: 'Europe', timezone: 'CET' },
  { code: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany', region: 'Europe', timezone: 'CET' },
  { code: 'AMS', name: 'Amsterdam Schiphol Airport', city: 'Amsterdam', country: 'Netherlands', region: 'Europe', timezone: 'CET' },
  { code: 'FCO', name: 'Leonardo da Vinci–Fiumicino', city: 'Rome', country: 'Italy', region: 'Europe', timezone: 'CET' },
  { code: 'MXP', name: 'Milan Malpensa Airport', city: 'Milan', country: 'Italy', region: 'Europe', timezone: 'CET' },
  { code: 'MAD', name: 'Adolfo Suárez Madrid–Barajas', city: 'Madrid', country: 'Spain', region: 'Europe', timezone: 'CET' },
  { code: 'BCN', name: 'Josep Tarradellas Barcelona–El Prat', city: 'Barcelona', country: 'Spain', region: 'Europe', timezone: 'CET' },
  { code: 'ATH', name: 'Athens International Airport', city: 'Athens', country: 'Greece', region: 'Europe', timezone: 'EET' },
  { code: 'JTR', name: 'Santorini International Airport', city: 'Santorini', country: 'Greece', region: 'Europe', timezone: 'EET' },
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', region: 'Europe', timezone: 'TRT' },
  { code: 'VIE', name: 'Vienna International Airport', city: 'Vienna', country: 'Austria', region: 'Europe', timezone: 'CET' },

  // Middle East
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', region: 'Middle East', timezone: 'GST' },
  { code: 'AUH', name: 'Zayed International Airport', city: 'Abu Dhabi', country: 'United Arab Emirates', region: 'Middle East', timezone: 'GST' },
  { code: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', region: 'Middle East', timezone: 'AST' },
  { code: 'RUH', name: 'King Khalid International Airport', city: 'Riyadh', country: 'Saudi Arabia', region: 'Middle East', timezone: 'AST' },
  { code: 'JED', name: 'King Abdulaziz International Airport', city: 'Jeddah', country: 'Saudi Arabia', region: 'Middle East', timezone: 'AST' },

  // Asia-Pacific
  { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', region: 'Asia-Pacific', timezone: 'SGT' },
  { code: 'HND', name: 'Tokyo Haneda Airport', city: 'Tokyo', country: 'Japan', region: 'Asia-Pacific', timezone: 'JST' },
  { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', region: 'Asia-Pacific', timezone: 'JST' },
  { code: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea', region: 'Asia-Pacific', timezone: 'KST' },
  { code: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong', region: 'Asia-Pacific', timezone: 'HKT' },
  { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', region: 'Asia-Pacific', timezone: 'ICT' },
  { code: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia', region: 'Asia-Pacific', timezone: 'MYT' },
  { code: 'DAC', name: 'Hazrat Shahjalal International Airport', city: 'Dhaka', country: 'Bangladesh', region: 'Asia-Pacific', timezone: 'BST' },
  { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'New Delhi', country: 'India', region: 'Asia-Pacific', timezone: 'IST' },
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj Intl', city: 'Mumbai', country: 'India', region: 'Asia-Pacific', timezone: 'IST' },
  { code: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', region: 'Asia-Pacific', timezone: 'AEDT' },
  { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', region: 'Asia-Pacific', timezone: 'AEDT' },
  { code: 'MLE', name: 'Velana International Airport', city: 'Malé', country: 'Maldives', region: 'Asia-Pacific', timezone: 'MVT' },

  // North America
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States', region: 'North America', timezone: 'EST' },
  { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States', region: 'North America', timezone: 'PST' },
  { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'United States', region: 'North America', timezone: 'PST' },
  { code: 'ORD', name: "O'Hare International Airport", city: 'Chicago', country: 'United States', region: 'North America', timezone: 'CST' },
  { code: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'United States', region: 'North America', timezone: 'EST' },
  { code: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada', region: 'North America', timezone: 'EST' },
  { code: 'YVR', name: 'Vancouver International Airport', city: 'Vancouver', country: 'Canada', region: 'North America', timezone: 'PST' },

  // South America & Africa
  { code: 'GRU', name: 'São Paulo/Guarulhos International', city: 'São Paulo', country: 'Brazil', region: 'South America', timezone: 'BRT' },
  { code: 'EZE', name: 'Ministro Pistarini International', city: 'Buenos Aires', country: 'Argentina', region: 'South America', timezone: 'ART' },
  { code: 'CAI', name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt', region: 'Africa', timezone: 'EET' },
  { code: 'JNB', name: 'O. R. Tambo International Airport', city: 'Johannesburg', country: 'South Africa', region: 'Africa', timezone: 'SAST' },
  { code: 'CMN', name: 'Mohammed V International Airport', city: 'Casablanca', country: 'Morocco', region: 'Africa', timezone: 'WET' },
];

export function getAirportByCode(code: string): Airport {
  return (
    GLOBAL_AIRPORTS.find((a) => a.code.toUpperCase() === code.toUpperCase()) ||
    GLOBAL_AIRPORTS[0]
  );
}

export function searchAirports(query: string): Airport[] {
  const q = query.trim().toLowerCase();
  if (!q) return GLOBAL_AIRPORTS;
  return GLOBAL_AIRPORTS.filter(
    (a) =>
      a.code.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q)
  );
}
