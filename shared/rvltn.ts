export const rvltnSizes = [5, 10, 20, 30] as const;
export const rvltnPrices = ["22.50", "45.00", "85.00", "120.00"] as const;
export const prexStockMl = 500;
export const quantumStockMl = 50;
/** When the next series drops: midnight Central (CST, UTC-6) on January 1, 2027. */
export const nextDropAt = "2027-01-01T00:00:00-06:00";
export const nextDropLabel = "January 1, 2027";
export const preorderTermsVersion = "rvltn-preorder-2026-11";
export const preorderTerms = "Backorder / paid waitlist: the full price is charged now. There is no confirmed restock or shipping date. Orders are nonrefundable except where required by law. This is not a ready-to-ship purchase.";
export const rvltnOffers = [
  {
    slug: "sleep-paralysis", name: "SLEEP PARALYSIS", status: "backorder",
    imageUrl: "/assets/Screenshot_20261107_102718_Messenger_1794069072308.jpg",
    description: "Citrus, floral aromatics and incense over deep woods and warm resins.",
    topNotes: "Bergamot · Lemon · Neroli · Spices · Citrus Accord · Aromatic Herbs · Pink Pepper",
    middleNotes: "Jasmine · Lavender · Violet Leaf · Incense · Green Tea · Orris · Cypress",
    baseNotes: "Oud · Sandalwood · Cedarwood · Amber · Musk · Tonka Bean · Resins · Vetiver",
  },
  {
    slug: "green-monster", name: "GREEN MONSTER", status: "backorder",
    imageUrl: "/assets/Screenshot_20261107_102734_Messenger_1794069072294.jpg",
    description: "Bright citrus and green cactus accords meet aromatic florals and earthy woods.",
    topNotes: "Bergamot · Lemon · Lime · Citrus Accord · Green Leaves · Cactus Accord · Aromatic Herbs · Pink Pepper",
    middleNotes: "Lavender · Geranium · Jasmine · Neroli · Green Tea · Cypress · Violet Leaf · Spices",
    baseNotes: "Oud · Vetiver · Sandalwood · Cedarwood · Amber · Musk · Tonka Bean · Patchouli · Incense",
  },
  {
    slug: "duality", name: "DUALITY", status: "backorder",
    imageUrl: "/assets/Screenshot_20261028_212446_ChatGPT_1794068728000.jpg",
    description: "An RVLTN Parfums blend exploring light and darkness. Scent notes have not yet been published.",
    topNotes: "", middleNotes: "", baseNotes: "",
  },
  {
    slug: "prex2026", name: "PREX2026", status: "limited", stockMl: prexStockMl,
    imageUrl: "/assets/Screenshot_20261107_102746_Messenger_1794069072245.jpg",
    description: "A limited release pairing citrus and marine notes with florals, spices and deep woods.",
    topNotes: "Bergamot · Mandarin Orange · Grapefruit · Lemon · Sea Salt · Fruity Notes · Aromatic Herbs · Pink Pepper",
    middleNotes: "Iris · Jasmine · Rose · Geranium · Lavender · Neroli · Marine Notes · Spices",
    baseNotes: "Oud · Sandalwood · Cedarwood · Musk · Ambergris · Patchouli · Frankincense · Guaiac Wood · Saffron · Nutmeg",
  },
  ...[
    ["green-monster-2", "GREEN MONSTER 2.0", "/assets/quantum/green-monster-2.jpg", "The next chapter of Green Monster."],
    ["electron", "ELECTRON", "/assets/quantum/electron.jpg", "Quantum Series. Scent notes have not yet been published."],
    ["neutron", "NEUTRON", "/assets/quantum/neutron.jpg", "Quantum Series. Scent notes have not yet been published."],
    ["proton", "PROTON", "/assets/quantum/proton.jpg", "Quantum Series. Scent notes have not yet been published."],
    ["dark-matter", "DARK MATTER", "/assets/quantum/dark-matter.jpg", "Quantum Series. Scent notes have not yet been published."],
  ].map(([slug, name, file, description]) => ({
    slug, name, status: "limited" as const, stockMl: quantumStockMl, imageUrl: file, description,
    topNotes: "", middleNotes: "", baseNotes: "",
  })),
].map((offer, index) => ({
  ...offer, productId: `84ac0000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
}));

/** The Quantum Series fragrances. Each draws from its own mL pool. */
export const quantumSlugs = ["green-monster-2", "electron", "neutron", "proton", "dark-matter"] as const;

/** One 50 mL bottle of every Quantum fragrance, sold together. It uses the full pool of all five. */
export const quantumSet = {
  slug: "quantum-set",
  productId: "84ac0000-0000-4000-8000-000000000999",
  variantId: "84ac0000-0000-4000-8000-000000009991",
  sku: "RVLTN-QUANTUM-SET",
  name: "QUANTUM SERIES — COMPLETE SET",
  price: "400.00",
  imageUrl: "/assets/quantum/lineup.jpg",
  description: "One 50 mL bottle of each: Proton, Neutron, Electron, Dark Matter and Green Monster 2.0.",
};

/** Earlier releases that have sold out. Their stock logic stays in place; this switch closes them to purchase. */
export const soldOutSlugs = new Set<string>(["sleep-paralysis", "green-monster", "duality", "prex2026", "green-monster-2", "electron", "neutron", "proton", "dark-matter", "quantum-set"]);

export const rvltnVariants = [
  ...rvltnOffers.flatMap((offer, index) => rvltnSizes.map((size, slot) => ({
    id: `84ac0000-0000-4000-8000-${String((index + 1) * 100 + slot + 1).padStart(12, "0")}`,
    productId: offer.productId, sku: `RVLTN-${offer.slug.toUpperCase()}-${size}ML`,
    size: `${size} mL`, concentration: "Fragrance decant", price: rvltnPrices[slot],
    // Backorders have an order limit, not a claim of physical inventory.
    totalInventory: offer.status === "limited" ? Math.floor((offer.stockMl ?? 0) / size) : 0,
    remainingInventory: offer.status === "limited" ? Math.floor((offer.stockMl ?? 0) / size) : 100,
    soldCount: 0, isActive: true,
  }))),
  {
    id: quantumSet.variantId, productId: quantumSet.productId, sku: quantumSet.sku,
    size: "Complete set", concentration: "5 × 50 mL", price: quantumSet.price,
    totalInventory: 1, remainingInventory: 1, soldCount: 0, isActive: true,
  },
];
export function rvltnVariant(id: string) { return rvltnVariants.find(v => v.id === id); }
function offerOf(id: string) {
  const variant = rvltnVariant(id);
  return variant ? rvltnOffers.find(o => o.productId === variant.productId) : undefined;
}
export function isPreorderVariant(id: string) {
  return offerOf(id)?.status === "backorder";
}
export function isSoldOutVariant(id: string) {
  if (id === quantumSet.variantId) return soldOutSlugs.has(quantumSet.slug);
  const offer = offerOf(id);
  return Boolean(offer && soldOutSlugs.has(offer.slug));
}
export function prexSize(id: string): number {
  const variant = rvltnVariant(id);
  return variant?.productId === rvltnOffers[3].productId ? parseInt(variant.size, 10) : 0;
}
export function prexRemainingMl(unavailable: Map<string, number>): number {
  return Math.max(0, prexStockMl - Array.from(unavailable).reduce((sum, [id, quantity]) => sum + prexSize(id) * quantity, 0));
}

/**
 * Limited releases (PREX2026 and each Quantum fragrance) sell from one mL pool shared by all of that
 * product's sizes. The complete set draws 50 mL from every Quantum pool at once.
 */
export function poolDemand(id: string): Array<[string, number]> {
  if (id === quantumSet.variantId)
    return rvltnOffers.filter(o => (quantumSlugs as readonly string[]).includes(o.slug)).map(o => [o.productId, quantumStockMl]);
  const offer = offerOf(id);
  return offer && offer.status === "limited" ? [[offer.productId, parseInt(rvltnVariant(id)!.size, 10)]] : [];
}
/** Size in mL for a variant that draws from exactly one pool, otherwise 0. */
export function poolSize(id: string): number {
  const demand = poolDemand(id);
  return demand.length === 1 ? demand[0][1] : 0;
}
/** The pool (product id) a single-pool variant draws from. */
export function poolKey(id: string): string | undefined {
  const demand = poolDemand(id);
  return demand.length === 1 ? demand[0][0] : undefined;
}
export function poolLabel(key: string): string {
  return rvltnOffers.find(o => o.productId === key)?.name ?? "this item";
}
export function poolName(id: string): string {
  const key = poolKey(id);
  return key ? poolLabel(key) : "this item";
}
export function poolRemaining(key: string, unavailable: Map<string, number>): number {
  const stock = rvltnOffers.find(o => o.productId === key)?.stockMl ?? 0;
  const used = Array.from(unavailable).reduce((sum, [id, quantity]) => {
    const draw = poolDemand(id).find(([pool]) => pool === key);
    return draw ? sum + draw[1] * quantity : sum;
  }, 0);
  return Math.max(0, stock - used);
}
/** Remaining mL in the pool a variant draws from (the smallest pool, for the set). */
export function poolRemainingMl(id: string, unavailable: Map<string, number>): number {
  const demand = poolDemand(id);
  return demand.length ? Math.min(...demand.map(([key]) => poolRemaining(key, unavailable))) : 0;
}
export function availableVariant<T extends { id: string; remainingInventory: number }>(variant: T, unavailable: Map<string, number>) {
  const demand = poolDemand(variant.id);
  const soldOut = isSoldOutVariant(variant.id);
  const pooled = demand.length ? Math.min(...demand.map(([key, ml]) => Math.floor(poolRemaining(key, unavailable) / ml))) : 0;
  return {
    ...variant,
    remainingInventory: soldOut ? 0 : isPreorderVariant(variant.id) ? 100 : demand.length ? pooled : Math.max(0, variant.remainingInventory - (unavailable.get(variant.id) ?? 0)),
    ...(demand.length === 1 ? { sharedRemainingMl: soldOut ? 0 : poolRemaining(demand[0][0], unavailable) } : {}),
    isPreorder: !soldOut && isPreorderVariant(variant.id),
  };
}
