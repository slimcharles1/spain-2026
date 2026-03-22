export interface GuideSection {
  id: string;
  emoji: string;
  title: string;
  items: string[];
}

export const guideSections: GuideSection[] = [
  {
    id: "reef-overview",
    emoji: "🏨",
    title: "The Reef Overview",
    items: [
      "The Reef is a condo-style tower connected to Atlantis via the walkway to The Royal — about a 10-minute walk or quick shuttle ride.",
      "Units have full kitchens — great for storing milk, snacks, and baby food. Hit the grocery delivery before arrival.",
      "Free shuttle runs between The Reef and the main Atlantis complex (Royal Towers) throughout the day.",
      "The Reef has its own quiet pool area — much calmer than the main pools. Perfect for little ones.",
      "You get full Aquaventure waterpark access with your stay — wristbands at check-in.",
      "Parking is available but you probably won't need a car. Resort shuttles + taxis cover everything.",
      "The lobby has a small market/shop for essentials if you forget something.",
    ],
  },
  {
    id: "kid-pools",
    emoji: "🏊",
    title: "Kid-Friendly Pools & Beaches",
    items: [
      "Splashers — Dedicated kids' water play area with shallow water, small slides, and splash zones. Best for Maeve, Rivers, and Wright.",
      "The Reef Pool — Much quieter than Aquaventure. Zero-entry section is great for toddlers. Less crowded in the mornings.",
      "Aquaventure — Huge waterpark included with stay. The lazy river is stroller-accessible nearby. Some slides have height/age limits.",
      "Cove Beach — Calmer water than Cabbage Beach. Better for toddlers. Chairs and umbrellas included.",
      "Cabbage Beach — Beautiful but waves can be strong. Better for older kids and adults.",
      "Pro tip: Arrive at pools by 9 AM to snag chairs. The Reef pool rarely fills up though.",
      "Bring water shoes — the pool deck and beach areas can get hot for little feet.",
    ],
  },
  {
    id: "dining",
    emoji: "🍽️",
    title: "Dining",
    items: [
      "Nobu — Upscale but surprisingly kid-tolerant. Book early evening (5:30-6 PM) for less crowds. Highchairs available.",
      "Seafire Steakhouse — Great for a nice dinner. Smart casual dress code. Reserve ahead.",
      "Marina Pizzeria — Casual, quick, and kids love it. No reservation needed.",
      "Virgil's Real BBQ — Family-friendly, loud enough that kids won't bother anyone. Solid option.",
      "Murray's Deli — Quick breakfast/lunch spot. Good sandwiches and bagels.",
      "Starbucks is in the Royal Towers — your morning coffee stop on the way to pools.",
      "Room service is available but pricey. The kitchen in your Reef unit saves a fortune on breakfasts and snacks.",
      "Tip: Order grocery delivery (Bahamas Grocery Delivery or Instacart equivalent) before arrival — milk, fruit, snacks, diapers.",
    ],
  },
  {
    id: "toddler-activities",
    emoji: "🐠",
    title: "Activities with Toddlers",
    items: [
      "Marine Habitat — FREE and open to all guests. Walk-through aquariums with huge windows. Maeve and Wright will love the fish. Rivers can do the guided experience.",
      "Dig — Interactive museum/play area for kids. Rivers (6) will be the right age. Younger kids may enjoy the simpler exhibits.",
      "Dolphin Cay — You can do the shallow water interaction. Check age minimums — some programs require 6+, which Rivers qualifies for.",
      "Aquaventure lazy river — Push the stroller alongside and hop in/out easily. Very toddler-parent friendly.",
      "Beach walks — Early morning or late afternoon is best. Bring the stroller for the boardwalk areas.",
      "Atlantis Casino — Adults-only evening option when one couple does bedtime duty and the other gets a night out.",
      "The resort is very stroller-friendly. Most areas have ramps and elevators.",
    ],
  },
  {
    id: "practical",
    emoji: "💡",
    title: "Practical Tips",
    items: [
      "Best pool times: 8-10 AM (quiet) or 3-5 PM (thinning out). Midday is packed and hottest.",
      "Daily carry bag: sunscreen, diapers/wipes, snacks, water cups, change of clothes, waterproof phone pouch.",
      "The walk from The Reef to Royal Towers is about 10 mins. Use the shuttle if you have strollers + gear.",
      "Pharmacy: There's a small one in the Marina Village. For bigger needs, there's a pharmacy in Nassau (taxi ride).",
      "Wi-Fi is included but can be spotty. Download shows/movies for the kids before the trip.",
      "Nap schedule tip: Plan pool time around naps. Morning pool → lunch → nap at the room → afternoon pool/beach.",
      "Baby monitor tip: The Reef units are spacious. Bring your monitor so you can sit on the balcony during naps.",
      "Tipping: 15-20% at restaurants. $2-5 per day for housekeeping. Pool/beach attendants appreciate $2-5 for chair setups.",
      "Weather: Late March/early April is ideal — mid-80s, low humidity, low chance of rain.",
    ],
  },
];
