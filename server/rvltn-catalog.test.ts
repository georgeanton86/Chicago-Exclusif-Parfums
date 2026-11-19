import { test } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import type Stripe from "stripe";
import express from "express";
import { registerRoutes } from "./routes";
import { existsSync } from "node:fs";
import { rvltnOffers, rvltnVariants, availableVariant, prexSize, isPreorderVariant, preorderTermsVersion, quantumStockMl, poolRemainingMl } from "../shared/rvltn";
import { canAddCartLines, reconcileCart } from "../shared/cart-inventory";
import { getUnavailableQuantities, priceCart, reserveChicagoCheckout, recordPaidOrder, attachChicagoIntent } from "./payments";

const prex = rvltnVariants.filter(v => prexSize(v.id));
test("checkout API rejects missing preorder consent and pooled oversells before Stripe", async () => {
  const app = express();
  app.use(express.json());
  const server = await registerRoutes(app);
  await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
  const address = server.address() as { port: number };
  const body = {
    checkoutKey: randomUUID(), items: [{ variantId: rvltnVariants[0].id, quantity: 1 }],
    customerName: "Consent Test", customerEmail: "consent-test@example.com",
    policyAcknowledged: true, decantAcknowledged: true,
    address: { line1: "1 Test St", city: "Chicago", state: "IL", postal_code: "60601", country: "US" },
  };
  try {
    const res = await fetch(`http://127.0.0.1:${address.port}/api/create-payment-intent`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    assert.equal(res.status, 400);
    assert.match((await res.json() as {message: string}).message, /acknowledge full payment/i);
    const oversized = await fetch(`http://127.0.0.1:${address.port}/api/create-payment-intent`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, items: [{ variantId: prex[3].id, quantity: 17 }] }),
    });
    assert.equal(oversized.status, 400);
    assert.match((await oversized.json() as {message: string}).message, /Insufficient inventory/);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
  }
});
test("new offers use supplied artwork, fixed prices, and no invented Duality notes", () => {
  for (const offer of rvltnOffers) assert.ok(existsSync(`attached_assets/${offer.imageUrl.replace("/assets/", "")}`));
  assert.equal(rvltnOffers[2].topNotes, "");
  assert.deepEqual(prex.map(v => v.price), ["22.50", "45.00", "85.00", "120.00"]);
  assert.deepEqual(prex.map(v => v.size), ["5 mL", "10 mL", "20 mL", "30 mL"]);
});
test("paid and reserved quantities consume a single 500 mL pool across every PREX size", async () => {
  const unavailable = new Map([[prex[3].id, 15], [prex[1].id, 3]]); // 480 mL consumed
  const variants = rvltnVariants.map(v => availableVariant(v, unavailable));
  assert.equal(variants.find(v => v.id === prex[0].id)?.remainingInventory, 4);
  assert.equal(variants.find(v => v.id === prex[3].id)?.remainingInventory, 0);
  const fits = [{ variantId: prex[0].id, quantity: 2 }, { variantId: prex[1].id, quantity: 1 }];
  assert.equal(canAddCartLines([], fits, variants), true);
  await priceCart(fits, undefined, unavailable);
  const oversells = [{ variantId: prex[0].id, quantity: 3 }, { variantId: prex[1].id, quantity: 1 }];
  assert.equal(canAddCartLines([], oversells, variants), false);
  assert.deepEqual(reconcileCart(oversells, variants), [oversells[0]]);
  await assert.rejects(priceCart(oversells, undefined, unavailable), /Insufficient inventory/);
});
test("backorders remain orderable without inventing or consuming physical stock", async () => {
  const variant = rvltnVariants[0];
  assert.equal(isPreorderVariant(variant.id), true);
  assert.equal(variant.totalInventory, 0);
  assert.equal(availableVariant(variant, new Map([[variant.id, 500]])).remainingInventory, 100);
  assert.equal(await priceCart([{ variantId: variant.id, quantity: 1 }], undefined, new Map([[variant.id, 500]])), 3149);
});
test("concurrent PREX buyers cannot reserve more than the pooled volume; retries reuse their hold", async () => {
  assert.notEqual(process.env.NODE_ENV, "production");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const held: string[] = [];
  const stripe = { paymentIntents: { retrieve: async () => { throw new Error("Test does not touch unrelated payments"); } } } as unknown as Stripe;
  try {
    const before = getUnavailableQuantities();
    assert.equal([...await before].filter(([id]) => prexSize(id)).length, 0, "Run only before real PREX purchases exist in development");
    const keys = [randomUUID(), randomUUID()];
    const carts = [[{ variantId: prex[3].id, quantity: 10 }], [{ variantId: prex[2].id, quantity: 15 }]];
    const results = await Promise.allSettled(carts.map((cart, i) => reserveChicagoCheckout(cart, undefined, stripe, keys[i], "test").then(r => { held.push(r.reservationId); return r; })));
    assert.equal(results.filter(r => r.status === "fulfilled").length, 1);
    assert.equal(results.filter(r => r.status === "rejected").length, 1);
    const winner = results.findIndex(r => r.status === "fulfilled");
    const retry = await reserveChicagoCheckout(carts[winner], undefined, stripe, keys[winner], "test");
    assert.equal(retry.reservationId, held[0]);
    const own = await getUnavailableQuantities(keys[winner]);
    assert.equal(availableVariant(prex[3], own).sharedRemainingMl, 500);
    assert.equal(availableVariant(prex[3], await getUnavailableQuantities()).sharedRemainingMl, 200);
  } finally {
    await pool.query("DELETE FROM chicago_reservations WHERE id = ANY($1::uuid[])", [held]);
    await pool.end();
  }
});
test("paid waitlist stores consent and full-payment status once, without live Stripe calls", async () => {
  assert.notEqual(process.env.NODE_ENV, "production");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const key = randomUUID();
  const intentId = `pi_preorder_test_${key.replaceAll("-", "")}`;
  let reservationId: string | undefined;
  const stripe = { paymentIntents: { retrieve: async () => { throw new Error("Test does not touch unrelated payments"); } } } as unknown as Stripe;
  try {
    const items = [{ variantId: rvltnVariants[0].id, quantity: 1, fulfillment: "backorder" as const }];
    const reserved = await reserveChicagoCheckout(items, undefined, stripe, key, "test-preorder");
    reservationId = reserved.reservationId;
    await attachChicagoIntent(reservationId, intentId);
    const intent = {
      id: intentId, status: "succeeded", currency: "usd", amount: reserved.amount, amount_received: reserved.amount,
      receipt_email: "preorder-test@example.com",
      shipping: { name: "Preorder Test", address: { line1: "1 Test St", city: "Chicago", postal_code: "60601", country: "US" } },
      metadata: { items: JSON.stringify(items), chicagoReservationId: reservationId, policyAcknowledged: "true", decantAcknowledged: "true", preorderAcknowledged: "true", preorderTermsVersion },
    } as unknown as Stripe.PaymentIntent;
    await assert.rejects(recordPaidOrder({ ...intent, metadata: { ...intent.metadata, preorderAcknowledged: "false" } }), /preorder consent/);
    const a = await recordPaidOrder(intent);
    const b = await recordPaidOrder(intent);
    assert.equal(a.id, b.id);
    const rows = await pool.query("SELECT items FROM payment_orders WHERE payment_intent_id = $1", [intentId]);
    assert.equal(rows.rows[0].items[0].fulfillment, "backorder");
    assert.equal(rows.rows[0].items[0].payment, "paid-in-full");
    assert.equal(rows.rows[0].items[0].preorderAcknowledged, true);
  } finally {
    await pool.query("DELETE FROM payment_orders WHERE payment_intent_id = $1", [intentId]);
    if (reservationId) await pool.query("DELETE FROM chicago_reservations WHERE id = $1", [reservationId]);
    await pool.end();
  }
});

