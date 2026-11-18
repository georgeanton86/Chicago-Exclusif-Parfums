import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { tdgOffers, tdgSizes, tdgVariants } from "../shared/tdg";
import { dreamerOffers, dreamerVariants } from "../shared/dreamer";
import { chicagoOffers, countChicagoSets, isChicagoVariant } from "../shared/chicago";
import { shippingCentsForSubtotal } from "../shared/commerce";
import { decantPrice, decantPricePerMl } from "../shared/decant-pricing";
import { storage } from "./storage";
import { priceCart } from "./payments";

test("Archived TDG records retain stable IDs and prices without being purchasable", async () => {
  assert.equal(tdgOffers.length, 25);
  assert.equal(tdgVariants.length, 125);
  assert.equal(new Set(tdgVariants.map(v => v.id)).size, 125);
  for (const offer of tdgOffers) {
    assert.notEqual(offer.name.toLowerCase(), offer.original.toLowerCase());
    assert.ok(existsSync(`client/public${offer.imageUrl}`), `Missing image for ${offer.original}`);
    const product = await storage.getProduct(offer.productId);
    assert.equal(product?.isActive, false);
    const variants = await storage.getProductVariants(offer.productId);
    assert.equal(variants.length, 5);
    for (const [index, size] of tdgSizes.entries()) {
      assert.equal(variants[index].size, `${size} mL`);
      assert.equal(variants[index].price, decantPrice(size));
      const legacySlot = ({ 5: 0, 10: 1, 20: 2, 30: 3 } as Record<number, number>)[size];
      if (legacySlot !== undefined) {
        const oldId = `70ac0000-0000-4000-8000-${String(1000 + Number(offer.code) * 10 + legacySlot).padStart(12, "0")}`;
        assert.equal(variants[index].id, oldId, `Existing ${size} mL variant ID must remain stable`);
      }
      assert.equal(variants[index].remainingInventory, 50);
      assert.equal(variants[index].isActive, false);
      assert.equal(variants[index].totalInventory, 50);
      assert.equal(isChicagoVariant(variants[index].id), true);
    }
  }
  assert.deepEqual(tdgSizes.map(decantPrice), ["7.50", "12.00", "16.50", "20.00", "27.00"]);
  assert.deepEqual(tdgSizes.map(decantPricePerMl), ["1.50", "1.20", "1.10", "1.00", "0.90"]);
});

test("Dreamer remains visible and sold out alongside the four new blends", async () => {
  const products = await storage.getAllProducts();
  assert.equal(products.filter(p => p.isActive).length, 7);
  assert.equal(products.filter(p => !p.isActive).length, 36);
  for (const offer of dreamerOffers)
    assert.equal((await storage.getProduct(offer.productId))?.isActive, true);
  for (const variant of dreamerVariants) {
    assert.equal(isChicagoVariant(variant.id), true);
    assert.equal((await storage.getProductVariant(variant.id))?.remainingInventory, 0);
    assert.equal((await storage.getProductVariant(variant.id))?.soldCount, 0);
    assert.equal(variant.price, decantPrice(Number.parseInt(variant.size, 10)));
  }
  assert.equal(dreamerVariants.length, 15);
  for (const offer of chicagoOffers) {
    const variant = await storage.getProductVariant(offer.variantId);
    assert.equal((await storage.getProduct(offer.productId))?.isActive, false);
    assert.equal(variant?.isActive, false);
    assert.equal(variant?.price, "59.99");
    assert.equal(variant?.remainingInventory, 0);
    assert.equal(variant?.soldCount, 0, "Offline sellout must not fabricate online sales");
  }
});

test("free shipping is strictly over $50, not at $50", () => {
  assert.equal(shippingCentsForSubtotal(4999), 899);
  assert.equal(shippingCentsForSubtotal(5000), 899);
  assert.equal(shippingCentsForSubtotal(5001), 0);
});

test("server rejects every sold-out Dreamer size even for stale carts", async () => {
  for (const variant of dreamerVariants)
    await assert.rejects(priceCart([{ variantId: variant.id, quantity: 1 }], undefined, new Map()), /Insufficient inventory/);
});

test("all archived offers reject checkout without deleting historical records", async () => {
  const archived = (await storage.getAllProductVariants()).filter(v => !v.isActive);
  for (const variant of archived)
    await assert.rejects(priceCart([{ variantId: variant.id, quantity: 1 }], undefined, new Map()), /no longer available/i);
});
