export interface MapLocation {
  id: string;
  emoji: string;
  name: string;
  description: string;
  lat: number;
  lng: number;
}

export const mapLocations: MapLocation[] = [
  { id: "reef", emoji: "🏨", name: "The Reef", description: "Home base", lat: 25.0847, lng: -77.3227 },
  { id: "aquaventure", emoji: "🎢", name: "Aquaventure", description: "Waterpark", lat: 25.0862, lng: -77.3233 },
  { id: "marina-village", emoji: "🛍️", name: "Marina Village", description: "Shops & restaurants", lat: 25.0856, lng: -77.3262 },
  { id: "royal-towers", emoji: "🏛️", name: "Royal Towers", description: "Casino & lobby", lat: 25.0868, lng: -77.3244 },
  { id: "nobu", emoji: "🍣", name: "Nobu", description: "Restaurant", lat: 25.0863, lng: -77.3251 },
  { id: "nassau", emoji: "🏙️", name: "Nassau Town", description: "Downtown", lat: 25.0480, lng: -77.3554 },
  { id: "splashers", emoji: "💦", name: "Splashers", description: "Kids water play", lat: 25.0860, lng: -77.3238 },
  { id: "marine-habitat", emoji: "🐠", name: "Marine Habitat", description: "Free aquariums", lat: 25.0865, lng: -77.3248 },
  { id: "dig", emoji: "🏛️", name: "Dig", description: "Kids museum", lat: 25.0866, lng: -77.3246 },
  { id: "dolphin-cay", emoji: "🐬", name: "Dolphin Cay", description: "Dolphin experience", lat: 25.0858, lng: -77.3260 },
  { id: "cove-beach", emoji: "🏖️", name: "Cove Beach", description: "Calm beach", lat: 25.0870, lng: -77.3220 },
  { id: "seafire", emoji: "🥩", name: "Seafire Steakhouse", description: "Fine dining", lat: 25.0864, lng: -77.3249 },
  { id: "casino", emoji: "🎰", name: "Atlantis Casino", description: "Adults only", lat: 25.0867, lng: -77.3245 },
];

// Center point for the embedded map (The Reef at Atlantis)
export const MAP_CENTER = { lat: 25.0855, lng: -77.3240 };

export function getLocationById(id: string): MapLocation | undefined {
  return mapLocations.find((l) => l.id === id);
}

export interface GuideItem {
  text: string;
  locationId?: string; // links to a MapLocation for "get directions"
  hours?: string; // timing/hours info
}

export interface GuideSection {
  id: string;
  emoji: string;
  title: string;
  items: GuideItem[];
}

