import { useState } from "react";
import { dreamerOffers } from "@shared/dreamer";
import { ArrowUpRight } from "lucide-react";
import ProductDetailModal from "@/components/product-detail-modal";

export function DreamerCollection() {
  const [selected, setSelected] = useState<string | null>(null);
  return <section id="dreamer" className="scroll-mt-24">
    <div className="flex flex-wrap items-end justify-between gap-5 pb-10"><div><p className="eyebrow">RVLTN Parfums / Collection 01</p><h2 className="mt-4 font-serif text-5xl sm:text-7xl">The Dreamer Series</h2></div><span className="sold-label">Entire series sold out</span></div>
    {dreamerOffers.map(offer => <article key={offer.slug} id={offer.slug} className="archive-row">
      <div className="archive-art"><img src={offer.imageUrl} alt={`${offer.name} — original Dreamer Series artwork`} style={{ objectFit: "contain" }} loading="lazy" /><span className="sold-label absolute left-4 top-4">Sold out</span><span className="absolute bottom-4 left-4 bg-background px-3 py-2 font-mono text-[10px] tracking-widest">DREAMER / {offer.number}</span></div>
      <div><p className="eyebrow text-primary">{offer.number} / {offer.mood}</p><h3 className="mt-4 max-w-lg font-serif text-5xl leading-[1.02] sm:text-6xl">{offer.name.toLowerCase()}</h3><p className="mt-6 max-w-lg text-sm leading-7 text-muted-foreground">{offer.description}</p>
        <dl className="mt-7"><div className="note-line"><dt className="eyebrow !text-[9px]">Top</dt><dd>{offer.topNotes}</dd></div><div className="note-line"><dt className="eyebrow !text-[9px]">Heart</dt><dd>{offer.middleNotes}</dd></div><div className="note-line"><dt className="eyebrow !text-[9px]">Base</dt><dd>{offer.baseNotes}</dd></div></dl>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4"><button onClick={() => setSelected(offer.slug)} className="house-link" data-testid={`details-${offer.slug}`}>Explore the scent <ArrowUpRight size={16} /></button><span className="eyebrow text-primary">Not available for purchase</span></div>
      </div>
    </article>)}
    <ProductDetailModal product={null} offerSlug={selected} isOpen={Boolean(selected)} onClose={() => setSelected(null)} />
  </section>;
}
