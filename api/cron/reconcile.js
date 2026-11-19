import { createRequire as __cr } from 'module'; const require = __cr(import.meta.url);

// server/stripeClient.ts
import Stripe from "stripe";
import { StripeSync } from "stripe-replit-sync";
function credentials() {
  const production = process.env.NODE_ENV === "production";
  const pairs = production ? [
    [process.env.STRIPE_SECRET_KEY, process.env.VITE_STRIPE_PUBLIC_KEY],
    [process.env.STRIPE_LIVE_SECRET_KEY, process.env.VITE_STRIPE_LIVE_PUBLIC_KEY]
  ] : [[process.env.STRIPE_SECRET_KEY, process.env.VITE_STRIPE_PUBLIC_KEY]];
  const secretPrefix = production ? "sk_live_" : "sk_test_";
  const publicPrefix = production ? "pk_live_" : "pk_test_";
  const pair = pairs.find(([secret, publicKey]) => secret?.startsWith(secretPrefix) && publicKey?.startsWith(publicPrefix));
  if (!pair) throw new Error(`Stripe ${production ? "live" : "test"} keys are not configured as a matching pair`);
  return { secretKey: pair[0], publishableKey: pair[1] };
}
async function getStripeClient() {
  return new Stripe(credentials().secretKey);
}

// server/payments.ts
import { Pool } from "pg";

// server/storage.ts
import { randomUUID } from "crypto";

// shared/decant-pricing.ts
var decantPrices = {
  5: "7.50",
  10: "12.00",
  15: "16.50",
  20: "20.00",
  30: "27.00"
};
function decantPrice(size) {
  const price = decantPrices[size];
  if (!price) throw new Error(`Unsupported decant size: ${size} mL`);
  return price;
}

// shared/dreamer.ts
var dreamerSizes = [5, 10, 15, 20, 30];
var dreamerOffers = [
  {
    number: "01",
    name: "LUCID STATE",
    slug: "lucid-state",
    productId: "64ac0000-0000-4000-8000-000000000001",
    imageUrl: "/assets/Screenshot_20261107_102709_Messenger_1794069072303.jpg",
    mood: "Clear. Bright. Elevated.",
    description: "Bright, clean and effortlessly addictive. Lucid State opens with sparkling citrus and neroli before moving into airy florals, aromatic tea and smooth modern woods. Fresh without smelling ordinary\u2014like stepping outside with a completely clear head.",
    scentProfile: "Fresh \xB7 Citrus \xB7 Neroli \xB7 Airy \xB7 Clean \xB7 Aromatic \xB7 Woody",
    topNotes: "Neroli \xB7 Bergamot \xB7 Citrus Zest",
    middleNotes: "Orange Blossom \xB7 Lavender \xB7 Tea Accord",
    baseNotes: "Ambroxan \xB7 Musk \xB7 Cedarwood",
    variantIds: [
      "64ac0000-0000-4000-8000-000000000101",
      "64ac0000-0000-4000-8000-000000000102",
      "64ac0000-0000-4000-8000-000000000105",
      "64ac0000-0000-4000-8000-000000000103",
      "64ac0000-0000-4000-8000-000000000104"
    ]
  },
  {
    number: "02",
    name: "FEVER DREAM",
    slug: "fever-dream",
    productId: "64ac0000-0000-4000-8000-000000000002",
    imageUrl: "/assets/Screenshot_20261107_102726_Messenger_1794069072300.jpg",
    mood: "Magnetic. Euphoric. Addictive.",
    description: "Sweet, luminous and slightly surreal. Fever Dream combines an addictive amber-saffron sweetness with bright citrus, clean aromatics and a deeper sensual backbone. It moves between fresh and seductive\u2014the kind of scent that feels familiar for a second, then suddenly becomes something else.",
    scentProfile: "Sweet \xB7 Airy \xB7 Amber \xB7 Citrus \xB7 Aromatic \xB7 Musky \xB7 Seductive",
    topNotes: "Saffron \xB7 Citrus Zest \xB7 Aldehydic Freshness",
    middleNotes: "Jasmine \xB7 Amberwood \xB7 Aromatic/Violet Accord",
    baseNotes: "Ambergris Accord \xB7 Cedar \xB7 Musk",
    variantIds: [
      "64ac0000-0000-4000-8000-000000000201",
      "64ac0000-0000-4000-8000-000000000202",
      "64ac0000-0000-4000-8000-000000000205",
      "64ac0000-0000-4000-8000-000000000203",
      "64ac0000-0000-4000-8000-000000000204"
    ]
  },
  {
    number: "03",
    name: "ALTERED MENTAL STATUS",
    slug: "altered-mental-status",
    productId: "64ac0000-0000-4000-8000-000000000003",
    imageUrl: "/dreamer/altered-mental-status.jpg",
    mood: "Familiar notes. New perspective.",
    description: "The darkest and most complex fragrance in the series. Altered Mental Status begins deceptively fresh with citrus, neroli and crisp green aromatics before shifting into spices, woods, sandalwood and powerful oud. Every component pulls in a different direction, yet together they create something strangely coherent, sophisticated and unmistakable.",
    scentProfile: "Green \xB7 Citrus \xB7 Woody \xB7 Spicy \xB7 Oud \xB7 Aromatic \xB7 Sandalwood",
    topNotes: "Neroli \xB7 Bergamot \xB7 Green Accord",
    middleNotes: "Iris \xB7 Aromatic Spices \xB7 Oud Accord",
    baseNotes: "Sandalwood \xB7 Cedar \xB7 Amber \xB7 Musk \xB7 Oud",
    variantIds: [
      "64ac0000-0000-4000-8000-000000000301",
      "64ac0000-0000-4000-8000-000000000302",
      "64ac0000-0000-4000-8000-000000000305",
      "64ac0000-0000-4000-8000-000000000303",
      "64ac0000-0000-4000-8000-000000000304"
    ]
  }
];
var dreamerVariants = dreamerOffers.flatMap((offer) => dreamerSizes.map((size, index) => ({
  id: offer.variantIds[index],
  productId: offer.productId,
  sku: `DREAMER-${offer.slug.toUpperCase()}-${size}ML`,
  size: `${size} mL`,
  concentration: "Extrait de Parfum decant",
  price: decantPrice(size),
  totalInventory: 50,
  // Owner confirmed the entire Dreamer Series is sold out.
  remainingInventory: 0,
  soldCount: 0,
  isActive: true
})));
function isDreamerVariant(variantId) {
  return dreamerVariants.some((variant) => variant.id === variantId);
}

