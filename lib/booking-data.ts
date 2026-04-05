export type BookingTier = "book-now" | "book-closer" | "no-booking";

export interface BookingItem {
  id: string;
  title: string;
  tier: BookingTier;
  date?: string;
  dateLabel?: string;
  partySize?: number;
  url?: string;
  notes?: string;
  location?: {
    name: string;
    address?: string;
    query?: string;
  };
}

export const bookingItems: BookingItem[] = [
  // BOOK NOW — availability matters
  {
    id: "lustau",
    title: "Bodegas Lustau",
    tier: "book-now",
    date: "2026-05-18",
    dateLabel: "Mon May 18",
    partySize: 4,
    url: "https://lustau.es",
    location: { name: "Bodegas Lustau", query: "Bodegas Lustau Jerez" },
  },
  {
    id: "protos",
    title: "Bodegas Protos",
    tier: "book-now",
    date: "2026-05-21",
    dateLabel: "Thu May 21",
    partySize: 4,
    url: "https://bodegasprotos.com",
    location: { name: "Bodegas Protos", query: "Bodegas Protos Peñafiel" },
  },
  {
    id: "emilio-moro",
    title: "Bodegas Emilio Moro",
    tier: "book-now",
    date: "2026-05-21",
    dateLabel: "Thu May 21",
    partySize: 4,
    url: "https://emiliomoro.com",
    location: { name: "Bodegas Emilio Moro", query: "Bodegas Emilio Moro Pesquera de Duero" },
  },
  {
    id: "alcazar",
    title: "Real Alcázar timed entry",
    tier: "book-now",
    date: "2026-05-19",
    dateLabel: "Tue May 19, morning",
    partySize: 4,
    url: "https://alcazarsevilla.org",
    location: { name: "Real Alcázar", query: "Real Alcazar Sevilla" },
  },

  {
    id: "ave-train",
    title: "AVE Train — Madrid → Seville",
    tier: "book-now",
    date: "2026-05-17",
    dateLabel: "Sun May 17",
    partySize: 4,
    url: "https://renfe.com/es/en",
    notes: "Atocha Station, ~2.5 hrs. Book assigned seats.",
  },
  {
    id: "rm-tickets",
    title: "Real Madrid Match Tickets",
    tier: "book-now",
    date: "2026-05-17",
    dateLabel: "Sun May 17, evening",
    partySize: 2,
    url: "https://seatpick.com",
    notes: "Charles & Tony only. Santiago Bernabéu.",
  },
  {
    id: "dstage",
    title: "DSTAgE — 2 Michelin Stars",
    tier: "book-now",
    date: "2026-05-21",
    dateLabel: "Thu May 21, 9 PM",
    partySize: 4,
    url: "https://dstageconcept.com",
    notes: "16-course DTASTE menu €175/pp + wine pairing €90/pp",
  },

  // BOOK CLOSER TO TRIP
  {
    id: "car-sherry",
    title: "Car rental — Sherry Triangle",
    tier: "book-closer",
    date: "2026-05-18",
    dateLabel: "Mon May 18",
    notes: "Pickup/return Seville. Check sixt.com or europcar.com",
    url: "https://sixt.com",
  },
  {
    id: "car-madrid",
    title: "Car rental — Seville → Madrid",
    tier: "book-closer",
    date: "2026-05-20",
    dateLabel: "Wed May 20",
    notes: "One-way drop in Madrid. Consider keeping through Thu May 21 for Ribera del Duero day trip.",
    url: "https://europcar.com",
  },
  {
    id: "cathedral",
    title: "Seville Cathedral tickets",
    tier: "book-closer",
    date: "2026-05-19",
    dateLabel: "Tue May 19",
    partySize: 4,
  },

  // NO BOOKING NEEDED — walk-in
  {
    id: "despiece",
    title: "Sala de Despiece",
    tier: "no-booking",
    dateLabel: "Wed night",
    notes: "Walk-in",
    location: { name: "Sala de Despiece", query: "Sala de Despiece Madrid" },
  },
  {
    id: "eslava",
    title: "Eslava",
    tier: "no-booking",
    dateLabel: "Mon night",
    notes: "Walk-in, arrive 9 PM",
    location: { name: "Eslava", query: "Eslava Sevilla" },
  },
  {
    id: "walkins-seville",
    title: "El Rinconcillo, Bar Juanito, Bodega Santa Cruz",
    tier: "no-booking",
    notes: "Walk-in tapas bars in Seville & Jerez",
  },
  {
    id: "walkins-bars",
    title: "La Venencia, La Clandestina",
    tier: "no-booking",
    notes: "Walk-in bars — Madrid & Cádiz",
  },
];

export const tierConfig = {
  "book-now": {
    label: "Book Now",
    sublabel: "Availability matters",
    color: "#C0392B",
    bgColor: "rgba(192, 57, 43, 0.04)",
  },
  "book-closer": {
    label: "Book Closer to Trip",
    sublabel: "Can wait a bit",
    color: "#D4A843",
    bgColor: "rgba(212, 168, 67, 0.04)",
  },
  "no-booking": {
    label: "No Booking Needed",
    sublabel: "Walk-in venues",
    color: "#5D6D3F",
    bgColor: "rgba(93, 109, 63, 0.04)",
  },
} as const;
