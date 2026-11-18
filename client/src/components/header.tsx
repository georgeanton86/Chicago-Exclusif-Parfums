import { Link } from "wouter";
import { useState } from "react";
import { Menu, X, ShoppingBag } from "lucide-react";
import { useShoppingCart } from "@/hooks/use-shopping-cart";
import Bag from "@/components/shopping-bag";

interface HeaderProps { cartCount?: number; onCartClick?: () => void; }
export default function Header({ cartCount, onCartClick }: HeaderProps = {}) {
  const [open, setOpen] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const cart = useShoppingCart();
  const count = cartCount ?? cart.count;
  const showBag = onCartClick ?? (() => setBagOpen(true));
  return <><header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
    <div className="house-wrap flex h-20 items-center justify-between gap-5">
      <Link href="/" aria-label="RVLTN Parfums home" className="flex items-baseline gap-3"><span className="text-3xl font-extrabold tracking-[-.08em]">RVLTN</span><span className="eyebrow !text-[9px]">Parfums</span></Link>
      <nav aria-label="Main navigation" className="hidden items-center gap-8 md:flex">
        <Link href="/shop" className="eyebrow hover:text-primary">The collection</Link>
        <a href="/#about" className="eyebrow hover:text-primary">The house</a>
        <Link href="/faq" className="eyebrow hover:text-primary">Questions</Link>
        <button onClick={showBag} className="flex items-center gap-2 text-xs" aria-label={`Open bag, ${count} items`}><ShoppingBag size={16} /> Bag ({count})</button>
      </nav>
      <button onClick={() => setOpen(!open)} className="p-2 md:hidden" aria-label={open ? "Close navigation" : "Open navigation"} aria-expanded={open}>{open ? <X size={22} /> : <Menu size={22} />}</button>
    </div>
    {open && <nav aria-label="Mobile navigation" className="house-wrap flex flex-col gap-6 border-t border-border py-7 md:hidden">
      <Link href="/shop" onClick={() => setOpen(false)} className="eyebrow">The collection</Link><a href="/#about" onClick={() => setOpen(false)} className="eyebrow">The house</a><Link href="/faq" onClick={() => setOpen(false)} className="eyebrow">Questions</Link><Link href="/policy" onClick={() => setOpen(false)} className="eyebrow">Policies</Link>
      <button onClick={() => { setOpen(false); showBag(); }} className="eyebrow text-left">Bag ({count})</button>
    </nav>}
  </header><Bag open={bagOpen} onOpenChange={setBagOpen} /></>;
}
