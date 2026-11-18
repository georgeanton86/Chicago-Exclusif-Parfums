import { Link } from "wouter";

export default function ProductShowcase() {
  return <section className="house-wrap grid gap-8 py-16 md:grid-cols-2 md:items-center"><img src="/dreamer/dreamer-series-tdg.jpg" alt="Original Dreamer Series collection artwork" className="w-full" /><div className="p-5"><p className="eyebrow">RVLTN Parfums / Dreamer</p><h2 className="mt-4 font-serif text-5xl">Three states.<br />One collection.</h2><p className="mt-5 text-sm leading-7">Lucid State, Fever Dream and Altered Mental Status. Explore the notes behind each blend.</p><span className="sold-label mt-6">Entire series sold out</span><div><Link href="/shop#dreamer" className="house-link mt-5">Explore the archive</Link></div></div></section>;
}
