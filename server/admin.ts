import type { Express, Request, Response } from "express";
import { createHash, timingSafeEqual } from "crypto";
import { listPaidOrders } from "./payments";
import { storage } from "./storage";
import { quantumSet, quantumSlugs, quantumStockMl, rvltnOffers } from "@shared/rvltn";

type OrderRow = {
  id: string; payment_intent_id: string; amount_cents: number; currency: string;
  customer_email: string; customer_name: string; items: unknown; shipping: unknown; created_at: Date | string;
};
type OrderItem = { variantId: string; quantity: number; fulfillment?: string };

const sha = (value: string) => createHash("sha256").update(value).digest();

/** Constant-time password check. An unset password means the admin page is switched off. */
export function checkAdminPassword(supplied: unknown, expected: string | undefined): "ok" | "wrong" | "disabled" {
  if (!expected) return "disabled";
  if (typeof supplied !== "string" || !supplied) return "wrong";
  return timingSafeEqual(sha(supplied), sha(expected)) ? "ok" : "wrong";
}

function mlOf(size: string): number {
  const match = /^(\d+(?:\.\d+)?)\s*mL/i.exec(size);
  return match ? Number(match[1]) : 0;
}

/** Turns stored order rows into what the orders page shows, plus totals. Pure, so it can be tested. */
export async function summarizeOrders(rows: OrderRow[]) {
  const byProduct = new Map<string, { name: string; ml: number; units: number }>();
  const bump = (name: string, ml: number, units: number) => {
    const entry = byProduct.get(name) ?? { name, ml: 0, units: 0 };
    entry.ml += ml; entry.units += units;
    byProduct.set(name, entry);
  };
  let grossCents = 0;
  let mlSold = 0;
  const orders = [];
  for (const row of rows) {
    const rawItems: OrderItem[] = Array.isArray(row.items) ? row.items as OrderItem[] : [];
    const items = [];
    for (const item of rawItems) {
      const variant = await storage.getProductVariant(item.variantId);
      const product = variant ? await storage.getProduct(variant.productId) : undefined;
      const name = product?.name ?? "Unknown item";
      const size = variant ? `${variant.size}${variant.concentration && variant.size === "Complete set" ? ` ${variant.concentration}` : ""}` : "";
      if (item.variantId === quantumSet.variantId) {
        // The complete set is one 50 mL bottle of every Quantum fragrance.
        for (const slug of quantumSlugs) {
          const offer = rvltnOffers.find(o => o.slug === slug);
          if (offer) bump(offer.name, quantumStockMl * item.quantity, item.quantity);
        }
        mlSold += quantumStockMl * quantumSlugs.length * item.quantity;
      } else if (variant) {
        const ml = mlOf(variant.size) * item.quantity;
        bump(name, ml, item.quantity);
        mlSold += ml;
      }
      items.push({ name, size, quantity: item.quantity, backorder: item.fulfillment === "backorder" });
    }
    grossCents += Number(row.amount_cents);
    orders.push({
      id: row.id, paymentIntentId: row.payment_intent_id, createdAt: new Date(row.created_at).toISOString(),
      amountCents: Number(row.amount_cents), currency: row.currency,
      customerName: row.customer_name, customerEmail: row.customer_email, shipping: row.shipping, items,
    });
  }
  return {
    orders,
    totals: {
      orders: rows.length, grossCents, mlSold,
      byProduct: Array.from(byProduct.values()).sort((a, b) => b.ml - a.ml),
    },
  };
}

const failures = new Map<string, { count: number; first: number }>();
function throttled(ip: string): boolean {
  const entry = failures.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.first > 15 * 60_000) { failures.delete(ip); return false; }
  return entry.count >= 8;
}

export function registerAdminRoutes(app: Express) {
  app.get("/api/admin/orders", async (req: Request, res: Response) => {
    res.set("Cache-Control", "no-store");
    const ip = req.ip || "unknown";
    if (throttled(ip)) return res.status(429).json({ message: "Too many attempts. Try again in a few minutes." });
    const verdict = checkAdminPassword(req.get("x-admin-password"), process.env.ADMIN_PASSWORD);
    if (verdict === "disabled") return res.status(503).json({ message: "The orders page is not set up yet. Add ADMIN_PASSWORD in Vercel." });
    if (verdict === "wrong") {
      const entry = failures.get(ip) ?? { count: 0, first: Date.now() };
      entry.count += 1; failures.set(ip, entry);
      await new Promise(resolve => setTimeout(resolve, 600));
      return res.status(401).json({ message: "Wrong password." });
    }
    failures.delete(ip);
    try {
      res.json(await summarizeOrders(await listPaidOrders()));
    } catch (error) {
      console.error("Failed to load orders:", error);
      res.status(500).json({ message: "Could not load orders." });
    }
  });
}
