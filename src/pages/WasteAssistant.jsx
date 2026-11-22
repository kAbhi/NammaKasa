import React, { useState, useRef, useEffect } from 'react';
import { Leaf, Send, RotateCcw, Recycle, Info, BookOpen } from 'lucide-react';

// ─── Knowledge Base ──────────────────────────────────────────────────────────
// Each entry has:
//   category   : 'wet' | 'dry' | 'sanitary' | 'hazardous' | 'e-waste' | 'construction' | 'donation'
//   bin        : human-readable disposal stream
//   preparation: step-by-step preparation array (English)
//   facility   : where to take/leave it
//   en         : one-line English summary
//   kn         : one-line Kannada summary
//   tips       : extra tip (English)
//   aliases    : extra keywords that should match this entry

const WASTE_KB = [
  // ── Wet / Organic ──────────────────────────────────────────────────────────
  {
    key: 'vegetable peels',
    aliases: ['vegetable', 'veggie', 'sabzi', 'palya', 'tarkari', 'onion peel', 'potato peel', 'carrot peel'],
    category: 'wet',
    bin: 'Green Bin (Wet Waste)',
    preparation: [
      'Drain any excess water or moisture.',
      'Do not wrap in plastic bags — use newspaper or a compostable bag.',
      'Place directly in the Green Bin kept outside your door.',
    ],
    facility: 'BBMP Green Bin → Wet Waste Processing Unit / Home Composting',
    en: 'Vegetable peels are organic wet waste. They go in the Green Bin and are ideal for composting.',
    kn: 'ತರಕಾರಿ ಸಿಪ್ಪೆಗಳು ಒದ್ದೆ ತ್ಯಾಜ್ಯ. ಹಸಿರು ಡಬ್ಬಿಗೆ ಹಾಕಿ ಮತ್ತು ಮನೆ ಗೊಬ್ಬರಕ್ಕೆ ಬಳಸಿ.',
    tips: 'Vegetable peels compost in 30–45 days. Try a home compost bin to reduce waste entirely!',
  },
  {
    key: 'food waste',
    aliases: ['food', 'cooked food', 'leftover', 'rice', 'dal', 'curry', 'roti', 'chapati', 'anna', 'bisibelebath'],
    category: 'wet',
    bin: 'Green Bin (Wet Waste)',
    preparation: [
      'Drain liquids into the sink before disposal.',
      'Avoid mixing with plastic wrappers or packaging.',
      'Use a small covered bin indoors; transfer to Green Bin on collection day.',
    ],
    facility: 'BBMP Green Bin → Wet Waste Processing Unit',
    en: 'Cooked food leftovers are wet waste. Drain liquids and place in the Green Bin.',
    kn: 'ಬೇಯಿಸಿದ ಆಹಾರ ತ್ಯಾಜ್ಯ ಒದ್ದೆ ತ್ಯಾಜ್ಯ. ದ್ರವ ಬಸಿದು ಹಸಿರು ಡಬ್ಬಿಗೆ ಹಾಕಿ.',
    tips: 'Consider contacting NGOs like Feeding India if the food is still edible.',
  },
  {
    key: 'fruit peels',
    aliases: ['fruit', 'banana peel', 'orange peel', 'mango seed', 'melon rind', 'hannu sippe'],
    category: 'wet',
    bin: 'Green Bin (Wet Waste)',
    preparation: [
      'Remove any stickers or rubber bands.',
      'No need to rinse — place directly in the Green Bin.',
    ],
    facility: 'BBMP Green Bin → Composting Facility',
    en: 'Fruit peels and seeds are wet waste. Put them in the Green Bin.',
    kn: 'ಹಣ್ಣಿನ ಸಿಪ್ಪೆ ಮತ್ತು ಬೀಜಗಳು ಒದ್ದೆ ತ್ಯಾಜ್ಯ. ಹಸಿರು ಡಬ್ಬಿಗೆ ಹಾಕಿ.',
    tips: 'Citrus peels can be dried and used as a natural air freshener before composting.',
  },
  {
    key: 'egg shells',
    aliases: ['egg', 'egg shell', 'motte chippi'],
    category: 'wet',
    bin: 'Green Bin (Wet Waste)',
    preparation: [
      'Rinse shells to remove any raw egg residue.',
      'Crush lightly to speed up composting.',
      'Place in Green Bin.',
    ],
    facility: 'BBMP Green Bin → Composting Facility',
    en: 'Egg shells are wet waste. Rinse, crush and place in the Green Bin.',
    kn: 'ಮೊಟ್ಟೆ ಚಿಪ್ಪು ಒದ್ದೆ ತ್ಯಾಜ್ಯ. ತೊಳೆದು ಹಸಿರು ಡಬ್ಬಿಗೆ ಹಾಕಿ.',
    tips: 'Crushed egg shells add calcium to compost and deter slugs in gardens.',
  },
  {
    key: 'garden waste',
    aliases: ['leaves', 'flowers', 'grass', 'plant', 'garden', 'tree branch', 'twig', 'ele', 'hoovu'],
    category: 'wet',
    bin: 'Green Bin (Wet Waste)',
    preparation: [
      'Chop large branches into smaller pieces.',
      'Bundle or bag loosely — do not use sealed plastic bags.',
      'Place in Green Bin or leave at the gate on collection day.',
    ],
    facility: 'BBMP Green Bin → Composting / Mulching Unit',
    en: 'Garden waste like leaves and flowers is wet waste. Place in the Green Bin.',
    kn: 'ಎಲೆಗಳು ಮತ್ತು ಹೂವುಗಳು ಒದ್ದೆ ತ್ಯಾಜ್ಯ. ಹಸಿರು ಡಬ್ಬಿಗೆ ಹಾಕಿ.',
    tips: 'Dry leaves are excellent for mulching garden beds or as a "brown" layer in compost.',
  },

  // ── Dry / Recyclable ───────────────────────────────────────────────────────
  {
    key: 'plastic bottle',
    aliases: ['plastic', 'plastic bag', 'polythene', 'carry bag', 'wrapper', 'covers', 'plastik'],
    category: 'dry',
    bin: 'Blue Bin (Dry Waste)',
    preparation: [
      'Rinse bottles and containers to remove food residue.',
      'Flatten bottles to save space in the bin.',
      'Remove caps — they may be a different plastic type.',
      'Avoid mixing wet or food-soiled plastics.',
    ],
    facility: 'BBMP Blue Bin → Dry Waste Collection Centre (DWCC)',
    en: 'Plastic bottles are dry recyclable waste. Rinse and flatten before placing in the Blue Bin.',
    kn: 'ಪ್ಲಾಸ್ಟಿಕ್ ಬಾಟಲಿಗಳು ಒಣ ತ್ಯಾಜ್ಯ. ತೊಳೆದು ಚಪ್ಪಟೆ ಮಾಡಿ ನೀಲಿ ಡಬ್ಬಿಗೆ ಹಾಕಿ.',
    tips: 'PET bottles (#1) and HDPE (#2) are the most recyclable. Check the number on the bottom.',
  },
  {
    key: 'broken glass',
    aliases: ['glass', 'glass bottle', 'mirror', 'broken bottle', 'glass jar', 'muri gaji', 'godaambara'],
    category: 'dry',
    bin: 'Blue Bin (Dry Waste) — handle with care',
    preparation: [
      'Wrap broken glass pieces in multiple layers of newspaper.',
      'Secure with tape so shards cannot pierce through.',
      'Label the parcel "Broken Glass – Handle Carefully".',
      'Place the wrapped parcel in or beside the Blue Bin.',
    ],
    facility: 'BBMP Blue Bin → Dry Waste Collection Centre (DWCC)',
    en: 'Broken glass is dry waste but must be wrapped safely in newspaper before going in the Blue Bin.',
    kn: 'ಒಡೆದ ಗಾಜನ್ನು ಪತ್ರಿಕೆಯಲ್ಲಿ ಸುತ್ತಿ ನೀಲಿ ಡಬ್ಬಿಗೆ ಹಾಕಿ. ಎಚ್ಚರಿಕೆ ಎಂದು ಬರೆಯಿರಿ.',
    tips: 'Glass is 100% recyclable indefinitely without quality loss. Intact bottles can be donated to local juice shops for reuse.',
  },
  {
    key: 'paper',
    aliases: ['newspaper', 'cardboard', 'magazine', 'book', 'carton', 'box', 'paper bag', 'paavade', 'karjir'],
    category: 'dry',
    bin: 'Blue Bin (Dry Waste)',
    preparation: [
      'Keep paper dry — wet or greasy paper loses recyclability.',
      'Flatten cardboard boxes and remove plastic tape.',
      'Bundle newspapers together with twine.',
    ],
    facility: 'BBMP Blue Bin → Dry Waste Collection Centre (DWCC) / Kabadiwala',
    en: 'Paper and cardboard are dry recyclable waste. Keep dry and place in the Blue Bin.',
    kn: 'ಕಾಗದ ಮತ್ತು ಕಾರ್ಡ್‌ಬೋರ್ಡ್ ಒಣ ತ್ಯಾಜ್ಯ. ಒಣಗಿಸಿ ನೀಲಿ ಡಬ್ಬಿಗೆ ಹಾಕಿ.',
    tips: 'Old newspapers are worth money! Call a local kabadiwala (scrap dealer) for a pick-up.',
  },
  {
    key: 'metal',
    aliases: ['tin can', 'aluminium', 'steel', 'iron', 'foil', 'utensil', 'vessel', 'bartan'],
    category: 'dry',
    bin: 'Blue Bin (Dry Waste)',
    preparation: [
      'Rinse cans to remove food residue.',
      'Crush cans lightly to save space.',
      'Remove plastic lids if present.',
    ],
    facility: 'BBMP Blue Bin → Dry Waste Collection Centre (DWCC)',
    en: 'Metal tins and cans are dry recyclable waste. Rinse and place in the Blue Bin.',
    kn: 'ಲೋಹದ ಡಬ್ಬಿಗಳು ಒಣ ತ್ಯಾಜ್ಯ. ತೊಳೆದು ನೀಲಿ ಡಬ್ಬಿಗೆ ಹಾಕಿ.',
    tips: 'Recycling one aluminium can saves enough energy to power a TV for 3 hours.',
  },
  {
    key: 'old clothes',
    aliases: ['clothes', 'clothing', 'shirt', 'saree', 'textile', 'fabric', 'torn clothes', 'old dress', 'kapade', 'vastragalu', 'jeans', 'pants', 'uniform'],
    category: 'donation',
    bin: 'Donation / Textile Recycling',
    preparation: [
      'Wash and dry clothes before donating or recycling.',
      'If wearable: donate to Goonj, iCall, or local NGO collection boxes.',
      'If torn/unwearable: hand over to the BBMP dry waste collector — they go to textile recyclers.',
      'Do NOT put clothes in either the Green or Blue Bin.',
    ],
    facility: 'Goonj / iCall drop-off  ·  Local NGO bins  ·  BBMP Dry Waste Collector (for rags)',
    en: 'Old clothes should be donated if wearable, or given to the dry waste collector for textile recycling.',
    kn: 'ಹಳೆ ಬಟ್ಟೆಗಳನ್ನು ದಾನ ಮಾಡಿ ಅಥವಾ BBMP ಒಣ ತ್ಯಾಜ್ಯ ಸಂಗ್ರಾಹಕರಿಗೆ ನೀಡಿ.',
    tips: 'Goonj accepts clothes at their Bengaluru centre in Indiranagar. Even rags are recycled into industrial wipers.',
  },

  // ── Sanitary ───────────────────────────────────────────────────────────────
  {
    key: 'sanitary pad',
    aliases: ['sanitary', 'napkin', 'pad', 'menstrual', 'whisper', 'stayfree', 'kotex', 'sanitary napkin', 'mahwari pad'],
    category: 'sanitary',
    bin: 'Black Bag / Sanitary Waste — separate from other bins',
    preparation: [
      'Wrap used pads in newspaper or the original wrapper.',
      'Place in a black plastic bag — never in the Green or Blue Bin.',
      'Hand the black bag separately to the BBMP waste collector; do not leave on the street.',
      'Ask your apartment if they have a sanitary waste incinerator.',
    ],
    facility: 'BBMP Sanitary Waste Stream → Incineration / Secure Landfill',
    en: 'Sanitary pads are sanitary waste. Wrap in newspaper and hand over in a black bag separately from other bins.',
    kn: 'ಸ್ಯಾನಿಟರಿ ಪ್ಯಾಡ್‌ಗಳು ಸ್ವಚ್ಛತಾ ತ್ಯಾಜ್ಯ. ಪತ್ರಿಕೆಯಲ್ಲಿ ಸುತ್ತಿ ಕಪ್ಪು ಚೀಲದಲ್ಲಿ ಬೇರೆ ನೀಡಿ.',
    tips: 'Reusable cloth pads and menstrual cups reduce sanitary waste by over 90% and save money long-term.',
  },
  {
    key: 'diaper',
    aliases: ['nappy', 'baby diaper', 'adult diaper', 'pampers', 'huggies'],
    category: 'sanitary',
    bin: 'Black Bag / Sanitary Waste — separate from other bins',
    preparation: [
      'Fold and wrap the used diaper in its own tapes.',
      'Place in a sealed black plastic bag.',
      'Hand to the BBMP collector separately — not in the Green or Blue Bin.',
    ],
    facility: 'BBMP Sanitary Waste Stream → Secure Landfill / Incineration',
    en: 'Diapers are sanitary waste. Wrap and seal in a black bag and hand over separately.',
    kn: 'ಡಯಾಪರ್ ಸ್ವಚ್ಛತಾ ತ್ಯಾಜ್ಯ. ಕಪ್ಪು ಚೀಲದಲ್ಲಿ ಮುಚ್ಚಿ ಬೇರೆ ನೀಡಿ.',
    tips: 'Cloth diapers are reusable, washable, and significantly cheaper over time.',
  },

  // ── Hazardous ──────────────────────────────────────────────────────────────
  {
    key: 'battery',
    aliases: ['batteries', 'aa battery', 'alkaline battery', 'lithium battery', 'cell', 'batari'],
    category: 'hazardous',
    bin: 'Hazardous Waste — BBMP Collection Drive or Drop-off',
    preparation: [
      'Do NOT throw in any regular bin (Green, Blue, or Black).',
      'Tape over the terminals with electrical tape to prevent short-circuits.',
      'Store in a dry place until a BBMP hazardous collection drive is scheduled.',
      'Drop off at electronics stores — Croma, Reliance Digital accept old batteries.',
    ],
    facility: 'BBMP Hazardous Waste Drive  ·  Electronics Store Drop-off  ·  E-Waste Centre',
    en: 'Batteries are hazardous waste. Never bin them — take to a BBMP collection drive or electronics store drop-off.',
    kn: 'ಬ್ಯಾಟರಿಗಳು ಅಪಾಯಕಾರಿ ತ್ಯಾಜ್ಯ. ಯಾವ ಡಬ್ಬಿಗೂ ಹಾಕಬೇಡಿ. BBMP ಸಂಗ್ರಹ ಕೇಂದ್ರಕ್ಕೆ ನೀಡಿ.',
    tips: 'Batteries contain lead, mercury and acid that contaminate groundwater for decades. BBMP helpline: 080-22660000.',
  },
  {
    key: 'medicine',
    aliases: ['medicines', 'tablet', 'capsule', 'syrup', 'expired medicine', 'drugs', 'pills', 'medicine strips'],
    category: 'hazardous',
    bin: 'Hazardous Waste — Pharmacy Drop-off or BBMP Drive',
    preparation: [
      'Do NOT flush medicines down the toilet or drain.',
      'Keep in original packaging with the label intact.',
      'Return to the pharmacy you purchased from — most accept returns.',
      'Wait for BBMP quarterly hazardous waste collection drive.',
    ],
    facility: 'Pharmacy Take-back  ·  BBMP Hazardous Waste Drive',
    en: 'Expired medicines are hazardous. Return to a pharmacy or BBMP collection drive. Never flush them.',
    kn: 'ಅವಧಿ ಮೀರಿದ ಔಷಧಿಗಳು ಅಪಾಯಕಾರಿ. ಔಷಧಾಲಯಕ್ಕೆ ಹಿಂತಿರುಗಿಸಿ ಅಥವಾ BBMP ಕ್ಕೆ ನೀಡಿ.',
    tips: 'Flushed medicines contaminate water supply and affect aquatic life.',
  },
  {
    key: 'paint',
    aliases: ['paint can', 'thinner', 'varnish', 'solvent', 'paint bucket'],
    category: 'hazardous',
    bin: 'Hazardous Waste — BBMP Collection Drive',
    preparation: [
      'Allow leftover paint to dry out completely before disposal.',
      'Keep the lid on tightly and store until collection day.',
      'Never pour paint down drains or on soil.',
    ],
    facility: 'BBMP Hazardous Waste Drive  ·  Call 080-22660000 for schedule',
    en: 'Paint and thinners are hazardous. Dry out leftover paint and dispose at a BBMP hazardous waste drive.',
    kn: 'ಬಣ್ಣ ಮತ್ತು ಥಿನ್ನರ್ ಅಪಾಯಕಾರಿ. BBMP ಸಂಗ್ರಹ ಕಾರ್ಯಕ್ರಮದಲ್ಲಿ ನೀಡಿ.',
    tips: 'Water-based paints are far less hazardous than oil-based paints.',
  },

  // ── E-Waste ────────────────────────────────────────────────────────────────
  {
    key: 'old phone',
    aliases: ['mobile phone', 'smartphone', 'phone', 'handset', 'mobile', 'old mobile'],
    category: 'e-waste',
    bin: 'E-Waste Collection Point',
    preparation: [
      'Perform a factory reset to erase all personal data.',
      'Remove the SIM card and memory card.',
      'If the phone still works, consider donating it.',
      'Drop at a BBMP e-waste centre or manufacturer take-back programme.',
    ],
    facility: 'BBMP E-Waste Centre  ·  Samsung / Apple / Motorola trade-in programmes',
    en: 'Old phones are e-waste. Wipe personal data, then take to a BBMP e-waste centre or manufacturer drop-off.',
    kn: 'ಹಳೆ ಮೊಬೈಲ್ E-ತ್ಯಾಜ್ಯ. ವ್ಯಕ್ತಿಗತ ಡೇಟಾ ಅಳಿಸಿ BBMP E-ತ್ಯಾಜ್ಯ ಕೇಂದ್ರಕ್ಕೆ ನೀಡಿ.',
    tips: 'BBMP holds quarterly e-waste drives in Whitefield, Indiranagar, and Koramangala. Check bbmp.gov.in for dates.',
  },
  {
    key: 'laptop',
    aliases: ['computer', 'desktop', 'monitor', 'keyboard', 'hard drive', 'printer', 'scanner'],
    category: 'e-waste',
    bin: 'E-Waste Collection Point',
    preparation: [
      'Back up and then permanently delete all data (use a secure wipe tool).',
      'Remove the battery if possible — treat it as hazardous waste separately.',
      'Take to a certified e-waste recycler or BBMP e-waste centre.',
    ],
    facility: 'BBMP E-Waste Centre  ·  Certified Recycler (eRecyclekaro, Attero)',
    en: 'Laptops and computers are e-waste. Wipe data, remove battery and take to a certified recycler.',
    kn: 'ಲ್ಯಾಪ್‌ಟಾಪ್ ಮತ್ತು ಕಂಪ್ಯೂಟರ್ E-ತ್ಯಾಜ್ಯ. ಡೇಟಾ ಅಳಿಸಿ ಪ್ರಮಾಣಿತ ಮರುಬಳಕೆದಾರರಿಗೆ ನೀಡಿ.',
    tips: 'Karnataka E-Waste Management Rules 2016 mandate proper disposal of IT equipment.',
  },
  {
    key: 'bulb',
    aliases: ['cfl bulb', 'tube light', 'fluorescent', 'light bulb', 'led bulb', 'mercury lamp', 'globe'],
    category: 'e-waste',
    bin: 'E-Waste Collection Point — do not crush',
    preparation: [
      'Do NOT crush CFL or fluorescent tubes — they contain mercury.',
      'Wrap carefully in the original packaging or several layers of newspaper.',
      'Take to a BBMP e-waste collection point or hardware store that accepts them.',
    ],
    facility: 'BBMP E-Waste Centre  ·  Hardware Store Drop-off',
    en: 'CFL bulbs and tube lights are e-waste containing mercury. Never crush — take to an e-waste centre.',
    kn: 'CFL ಬಲ್ಬ್ ಮತ್ತು ಟ್ಯೂಬ್‌ಲೈಟ್ E-ತ್ಯಾಜ್ಯ. ಪುಡಿ ಮಾಡಬೇಡಿ, E-ತ್ಯಾಜ್ಯ ಕೇಂದ್ರಕ್ಕೆ ನೀಡಿ.',
    tips: 'LED bulbs are safer and have no mercury. Switching to LED also reduces electricity bills.',
  },
  {
    key: 'charger',
    aliases: ['cable', 'power adapter', 'earphones', 'headphones', 'usb cable', 'wire'],
    category: 'e-waste',
    bin: 'E-Waste Collection Point',
    preparation: [
      'Bundle cables together with a twist-tie.',
      'Drop at any BBMP e-waste centre or electronics store bin.',
    ],
    facility: 'BBMP E-Waste Centre  ·  Electronics Store Drop-off',
    en: 'Old chargers and cables are e-waste. Bundle and drop at an e-waste collection point.',
    kn: 'ಹಳೆ ಚಾರ್ಜರ್ ಮತ್ತು ಕೇಬಲ್ E-ತ್ಯಾಜ್ಯ. E-ತ್ಯಾಜ್ಯ ಕೇಂದ್ರಕ್ಕೆ ನೀಡಿ.',
    tips: 'Many electronics stores like Croma and Reliance Digital have free e-waste drop boxes near the entrance.',
  },

  // ── Construction Debris ────────────────────────────────────────────────────
  {
    key: 'construction debris',
    aliases: ['brick', 'concrete', 'rubble', 'tiles', 'cement', 'sand', 'plaster', 'mud', 'renovation waste'],
    category: 'construction',
    bin: 'BBMP Bulk / Construction & Demolition Waste',
    preparation: [
      'Segregate from household waste completely.',
      'Do NOT mix with regular bins or leave on roads.',
      'Call BBMP on 080-22660000 or contact your ward office to arrange bulk pick-up.',
    ],
    facility: 'BBMP C&D Waste Processing Centre  ·  Ward Office Bulk Collection',
    en: 'Construction debris is handled separately. Call BBMP for special bulk collection — do not mix with household bins.',
    kn: 'ಕಟ್ಟಡ ತ್ಯಾಜ್ಯವನ್ನು ಬೇರೆ ನಿರ್ವಹಿಸಲಾಗುತ್ತದೆ. BBMP ಗೆ 080-22660000 ಗೆ ಕರೆ ಮಾಡಿ.',
    tips: 'Under BBMP\'s C&D rules, mixing construction waste with household waste carries a fine.',
  },
];

