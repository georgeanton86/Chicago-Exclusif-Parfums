import { Link } from "wouter";
import { ShoppingBag as BagIcon, Minus, Plus, X } from "lucide-react";
import { useShoppingCart } from "@/hooks/use-shopping-cart";
import { isPreorderVariant, preorderTerms, quantumSet, rvltnOffers } from "@shared/rvltn";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

export default function ShoppingBag({ open, onOpenChange }: { open: boolean; onOpenChange: (value: boolean) => void }) {
  const cart = useShoppingCart();
  const hasPreorder = cart.cart.some(line => isPreorderVariant(line.variantId));
  const loading = cart.products.isLoading || cart.variants.isLoading;
  const failed = cart.products.isError || cart.variants.isError;
  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent className="flex w-full max-w-[100vw] min-w-0 flex-col overflow-y-auto break-words sm:max-w-lg"><SheetHeader><p className="eyebrow text-primary">Chicago Exclusif Parfums</p><SheetTitle className="font-serif text-4xl font-normal">Your bag ({cart.count})</SheetTitle><SheetDescription className="sr-only">Review fragrance sizes, quantities, availability and preorder terms before checkout.</SheetDescription></SheetHeader>
    {!cart.cart.length ? <div className="my-12 border-y border-border py-12"><BagIcon size={28} /><h2 className="mt-6 font-serif text-3xl">A new perspective awaits.</h2><p className="mt-4 text-sm leading-7">Explore our blends through their artwork and notes.</p><Link href="/shop" onClick={() => onOpenChange(false)} className="house-link mt-4">Explore the collection</Link></div> : <>
      {loading ? <div role="status" aria-label="Loading bag" className="my-8 h-40 animate-pulse bg-warm-gray" /> : failed ? <div role="alert" className="my-8 text-sm">Your saved bag is intact. Availability could not load.<button className="house-link" onClick={() => { void cart.products.refetch(); void cart.variants.refetch(); }}>Retry</button></div> : <div className="mt-6 divide-y divide-border">{cart.lines.map(line => {
        const offer = rvltnOffers.find(o => o.productId === line.variant?.productId);
        const backorder = isPreorderVariant(line.variantId);
        return <div key={line.variantId} className="py-6"><div className="flex justify-between gap-4"><div><h3 className="font-serif text-2xl">{line.product?.name || "Unavailable item"}</h3><p className="eyebrow mt-2 text-primary">{backorder ? "Backorder · paid waitlist" : offer ? `${offer.name} · available stock` : line.variant?.productId === quantumSet.productId ? "Quantum Series · complete set" : "Archive · unavailable"}</p></div><button aria-label={`Remove ${line.product?.name || "item"}`} className="self-start p-2" onClick={() => cart.remove(line.variantId)}><X size={16} /></button></div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3"><label className="text-xs">Size <select aria-label={`${line.product?.name} size`} className="ml-2 border border-border bg-transparent p-2" value={line.variantId} onChange={e => cart.change(line.variantId, e.target.value, line.quantity)}>{line.variant ? cart.variants.data?.filter(v => v.productId === line.variant?.productId).map(v => <option key={v.id} value={v.id}>{v.size} — ${v.price}</option>) : <option value={line.variantId}>Unavailable</option>}</select></label><span className="text-sm">${(Number(line.variant?.price || 0) * line.quantity).toFixed(2)}</span></div>
          <div className="mt-4 flex items-center gap-4"><button className="size-choice" disabled={line.quantity <= 1} aria-label={`Decrease ${line.product?.name} quantity`} onClick={() => cart.change(line.variantId, line.variantId, line.quantity - 1)}><Minus size={12} /></button><span className="text-sm" aria-label="Quantity">{line.quantity}</span><button className="size-choice" aria-label={`Increase ${line.product?.name} quantity`} onClick={() => cart.change(line.variantId, line.variantId, line.quantity + 1)}><Plus size={12} /></button></div>
        </div>;
      })}</div>}
      {cart.error && <p role="alert" className="mt-4 text-sm text-primary">{cart.error}</p>}
      {cart.stockChanged && !loading && <div role="alert" className="my-4 border border-primary p-4 text-sm">Availability changed. Backorder limits and pooled limited-release stock are checked across your bag.<button onClick={cart.reconcile} className="house-link">Update bag to availability</button></div>}
      {hasPreorder && <div className="my-5 border-l-2 border-primary pl-4 text-xs leading-6"><p>{preorderTerms}</p><p className="mt-3 font-semibold">Orders containing backorders, including mixed orders with limited-release items, ship together when all items are ready.</p></div>}
      <div className="mt-auto border-t border-border pt-6"><div className="flex justify-between font-serif text-3xl"><span>Subtotal</span><span>${cart.total.toFixed(2)}</span></div><p className="my-4 text-xs leading-6">Shipping and any applicable discounts are calculated at checkout.</p>{!loading && !failed && !cart.stockChanged && cart.lines.every(line => line.variant && line.product) ? <Link className="house-button w-full" href="/checkout" onClick={() => onOpenChange(false)}>Secure checkout</Link> : <button disabled className="house-button w-full">Review availability to continue</button>}</div>
    </>}
  </SheetContent></Sheet>;
}
