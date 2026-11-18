import Header from "@/components/header";
import Footer from "@/components/footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "wouter";
import { preorderTerms } from "@shared/rvltn";

const questions = [
  ["What is RVLTN Parfums?", "An independent fragrance house whose own blends and striking scent artwork invite exploration. The current collection features Sleep Paralysis, Green Monster, Duality and PREX2026; the sold-out Dreamer Series remains in the archive."],
  ["What does backorder / paid waitlist mean?", preorderTerms],
  ["Which blends are backorders?", "Sleep Paralysis, Green Monster and Duality are full-payment backorders. Backorder quantities are order limits, not a statement of physical stock."],
  ["What is available now?", "PREX2026 is a limited release with a total of 500 mL shared across every size. Live availability is checked across your whole cart and again before payment."],
  ["Will a mixed order ship separately?", "No. Orders containing backorders, including mixed orders with available PREX2026 items, ship together when all items are ready. There is no confirmed restock or shipping date for backorders."],
  ["Which sizes and prices can I choose?", "5 mL is $22.50; 10 mL is $45; 20 mL is $85; 30 mL is $120. These are fragrance decants. The original artwork is displayed unchanged and does not promise the illustrated retail bottle packaging."],
  ["What does Duality smell like?", "Duality explores light and darkness. Its scent notes have not yet been published."],
  ["Can I purchase the Dreamer Series?", "No. Lucid State, Fever Dream and Altered Mental Status are all sold out. No sizes are available for purchase."],
  ["What makes up the Dreamer Series?", "Three blends: Lucid State, Fever Dream and Altered Mental Status. Each has its own mood and scent profile. The collection archive preserves their artwork and top, heart and base notes."],
  ["When will Dreamer be available again?", "There is no announced restock date. The collection is shown as sold out."],
  ["Where can I read the scent notes?", "Published notes appear alongside each blend’s original artwork in the shop. Duality’s notes have not yet been published. The Dreamer archive retains the original three scent profiles."],
  ["Where can I find order policies?", "Our policies page contains the terms and return policy. For questions about an existing purchase, use the contact information included with your order."],
];
export default function FAQ() {
  return <div className="min-h-[100dvh]"><Header /><main className="house-wrap pb-24 pt-36"><p className="eyebrow text-primary">RVLTN Parfums / Useful details</p><h1 className="mt-5 font-serif text-6xl sm:text-8xl">A little clarity.</h1><div className="mt-14 max-w-3xl"><Accordion type="single" collapsible>{questions.map(([title, answer], i) => <AccordionItem key={title} value={String(i)}><AccordionTrigger className="py-6 text-left text-sm">{title}</AccordionTrigger><AccordionContent className="max-w-2xl text-sm leading-7 text-muted-foreground">{answer}</AccordionContent></AccordionItem>)}</Accordion><div className="mt-10 flex flex-wrap gap-8"><Link href="/shop" className="house-link">The collection</Link><Link href="/policy" className="house-link">Order policies</Link></div></div></main><Footer /></div>;
}