// shared/tdg.ts
var tdgSizes = [5, 10, 15, 20, 30];
var scents = [
  { code: "01", name: "COSMIC CITRUS", slug: "meteore", original: "M\xE9t\xE9ore", house: "Louis Vuitton" },
  { code: "02", name: "OPEN DAYDREAM", slug: "imagination", original: "Imagination", house: "Louis Vuitton" },
  { code: "03", name: "SUN DIP", slug: "afternoon-swim", original: "Afternoon Swim", house: "Louis Vuitton" },
  { code: "04", name: "COASTAL RESET", slug: "pacific-chill", original: "Pacific Chill", house: "Louis Vuitton" },
  { code: "05", name: "BLUE RIVIERA", slug: "neroli-portofino", original: "Neroli Portofino", house: "Tom Ford" },
  { code: "06", name: "DESERT GREEN", slug: "cactus-garden", original: "Cactus Garden", house: "Louis Vuitton" },
  { code: "07", name: "RUBY RESERVE", slug: "rouge-extrait", original: "Baccarat Rouge 540 Extrait", house: "Maison Francis Kurkdjian" },
  { code: "08", name: "TEA STORM", slug: "rain-tea", original: "Rain Tea", house: "Chasing Scents" },
  { code: "09", name: "VICTORY LAP", slug: "aventus", original: "Aventus", house: "Creed" },
  { code: "10", name: "DARK INSTINCT", slug: "terrible-teddy", original: "Terrible Teddy", house: "Penhaligon\u2019s" },
  { code: "11", name: "SPICE REBEL", slug: "blazing-sam", original: "The Blazing Mr Sam", house: "Penhaligon\u2019s" },
  { code: "12", name: "GILDED LEGACY", slug: "lord-george", original: "The Tragedy of Lord George", house: "Penhaligon\u2019s" },
  { code: "13", name: "VELVET OUD", slug: "gucci-oud", original: "Gucci Oud", house: "Gucci" },
  { code: "14", name: "SANDAL DRIFT", slug: "santal-33", original: "Santal 33", house: "Le Labo" },
  { code: "15", name: "OUD CROWN", slug: "royal-oud", original: "Royal Oud", house: "Creed" },
  { code: "16", name: "GRAND OUD", slug: "oud-greatness", original: "Oud for Greatness", house: "Initio" },
  { code: "17", name: "WILD FORTUNE", slug: "finley", original: "Fortuitous Finley", house: "Penhaligon\u2019s" },
  { code: "18", name: "LUNAR CHAPTER", slug: "moon-tale", original: "Moon Tale", house: "Louis Vuitton" },
  { code: "19", name: "RUBY HAZE", slug: "rouge", original: "Baccarat Rouge 540", house: "Maison Francis Kurkdjian" },
  { code: "20", name: "GOLDEN TIDE", slug: "millesime", original: "Mill\xE9sime Imp\xE9rial", house: "Creed" },
  { code: "21", name: "VETIVER WILD", slug: "wild-vetiver", original: "Wild Vetiver", house: "Creed" },
  { code: "22", name: "DEEP PURPOSE", slug: "purpose-50", original: "Purpose 50", house: "Amouage" },
  { code: "23", name: "GREEN LEGEND", slug: "green-irish", original: "Green Irish Tweed", house: "Creed" },
  { code: "24", name: "NEROLI GLOW", slug: "neroli-36", original: "Neroli 36", house: "Le Labo" },
  { code: "25", name: "SMOKE & EARTH", slug: "patchouli-24", original: "Patchouli 24", house: "Le Labo" }
];
var tdgOffers = scents.map((scent) => ({
  ...scent,
  productId: `70ac0000-0000-4000-8000-${scent.code.padStart(12, "0")}`,
  imageUrl: `/tdg/reference/${scent.slug}.jpg`,
  description: `An independently produced TDG dupe inspired by ${scent.house} ${scent.original}. Explore this scent inspiration in a 5, 10, 15, 20, or 30 mL decant. This is not the original designer fragrance.`
}));
var tdgVariantSlot = { 5: 0, 10: 1, 15: 4, 20: 2, 30: 3 };
var tdgVariants = tdgOffers.flatMap((offer) => tdgSizes.map((size) => ({
  id: `70ac0000-0000-4000-8000-${String(1e3 + Number(offer.code) * 10 + tdgVariantSlot[size]).padStart(12, "0")}`,
  productId: offer.productId,
  sku: `TDG-${offer.code}-${size}ML`,
  size: `${size} mL`,
  concentration: "Fragrance dupe decant",
  price: decantPrice(size),
  totalInventory: 50,
  remainingInventory: 50,
  soldCount: 0,
  isActive: true
})));
function isTdgVariant(variantId) {
  return tdgVariants.some((variant) => variant.id === variantId);
}

