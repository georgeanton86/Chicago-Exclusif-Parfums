import { Link } from "wouter";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function NotFound() {
  return <div className="min-h-[100dvh]"><Header /><main className="house-wrap py-40"><p className="eyebrow text-primary">RVLTN Parfums / 404</p><h1 className="mt-7 font-serif text-6xl sm:text-8xl">A little off course.</h1><p className="mt-7 max-w-md text-sm leading-7 text-muted-foreground">This page isn’t here. The Dreamer archive is still waiting.</p><Link href="/shop" className="house-link mt-7">Return to the collection</Link></main><Footer /></div>;
}
