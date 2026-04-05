export interface InfoItem {
  text: string;
  emphasis?: boolean;
  mapsQuery?: string;
  url?: string;
}

export interface InfoSection {
  id: string;
  emoji: string;
  title: string;
  summary: string;
  items: InfoItem[];
  autoCollapseAfterTripStart?: boolean;
}

export const flightInfo = {
  outbound: {
    label: "OUTBOUND",
    route: "IAD → MAD",
    airline: "Iberia",
    date: "Fri May 15",
    detail: "Nonstop · ~5:00 PM",
    confirmation: "",
  },
  return: {
    label: "RETURN",
    route: "MAD → IAD",
    airline: "IB 361",
    date: "Fri May 22",
    detail: "12:20 PM · 9h 10m",
    confirmation: "BR3EZO",
  },
};

export const infoSections: InfoSection[] = [
  {
    id: "emergency",
    emoji: "🚨",
    title: "Emergency",
    summary: "112 · US Embassy · hospitals",
    items: [
      { text: "Emergency number: 112 (works across Spain)", emphasis: true },
      { text: "US Embassy Madrid: +34 91 587 2200", emphasis: true },
      { text: "Calle de Serrano, 75, 28006 Madrid", mapsQuery: "US Embassy Madrid" },
      { text: "Hospital Universitario Virgen del Rocío (Seville): +34 955 01 20 00", mapsQuery: "Hospital Virgen del Rocio Seville" },
      { text: "Hospital Universitario La Paz (Madrid): +34 91 727 70 00", mapsQuery: "Hospital La Paz Madrid" },
      { text: "Travel insurance: check documents before departure" },
    ],
  },
  {
    id: "hotels",
    emoji: "🏨",
    title: "Hotels",
    summary: "3 hotels across Madrid & Seville",
    items: [
      { text: "URSO Hotel & Spa — 1 night (May 16)", emphasis: true },
      { text: "Calle de Mejía Lequerica, 8, Madrid · ~€220-280/night", mapsQuery: "URSO Hotel Spa Madrid" },
      { text: "Restored 1920s palace · Full spa · Early check-in friendly" },
      { text: "Check Amex FHR availability for extra perks" },
      { text: "—" },
      { text: "Hotel Colón Gran Meliá — 3 nights (May 17-19)", emphasis: true },
      { text: "Canalejas, 1, Plaza Nueva, Seville", mapsQuery: "Hotel Colon Gran Melia Seville" },
      { text: "Amex FHR: $300 F&B credit · breakfast for 2 · room upgrade · late checkout" },
      { text: "Rooftop plunge pool · Clarins spa · ~€275-350/night" },
      { text: "—" },
      { text: "Gran Hotel Inglés — 2 nights (May 20-21)", emphasis: true },
      { text: "Calle de Echegaray, 8, Madrid · Barrio de las Letras", mapsQuery: "Gran Hotel Ingles Madrid" },
      { text: "Madrid's #1 rated hotel on TripAdvisor" },
    ],
  },
  {
    id: "transport",
    emoji: "🚆",
    title: "Transport",
    summary: "AVE trains, taxis, car rental",
    items: [
      { text: "Madrid airport taxi: flat €33 from T4 to center", emphasis: true },
      { text: "Madrid → Seville: AVE from Atocha (2.5 hrs, ~€50-80/pp)", emphasis: true },
      { text: "Download the Renfe app for train tickets", url: "https://renfe.com/es/en" },
      { text: "Sherry Triangle: rental car or guided tour (~€40-90/day)" },
      { text: "Seville → Madrid: one-way car rental (5-8 hrs with stops, ~€60-80 + €30-40 fuel)" },
      { text: "Ribera del Duero: rental car from Madrid (~2 hrs each way)" },
      { text: "US license is valid for short stays in Spain" },
      { text: "Mostly toll-free via A-4 highway" },
      { text: "Madrid metro: fast and cheap. Seville: walkable historic center" },
    ],
  },
  {
    id: "language",
    emoji: "🗣️",
    title: "Language",
    summary: "Key Spanish phrases",
    items: [
      { text: "La cuenta, por favor — The check, please", emphasis: true },
      { text: "Una mesa para cuatro — A table for four" },
      { text: "Agua del grifo, por favor — Tap water, please" },
      { text: "¡Salud! — Cheers!" },
      { text: "¿Dónde está...? — Where is...?" },
      { text: "Un vino tinto / blanco — A red / white wine" },
      { text: "¿Tienen carta en inglés? — Do you have a menu in English?" },
      { text: "Dos cañas, por favor — Two small beers, please" },
      { text: "Muchas gracias — Thank you very much" },
      { text: "Most people in tourist areas speak some English" },
    ],
  },
  {
    id: "dining",
    emoji: "🍽️",
    title: "Dining Culture",
    summary: "Meal times, tipping, walk-in culture",
    items: [
      { text: "Lunch: 2:00-3:30 PM · Dinner: 9:00-11:00 PM", emphasis: true },
      { text: "Siesta: many shops and smaller restaurants close 2-5 PM", emphasis: true },
      { text: "Tipping: 5-10% at sit-down restaurants. Round up at tapas bars." },
      { text: "Tapas bars: no reservations needed. Stand at the bar." },
      { text: "Sobremesa — the post-meal conversation. Don't rush dinner." },
      { text: "Vermut hour: 12-2 PM (traditional) or ~7 PM" },
      { text: "Tapas: ~€15-25/pp · Sit-down: ~€40-70/pp · DSTAgE: ~€175-265/pp" },
    ],
  },
  {
    id: "money",
    emoji: "💶",
    title: "Money",
    summary: "EUR, cards, cash tips",
    items: [
      { text: "Currency: Euro (€). Cards accepted nearly everywhere." },
      { text: "Cash for: small tapas bars, sherry bars, markets, tipping" },
      { text: "Ask for 'agua del grifo' for free tap water (safe to drink!)", emphasis: true },
      { text: "ATMs: avoid 'dynamic currency conversion' — always pay in EUR" },
      { text: "Amex FHR: $300 F&B credit at Colón Gran Meliá" },
      { text: "Amex $600 hotel credit + $200 airline credit may apply" },
    ],
  },
  {
    id: "weather",
    emoji: "☀️",
    title: "Weather",
    summary: "Warm, sunny, pack light layers",
    items: [
      { text: "Madrid: 60-77°F (16-25°C), mostly sunny" },
      { text: "Seville: 65-86°F (18-30°C), hot and sunny" },
      { text: "Cádiz: ocean breeze, slightly cooler — bring a light layer for the beach" },
      { text: "May is one of the best months to visit — before summer heat" },
      { text: "Rain is unlikely but not impossible — check forecast day-of" },
    ],
  },
  {
    id: "packing",
    emoji: "🧳",
    title: "Packing Essentials",
    summary: "Walking shoes, layers, sunscreen",
    autoCollapseAfterTripStart: true,
    items: [
      { text: "Comfortable walking shoes — you'll walk 8-12 miles/day", emphasis: true },
      { text: "Light layers for evening (AC in restaurants can be cold)" },
      { text: "Sunscreen and sunglasses" },
      { text: "Smart casual for restaurants — no shorts at cathedrals" },
      { text: "Nice outfit for DSTAgE (smart/dressy)", emphasis: true },
      { text: "Passport — check expiration date!" },
      { text: "Phone charger + portable battery" },
      { text: "Swimsuit for hotel pools and Cádiz beach" },
    ],
  },
  {
    id: "pharmacies",
    emoji: "💊",
    title: "Pharmacies",
    summary: "Green cross signs, OTC meds",
    items: [
      { text: "Look for the green cross signs — they're everywhere" },
      { text: "Spanish pharmacies carry things that require prescriptions in the US" },
      { text: "Ibuprofen, allergy meds, stomach remedies available OTC" },
      { text: "Pharmacists often speak English and can recommend treatments" },
    ],
  },
  {
    id: "links",
    emoji: "🔗",
    title: "Key Links",
    summary: "Bookings, apps, references",
    items: [
      { text: "AVE Trains: renfe.com/es/en", url: "https://renfe.com/es/en" },
      { text: "Football tickets: seatpick.com", url: "https://seatpick.com" },
      { text: "Alcázar: alcazarsevilla.org", url: "https://alcazarsevilla.org" },
      { text: "Lustau: lustau.es", url: "https://lustau.es" },
      { text: "Protos: bodegasprotos.com", url: "https://bodegasprotos.com" },
      { text: "DSTAgE: dstageconcept.com", url: "https://dstageconcept.com" },
      { text: "Amex FHR: americanexpress.com/travel", url: "https://americanexpress.com/travel" },
      { text: "Car rental: sixt.com / europcar.com" },
    ],
  },
];