// shared/rvltn.ts
var rvltnSizes = [5, 10, 20, 30];
var rvltnPrices = ["22.50", "45.00", "85.00", "120.00"];
var prexStockMl = 500;
var quantumStockMl = 50;
var preorderTermsVersion = "rvltn-preorder-2026-11";
var preorderTerms = "Backorder / paid waitlist: the full price is charged now. There is no confirmed restock or shipping date. Orders are nonrefundable except where required by law. This is not a ready-to-ship purchase.";
var rvltnOffers = [
  {
    slug: "sleep-paralysis",
    name: "SLEEP PARALYSIS",
    status: "backorder",
    imageUrl: "/assets/Screenshot_20261107_102718_Messenger_1794069072308.jpg",
    description: "Citrus, floral aromatics and incense over deep woods and warm resins.",
    topNotes: "Bergamot \xB7 Lemon \xB7 Neroli \xB7 Spices \xB7 Citrus Accord \xB7 Aromatic Herbs \xB7 Pink Pepper",
    middleNotes: "Jasmine \xB7 Lavender \xB7 Violet Leaf \xB7 Incense \xB7 Green Tea \xB7 Orris \xB7 Cypress",
    baseNotes: "Oud \xB7 Sandalwood \xB7 Cedarwood \xB7 Amber \xB7 Musk \xB7 Tonka Bean \xB7 Resins \xB7 Vetiver"
  },
  {
    slug: "green-monster",
    name: "GREEN MONSTER",
    status: "backorder",
    imageUrl: "/assets/Screenshot_20261107_102734_Messenger_1794069072294.jpg",
    description: "Bright citrus and green cactus accords meet aromatic florals and earthy woods.",
    topNotes: "Bergamot \xB7 Lemon \xB7 Lime \xB7 Citrus Accord \xB7 Green Leaves \xB7 Cactus Accord \xB7 Aromatic Herbs \xB7 Pink Pepper",
    middleNotes: "Lavender \xB7 Geranium \xB7 Jasmine \xB7 Neroli \xB7 Green Tea \xB7 Cypress \xB7 Violet Leaf \xB7 Spices",
    baseNotes: "Oud \xB7 Vetiver \xB7 Sandalwood \xB7 Cedarwood \xB7 Amber \xB7 Musk \xB7 Tonka Bean \xB7 Patchouli \xB7 Incense"
  },
  {
    slug: "duality",
    name: "DUALITY",
    status: "backorder",
    imageUrl: "/assets/Screenshot_20261028_212446_ChatGPT_1794068728000.jpg",
    description: "An RVLTN Parfums blend exploring light and darkness. Scent notes have not yet been published.",
    topNotes: "",
    middleNotes: "",
    baseNotes: ""
  },
  {
    slug: "prex2026",
    name: "PREX2026",
    status: "limited",
    stockMl: prexStockMl,
    imageUrl: "/assets/Screenshot_20261107_102746_Messenger_1794069072245.jpg",
    description: "A limited release pairing citrus and marine notes with florals, spices and deep woods.",
    topNotes: "Bergamot \xB7 Mandarin Orange \xB7 Grapefruit \xB7 Lemon \xB7 Sea Salt \xB7 Fruity Notes \xB7 Aromatic Herbs \xB7 Pink Pepper",
    middleNotes: "Iris \xB7 Jasmine \xB7 Rose \xB7 Geranium \xB7 Lavender \xB7 Neroli \xB7 Marine Notes \xB7 Spices",
    baseNotes: "Oud \xB7 Sandalwood \xB7 Cedarwood \xB7 Musk \xB7 Ambergris \xB7 Patchouli \xB7 Frankincense \xB7 Guaiac Wood \xB7 Saffron \xB7 Nutmeg"
  },
  ...[
    ["green-monster-2", "GREEN MONSTER 2.0", "/assets/quantum/green-monster-2.jpg", "The next chapter of Green Monster."],
    ["electron", "ELECTRON", "/assets/quantum/electron.jpg", "Quantum Series. Scent notes have not yet been published."],
    ["neutron", "NEUTRON", "/assets/quantum/neutron.jpg", "Quantum Series. Scent notes have not yet been published."],
    ["proton", "PROTON", "/assets/quantum/proton.jpg", "Quantum Series. Scent notes have not yet been published."],
    ["dark-matter", "DARK MATTER", "/assets/quantum/dark-matter.jpg", "Quantum Series. Scent notes have not yet been published."]
  ].map(([slug, name, file, description]) => ({
    slug,
    name,
    status: "limited",
    stockMl: quantumStockMl,
    imageUrl: file,
    description,
    topNotes: "",
    middleNotes: "",
    baseNotes: ""
  }))
].map((offer, index) => ({
  ...offer,
  productId: `84ac0000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`
}));
var rvltnVariants = rvltnOffers.flatMap((offer, index) => rvltnSizes.map((size, slot) => ({
  id: `84ac0000-0000-4000-8000-${String((index + 1) * 100 + slot + 1).padStart(12, "0")}`,
  productId: offer.productId,
  sku: `RVLTN-${offer.slug.toUpperCase()}-${size}ML`,
  size: `${size} mL`,
  concentration: "Fragrance decant",
  price: rvltnPrices[slot],
  // Backorders have an order limit, not a claim of physical inventory.
  totalInventory: offer.status === "limited" ? Math.floor((offer.stockMl ?? 0) / size) : 0,
  remainingInventory: offer.status === "limited" ? Math.floor((offer.stockMl ?? 0) / size) : 100,
  soldCount: 0,
  isActive: true
})));
function rvltnVariant(id) {
  return rvltnVariants.find((v) => v.id === id);
}