test("each Quantum fragrance sells from its own 50 mL pool shared across sizes", async () => {
  const quantum = rvltnOffers.filter(o => o.slug === "green-monster-2" || ["electron", "neutron", "proton", "dark-matter"].includes(o.slug));
  assert.equal(quantum.length, 5);
  for (const offer of quantum) assert.equal(offer.status, "limited");
  const sizesOf = (productId: string) => rvltnVariants.filter(v => v.productId === productId);
  const [first, second] = quantum;
  const firstVariants = sizesOf(first.productId);
  // 30 mL + 10 mL of the first fragrance leaves 10 mL of its pool...
  const unavailable = new Map([[firstVariants[3].id, 1], [firstVariants[1].id, 1]]);
  const variants = rvltnVariants.map(v => availableVariant(v, unavailable));
  assert.equal(poolRemainingMl(firstVariants[0].id, unavailable), quantumStockMl - 40);
  assert.equal(variants.find(v => v.id === firstVariants[1].id)?.remainingInventory, 1);
  assert.equal(variants.find(v => v.id === firstVariants[2].id)?.remainingInventory, 0);
  // ...without touching any other fragrance's pool or PREX2026.
  for (const other of [second, rvltnOffers[3]]) assert.equal(poolRemainingMl(sizesOf(other.productId)[0].id, unavailable), other.status === "limited" && other === second ? quantumStockMl : 500);
  const fits = [{ variantId: firstVariants[0].id, quantity: 2 }];
  assert.equal(canAddCartLines([], fits, variants), true);
  await priceCart(fits, undefined, unavailable);
  const oversell = [{ variantId: firstVariants[1].id, quantity: 2 }];
  assert.equal(canAddCartLines([], oversell, variants), false);
  await assert.rejects(() => priceCart(oversell, undefined, unavailable), /Insufficient inventory/);
  // A full 50 mL of every Quantum fragrance can be carted together, but 60 mL of one cannot.
  const everyPool = quantum.map(o => ({ variantId: sizesOf(o.productId)[3].id, quantity: 1 }));
  const fresh = rvltnVariants.map(v => availableVariant(v, new Map()));
  assert.equal(canAddCartLines([], everyPool, fresh), true);
  assert.equal(canAddCartLines([], [{ variantId: sizesOf(first.productId)[3].id, quantity: 2 }], fresh), false);
});