// ─── Matching ────────────────────────────────────────────────────────────────
function findWasteInfo(query) {
  const q = query.toLowerCase().trim();
  for (const entry of WASTE_KB) {
    if (q.includes(entry.key)) return entry;
    if (entry.aliases.some(a => q.includes(a))) return entry;
  }
  return null;
}

// ─── Visual config ───────────────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  wet:          { label: 'Wet Waste',          color: 'bg-green-100 text-green-800',   border: 'border-green-400',  dot: 'bg-green-500'   },
  dry:          { label: 'Dry Waste',          color: 'bg-blue-100 text-blue-800',     border: 'border-blue-400',   dot: 'bg-blue-500'    },
  sanitary:     { label: 'Sanitary Waste',     color: 'bg-yellow-100 text-yellow-800', border: 'border-yellow-400', dot: 'bg-yellow-500'  },
  hazardous:    { label: 'Hazardous Waste',    color: 'bg-red-100 text-red-800',       border: 'border-red-400',    dot: 'bg-red-500'     },
  'e-waste':    { label: 'E-Waste',            color: 'bg-purple-100 text-purple-800', border: 'border-purple-400', dot: 'bg-purple-500'  },
  donation:     { label: 'Donate / Recycle',   color: 'bg-orange-100 text-orange-800', border: 'border-orange-400', dot: 'bg-orange-500'  },
  construction: { label: 'Construction Waste', color: 'bg-stone-100 text-stone-800',   border: 'border-stone-400',  dot: 'bg-stone-500'   },
};

