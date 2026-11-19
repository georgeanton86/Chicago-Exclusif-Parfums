import { createRequire as __cr } from 'module'; const require = __cr(import.meta.url);

// server/app.ts
import express2 from "express";
import path from "path";

// server/routes.ts
import { createServer } from "http";
import { createHash } from "crypto";

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
function isPreorderVariant(id) {
  const variant = rvltnVariant(id);
  return Boolean(variant && rvltnOffers.find((o) => o.productId === variant.productId)?.status === "backorder");
}
function limitedOffer(id) {
  const variant = rvltnVariant(id);
  const offer = variant && rvltnOffers.find((o) => o.productId === variant.productId);
  return offer && offer.status === "limited" ? offer : void 0;
}
function poolSize(id) {
  return limitedOffer(id) ? parseInt(rvltnVariant(id).size, 10) : 0;
}
function poolKey(id) {
  return limitedOffer(id)?.productId;
}
function poolName(id) {
  return limitedOffer(id)?.name ?? "this item";
}
function poolRemainingMl(id, unavailable) {
  const offer = limitedOffer(id);
  if (!offer) return 0;
  const used = Array.from(unavailable).reduce((sum, [other, quantity]) => poolKey(other) === offer.productId ? sum + poolSize(other) * quantity : sum, 0);
  return Math.max(0, (offer.stockMl ?? 0) - used);
}
function availableVariant(variant, unavailable) {
  const size = poolSize(variant.id);
  return {
    ...variant,
    remainingInventory: isPreorderVariant(variant.id) ? 100 : size ? Math.floor(poolRemainingMl(variant.id, unavailable) / size) : Math.max(0, variant.remainingInventory - (unavailable.get(variant.id) ?? 0)),
    ...size ? { sharedRemainingMl: poolRemainingMl(variant.id, unavailable) } : {},
    isPreorder: isPreorderVariant(variant.id)
  };
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
function countChicagoSets(items) {
  return Math.min(...chicagoOffers.map(
    (offer) => items.filter((item) => item.variantId === offer.variantId).reduce((sum, item) => sum + item.quantity, 0)
  ));
}
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

// server/routes.ts
import { z } from "zod";

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
async function getStripePublishableKey() {
  return credentials().publishableKey;
}
async function getStripeSync() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const { secretKey } = credentials();
  return new StripeSync({
    poolConfig: { connectionString: process.env.DATABASE_URL },
    stripeSecretKey: secretKey,
    stripeWebhookSecret: ""
  });
}

// server/payments.ts
import { Pool } from "pg";

// shared/commerce.ts
var freeShippingThresholdCents = 5e3;
var standardShippingCents = 899;
function shippingCentsForSubtotal(subtotalCents) {
  return subtotalCents > freeShippingThresholdCents ? 0 : standardShippingCents;
}

// shared/promotions.ts
var trialPromotionsEnabled = false;
var minimumCardChargeCents = 50;
function parsePromoCodes(value) {
  const codes = Array.from(new Set((value ?? "").toUpperCase().trim().split(/[\s,+]+/).filter(Boolean)));
  const allowed = trialPromotionsEnabled ? ["WELCOME10", "10OFFNOW", "FREESHIP", "99OFF"] : ["WELCOME10", "10OFFNOW"];
  if (codes.some((code) => !allowed.includes(code))) throw new Error("Promo code is invalid or no longer available.");
  if (codes.filter((code) => code !== "FREESHIP").length > 1) {
    throw new Error("Use only one percentage discount code. Free shipping can be combined with it.");
  }
  return codes;
}
function cartPricing(subtotalCents, setDiscountCents, promoCode) {
  const codes = parsePromoCodes(promoCode);
  const discountPercent = codes.includes("99OFF") ? 99 : codes.includes("WELCOME10") || codes.includes("10OFFNOW") ? 10 : 0;
  const merchandiseCents = Math.max(0, subtotalCents - setDiscountCents);
  const discountCents = Math.round(merchandiseCents * discountPercent / 100);
  const shippingCents = codes.includes("FREESHIP") ? 0 : shippingCentsForSubtotal(subtotalCents);
  return {
    codes,
    discountPercent,
    discountCents,
    shippingCents,
    totalCents: merchandiseCents - discountCents + shippingCents
  };
}

