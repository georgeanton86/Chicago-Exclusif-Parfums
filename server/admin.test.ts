import { strict as assert } from "node:assert";
import { test } from "node:test";
import { checkAdminPassword, summarizeOrders } from "./admin";
import { quantumSet } from "../shared/rvltn";

const id = (n: string) => `84ac0000-0000-4000-8000-000000000${n}`;

test("admin password: unset disables the page; wrong, empty and non-string values are rejected", () => {
  assert.equal(checkAdminPassword("anything", undefined), "disabled");
  assert.equal(checkAdminPassword("anything", ""), "disabled");
  assert.equal(checkAdminPassword("nope", "secret"), "wrong");
  assert.equal(checkAdminPassword("", "secret"), "wrong");
  assert.equal(checkAdminPassword(undefined, "secret"), "wrong");
  assert.equal(checkAdminPassword(["secret"], "secret"), "wrong");
  assert.equal(checkAdminPassword("secret", "secret"), "ok");
});

test("orders summary names items and totals revenue and mL, including the complete set", async () => {
  const rows = [
    { id: "o1", payment_intent_id: "pi_1", amount_cents: 22500, currency: "usd", customer_email: "a@example.com", customer_name: "A",
      items: ["502", "702", "802", "902", "602"].map(n => ({ variantId: id(n), quantity: 1 })),
      shipping: { name: "A", address: { line1: "1 Main St", city: "X", state: "MN", postal_code: "55113", country: "US" } }, created_at: "2026-11-20T19:10:00Z" },
    { id: "o2", payment_intent_id: "pi_2", amount_cents: 40000, currency: "usd", customer_email: "b@example.com", customer_name: "B",
      items: [{ variantId: quantumSet.variantId, quantity: 1 }], shipping: {}, created_at: new Date("2026-11-21T10:00:00Z") },
  ];
  const { orders, totals } = await summarizeOrders(rows);
  assert.equal(orders.length, 2);
  assert.deepEqual(orders[0].items.map(i => `${i.name} ${i.size}`), ["GREEN MONSTER 2.0 10 mL", "NEUTRON 10 mL", "PROTON 10 mL", "DARK MATTER 10 mL", "ELECTRON 10 mL"]);
  assert.equal(totals.orders, 2);
  assert.equal(totals.grossCents, 62500);
  assert.equal(totals.mlSold, 50 + 250);
  assert.equal(totals.byProduct.find(p => p.name === "PROTON")?.ml, 60);
  assert.equal(totals.byProduct.length, 5);
});

test("an unknown item does not break the summary", async () => {
  const { orders, totals } = await summarizeOrders([{ id: "o", payment_intent_id: "pi", amount_cents: 100, currency: "usd", customer_email: "c@example.com", customer_name: "C",
    items: [{ variantId: "does-not-exist", quantity: 2 }], shipping: {}, created_at: "2026-11-20T00:00:00Z" }]);
  assert.equal(orders[0].items[0].name, "Unknown item");
  assert.equal(totals.mlSold, 0);
});
