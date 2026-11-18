export const rvltnSizes = [5, 10, 20, 30] as const;
export const rvltnPrices = ["22.50", "45.00", "85.00", "120.00"] as const;
export const prexStockMl = 500;
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
    slug: "prex2026", name: "PREX2026", status: "limited",
    imageUrl: "/assets/Screenshot_20261107_102746_Messenger_1794069072245.jpg",
    description: "A limited release pairing citrus and marine notes with florals, spices and deep woods.",
    topNotes: "Bergamot · Mandarin Orange · Grapefruit · Lemon · Sea Salt · Fruity Notes · Aromatic Herbs · Pink Pepper",
    middleNotes: "Iris · Jasmine · Rose · Geranium · Lavender · Neroli · Marine Notes · Spices",
    baseNotes: "Oud · Sandalwood · Cedarwood · Musk · Ambergris · Patchouli · Frankincense · Guaiac Wood · Saffron · Nutmeg",
  },
].map((offer, index) => ({
  ...offer, productId: `84ac0000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
}));

export const rvltnVariants = rvltnOffers.flatMap((offer, index) => rvltnSizes.map((size, slot) => ({
  id: `84ac0000-0000-4000-8000-${String((index + 1) * 100 + slot + 1).padStart(12, "0")}`,
  productId: offer.productId, sku: `RVLTN-${offer.slug.toUpperCase()}-${size}ML`,
  size: `${size} mL`, concentration: "Fragrance decant", price: rvltnPrices[slot],
  // Backorders have an order limit, not a claim of physical inventory.
  totalInventory: offer.status === "limited" ? Math.floor(prexStockMl / size) : 0,
  remainingInventory: offer.status === "limited" ? Math.floor(prexStockMl / size) : 100,
  soldCount: 0, isActive: true,
})));
export function rvltnVariant(id: string) { return rvltnVariants.find(v => v.id === id); }
export function isPreorderVariant(id: string) {
  const variant = rvltnVariant(id);
  return Boolean(variant && rvltnOffers.find(o => o.productId === variant.productId)?.status === "backorder");
}
export function prexSize(id: string): number {
  const variant = rvltnVariant(id);
  return variant?.productId === rvltnOffers[3].productId ? parseInt(variant.size, 10) : 0;
}
export function prexRemainingMl(unavailable: Map<string, number>): number {
  return Math.max(0, prexStockMl - Array.from(unavailable).reduce((sum, [id, quantity]) => sum + prexSize(id) * quantity, 0));
}
export function availableVariant<T extends { id: string; remainingInventory: number }>(variant: T, unavailable: Map<string, number>) {
  const size = prexSize(variant.id);
  return {
    ...variant,
    remainingInventory: isPreorderVariant(variant.id) ? 100 : size ? Math.floor(prexRemainingMl(unavailable) / size) : Math.max(0, variant.remainingInventory - (unavailable.get(variant.id) ?? 0)),
    ...(size ? { sharedRemainingMl: prexRemainingMl(unavailable) } : {}),
    isPreorder: isPreorderVariant(variant.id),
  };
}