// server/payments.ts
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required for orders");
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var chicagoLock = 54182025;
var CheckoutConflict = class extends Error {
};
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
async function quantities(query, includePending, checkoutKey) {
  const result = await query.query(
    `SELECT variant_id, SUM(quantity)::integer AS sold FROM (
       SELECT line->>'variantId' AS variant_id, (line->>'quantity')::integer AS quantity
       FROM payment_orders, LATERAL jsonb_array_elements(items) AS line
       ${includePending ? `UNION ALL
       SELECT line->>'variantId', (line->>'quantity')::integer
       FROM chicago_reservations, LATERAL jsonb_array_elements(items) AS line
        WHERE status = 'pending' ${checkoutKey ? "AND NOT (checkout_key IS NOT DISTINCT FROM $1 AND expires_at > now())" : ""}` : ""}
     ) AS stock GROUP BY variant_id`,
    checkoutKey ? [checkoutKey] : []
  );
  return new Map(result.rows.map((row) => [row.variant_id, row.sold]));
}
async function getPaidQuantities() {
  return quantities(pool, false);
}
async function getUnavailableQuantities(checkoutKey) {
  return quantities(pool, true, checkoutKey);
}
async function reserveChicagoCheckout(items, promoCode, stripe, checkoutKey, requestHash) {
  await reconcileExpiredReservations(stripe);
  return withChicagoLock(async (client) => {
    const existing = await client.query(
      `SELECT id, request_hash, amount_cents, status, expires_at
       FROM chicago_reservations WHERE checkout_key = $1`,
      [checkoutKey]
    );
    if (existing.rowCount) {
      const row = existing.rows[0];
      if (row.request_hash !== requestHash)
        throw new CheckoutConflict("Checkout details changed. Start a new checkout.");
      if (row.status !== "pending" || new Date(row.expires_at).getTime() <= Date.now())
        throw new CheckoutConflict("This checkout has expired or completed. Start a new checkout.");
      return { reservationId: row.id, amount: row.amount_cents };
    }
    const unavailable = await quantities(client, true);
    const amount = await priceCart(items, promoCode, unavailable);
    const decants = items.filter((item) => isChicagoVariant(item.variantId));
    const result = await client.query(
      `INSERT INTO chicago_reservations (items, expires_at, checkout_key, request_hash, amount_cents)
       VALUES ($1::jsonb, now() + interval '30 minutes', $2, $3, $4) RETURNING id`,
      [JSON.stringify(decants), checkoutKey, requestHash, amount]
    );
    return { reservationId: result.rows[0].id, amount };
  });
}
async function getOrCreateChicagoIntent(reservationId, stripe, params) {
  return withChicagoLock(async (client) => {
    const result = await client.query(
      `SELECT payment_intent_id, status, expires_at FROM chicago_reservations WHERE id = $1`,
      [reservationId]
    );
    const row = result.rows[0];
    if (!row || row.status !== "pending" || new Date(row.expires_at).getTime() <= Date.now())
      throw new CheckoutConflict("This checkout has expired or completed. Start a new checkout.");
    const intent = row.payment_intent_id ? await stripe.paymentIntents.retrieve(row.payment_intent_id) : await stripe.paymentIntents.create(params, { idempotencyKey: reservationId });
    if (!["requires_payment_method", "requires_confirmation", "requires_action"].includes(intent.status) || !intent.client_secret)
      throw new CheckoutConflict("This payment is already underway. Check its status before starting another.");
    if (!row.payment_intent_id) {
      await client.query(
        `UPDATE chicago_reservations SET payment_intent_id = $2 WHERE id = $1 AND status = 'pending'`,
        [reservationId, intent.id]
      );
    }
    return intent;
  });
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
async function reconcileChicagoIntent(stripe, intentId, cancel = false) {
  await withChicagoLock((client) => reconcileIntentLocked(client, stripe, intentId, cancel));
}
async function handlePaymentIntentNotification(stripe, type, intentId) {
  if (!["payment_intent.succeeded", "payment_intent.canceled", "payment_intent.payment_failed"].includes(type))
    return;
  const intent = await stripe.paymentIntents.retrieve(intentId);
  if (intent.status === "succeeded") await recordPaidOrder(intent);
  else if (intent.metadata.chicagoReservationId)
    await reconcileChicagoIntent(stripe, intent.id, type === "payment_intent.payment_failed");
}
async function priceCart(items, promoCode, unavailable) {
  let subtotalCents = 0;
  const paid = unavailable ?? await getUnavailableQuantities();
  const requestedMl = /* @__PURE__ */ new Map();
  for (const item of items) {
    const key = poolKey(item.variantId);
    if (!key) continue;
    const entry = requestedMl.get(key) ?? { ml: 0, sample: item.variantId };
    entry.ml += poolSize(item.variantId) * item.quantity;
    requestedMl.set(key, entry);
  }
  for (const { ml, sample } of Array.from(requestedMl.values()))
    if (ml > poolRemainingMl(sample, paid)) throw new Error(`Insufficient inventory: ${poolName(sample)} sizes share the remaining fragrance volume`);
  for (const item of items) {
    const variant = await storage.getProductVariant(item.variantId);
    if (!variant || !variant.isActive) throw new Error("An item is no longer available");
    if (availableVariant(variant, paid).remainingInventory < item.quantity)
      throw new Error("Insufficient inventory");
    subtotalCents += Math.round(Number(variant.price) * 100) * item.quantity;
  }
  const setDiscountCents = countChicagoSets(items) * chicagoSetDiscountCents;
  const { totalCents } = cartPricing(subtotalCents, setDiscountCents, promoCode);
  if (totalCents < minimumCardChargeCents) {
    throw new CheckoutConflict("The discounted total is below Stripe's $0.50 minimum. Add an item or remove a promo code.");
  }
  return totalCents;
}
async function recordPaidOrder(intent) {
  return withChicagoLock((client) => recordPaidOrderLocked(client, intent));
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

// server/routes.ts
var checkoutSchema = z.object({
  checkoutKey: z.string().uuid(),
  items: z.array(z.object({
    variantId: z.string().min(1),
    quantity: z.number().int().min(1).max(100)
  })).min(1).max(30).refine(
    (items) => new Set(items.map((item) => item.variantId)).size === items.length,
    "Duplicate items are not allowed"
  ),
  promoCode: z.string().max(40).optional().nullable(),
  customerEmail: z.string().email().max(254),
  customerName: z.string().trim().min(1).max(100),
  policyAcknowledged: z.literal(true),
  decantAcknowledged: z.boolean().optional(),
  preorderAcknowledged: z.boolean().optional(),
  address: z.object({
    line1: z.string().trim().min(1).max(200),
    line2: z.string().trim().max(200).optional(),
    city: z.string().trim().min(1).max(100),
    state: z.string().trim().min(1).max(100),
    postal_code: z.string().trim().min(1).max(30),
    country: z.literal("US")
  })
});
async function registerRoutes(app2) {
  app2.get("/api/products", async (req, res) => {
    try {
      const allProducts = (await storage.getAllProducts()).filter((product) => product.isActive);
      res.json(allProducts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching products: " + error.message });
    }
  });
  app2.get("/api/product", async (req, res) => {
    try {
      const allProducts = (await storage.getAllProducts()).filter((product) => product.isActive);
      if (allProducts.length === 0) {
        return res.status(404).json({ message: "No products available" });
      }
      res.json(allProducts[0]);
    } catch (error) {
      res.status(500).json({ message: "Error fetching product: " + error.message });
    }
  });
  app2.get("/api/product/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product?.isActive) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Error fetching product: " + error.message });
    }
  });
  app2.get("/api/product-variants", async (req, res) => {
    try {
      res.set("Cache-Control", "no-store");
      const allVariants = (await storage.getAllProductVariants()).filter((variant) => variant.isActive);
      const paid = await getPaidQuantities();
      const unavailable = await getUnavailableQuantities();
      res.json(allVariants.map((v) => ({
        ...availableVariant(v, unavailable),
        soldCount: v.soldCount + (paid.get(v.id) ?? 0)
      })));
    } catch (error) {
      res.status(500).json({ message: "Error fetching product variants: " + error.message });
    }
  });
  app2.get("/api/checkout-availability/:checkoutKey", async (req, res) => {
    res.set("Cache-Control", "no-store");
    const key = z.string().uuid().safeParse(req.params.checkoutKey);
    if (!key.success) return res.status(400).json({ message: "Invalid checkout key" });
    try {
      const variants = (await storage.getAllProductVariants()).filter((variant) => variant.isActive);
      const unavailable = await getUnavailableQuantities(key.data);
      res.json(variants.map((variant) => ({
        ...availableVariant(variant, unavailable)
      })));
    } catch {
      res.status(503).json({ message: "Could not check stock. Please try again." });
    }
  });
  app2.get("/api/product-variants/:productId", async (req, res) => {
    try {
      const variants = (await storage.getProductVariants(req.params.productId)).filter((variant) => variant.isActive);
      const paid = await getPaidQuantities();
      const unavailable = await getUnavailableQuantities();
      res.json(variants.map((v) => ({
        ...availableVariant(v, unavailable),
        soldCount: v.soldCount + (paid.get(v.id) ?? 0)
      })));
    } catch (error) {
      res.status(500).json({ message: "Error fetching product variants: " + error.message });
    }
  });
  app2.get("/api/variant/:id", async (req, res) => {
    try {
      const variant = await storage.getProductVariant(req.params.id);
      if (!variant?.isActive) {
        return res.status(404).json({ message: "Product variant not found" });
      }
      const paid = await getPaidQuantities();
      const unavailable = await getUnavailableQuantities();
      res.json({
        ...availableVariant(variant, unavailable),
        soldCount: variant.soldCount + (paid.get(variant.id) ?? 0)
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching product variant: " + error.message });
    }
  });
  app2.get("/api/stripe/config", async (_req, res) => {
    try {
      res.json({ publishableKey: await getStripePublishableKey() });
    } catch (error) {
      console.error("Stripe configuration error:", error);
      res.status(503).json({ message: "Payments are unavailable" });
    }
  });
  app2.post("/api/create-payment-intent", async (req, res) => {
    try {
      const parsed = checkoutSchema.safeParse(req.body);
      if (!parsed.success) return res.status(400).json({ message: "Invalid checkout details", details: parsed.error.flatten() });
      const { items, promoCode, customerEmail, customerName, address, checkoutKey } = parsed.data;
      const hasPreorder = items.some((item) => isPreorderVariant(item.variantId));
      if (hasPreorder && parsed.data.preorderAcknowledged !== true)
        return res.status(400).json({ message: "Please acknowledge full payment, unknown fulfillment timing, and the preorder refund policy." });
      let normalizedPromoCode;
      try {
        normalizedPromoCode = parsePromoCodes(promoCode).join(" ");
      } catch (error) {
        return res.status(400).json({ message: error instanceof Error ? error.message : "Invalid promo code" });
      }
      if (items.some((item) => isChicagoVariant(item.variantId)) && parsed.data.decantAcknowledged !== true)
        return res.status(400).json({ message: "Please acknowledge the decant bottle disclosure" });
      await priceCart(items, promoCode ?? void 0, /* @__PURE__ */ new Map());
      const stripe = await getStripeClient();
      const hasDecants = items.some((item) => isChicagoVariant(item.variantId));
      const requestHash = createHash("sha256").update(JSON.stringify(parsed.data)).digest("hex");
      const checkout = hasDecants ? await reserveChicagoCheckout(items, promoCode ?? void 0, stripe, checkoutKey, requestHash) : void 0;
      const amount = checkout?.amount ?? await priceCart(items, promoCode ?? void 0);
      const reservationId = checkout?.reservationId;
      const params = {
        amount,
        currency: "usd",
        automatic_payment_methods: { enabled: true },
        receipt_email: customerEmail,
        shipping: { name: customerName, address },
        metadata: {
          items: JSON.stringify(items.map((item) => isPreorderVariant(item.variantId) ? { ...item, fulfillment: "backorder" } : item)),
          promoCode: normalizedPromoCode,
          policyAcknowledged: "true",
          decantAcknowledged: parsed.data.decantAcknowledged === true ? "true" : "false",
          ...hasPreorder ? { preorderAcknowledged: "true", preorderTermsVersion, fulfillment: "backorder", preorderTerms } : {},
          ...reservationId ? { chicagoReservationId: reservationId } : {}
        }
      };
      const paymentIntent = reservationId ? await getOrCreateChicagoIntent(reservationId, stripe, params) : await stripe.paymentIntents.create(params, { idempotencyKey: checkoutKey });
      res.json({ clientSecret: paymentIntent.client_secret, total: amount / 100 });
    } catch (error) {
      console.error("Failed to create payment intent:", error);
      const inventoryError = error instanceof Error && /inventory|no longer available/i.test(error.message);
      res.status(error instanceof CheckoutConflict ? 409 : inventoryError ? 400 : 503).json({ message: error instanceof CheckoutConflict || inventoryError ? error.message : "Could not start payment" });
    }
  });
  app2.post("/api/complete-stripe-payment", async (req, res) => {
    try {
      const { paymentIntentId, clientSecret } = z.object({
        paymentIntentId: z.string().regex(/^pi_[a-zA-Z0-9]+$/),
        clientSecret: z.string().min(10)
      }).parse(req.body);
      const stripe = await getStripeClient();
      const intent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (!intent.client_secret || intent.client_secret !== clientSecret)
        return res.status(403).json({ message: "Invalid payment confirmation" });
      if (intent.status !== "succeeded")
        return res.status(409).json({ message: "Payment is not complete yet" });
      const order = await recordPaidOrder(intent);
      res.json({
        success: true,
        orderId: order.id,
        total: (order.amount_cents / 100).toFixed(2),
        customerEmail: order.customer_email,
        customerName: order.customer_name,
        hasPreorder: intent.metadata.preorderAcknowledged === "true",
        ...intent.metadata.preorderAcknowledged === "true" ? { preorderTerms: intent.metadata.preorderTerms || preorderTerms } : {}
      });
    } catch (error) {
      if (error instanceof z.ZodError) return res.status(400).json({ message: "Invalid payment confirmation" });
      console.error("Payment confirmation failed:", error);
      res.status(503).json({ message: "Payment status could not be confirmed. Please retry; do not pay again." });
    }
  });
  app2.get("/api/inventory/:variantId", async (req, res) => {
    try {
      const { variantId } = req.params;
      const variant = await storage.getProductVariant(variantId);
      if (!variant?.isActive) {
        return res.status(404).json({ message: "Product variant not found" });
      }
      const unavailable = await getUnavailableQuantities();
      res.json({
        remaining: availableVariant(variant, unavailable).remainingInventory,
        isPreorder: isPreorderVariant(variant.id),
        ..."sharedRemainingMl" in availableVariant(variant, unavailable) ? { sharedRemainingMl: availableVariant(variant, unavailable).sharedRemainingMl } : {},
        total: variant.totalInventory
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching inventory: " + error.message });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/log.ts
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

// server/app.ts
import { runMigrations } from "stripe-replit-sync";

// server/stripeWebhook.ts
import express from "express";
function registerStripeWebhook(app2, { getSync, getClient } = { getSync: getStripeSync, getClient: getStripeClient }) {
  app2.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const signature = req.headers["stripe-signature"];
    if (!signature || typeof signature !== "string" || !Buffer.isBuffer(req.body))
      return res.status(400).json({ message: "Invalid webhook" });
    try {
      const sync = await getSync();
      await sync.processWebhook(req.body, signature);
      const event = JSON.parse(req.body.toString("utf8"));
      if (event.type === "payment_intent.succeeded" || event.type === "payment_intent.canceled" || event.type === "payment_intent.payment_failed") {
        await handlePaymentIntentNotification(await getClient(), event.type, event.data.object.id);
      }
      res.json({ received: true });
    } catch (error) {
      console.error("Stripe webhook failed:", error);
      res.status(400).json({ message: "Webhook could not be processed" });
    }
  });
}

// server/app.ts
var app = express2();
async function initializeStripeIntegration() {
  try {
    const sync = await getStripeSync();
    const base = process.env.PUBLIC_URL?.replace(/\/$/, "") ?? (process.env.REPLIT_DOMAINS ? `https://${process.env.REPLIT_DOMAINS.split(",")[0]}` : void 0);
    if (!base) throw new Error("PUBLIC_URL is required for Stripe webhooks");
    await sync.findOrCreateManagedWebhook(`${base}/api/stripe/webhook`);
    if (!process.env.VERCEL) void sync.syncBackfill({ object: "all" }).catch((error) => console.error("Stripe sync backfill failed:", error));
  } catch (error) {
    console.error("Stripe webhook setup failed; storefront is online but payment notifications may be unavailable:", error);
  }
}
registerStripeWebhook(app);
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use("/assets", express2.static(path.resolve(import.meta.dirname, "..", "attached_assets")));
app.use((req, res, next) => {
  const start = Date.now();
  const reqPath = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (reqPath.startsWith("/api")) {
      let logLine = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse && ![
        "/api/stripe/config",
        "/api/create-payment-intent",
        "/api/complete-stripe-payment"
      ].includes(reqPath)) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
var ready;
function createApp() {
  ready ??= (async () => {
    if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
    await runMigrations({ databaseUrl: process.env.DATABASE_URL });
    const server = await registerRoutes(app);
    app.use((err, _req, res, _next) => {
      const status = err.status || err.statusCode || 500;
      res.status(status).json({ message: err.message || "Internal Server Error" });
      console.error(err);
    });
    if (process.env.VERCEL && process.env.PUBLIC_URL) await initializeStripeIntegration();
    return server;
  })();
  return ready;
}

// serverless/index.ts
async function handler(req, res) {
  await createApp();
  app(req, res);
}
export {
  handler as default
};