export const guideSections: GuideSection[] = [
  {
    id: "reef-overview",
    emoji: "🏨",
    title: "The Reef Overview",
    items: [
      { text: "The Reef is a condo-style tower connected to Atlantis via the walkway to The Royal — about a 10-minute walk or quick shuttle ride.", locationId: "reef" },
      { text: "Units have full kitchens — great for storing milk, snacks, and baby food. Hit the grocery delivery before arrival." },
      { text: "Free shuttle runs between The Reef and the main Atlantis complex (Royal Towers) throughout the day.", hours: "Shuttle runs 7 AM – 11 PM" },
      { text: "The Reef has its own quiet pool area — much calmer than the main pools. Perfect for little ones.", locationId: "reef", hours: "Pool open 8 AM – 6 PM" },
      { text: "You get full Aquaventure waterpark access with your stay — wristbands at check-in.", locationId: "aquaventure" },
      { text: "Parking is available but you probably won't need a car. Resort shuttles + taxis cover everything." },
      { text: "The lobby has a small market/shop for essentials if you forget something.", hours: "Open 7 AM – 10 PM" },
    ],
  },
  {
    id: "kid-pools",
    emoji: "🏊",
    title: "Kid-Friendly Pools & Beaches",
    items: [
      { text: "Splashers — Dedicated kids' water play area with shallow water, small slides, and splash zones. Best for Maeve, Rivers, and Wright.", locationId: "splashers", hours: "Open 9 AM – 5 PM daily" },
      { text: "The Reef Pool — Much quieter than Aquaventure. Zero-entry section is great for toddlers. Less crowded in the mornings.", locationId: "reef", hours: "Open 8 AM – 6 PM" },
      { text: "Aquaventure — Huge waterpark included with stay. The lazy river is stroller-accessible nearby. Some slides have height/age limits.", locationId: "aquaventure", hours: "Open 9 AM – 5 PM (seasonal hours may extend to 6 PM)" },
      { text: "Cove Beach — Calmer water than Cabbage Beach. Better for toddlers. Chairs and umbrellas included.", locationId: "cove-beach" },
      { text: "Cabbage Beach — Beautiful but waves can be strong. Better for older kids and adults." },
      { text: "Pro tip: Arrive at pools by 9 AM to snag chairs. The Reef pool rarely fills up though." },
      { text: "Bring water shoes — the pool deck and beach areas can get hot for little feet." },
    ],
  },
  {
    id: "dining",
    emoji: "🍽️",
    title: "Dining",
    items: [
      { text: "Nobu — Upscale but surprisingly kid-tolerant. Book early evening (5:30-6 PM) for less crowds. Highchairs available.", locationId: "nobu", hours: "Dinner 5:30 PM – 10 PM · Reservations recommended" },
      { text: "Seafire Steakhouse — Great for a nice dinner. Smart casual dress code. Reserve ahead.", locationId: "seafire", hours: "Dinner 5:30 PM – 10 PM · Reservations required" },
      { text: "Marina Pizzeria — Casual, quick, and kids love it. No reservation needed.", locationId: "marina-village", hours: "Open 11 AM – 11 PM" },
      { text: "Virgil's Real BBQ — Family-friendly, loud enough that kids won't bother anyone. Solid option.", locationId: "marina-village", hours: "Open 11:30 AM – 10 PM" },
      { text: "Murray's Deli — Quick breakfast/lunch spot. Good sandwiches and bagels.", locationId: "marina-village", hours: "Open 7 AM – 5 PM" },
      { text: "Starbucks is in the Royal Towers — your morning coffee stop on the way to pools.", locationId: "royal-towers", hours: "Open 6 AM – 9 PM" },
      { text: "Room service is available but pricey. The kitchen in your Reef unit saves a fortune on breakfasts and snacks." },
      { text: "Tip: Order grocery delivery (Bahamas Grocery Delivery or Instacart equivalent) before arrival — milk, fruit, snacks, diapers." },
    ],
  },
  {
    id: "toddler-activities",
    emoji: "🐠",
    title: "Activities with Toddlers",
    items: [
      { text: "Marine Habitat — FREE and open to all guests. Walk-through aquariums with huge windows. Maeve and Wright will love the fish. Rivers can do the guided experience.", locationId: "marine-habitat", hours: "Open 24/7 (self-guided) · Guided tours 10 AM – 4 PM" },
      { text: "Dig — Interactive museum/play area for kids. Rivers (6) will be the right age. Younger kids may enjoy the simpler exhibits.", locationId: "dig", hours: "Open 10 AM – 7 PM · Last entry 6 PM" },
      { text: "Dolphin Cay — You can do the shallow water interaction. Check age minimums — some programs require 6+, which Rivers qualifies for.", locationId: "dolphin-cay", hours: "Sessions 9 AM – 4:30 PM · Book in advance" },
      { text: "Aquaventure lazy river — Push the stroller alongside and hop in/out easily. Very toddler-parent friendly.", locationId: "aquaventure", hours: "Open 9 AM – 5 PM" },
      { text: "Beach walks — Early morning or late afternoon is best. Bring the stroller for the boardwalk areas.", locationId: "cove-beach" },
      { text: "Atlantis Casino — Adults-only evening option when one couple does bedtime duty and the other gets a night out.", locationId: "casino", hours: "Open 24/7 · Must be 18+" },
      { text: "The resort is very stroller-friendly. Most areas have ramps and elevators." },
    ],
  },
  {
    id: "practical",
    emoji: "💡",
    title: "Practical Tips",
    items: [
      { text: "Best pool times: 8-10 AM (quiet) or 3-5 PM (thinning out). Midday is packed and hottest." },
      { text: "Daily carry bag: sunscreen, diapers/wipes, snacks, water cups, change of clothes, waterproof phone pouch." },
      { text: "The walk from The Reef to Royal Towers is about 10 mins. Use the shuttle if you have strollers + gear.", locationId: "royal-towers" },
      { text: "Pharmacy: There's a small one in the Marina Village. For bigger needs, there's a pharmacy in Nassau (taxi ride).", locationId: "marina-village" },
      { text: "Wi-Fi is included but can be spotty. Download shows/movies for the kids before the trip." },
      { text: "Nap schedule tip: Plan pool time around naps. Morning pool → lunch → nap at the room → afternoon pool/beach." },
      { text: "Baby monitor tip: The Reef units are spacious. Bring your monitor so you can sit on the balcony during naps." },
      { text: "Tipping: 15-20% at restaurants. $2-5 per day for housekeeping. Pool/beach attendants appreciate $2-5 for chair setups." },
      { text: "Weather: Late March/early April is ideal — mid-80s, low humidity, low chance of rain." },
    ],
  },
];
