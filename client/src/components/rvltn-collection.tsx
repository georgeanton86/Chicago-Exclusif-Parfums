import { useState } from "react";
import { rvltnOffers, rvltnSizes, rvltnPrices, rvltnVariants, preorderTerms, soldOutSlugs, quantumSet } from "@shared/rvltn";
import { inventoryLimit } from "@shared/cart-inventory";
import { useShoppingCart } from "@/hooks/use-shopping-cart";

function Offer({ offer, index }: { offer: typeof rvltnOffers[number]; index: number }) {
  const [size, setSize] = useState<number>(5);
  const [added, setAdded] = useState(false);
  const cart = useShoppingCart();
  const id = rvltnVariants.find(v => v.productId === offer.productId && parseInt(v.size, 10) === size)?.id;
  const variant = cart.variants.data?.find(v => v.id === id);
  const available = inventoryLimit(variant) > 0;
  const soldOut = soldOutSlugs.has(offer.slug);
  const backorder = offer.status === "backorder" && !soldOut;
  return <article id={offer.slug} className="archive-row">
    <div className="archive-art"><img src={offer.imageUrl} alt={`${offer.name} original fragrance artwork`} className="offer-art" style={{ aspectRatio: "auto", objectFit: "contain" }} loading="lazy" /></div>
    <div>
      <p className="eyebrow text-primary">Chicago Exclusif / {String(index + 1).padStart(2, "0")} — {soldOut ? "Sold out" : backorder ? "Backorder · paid waitlist" : "Limited release · available stock"}</p>
      {soldOut && <span className="sold-label mt-4 inline-block">Sold out</span>}
      <h2 className="mt-5 font-serif text-5xl sm:text-6xl">{offer.name}</h2>
      <p className="my-6 max-w-xl text-sm leading-7 text-muted-foreground">{offer.description}</p>
      {offer.topNotes ? <div>{[["Top", offer.topNotes], ["Heart", offer.middleNotes], ["Base", offer.baseNotes]].map(([label, notes]) => <div key={label} className="note-line"><span className="eyebrow">{label}</span><p>{notes}</p></div>)}</div> : <p className="border-y border-border py-4 text-sm">Scent notes have not yet been published.</p>}
      <div className="mt-7 flex flex-wrap gap-2" role="group" aria-label={`${offer.name} size`}>{rvltnSizes.map(value => <button key={value} className="size-choice" aria-pressed={size === value} onClick={() => { setSize(value); setAdded(false); }}>{value} mL</button>)}</div>
      <div className="mt-5 flex flex-wrap items-center gap-5"><span className="font-serif text-3xl">${rvltnPrices[rvltnSizes.indexOf(size as typeof rvltnSizes[number])]}</span><button className="house-button" disabled={!available || cart.variants.isError || cart.products.isError || cart.products.isLoading} onClick={() => { if (id && cart.add(id, 1)) setAdded(true); }}>{soldOut ? "Sold out" : cart.variants.isLoading ? "Checking availability…" : !available ? backorder ? "Waitlist unavailable" : "Unavailable" : backorder ? "Add paid backorder" : "Add to bag"}</button></div>
      <p role="status" className="mt-3 text-sm">{added ? "Added to your bag. Open Bag above to review." : cart.error}</p>
      <div className="mt-5 border-l-2 border-primary pl-4 text-xs leading-6 text-muted-foreground">{soldOut ? "This release has sold out and is no longer available." : backorder ? preorderTerms : <>{variant?.sharedRemainingMl !== undefined ? `${variant.sharedRemainingMl} mL currently available across all sizes. ` : `${(offer as { stockMl?: number }).stockMl ?? 500} mL total release, shared across all sizes. `}Stock is checked again at checkout.</>}</div>
      <p className="mt-3 text-xs leading-6 text-muted-foreground">Sold as a fragrance decant. Supplied artwork is presented unchanged; it is not a promise of retail bottle packaging.</p>
    </div>
  </article>;
}
function QuantumSet() {
  const [added, setAdded] = useState(false);
  const cart = useShoppingCart();
  const variant = cart.variants.data?.find(v => v.id === quantumSet.variantId);
  const soldOut = soldOutSlugs.has(quantumSet.slug);
  const available = !soldOut && inventoryLimit(variant) > 0;
  return <article id={quantumSet.slug} className="archive-row">
    <div className="archive-art"><img src={quantumSet.imageUrl} alt="The Quantum Series complete set artwork" className="offer-art" style={{ aspectRatio: "auto", objectFit: "contain" }} loading="lazy" /></div>
    <div>
      <p className="eyebrow text-primary">Chicago Exclusif / Complete set · Sold out</p>
      {soldOut && <span className="sold-label mt-4 inline-block">Sold out</span>}
      <h2 className="mt-5 font-serif text-5xl sm:text-6xl">The Quantum Series</h2>
      <p className="my-6 max-w-xl text-sm leading-7 text-muted-foreground">{quantumSet.description}</p>
      <div className="mt-5 flex flex-wrap items-center gap-5"><span className="font-serif text-3xl">${Number(quantumSet.price).toFixed(0)}</span><button className="house-button" disabled={!available || cart.variants.isError || cart.products.isError || cart.products.isLoading} onClick={() => { if (cart.add(quantumSet.variantId, 1)) setAdded(true); }}>{soldOut ? "Sold out" : cart.variants.isLoading ? "Checking availability…" : available ? "Add the complete set" : "Set unavailable"}</button></div>
      <p role="status" className="mt-3 text-sm">{added ? "Added to your bag. Open Bag above to review." : cart.error}</p>
      <div className="mt-5 border-l-2 border-primary pl-4 text-xs leading-6 text-muted-foreground">{soldOut ? "The Quantum Series has sold out. Every bottle has been claimed." : "Five 50 mL bottles: Proton, Neutron, Electron, Dark Matter and Green Monster 2.0. Stock is checked again at checkout."}</div>
    </div>
  </article>;
}
export default function RvltnCollection() {
  const cart = useShoppingCart();
  // Live releases first; sold-out releases follow.
  const offers = [...rvltnOffers].sort((a, b) => Number(soldOutSlugs.has(a.slug)) - Number(soldOutSlugs.has(b.slug)));
  return <div>
    {(cart.variants.isError || cart.products.isError) && <div role="alert" className="mb-8 border border-primary p-5 text-sm">Live availability could not load. Explore the artwork below, or <button className="house-link" onClick={() => { void cart.variants.refetch(); void cart.products.refetch(); }}>Retry availability</button>.</div>}
    <QuantumSet />
    {offers.map((offer, index) => <Offer key={offer.slug} offer={offer} index={index} />)}
  </div>;
}
