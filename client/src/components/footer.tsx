import { Link } from "wouter";

export default function Footer() {
  return <footer className="border-t border-border bg-warm-gray">
    <div className="house-wrap grid gap-10 py-14 md:grid-cols-[1.5fr_1fr]">
      <div><Link href="/" className="font-serif text-3xl uppercase tracking-[.14em] sm:text-4xl">Chicago Exclusif <span className="eyebrow ml-2 align-middle">Parfums</span></Link><p className="mt-5 font-serif text-3xl">Because you can’t wear the bottle.</p><p className="eyebrow mt-5">Independent fragrance house</p></div>
      <div className="flex flex-wrap gap-x-10 gap-y-5 self-end text-xs"><Link href="/shop" className="house-link">The collection</Link><Link href="/faq" className="house-link">Questions</Link><Link href="/policy" className="house-link">Policies</Link></div>
    </div>
    <div className="house-wrap flex flex-wrap justify-between gap-3 border-t border-border py-6"><p className="eyebrow !text-[9px]">© {new Date().getFullYear()} Chicago Exclusif Parfums</p><p className="eyebrow !text-[9px]">New perspectives / Dreamer remains sold out</p></div>
  </footer>;
}
