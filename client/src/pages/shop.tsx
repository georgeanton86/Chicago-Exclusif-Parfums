import Header from "@/components/header";
import Footer from "@/components/footer";
import RvltnCollection from "@/components/rvltn-collection";
import { DreamerCollection } from "@/components/catalog-collections";

export default function Shop() {
  return <div className="min-h-[100dvh]"><Header /><main>
    <section className="border-b border-border bg-warm-gray"><div className="house-wrap pb-14 pt-36 md:pb-20 md:pt-44"><p className="eyebrow">RVLTN Parfums / Independent fragrance house</p><h1 className="mt-8 font-serif text-6xl leading-[.95] sm:text-8xl">Follow the art.<br /><i>Find your scent.</i></h1><p className="mt-7 max-w-xl text-sm leading-7 text-muted-foreground">Four blends. Four distinct worlds. Sleep Paralysis, Green Monster and Duality are full-payment backorders with no confirmed restock or shipping date. PREX2026 is a limited 500 mL release, shared across all sizes.</p><a className="house-link mt-6" href="#dreamer">Visit the sold-out Dreamer archive</a></div></section>
    <div className="house-wrap py-10 md:py-16"><RvltnCollection /><section id="dreamer" className="pt-16"><p className="eyebrow text-primary">The archive / Dreamer Series — sold out</p><h2 className="my-6 font-serif text-5xl">Three states. One Dreamer.</h2><DreamerCollection /></section></div>
  </main><Footer /></div>;
}
