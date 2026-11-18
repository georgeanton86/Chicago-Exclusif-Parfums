import { useQuery } from "@tanstack/react-query";
import { useSyncExternalStore, useState } from "react";
import type { Product, ProductVariant } from "@shared/schema";
import { canAddCartLines, cartMatchesInventory, reconcileCart } from "@shared/cart-inventory";

export type StoreVariant = ProductVariant & { sharedRemainingMl?: number; isPreorder?: boolean };
type Line = { variantId: string; quantity: number };
type SavedCart = { cart: Line[]; checkoutKey: string; promoCode: string | null };
const emptySnapshot = "";
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("rvltn-cart", callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener("rvltn-cart", callback); };
}
function snapshot() { return localStorage.getItem("checkoutCart") || emptySnapshot; }
function parse(raw: string): SavedCart {
  try {
    const data = JSON.parse(raw);
    if (Array.isArray(data.cart) && data.cart.every((line: Line) => typeof line.variantId === "string" && Number.isInteger(line.quantity) && line.quantity > 0)) {
      return { cart: data.cart, checkoutKey: data.checkoutKey || "", promoCode: data.promoCode ?? null };
    }
  } catch { /* A malformed saved bag is treated as empty. */ }
  return { cart: [], checkoutKey: "", promoCode: null };
}
export function useShoppingCart() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => emptySnapshot);
  const saved = parse(raw);
  const [error, setError] = useState("");
  const products = useQuery<Product[]>({ queryKey: ["/api/products"] });
  const variants = useQuery<StoreVariant[]>({ queryKey: ["/api/product-variants"], staleTime: 0, refetchOnWindowFocus: true });
  function save(cart: Line[]) {
    localStorage.setItem("checkoutCart", JSON.stringify({ cart, checkoutKey: crypto.randomUUID(), promoCode: saved.promoCode } satisfies SavedCart));
    window.dispatchEvent(new Event("rvltn-cart"));
    setError("");
  }
  function add(variantId: string, quantity: number) {
    const current = parse(snapshot()).cart;
    if (!products.data || !variants.data || !canAddCartLines(current, [{ variantId, quantity }], variants.data)) {
      setError("This quantity exceeds the current availability or order limit. Review your bag."); return false;
    }
    const existing = current.find(line => line.variantId === variantId);
    save(existing ? current.map(line => line.variantId === variantId ? { ...line, quantity: line.quantity + quantity } : line) : [...current, { variantId, quantity }]);
    return true;
  }
  function change(oldId: string, newId: string, quantity: number) {
    const current = parse(snapshot()).cart;
    if (!Number.isInteger(quantity) || quantity < 1) return false;
    const others = current.filter(line => line.variantId !== oldId);
    if (!variants.data || !canAddCartLines(others, [{ variantId: newId, quantity }], variants.data)) {
      setError("That size or quantity exceeds the available stock or order limit."); return false;
    }
    const existing = others.find(line => line.variantId === newId);
    save(existing ? others.map(line => line.variantId === newId ? { ...line, quantity: line.quantity + quantity } : line) : [...others, { variantId: newId, quantity }]);
    return true;
  }
  const lines = saved.cart.map(line => {
    const variant = variants.data?.find(v => v.id === line.variantId);
    return { ...line, variant, product: products.data?.find(p => p.id === variant?.productId) };
  });
  return {
    ...saved, lines, products, variants, error, add, change,
    remove: (id: string) => save(parse(snapshot()).cart.filter(line => line.variantId !== id)),
    reconcile: () => variants.data && save(reconcileCart(saved.cart, variants.data)),
    stockChanged: Boolean(variants.data && !cartMatchesInventory(saved.cart, variants.data)),
    total: lines.reduce((sum, line) => sum + Number(line.variant?.price || 0) * line.quantity, 0),
    count: saved.cart.reduce((sum, line) => sum + line.quantity, 0),
  };
}