// shared/chicago.ts
var chicagoOffers = [
  {
    name: "PLAYER ONE",
    productId: "54ac0000-0000-4000-8000-000000000001",
    variantId: "54ac0000-0000-4000-8000-000000000011",
    sku: "CHICAGO-PLAYER-ONE-30ML",
    imageUrl: "/gaming/player-one-cinematic.jpg"
  },
  {
    name: "PLAY AGAIN?",
    productId: "54ac0000-0000-4000-8000-000000000002",
    variantId: "54ac0000-0000-4000-8000-000000000012",
    sku: "CHICAGO-PLAY-AGAIN-30ML",
    imageUrl: "/gaming/play-again-cinematic.jpg"
  },
  {
    name: "HALF LIFE",
    productId: "54ac0000-0000-4000-8000-000000000003",
    variantId: "54ac0000-0000-4000-8000-000000000013",
    sku: "CHICAGO-HALF-LIFE-30ML",
    imageUrl: "/gaming/half-life-cinematic.jpg"
  }
];
var chicagoBottleImages = Object.fromEntries(
  chicagoOffers.map((offer) => [offer.name, offer.imageUrl])
);
var chicagoSetDiscountCents = 3 * 5999 - 15e3;
function isChicagoVariant(variantId) {
  return chicagoOffers.some((offer) => offer.variantId === variantId) || isDreamerVariant(variantId) || isTdgVariant(variantId) || Boolean(rvltnVariant(variantId));
}

