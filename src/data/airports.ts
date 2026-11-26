import type { Airport } from '../types';

export const GLOBAL_AIRPORTS: Airport[] = [
  // Bangladesh — Complete International & Domestic Network
  { code: 'DAC', name: 'Hazrat Shahjalal International Airport', city: 'Dhaka', country: 'Bangladesh', region: 'Asia-Pacific', timezone: 'BST' },
  { code: 'CGP', name: 'Shah Amanat International Airport', city: 'Chattogram', country: 'Bangladesh', region: 'Asia-Pacific', timezone: 'BST' },
  { code: 'ZYL', name: 'Osmani International Airport', city: 'Sylhet', country: 'Bangladesh', region: 'Asia-Pacific', timezone: 'BST' },
  { code: 'CXB', name: "Cox's Bazar International Airport", city: "Cox's Bazar", country: 'Bangladesh', region: 'Asia-Pacific', timezone: 'BST' },
  { code: 'JSR', name: 'Jashore Airport (Sundarbans Gateway)', city: 'Jashore', country: 'Bangladesh', region: 'Asia-Pacific', timezone: 'BST' },
  { code: 'RJH', name: 'Shah Makhdum Airport', city: 'Rajshahi', country: 'Bangladesh', region: 'Asia-Pacific', timezone: 'BST' },
  { code: 'SPD', name: 'Saidpur Airport', city: 'Saidpur', country: 'Bangladesh', region: 'Asia-Pacific', timezone: 'BST' },
  { code: 'BZL', name: 'Barishal Airport', city: 'Barishal', country: 'Bangladesh', region: 'Asia-Pacific', timezone: 'BST' },

  // Europe
  { code: 'LHR', name: 'London Heathrow Airport', city: 'London', country: 'United Kingdom', region: 'Europe', timezone: 'GMT' },
  { code: 'LGW', name: 'London Gatwick Airport', city: 'London', country: 'United Kingdom', region: 'Europe', timezone: 'GMT' },
  { code: 'MAN', name: 'Manchester Airport', city: 'Manchester', country: 'United Kingdom', region: 'Europe', timezone: 'GMT' },
  { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France', region: 'Europe', timezone: 'CET' },
  { code: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland', region: 'Europe', timezone: 'CET' },
  { code: 'GVA', name: 'Geneva Airport', city: 'Geneva', country: 'Switzerland', region: 'Europe', timezone: 'CET' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany', region: 'Europe', timezone: 'CET' },
  { code: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany', region: 'Europe', timezone: 'CET' },
  { code: 'BER', name: 'Berlin Brandenburg Airport', city: 'Berlin', country: 'Germany', region: 'Europe', timezone: 'CET' },
  { code: 'AMS', name: 'Amsterdam Schiphol Airport', city: 'Amsterdam', country: 'Netherlands', region: 'Europe', timezone: 'CET' },
  { code: 'FCO', name: 'Leonardo da Vinci–Fiumicino', city: 'Rome', country: 'Italy', region: 'Europe', timezone: 'CET' },
  { code: 'MXP', name: 'Milan Malpensa Airport', city: 'Milan', country: 'Italy', region: 'Europe', timezone: 'CET' },
  { code: 'VCE', name: 'Venice Marco Polo Airport', city: 'Venice', country: 'Italy', region: 'Europe', timezone: 'CET' },
  { code: 'MAD', name: 'Adolfo Suárez Madrid–Barajas', city: 'Madrid', country: 'Spain', region: 'Europe', timezone: 'CET' },
  { code: 'BCN', name: 'Josep Tarradellas Barcelona–El Prat', city: 'Barcelona', country: 'Spain', region: 'Europe', timezone: 'CET' },
  { code: 'LIS', name: 'Humberto Delgado Airport', city: 'Lisbon', country: 'Portugal', region: 'Europe', timezone: 'WET' },
  { code: 'ATH', name: 'Athens International Airport', city: 'Athens', country: 'Greece', region: 'Europe', timezone: 'EET' },
  { code: 'JTR', name: 'Santorini International Airport', city: 'Santorini', country: 'Greece', region: 'Europe', timezone: 'EET' },
  { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey', region: 'Europe', timezone: 'TRT' },
  { code: 'VIE', name: 'Vienna International Airport', city: 'Vienna', country: 'Austria', region: 'Europe', timezone: 'CET' },
  { code: 'DUB', name: 'Dublin Airport', city: 'Dublin', country: 'Ireland', region: 'Europe', timezone: 'GMT' },
  { code: 'BRU', name: 'Brussels Airport', city: 'Brussels', country: 'Belgium', region: 'Europe', timezone: 'CET' },
  { code: 'ARN', name: 'Stockholm Arlanda Airport', city: 'Stockholm', country: 'Sweden', region: 'Europe', timezone: 'CET' },
  { code: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark', region: 'Europe', timezone: 'CET' },
  { code: 'OSL', name: 'Oslo Gardermoen Airport', city: 'Oslo', country: 'Norway', region: 'Europe', timezone: 'CET' },
  { code: 'HEL', name: 'Helsinki-Vantaa Airport', city: 'Helsinki', country: 'Finland', region: 'Europe', timezone: 'EET' },
  { code: 'WAW', name: 'Warsaw Chopin Airport', city: 'Warsaw', country: 'Poland', region: 'Europe', timezone: 'CET' },
  { code: 'PRG', name: 'Václav Havel Airport Prague', city: 'Prague', country: 'Czech Republic', region: 'Europe', timezone: 'CET' },
  { code: 'BUD', name: 'Budapest Ferenc Liszt Intl', city: 'Budapest', country: 'Hungary', region: 'Europe', timezone: 'CET' },

  // Middle East
  { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'United Arab Emirates', region: 'Middle East', timezone: 'GST' },
  { code: 'AUH', name: 'Zayed International Airport', city: 'Abu Dhabi', country: 'United Arab Emirates', region: 'Middle East', timezone: 'GST' },
  { code: 'SHJ', name: 'Sharjah International Airport', city: 'Sharjah', country: 'United Arab Emirates', region: 'Middle East', timezone: 'GST' },
  { code: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar', region: 'Middle East', timezone: 'AST' },
  { code: 'RUH', name: 'King Khalid International Airport', city: 'Riyadh', country: 'Saudi Arabia', region: 'Middle East', timezone: 'AST' },
  { code: 'JED', name: 'King Abdulaziz International Airport', city: 'Jeddah', country: 'Saudi Arabia', region: 'Middle East', timezone: 'AST' },
  { code: 'MED', name: 'Prince Mohammad Bin Abdulaziz Intl', city: 'Madinah', country: 'Saudi Arabia', region: 'Middle East', timezone: 'AST' },
  { code: 'DMM', name: 'King Fahd International Airport', city: 'Dammam', country: 'Saudi Arabia', region: 'Middle East', timezone: 'AST' },
  { code: 'MCT', name: 'Muscat International Airport', city: 'Muscat', country: 'Oman', region: 'Middle East', timezone: 'GST' },
  { code: 'KWI', name: 'Kuwait International Airport', city: 'Kuwait City', country: 'Kuwait', region: 'Middle East', timezone: 'AST' },
  { code: 'BAH', name: 'Bahrain International Airport', city: 'Manama', country: 'Bahrain', region: 'Middle East', timezone: 'AST' },
  { code: 'AMM', name: 'Queen Alia International Airport', city: 'Amman', country: 'Jordan', region: 'Middle East', timezone: 'EET' },

  // Asia-Pacific
  { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore', region: 'Asia-Pacific', timezone: 'SGT' },
  { code: 'HND', name: 'Tokyo Haneda Airport', city: 'Tokyo', country: 'Japan', region: 'Asia-Pacific', timezone: 'JST' },
  { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan', region: 'Asia-Pacific', timezone: 'JST' },
  { code: 'KIX', name: 'Kansai International Airport', city: 'Osaka', country: 'Japan', region: 'Asia-Pacific', timezone: 'JST' },
  { code: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea', region: 'Asia-Pacific', timezone: 'KST' },
  { code: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong', region: 'Asia-Pacific', timezone: 'HKT' },
  { code: 'PEK', name: 'Beijing Capital International Airport', city: 'Beijing', country: 'China', region: 'Asia-Pacific', timezone: 'CST' },
  { code: 'PVG', name: 'Shanghai Pudong International Airport', city: 'Shanghai', country: 'China', region: 'Asia-Pacific', timezone: 'CST' },
  { code: 'CAN', name: 'Guangzhou Baiyun International Airport', city: 'Guangzhou', country: 'China', region: 'Asia-Pacific', timezone: 'CST' },
  { code: 'TPE', name: 'Taiwan Taoyuan International Airport', city: 'Taipei', country: 'Taiwan', region: 'Asia-Pacific', timezone: 'CST' },
  { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand', region: 'Asia-Pacific', timezone: 'ICT' },
  { code: 'HKT', name: 'Phuket International Airport', city: 'Phuket', country: 'Thailand', region: 'Asia-Pacific', timezone: 'ICT' },
  { code: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia', region: 'Asia-Pacific', timezone: 'MYT' },
  { code: 'CGK', name: 'Soekarno–Hatta International Airport', city: 'Jakarta', country: 'Indonesia', region: 'Asia-Pacific', timezone: 'WIB' },
  { code: 'DPS', name: 'Ngurah Rai International Airport', city: 'Bali', country: 'Indonesia', region: 'Asia-Pacific', timezone: 'WITA' },
  { code: 'MNL', name: 'Ninoy Aquino International Airport', city: 'Manila', country: 'Philippines', region: 'Asia-Pacific', timezone: 'PHT' },
  { code: 'SGN', name: 'Tan Son Nhat International Airport', city: 'Ho Chi Minh City', country: 'Vietnam', region: 'Asia-Pacific', timezone: 'ICT' },
  { code: 'HAN', name: 'Noi Bai International Airport', city: 'Hanoi', country: 'Vietnam', region: 'Asia-Pacific', timezone: 'ICT' },
  { code: 'CCU', name: 'Netaji Subhas Chandra Bose Intl', city: 'Kolkata', country: 'India', region: 'Asia-Pacific', timezone: 'IST' },
  { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'New Delhi', country: 'India', region: 'Asia-Pacific', timezone: 'IST' },
  { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj Intl', city: 'Mumbai', country: 'India', region: 'Asia-Pacific', timezone: 'IST' },
  { code: 'BLR', name: 'Kempegowda International Airport', city: 'Bengaluru', country: 'India', region: 'Asia-Pacific', timezone: 'IST' },
  { code: 'MAA', name: 'Chennai International Airport', city: 'Chennai', country: 'India', region: 'Asia-Pacific', timezone: 'IST' },
  { code: 'KTM', name: 'Tribhuvan International Airport', city: 'Kathmandu', country: 'Nepal', region: 'Asia-Pacific', timezone: 'NPT' },
  { code: 'CMB', name: 'Bandaranaike International Airport', city: 'Colombo', country: 'Sri Lanka', region: 'Asia-Pacific', timezone: 'IST' },
  { code: 'KHI', name: 'Jinnah International Airport', city: 'Karachi', country: 'Pakistan', region: 'Asia-Pacific', timezone: 'PKT' },
  { code: 'LHE', name: 'Allama Iqbal International Airport', city: 'Lahore', country: 'Pakistan', region: 'Asia-Pacific', timezone: 'PKT' },
  { code: 'ISB', name: 'Islamabad International Airport', city: 'Islamabad', country: 'Pakistan', region: 'Asia-Pacific', timezone: 'PKT' },
  { code: 'MLE', name: 'Velana International Airport', city: 'Malé', country: 'Maldives', region: 'Asia-Pacific', timezone: 'MVT' },
  { code: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia', region: 'Asia-Pacific', timezone: 'AEDT' },
  { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia', region: 'Asia-Pacific', timezone: 'AEDT' },
  { code: 'BNE', name: 'Brisbane Airport', city: 'Brisbane', country: 'Australia', region: 'Asia-Pacific', timezone: 'AEST' },
  { code: 'PER', name: 'Perth Airport', city: 'Perth', country: 'Australia', region: 'Asia-Pacific', timezone: 'AWST' },
  { code: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand', region: 'Asia-Pacific', timezone: 'NZDT' },

  // North America
  { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'United States', region: 'North America', timezone: 'EST' },
  { code: 'EWR', name: 'Newark Liberty International Airport', city: 'New York / Newark', country: 'United States', region: 'North America', timezone: 'EST' },
  { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'United States', region: 'North America', timezone: 'PST' },
  { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'United States', region: 'North America', timezone: 'PST' },
  { code: 'ORD', name: "O'Hare International Airport", city: 'Chicago', country: 'United States', region: 'North America', timezone: 'CST' },
  { code: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'United States', region: 'North America', timezone: 'EST' },
  { code: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas', country: 'United States', region: 'North America', timezone: 'CST' },
  { code: 'ATL', name: 'Hartsfield–Jackson Atlanta Intl', city: 'Atlanta', country: 'United States', region: 'North America', timezone: 'EST' },
  { code: 'IAD', name: 'Washington Dulles International Airport', city: 'Washington, D.C.', country: 'United States', region: 'North America', timezone: 'EST' },
  { code: 'BOS', name: 'Boston Logan International Airport', city: 'Boston', country: 'United States', region: 'North America', timezone: 'EST' },
  { code: 'SEA', name: 'Seattle–Tacoma International Airport', city: 'Seattle', country: 'United States', region: 'North America', timezone: 'PST' },
  { code: 'IAH', name: 'George Bush Intercontinental Airport', city: 'Houston', country: 'United States', region: 'North America', timezone: 'CST' },
  { code: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada', region: 'North America', timezone: 'EST' },
  { code: 'YVR', name: 'Vancouver International Airport', city: 'Vancouver', country: 'Canada', region: 'North America', timezone: 'PST' },
  { code: 'YUL', name: 'Montréal–Trudeau International Airport', city: 'Montreal', country: 'Canada', region: 'North America', timezone: 'EST' },
  { code: 'MEX', name: 'Mexico City International Airport', city: 'Mexico City', country: 'Mexico', region: 'North America', timezone: 'CST' },
  { code: 'CUN', name: 'Cancún International Airport', city: 'Cancún', country: 'Mexico', region: 'North America', timezone: 'EST' },

  // South America
  { code: 'GRU', name: 'São Paulo/Guarulhos International', city: 'São Paulo', country: 'Brazil', region: 'South America', timezone: 'BRT' },
  { code: 'GIG', name: 'Rio de Janeiro/Galeão International', city: 'Rio de Janeiro', country: 'Brazil', region: 'South America', timezone: 'BRT' },
  { code: 'EZE', name: 'Ministro Pistarini International', city: 'Buenos Aires', country: 'Argentina', region: 'South America', timezone: 'ART' },
  { code: 'SCL', name: 'Arturo Merino Benítez International', city: 'Santiago', country: 'Chile', region: 'South America', timezone: 'CLT' },
  { code: 'BOG', name: 'El Dorado International Airport', city: 'Bogotá', country: 'Colombia', region: 'South America', timezone: 'COT' },
  { code: 'LIM', name: 'Jorge Chávez International Airport', city: 'Lima', country: 'Peru', region: 'South America', timezone: 'PET' },
  { code: 'PTY', name: 'Tocumen International Airport', city: 'Panama City', country: 'Panama', region: 'South America', timezone: 'EST' },

  // Africa
  { code: 'CAI', name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt', region: 'Africa', timezone: 'EET' },
  { code: 'JNB', name: 'O. R. Tambo International Airport', city: 'Johannesburg', country: 'South Africa', region: 'Africa', timezone: 'SAST' },
  { code: 'CPT', name: 'Cape Town International Airport', city: 'Cape Town', country: 'South Africa', region: 'Africa', timezone: 'SAST' },
  { code: 'CMN', name: 'Mohammed V International Airport', city: 'Casablanca', country: 'Morocco', region: 'Africa', timezone: 'WET' },
  { code: 'NBO', name: 'Jomo Kenyatta International Airport', city: 'Nairobi', country: 'Kenya', region: 'Africa', timezone: 'EAT' },
  { code: 'ADD', name: 'Addis Ababa Bole International Airport', city: 'Addis Ababa', country: 'Ethiopia', region: 'Africa', timezone: 'EAT' },
  { code: 'LOS', name: 'Murtala Muhammed International Airport', city: 'Lagos', country: 'Nigeria', region: 'Africa', timezone: 'WAT' },
  { code: 'MRU', name: 'Sir Seewoosagur Ramgoolam Intl', city: 'Port Louis', country: 'Mauritius', region: 'Africa', timezone: 'MUT' },
  { code: 'SEZ', name: 'Seychelles International Airport', city: 'Mahé', country: 'Seychelles', region: 'Africa', timezone: 'SCT' },
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
      a.name.toLowerCase().includes(q) ||
      a.region.toLowerCase().includes(q)
  );
}
