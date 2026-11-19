import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Product } from "@shared/schema";
import { dreamerOffers } from "@shared/dreamer";

interface ProductDetailModalProps { product: Product | null; offerSlug?: string | null; isOpen: boolean; onClose: () => void; }
export default function ProductDetailModal({ product, offerSlug, isOpen, onClose }: ProductDetailModalProps) {
  const offer = dreamerOffers.find(item => item.slug === offerSlug || item.productId === product?.id);
  if (!offer) return null;
  return <Dialog open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="max-h-[90dvh] max-w-4xl overflow-y-auto rounded-none border-border bg-background p-0 text-foreground">
      <div className="grid md:grid-cols-2"><div className="relative bg-warm-gray"><img src={offer.imageUrl} alt={`${offer.name} Dreamer Series artwork`} className="h-full max-h-[600px] min-h-[240px] w-full object-contain" /><span className="sold-label absolute left-4 top-4">Sold out</span></div>
      <div className="p-6 sm:p-10"><DialogHeader className="text-left"><p className="eyebrow">Chicago Exclusif Parfums / Dreamer {offer.number}</p><DialogTitle className="mt-4 font-serif text-4xl font-normal">{offer.name.toLowerCase()}</DialogTitle><DialogDescription className="text-primary">{offer.mood}</DialogDescription></DialogHeader>
      <p className="mt-6 text-sm leading-7 text-muted-foreground">{offer.description}</p><p className="mt-6 text-xs leading-6">{offer.scentProfile}</p>
      <dl className="mt-5"><div className="note-line"><dt className="eyebrow !text-[9px]">Top</dt><dd>{offer.topNotes}</dd></div><div className="note-line"><dt className="eyebrow !text-[9px]">Heart</dt><dd>{offer.middleNotes}</dd></div><div className="note-line"><dt className="eyebrow !text-[9px]">Base</dt><dd>{offer.baseNotes}</dd></div></dl>
      <div className="mt-7 border border-primary p-4"><p className="eyebrow text-primary">Dreamer Series — Sold out</p><p className="mt-2 text-xs leading-6">This fragrance remains in the collection archive. No sizes are available for purchase.</p></div>
      </div></div>
    </DialogContent>
  </Dialog>;
}
