// src/lib/country-data.ts
export interface CountryData {
  code: string;
  flag: string;
  name: string;
  city: string;
  tz: string;
  lat: number;
  lng: number;
  currency: string;
  dial: string;
  languages: string;
  population: string;
  region: string;
}

export const REGION_LABELS: Record<string, string> = {
  Americas: "the Americas",
  Europe: "Europe",
  Asia: "Asia",
  "Middle East": "the Middle East",
  Africa: "Africa",
  Oceania: "Oceania",
};

export const COUNTRIES: CountryData[] = [
  // ---------- Americas ----------
  { code: "US", flag: "🇺🇸", name: "United States", city: "New York", tz: "America/New_York", lat: 40.7128, lng: -74.006, currency: "USD", dial: "+1", languages: "English", population: "335M", region: "Americas" },
  { code: "CA", flag: "🇨🇦", name: "Canada", city: "Toronto", tz: "America/Toronto", lat: 43.6532, lng: -79.3832, currency: "CAD", dial: "+1", languages: "English, French", population: "40M", region: "Americas" },
  { code: "MX", flag: "🇲🇽", name: "Mexico", city: "Mexico City", tz: "America/Mexico_City", lat: 19.4326, lng: -99.1332, currency: "MXN", dial: "+52", languages: "Spanish", population: "129M", region: "Americas" },
  { code: "BR", flag: "🇧🇷", name: "Brazil", city: "São Paulo", tz: "America/Sao_Paulo", lat: -23.5505, lng: -46.6333, currency: "BRL", dial: "+55", languages: "Portuguese", population: "215M", region: "Americas" },
  { code: "AR", flag: "🇦🇷", name: "Argentina", city: "Buenos Aires", tz: "America/Argentina/Buenos_Aires", lat: -34.6037, lng: -58.3816, currency: "ARS", dial: "+54", languages: "Spanish", population: "46M", region: "Americas" },

  // ---------- Europe ----------
  { code: "GB", flag: "🇬🇧", name: "United Kingdom", city: "London", tz: "Europe/London", lat: 51.5074, lng: -0.1278, currency: "GBP", dial: "+44", languages: "English", population: "68M", region: "Europe" },
  { code: "DE", flag: "🇩🇪", name: "Germany", city: "Berlin", tz: "Europe/Berlin", lat: 52.52, lng: 13.405, currency: "EUR", dial: "+49", languages: "German", population: "84M", region: "Europe" },
  { code: "FR", flag: "🇫🇷", name: "France", city: "Paris", tz: "Europe/Paris", lat: 48.8566, lng: 2.3522, currency: "EUR", dial: "+33", languages: "French", population: "68M", region: "Europe" },
  { code: "IT", flag: "🇮🇹", name: "Italy", city: "Rome", tz: "Europe/Rome", lat: 41.9028, lng: 12.4964, currency: "EUR", dial: "+39", languages: "Italian", population: "59M", region: "Europe" },
  { code: "ES", flag: "🇪🇸", name: "Spain", city: "Madrid", tz: "Europe/Madrid", lat: 40.4168, lng: -3.7038, currency: "EUR", dial: "+34", languages: "Spanish", population: "48M", region: "Europe" },
  { code: "NL", flag: "🇳🇱", name: "Netherlands", city: "Amsterdam", tz: "Europe/Amsterdam", lat: 52.3676, lng: 4.9041, currency: "EUR", dial: "+31", languages: "Dutch", population: "18M", region: "Europe" },
  { code: "IE", flag: "🇮🇪", name: "Ireland", city: "Dublin", tz: "Europe/Dublin", lat: 53.3498, lng: -6.2603, currency: "EUR", dial: "+353", languages: "English, Irish", population: "5M", region: "Europe" },
  { code: "SE", flag: "🇸🇪", name: "Sweden", city: "Stockholm", tz: "Europe/Stockholm", lat: 59.3293, lng: 18.0686, currency: "SEK", dial: "+46", languages: "Swedish", population: "10M", region: "Europe" },
  { code: "CH", flag: "🇨🇭", name: "Switzerland", city: "Zurich", tz: "Europe/Zurich", lat: 47.3769, lng: 8.5417, currency: "CHF", dial: "+41", languages: "German, French, Italian", population: "9M", region: "Europe" },

  // ---------- Asia ----------
  { code: "IN", flag: "🇮🇳", name: "India", city: "Kolkata", tz: "Asia/Calcutta", lat: 22.5726, lng: 88.3639, currency: "INR", dial: "+91", languages: "Hindi, English", population: "1.4B", region: "Asia" },
  { code: "JP", flag: "🇯🇵", name: "Japan", city: "Tokyo", tz: "Asia/Tokyo", lat: 35.6762, lng: 139.6503, currency: "JPY", dial: "+81", languages: "Japanese", population: "123M", region: "Asia" },
  { code: "CN", flag: "🇨🇳", name: "China", city: "Beijing", tz: "Asia/Shanghai", lat: 39.9042, lng: 116.4074, currency: "CNY", dial: "+86", languages: "Mandarin", population: "1.4B", region: "Asia" },
  { code: "KR", flag: "🇰🇷", name: "South Korea", city: "Seoul", tz: "Asia/Seoul", lat: 37.5665, lng: 126.978, currency: "KRW", dial: "+82", languages: "Korean", population: "52M", region: "Asia" },
  { code: "SG", flag: "🇸🇬", name: "Singapore", city: "Singapore", tz: "Asia/Singapore", lat: 1.3521, lng: 103.8198, currency: "SGD", dial: "+65", languages: "English, Malay, Chinese, Tamil", population: "6M", region: "Asia" },
  { code: "TH", flag: "🇹🇭", name: "Thailand", city: "Bangkok", tz: "Asia/Bangkok", lat: 13.7563, lng: 100.5018, currency: "THB", dial: "+66", languages: "Thai", population: "72M", region: "Asia" },
  { code: "VN", flag: "🇻🇳", name: "Vietnam", city: "Hanoi", tz: "Asia/Ho_Chi_Minh", lat: 21.0278, lng: 105.8342, currency: "VND", dial: "+84", languages: "Vietnamese", population: "99M", region: "Asia" },
  { code: "MY", flag: "🇲🇾", name: "Malaysia", city: "Kuala Lumpur", tz: "Asia/Kuala_Lumpur", lat: 3.139, lng: 101.6869, currency: "MYR", dial: "+60", languages: "Malay", population: "34M", region: "Asia" },
  { code: "ID", flag: "🇮🇩", name: "Indonesia", city: "Jakarta", tz: "Asia/Jakarta", lat: -6.2088, lng: 106.8456, currency: "IDR", dial: "+62", languages: "Indonesian", population: "275M", region: "Asia" },
  { code: "PH", flag: "🇵🇭", name: "Philippines", city: "Manila", tz: "Asia/Manila", lat: 14.5995, lng: 120.9842, currency: "PHP", dial: "+63", languages: "Filipino, English", population: "115M", region: "Asia" },

  // ---------- Middle East ----------
  { code: "AE", flag: "🇦🇪", name: "United Arab Emirates", city: "Dubai", tz: "Asia/Dubai", lat: 25.2048, lng: 55.2708, currency: "AED", dial: "+971", languages: "Arabic", population: "10M", region: "Middle East" },
  { code: "SA", flag: "🇸🇦", name: "Saudi Arabia", city: "Riyadh", tz: "Asia/Riyadh", lat: 24.7136, lng: 46.6753, currency: "SAR", dial: "+966", languages: "Arabic", population: "36M", region: "Middle East" },
  { code: "IL", flag: "🇮🇱", name: "Israel", city: "Jerusalem", tz: "Asia/Jerusalem", lat: 31.7683, lng: 35.2137, currency: "ILS", dial: "+972", languages: "Hebrew", population: "10M", region: "Middle East" },
  { code: "TR", flag: "🇹🇷", name: "Türkiye", city: "Istanbul", tz: "Europe/Istanbul", lat: 41.0082, lng: 28.9784, currency: "TRY", dial: "+90", languages: "Turkish", population: "85M", region: "Middle East" },

  // ---------- Africa ----------
  { code: "EG", flag: "🇪🇬", name: "Egypt", city: "Cairo", tz: "Africa/Cairo", lat: 30.0444, lng: 31.2357, currency: "EGP", dial: "+20", languages: "Arabic", population: "110M", region: "Africa" },
  { code: "ZA", flag: "🇿🇦", name: "South Africa", city: "Johannesburg", tz: "Africa/Johannesburg", lat: -26.2041, lng: 28.0473, currency: "ZAR", dial: "+27", languages: "English, Afrikaans, Zulu", population: "60M", region: "Africa" },
  { code: "NG", flag: "🇳🇬", name: "Nigeria", city: "Lagos", tz: "Africa/Lagos", lat: 6.5244, lng: 3.3792, currency: "NGN", dial: "+234", languages: "English", population: "220M", region: "Africa" },
  { code: "KE", flag: "🇰🇪", name: "Kenya", city: "Nairobi", tz: "Africa/Nairobi", lat: -1.2921, lng: 36.8219, currency: "KES", dial: "+254", languages: "English, Swahili", population: "55M", region: "Africa" },

  // ---------- Oceania ----------
  { code: "AU", flag: "🇦🇺", name: "Australia", city: "Sydney", tz: "Australia/Sydney", lat: -33.8688, lng: 151.2093, currency: "AUD", dial: "+61", languages: "English", population: "26M", region: "Oceania" },
  { code: "NZ", flag: "🇳🇿", name: "New Zealand", city: "Auckland", tz: "Pacific/Auckland", lat: -36.8485, lng: 174.7633, currency: "NZD", dial: "+64", languages: "English, Māori", population: "5M", region: "Oceania" },
];