// server/storage.ts
var MemStorage = class {
  users;
  products;
  productVariants;
  orders;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.products = /* @__PURE__ */ new Map();
    this.productVariants = /* @__PURE__ */ new Map();
    this.orders = /* @__PURE__ */ new Map();
    this.initializeProducts();
  }
  initializeProducts() {
    for (const offer of rvltnOffers) {
      this.products.set(offer.productId, {
        id: offer.productId,
        name: offer.name,
        description: offer.description,
        notes: offer.status === "backorder" ? "Backorder \u2014 full payment; no confirmed shipping date" : "Limited availability",
        topNotes: offer.topNotes,
        middleNotes: offer.middleNotes,
        baseNotes: offer.baseNotes,
        imageUrl: offer.imageUrl,
        type: "Fragrance decant",
        bibleVerse: "",
        verseReference: "",
        isActive: true,
        releaseDate: /* @__PURE__ */ new Date(),
        createdAt: /* @__PURE__ */ new Date()
      });
    }
    for (const variant of rvltnVariants)
      this.productVariants.set(variant.id, { ...variant, createdAt: /* @__PURE__ */ new Date() });
    const fragrances = [
      {
        name: "EQUUS ALBUS",
        description: "Bright pineapple-citrus opening with a green woody heart and a smoky amber-musk base.",
        notes: "Fruity Smoky Woods",
        topNotes: "Bergamot Grapefruit, Rainforest Hibiscus, Birch Tree & Fig",
        middleNotes: "Smoky Pineapple Accord, Alpine Cheer, Bergamot Tobacco",
        baseNotes: "Cedar & Aged Oak, Salted Amber, Smoked Cardamom, Aurora Dawn",
        imageUrl: "/assets/file_00000000a04071f5b21d7e763cb4b1fc_1764980262870.png",
        bibleVerse: "I looked, and behold, a white horse! And its rider had a bow, and a crown was given to him",
        verseReference: "Revelation 6:1\u20132"
      },
      {
        name: "PAX OBSCURA",
        description: "Cool citrus and aquatic top, aromatic heart, and smooth amber-musk drydown.",
        notes: "Blue Woody Amber",
        topNotes: "Bergamot Grapefruit, Storm Watch, Egomaniacal Green",
        middleNotes: "Mountain Spring, Rainforest Hibiscus, Dark Rose Oud",
        baseNotes: "Cedar & Aged Oak, Salted Amber, Ruby Red, Aurora Dawn",
        imageUrl: "/assets/file_00000000a484720ca189ff9971c50b75_1764982101085.png",
        bibleVerse: "Out came another horse, bright red. Its rider was permitted to take peace from the earth",
        verseReference: "Revelation 6:3\u20134"
      },
      {
        name: "FAMES",
        description: "Sweet, airy amber with crystalline warmth and an addictive modern trail.",
        notes: "Amber Sweet Airy",
        topNotes: "Sea Salt & Orchid, Birch Tree & Fig, Cashmere Plum",
        middleNotes: "Ruby Red, Cedar & Aged Oak, French Vanilla",
        baseNotes: "Salted Amber, Aurora Dawn",
        imageUrl: "/assets/file_00000000bfb0720cb4f9047931f5738d_1764984215951.png",
        bibleVerse: "I looked, and behold, a black horse! And its rider had a pair of scales in his hand",
        verseReference: "Revelation 6:5\u20136"
      },
      {
        name: "MORTEM",
        description: "Dense rose-oud body with a leathery incense middle and smoky amber finish.",
        notes: "Dark Oud Rose Resin",
        topNotes: "Smoked Cardamom, Midsummer Night",
        middleNotes: "Dark Rose Oud, Suede & Sumac Leaves, Cedar & Aged Oak",
        baseNotes: "Barnwood, Salted Amber, Boot Strap & Whiskey",
        imageUrl: "/assets/file_000000007fcc720cb4eb90ab90afb7c3_1764984190338.png",
        bibleVerse: "I looked, and behold, a pale horse! And its rider's name was Death",
        verseReference: "Revelation 6:7\u20138"
      },
      {
        name: "VOX CAELI",
        description: "Sparkling neroli-citrus top, marine-floral heart, and sheer amberwood base.",
        notes: "Neroli Marine Citrus",
        topNotes: "Italian Neroli, Bergamot Grapefruit, Fresh Juniper & Sea",
        middleNotes: "White Tea & Ginger, Sea Salt & Orchid, Rainforest Hibiscus, Mountain Spring",
        baseNotes: "Cedar & Aged Oak, Salted Amber",
        imageUrl: "/assets/file_00000000909471fd97064b4e9d17083f_1764984976100.png",
        bibleVerse: "I saw under the altar the souls of those who had been slain for the word of God",
        verseReference: "Revelation 6:9\u201311"
      },
      {
        name: "TERRA TREMOR",
        description: "Tobacco-vanilla smoke with boozy sweetness and a smooth amber-musk trail.",
        notes: "Tobacco Vanilla Smoke",
        topNotes: "Smoked Cardamom, Boot Strap & Whiskey",
        middleNotes: "Tobacco Leaves & Hemp Twist, French Vanilla, Barnwood",
        baseNotes: "Cedar & Aged Oak, Salted Amber, Aurora Dawn",
        imageUrl: "/assets/generated_images/Terra_Tremor_luxury_bottle_27a4bc2e.png",
        bibleVerse: "There was a great earthquake, and the sun became black as sackcloth",
        verseReference: "Revelation 6:12\u201317"
      },
      {
        name: "SABBATUM",
        description: "Soft pear-floral lift, tranquil clean tea heart, and musky amber serenity.",
        notes: "Pear Musk Fresh Comfort",
        topNotes: "English Pear & Freesia, Baja Cactus Blossom",
        middleNotes: "White Tea & Ginger, Sea Salt & Orchid",
        baseNotes: "Cedar & Aged Oak, Salted Amber, Aurora Dawn",
        imageUrl: "/assets/generated_images/Sabbatum_luxury_bottle_b96d831e.png",
        bibleVerse: "When the Lamb opened the seventh seal, there was silence in heaven for about half an hour",
        verseReference: "Revelation 8:1"
      },
      {
        name: "LUX AETERNA",
        description: "Crisp citrus-ozone opening with a green woody heart and glowing amber-musk finish.",
        notes: "Fresh Green Vetiver",
        topNotes: "Bergamot Grapefruit, Fresh Juniper & Sea, Alpine Cheer",
        middleNotes: "Egomaniacal Green, Birch Tree & Fig, Rainforest Hibiscus",
        baseNotes: "Cedar & Aged Oak, Barnwood, Salted Amber, Aurora Dawn",
        imageUrl: "/assets/generated_images/Lux_Aeterna_luxury_bottle_d2b6357e.png",
        bibleVerse: "The city has no need of sun or moon, for the glory of God gives it light",
        verseReference: "Revelation 21:23"
      }
    ];
    fragrances.forEach((fragrance, index) => {
      const productId = randomUUID();
      const product = {
        id: productId,
        name: fragrance.name,
        description: fragrance.description,
        notes: fragrance.notes,
        topNotes: fragrance.topNotes,
        middleNotes: fragrance.middleNotes,
        baseNotes: fragrance.baseNotes,
        type: "Unisex Perfume",
        imageUrl: fragrance.imageUrl,
        bibleVerse: fragrance.bibleVerse,
        verseReference: fragrance.verseReference,
        isActive: false,
        releaseDate: /* @__PURE__ */ new Date("2024-01-01"),
        createdAt: /* @__PURE__ */ new Date()
      };
      this.products.set(productId, product);
      const variants = [
        { size: "100mL", concentration: "Eau de Parfum", price: "120.00" },
        // $1.20/mL - Best EDP value
        { size: "50mL", concentration: "Eau de Parfum", price: "65.00" },
        // $1.30/mL - Entry point
        { size: "100mL", concentration: "Extrait de Parfum", price: "180.00" },
        // $1.80/mL - Ultimate luxury
        { size: "50mL", concentration: "Extrait de Parfum", price: "95.00" },
        // $1.90/mL - Premium tier
        { size: "10mL", concentration: "Pure Oil Roll-on", price: "28.00" },
        // $2.80/mL - Luxury convenience
        { size: "30mL", concentration: "Pure Oil Roll-on", price: "60.00" }
        // $2.00/mL - Better value
      ];
      variants.forEach((v) => {
        const variantId = randomUUID();
        const sku = `${fragrance.name.replace(/\s+/g, "-")}-${v.size.replace(/[^0-9]/g, "")}-${v.concentration.replace(/\s+/g, "-").substring(0, 3).toUpperCase()}`;
        const variant = {
          id: variantId,
          productId,
          sku,
          size: v.size,
          concentration: v.concentration,
          price: v.price,
          totalInventory: 100,
          remainingInventory: index === 0 && v.concentration === "Extrait de Parfum" && v.size === "100mL" ? 82 : 100,
          soldCount: index === 0 && v.concentration === "Extrait de Parfum" && v.size === "100mL" ? 18 : 0,
          isActive: false,
          createdAt: /* @__PURE__ */ new Date()
        };
        this.productVariants.set(variantId, variant);
      });
    });
    for (const offer of chicagoOffers) {
      this.products.set(offer.productId, {
        id: offer.productId,
        name: offer.name,
        description: "An archived gaming-inspired fragrance, offered as a 30 mL decant.",
        notes: "Gaming collection",
        topNotes: "",
        middleNotes: "",
        baseNotes: "",
        type: "Fragrance decant",
        imageUrl: offer.imageUrl,
        bibleVerse: "",
        verseReference: "",
        isActive: false,
        releaseDate: /* @__PURE__ */ new Date(),
        createdAt: /* @__PURE__ */ new Date()
      });
      this.productVariants.set(offer.variantId, {
        id: offer.variantId,
        productId: offer.productId,
        sku: offer.sku,
        size: "30 mL",
        concentration: "Fragrance decant",
        price: "59.99",
        totalInventory: 25,
        // Owner confirmed the remaining Gaming stock was sold offline.
        remainingInventory: 0,
        soldCount: 0,
        isActive: false,
        createdAt: /* @__PURE__ */ new Date()
      });
    }
    for (const offer of dreamerOffers) {
      this.products.set(offer.productId, {
        id: offer.productId,
        name: offer.name,
        description: offer.description,
        notes: offer.scentProfile,
        topNotes: offer.topNotes,
        middleNotes: offer.middleNotes,
        baseNotes: offer.baseNotes,
        type: "Extrait de Parfum",
        imageUrl: offer.imageUrl,
        bibleVerse: "",
        verseReference: "",
        isActive: true,
        releaseDate: /* @__PURE__ */ new Date(),
        createdAt: /* @__PURE__ */ new Date()
      });
    }
    for (const variant of dreamerVariants) {
      this.productVariants.set(variant.id, { ...variant, createdAt: /* @__PURE__ */ new Date() });
    }
    for (const offer of tdgOffers) {
      this.products.set(offer.productId, {
        id: offer.productId,
        name: offer.name,
        description: offer.description,
        notes: `Inspired by ${offer.house} ${offer.original}`,
        topNotes: "",
        middleNotes: "",
        baseNotes: "",
        type: "Fragrance dupe",
        imageUrl: offer.imageUrl,
        bibleVerse: "",
        verseReference: "",
        isActive: false,
        releaseDate: /* @__PURE__ */ new Date(),
        createdAt: /* @__PURE__ */ new Date()
      });
    }
    for (const variant of tdgVariants) {
      this.productVariants.set(variant.id, { ...variant, isActive: false, createdAt: /* @__PURE__ */ new Date() });
    }
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = randomUUID();
    const user = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }
  async getProduct(id) {
    return this.products.get(id);
  }
  async createProduct(insertProduct) {
    const id = randomUUID();
    const product = {
      ...insertProduct,
      isActive: insertProduct.isActive ?? true,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.products.set(id, product);
    return product;
  }
  async getAllProducts() {
    return Array.from(this.products.values());
  }
  async getProductVariant(id) {
    return this.productVariants.get(id);
  }
  async getProductVariantBySku(sku) {
    return Array.from(this.productVariants.values()).find(
      (variant) => variant.sku === sku
    );
  }
  async getProductVariants(productId) {
    return Array.from(this.productVariants.values()).filter(
      (variant) => variant.productId === productId
    );
  }
  async getAllProductVariants() {
    return Array.from(this.productVariants.values());
  }
  async createProductVariant(insertVariant) {
    const id = randomUUID();
    const variant = {
      ...insertVariant,
      soldCount: insertVariant.soldCount ?? 0,
      isActive: insertVariant.isActive ?? true,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.productVariants.set(id, variant);
    return variant;
  }
  async updateProductVariantInventory(id, remainingInventory) {
    const variant = this.productVariants.get(id);
    if (variant) {
      variant.remainingInventory = remainingInventory;
      this.productVariants.set(id, variant);
      return variant;
    }
    return void 0;
  }
  async updateProductVariantSoldCount(id, soldCount) {
    const variant = this.productVariants.get(id);
    if (variant) {
      variant.soldCount = soldCount;
      this.productVariants.set(id, variant);
      return variant;
    }
    return void 0;
  }
  async createOrder(insertOrder) {
    const id = randomUUID();
    const order = {
      ...insertOrder,
      policyAcknowledged: insertOrder.policyAcknowledged ?? false,
      id,
      status: "pending",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.orders.set(id, order);
    return order;
  }
  async getOrder(id) {
    return this.orders.get(id);
  }
  async getOrderByPaypalOrderId(paypalOrderId) {
    return Array.from(this.orders.values()).find(
      (order) => order.paypalOrderId === paypalOrderId
    );
  }
  async updateOrderStatus(id, status) {
    const order = this.orders.get(id);
    if (order) {
      order.status = status;
      this.orders.set(id, order);
      return order;
    }
    return void 0;
  }
};
var storage = new MemStorage();

// server/payments.ts
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for orders");
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var chicagoLock = 54182025;
async function withChicagoLock(action) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await client.query("SELECT pg_advisory_xact_lock($1)", [chicagoLock]);
    const result = await action(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
async function reconcileExpiredReservations(stripe) {
  await withChicagoLock(async (client) => {
    const expired = await client.query(
      `SELECT id, payment_intent_id FROM chicago_reservations
       WHERE status = 'pending' AND expires_at <= now() ORDER BY created_at`
    );
    for (const row of expired.rows) {
      if (!row.payment_intent_id) {
        await client.query("UPDATE chicago_reservations SET status = 'released' WHERE id = $1", [row.id]);
        continue;
      }
      try {
        await reconcileIntentLocked(client, stripe, row.payment_intent_id, true);
      } catch (error) {
        console.error("Could not reconcile expired reservation:", row.id, error);
      }
    }
  });
}
async function reconcileIntentLocked(client, stripe, intentId, cancel) {
  let intent = await stripe.paymentIntents.retrieve(intentId);
  if (intent.status === "succeeded") {
    await recordPaidOrderLocked(client, intent);
  } else if (intent.status === "canceled") {
    await client.query(
      `UPDATE chicago_reservations SET status = 'released'
       WHERE payment_intent_id = $1 AND status = 'pending'`,
      [intentId]
    );
  } else if (cancel) {
    try {
      intent = await stripe.paymentIntents.cancel(intentId);
    } catch (error) {
      intent = await stripe.paymentIntents.retrieve(intentId);
      if (intent.status !== "succeeded" && intent.status !== "canceled") throw error;
    }
    if (intent.status === "succeeded") await recordPaidOrderLocked(client, intent);
    else if (intent.status === "canceled")
      await client.query(
        `UPDATE chicago_reservations SET status = 'released'
         WHERE payment_intent_id = $1 AND status = 'pending'`,
        [intentId]
      );
  }
}
async function recordPaidOrderLocked(client, intent) {
  if (intent.status !== "succeeded" || intent.currency !== "usd" || intent.amount_received !== intent.amount || intent.amount <= 0) {
    throw new Error("Payment has not been captured in full");
  }
  const items = JSON.parse(intent.metadata.items || "null");
  const email = intent.receipt_email;
  const shipping = intent.shipping;
  if (!items || !Array.isArray(items) || !items.length || !email || !shipping?.name || !shipping.address?.line1 || !shipping.address?.city || !shipping.address?.postal_code || !shipping.address?.country || intent.metadata.policyAcknowledged !== "true" || items.some((item) => isChicagoVariant(item.variantId)) && intent.metadata.decantAcknowledged !== "true") {
    throw new Error("Payment is missing order details");
  }
  const hasPreorder = items.some((item) => item.fulfillment === "backorder");
  if (hasPreorder && (intent.metadata.preorderAcknowledged !== "true" || intent.metadata.preorderTermsVersion !== preorderTermsVersion))
    throw new Error("Payment is missing preorder consent");
  if (items.some((item) => isChicagoVariant(item.variantId))) {
    const reservation = await client.query(
      `SELECT items, status, payment_intent_id FROM chicago_reservations WHERE id = $1`,
      [intent.metadata.chicagoReservationId ?? ""]
    );
    const row = reservation.rows[0];
    const decants = items.filter((item) => isChicagoVariant(item.variantId));
    const reserved = row?.items;
    if (!row || row.payment_intent_id !== intent.id || !["pending", "committed"].includes(row.status) || !Array.isArray(reserved) || reserved.length !== decants.length || !decants.every((item, index) => reserved[index]?.variantId === item.variantId && reserved[index]?.quantity === item.quantity))
      throw new Error("Payment has no matching inventory reservation");
    await client.query(
      `UPDATE chicago_reservations SET status = 'committed'
       WHERE id = $1 AND status = 'pending'`,
      [intent.metadata.chicagoReservationId]
    );
  }
  const result = await client.query(
    `INSERT INTO payment_orders
       (payment_intent_id, amount_cents, currency, customer_email, customer_name, items, shipping)
     VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb)
     ON CONFLICT (payment_intent_id) DO UPDATE SET payment_intent_id = EXCLUDED.payment_intent_id
     RETURNING id, amount_cents, customer_email, customer_name`,
    [
      intent.id,
      intent.amount_received,
      intent.currency,
      email,
      shipping.name,
      JSON.stringify(items.map((item) => item.fulfillment === "backorder" ? {
        ...item,
        fulfillment: "backorder",
        payment: "paid-in-full",
        preorderTermsVersion: intent.metadata.preorderTermsVersion,
        preorderTerms,
        preorderAcknowledged: true
      } : item)),
      JSON.stringify(shipping)
    ]
  );
  return result.rows[0];
}

// serverless/reconcile.ts
async function handler(req, res) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== `Bearer ${secret}`) {
    res.statusCode = 401;
    return res.end("Unauthorized");
  }
  await reconcileExpiredReservations(await getStripeClient());
  res.setHeader("content-type", "application/json");
  res.end(JSON.stringify({ ok: true }));
}
export {
  handler as default
};