const QUICK_CHIPS = [
  'Vegetable peels', 'Plastic bottle', 'Battery',
  'Sanitary pad',    'Old clothes',    'Broken glass',
  'Old phone',       'Diaper',         'Newspaper',
  'Medicine',
];

const GREETINGS = [
  "ನಮಸ್ಕಾರ! Ask me how to dispose of any waste item in Bengaluru — I know BBMP's rules.",
  'Type a waste item like "battery", "broken glass" or "old clothes" and I\'ll tell you exactly what to do.',
  'ಕಸ ವರ್ಗೀಕರಣ ಮಾಡುವ ಬಗ್ಗೆ ಸಹಾಯ ಬೇಕೇ? Type any waste item to get started.',
];

// ─── Components ───────────────────────────────────────────────────────────────
function CategoryBadge({ category }) {
  const cfg = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.dry;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function WasteResponseCard({ entry }) {
  const cfg = CATEGORY_CONFIG[entry.category] || CATEGORY_CONFIG.dry;
  const [lang, setLang] = useState('en');

  return (
    <div className={`rounded-2xl border-2 ${cfg.border} bg-white overflow-hidden`}>
      {/* Category header */}
      <div className={`px-4 py-2.5 flex items-center justify-between ${cfg.color.replace('text-', 'text-').replace('bg-', 'bg-')}`}>
        <div className="flex items-center gap-2">
          <Recycle size={14} />
          <span className="text-xs font-bold uppercase tracking-wide">{cfg.label}</span>
        </div>
        {/* Language toggle */}
        <div className="flex items-center gap-1 bg-white/50 rounded-full p-0.5">
          <button
            onClick={() => setLang('en')}
            className={`text-xs px-2 py-0.5 rounded-full font-semibold transition-colors ${lang === 'en' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
          >
            EN
          </button>
          <button
            onClick={() => setLang('kn')}
            className={`text-xs px-2 py-0.5 rounded-full font-semibold transition-colors ${lang === 'kn' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500'}`}
          >
            ಕನ್ನಡ
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Summary line */}
        <p className="text-sm text-gray-700 font-medium leading-snug">
          {lang === 'en' ? entry.en : entry.kn}
        </p>

        {/* Disposal stream */}
        <div className="flex items-start gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-0.5 w-20 flex-shrink-0">Goes in</span>
          <span className="text-sm font-bold text-gray-900">{entry.bin}</span>
        </div>

        {/* Facility */}
        <div className="flex items-start gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mt-0.5 w-20 flex-shrink-0">Facility</span>
          <span className="text-sm text-gray-700">{entry.facility}</span>
        </div>

        {/* Preparation steps */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">How to prepare</p>
          <ol className="space-y-1.5">
            {entry.preparation.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                <span className={`flex-shrink-0 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold text-white mt-0.5 ${cfg.dot}`}>
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Tip */}
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs font-semibold text-gray-500 mb-0.5">💡 Did you know?</p>
          <p className="text-xs text-gray-600">{entry.tips}</p>
        </div>
      </div>
    </div>
  );
}

function DisclaimerBanner() {
  return (
    <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5 mb-3">
      <Info size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-amber-800 leading-snug">
        <span className="font-semibold">Local knowledge base only.</span> Answers come from BBMP's official waste segregation rules — no live AI service is connected.
      </p>
    </div>
  );
}

export default function WasteAssistant() {
  const [messages, setMessages] = useState([
    { id: 1, role: 'bot', text: GREETINGS[0] }
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (text) => {
    const userText = (text || input).trim();
    if (!userText) return;
    setInput('');

    const userMsg = { id: Date.now(), role: 'user', text: userText };
    const entry = findWasteInfo(userText);

    let botMsg;
    if (entry) {
      botMsg = {
        id: Date.now() + 1,
        role: 'bot',
        text: `Here's the disposal guide for "${userText}":`,
        entry,
      };
    } else {
      botMsg = {
        id: Date.now() + 1,
        role: 'bot',
        text: `I don't have a specific entry for "${userText}" yet.\n\nGeneral BBMP rules:\n• Wet / organic waste → Green Bin\n• Dry recyclables (paper, plastic, metal, glass) → Blue Bin\n• Sanitary waste → Black Bag, hand separately\n• Hazardous & e-waste → BBMP collection drive\n• Old clothes → Donate or give to dry waste collector\n\nTry a more specific term — e.g. "plastic bottle", "old phone", "broken glass".`,
      };
    }

    setMessages(prev => [...prev, userMsg, botMsg]);
  };

  const reset = () => {
    setMessages([{ id: Date.now(), role: 'bot', text: GREETINGS[Math.floor(Math.random() * GREETINGS.length)] }]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] min-h-96">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="bg-green-100 p-2 rounded-xl">
            <Leaf size={18} className="text-green-700" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">AI Kasa Assistant</p>
            <p className="text-xs text-gray-400">BBMP waste guide · EN &amp; ಕನ್ನಡ</p>
          </div>
        </div>
        <button onClick={reset} className="p-2 text-gray-400 hover:text-green-600 transition-colors" title="Reset conversation">
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Disclaimer */}
      <DisclaimerBanner />

      {/* Quick chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
        {QUICK_CHIPS.map(q => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            className="flex-shrink-0 text-xs bg-green-50 text-green-700 border border-green-200 rounded-full px-3 py-1.5 hover:bg-green-100 transition-colors font-medium"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'bot' ? (
              <div className="max-w-[95%] space-y-2">
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-gray-700">
                  {msg.text.split('\n').map((line, i) => (
                    <p key={i} className={i > 0 ? 'mt-1' : ''}>{line}</p>
                  ))}
                </div>
                {msg.entry && <WasteResponseCard entry={msg.entry} />}
              </div>
            ) : (
              <div className="bg-green-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm max-w-[80%]">
                {msg.text}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100">
        <input
          type="text"
          className="input flex-1"
          placeholder="Type a waste item, e.g. battery…"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={() => sendMessage()}
          className="bg-green-600 text-white p-2.5 rounded-xl hover:bg-green-700 transition-colors active:scale-95"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
