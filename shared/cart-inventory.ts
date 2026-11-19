import { poolDemand } from "./rvltn";
type InventoryVariant = { id: string; isActive: boolean; remainingInventory: number; sharedRemainingMl?: number };
type CartLine = { variantId: string; quantity: number };

export function inventoryLimit(variant: InventoryVariant | undefined): number {
  if (!variant?.isActive || !Number.isFinite(variant.remainingInventory)) return 0;
  return Math.min(100, Math.max(0, Math.floor(variant.remainingInventory)));
}

/** Remaining mL for each limited-release pool, as reported by the single-pool variants. */
function poolRemainings(variants: InventoryVariant[]): Map<string, number> {
  const remaining = new Map<string, number>();
  for (const variant of variants) {
    const demand = poolDemand(variant.id);
    if (demand.length === 1 && variant.sharedRemainingMl !== undefined && !remaining.has(demand[0][0]))
      remaining.set(demand[0][0], variant.sharedRemainingMl);
  }
  return remaining;
}

export function reconcileCart<T extends CartLine>(lines: T[], variants: InventoryVariant[]): T[] {
  const byId = new Map(variants.map(variant => [variant.id, variant]));
  const remainingMl = poolRemainings(variants);
  return lines.flatMap(line => {
    const demand = poolDemand(line.variantId);
    const quantity = Math.min(
      line.quantity,
      inventoryLimit(byId.get(line.variantId)),
      ...demand.map(([key, ml]) => Math.floor((remainingMl.get(key) ?? 0) / ml)),
    );
    if (Number.isInteger(quantity) && quantity > 0)
      for (const [key, ml] of demand) remainingMl.set(key, (remainingMl.get(key) ?? 0) - ml * quantity);
    return Number.isInteger(quantity) && quantity > 0 ? [{ ...line, quantity }] : [];
  });
}

export function cartMatchesInventory(lines: CartLine[], variants: InventoryVariant[]): boolean {
  const next = reconcileCart(lines, variants);
  return next.length === lines.length && next.every((line, index) => line.quantity === lines[index].quantity);
}

export function canAddCartLines(current: CartLine[], additions: CartLine[], variants: InventoryVariant[]): boolean {
  const byId = new Map(variants.map(variant => [variant.id, variant]));
  const quantities = new Map<string, number>();
  for (const line of [...current, ...additions]) {
    if (!Number.isInteger(line.quantity) || line.quantity <= 0) return false;
    quantities.set(line.variantId, (quantities.get(line.variantId) ?? 0) + line.quantity);
  }
  const remainingMl = poolRemainings(variants);
  const requestedMl = new Map<string, number>();
  for (const [id, quantity] of Array.from(quantities))
    for (const [key, ml] of poolDemand(id)) requestedMl.set(key, (requestedMl.get(key) ?? 0) + ml * quantity);
  return Array.from(requestedMl).every(([key, ml]) => ml <= (remainingMl.get(key) ?? 0)) &&
    Array.from(quantities).every(([id, quantity]) => quantity <= inventoryLimit(byId.get(id)));
}
