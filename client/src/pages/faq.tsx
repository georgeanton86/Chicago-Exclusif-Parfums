import Header from "@/components/header";
import Footer from "@/components/footer";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Link } from "wouter";
import { preorderTerms } from "@shared/rvltn";

const questions = [
  ["What is Chicago Exclusif Parfums?", "An independent fragrance house whose own blends and striking scent artwork invite exploration. Every series has sold out, including the Quantum Series, and the archive keeps the artwork."],
  ["What does backorder / paid waitlist mean?", preorderTerms],
  ["Which blends have sold out?", "Dreamer, Sleep Paralysis, Green Monster, Duality, PREX2026 and the Quantum Series have all sold out and cannot be purchased."],
  ["What is available now?", "Nothing right now. Every series has sold out, including the Quantum Series. The next series is coming. Use code 25ORION for 25% off when it drops."],
  ["Will a mixed order ship separately?", "No. Your order ships together."],
  ["Which sizes and prices can I choose?", "5 mL is $22.50; 10 mL is $45; 20 mL is $85; 30 mL is $120. These are fragrance decants. The original artwork is displayed unchanged and does not promise the illustrated retail bottle packaging."],
  ["What does Duality smell like?", "Duality explores light and darkness. Its scent notes have not yet been published."],
  ["Can I purchase the Dreamer Series?", "No. Lucid State, Fever Dream and Altered Mental Status are all sold out. No sizes are available for purchase."],
  ["What makes up the Dreamer Series?", "Three blends: Lucid State, Fever Dream and Altered Mental Status. Each has its own mood and scent profile. The collection archive preserves their artwork and top, heart and base notes."],
  ["When will Dreamer be available again?", "There is no announced restock date. The collection is shown as sold out."],
  ["Where can I read the scent notes?", "Published notes appear alongside each blend’s original artwork in the shop. Duality’s notes have not yet been published. The Dreamer archive retains the original three scent profiles."],
  ["Where can I find order policies?", "Our policies page contains the terms and return policy. For questions about an existing purchase, use the contact information included with your order."],
];
export default function FAQ() {
  return <div className="min-h-[100dvh]"><Header /><main className="house-wrap pb-24 pt-36"><p className="eyebrow text-primary">Chicago Exclusif Parfums / Useful details</p><h1 className="mt-5 font-serif text-6xl sm:text-8xl">A little clarity.</h1><div className="mt-14 max-w-3xl"><Accordion type="single" collapsible>{questions.map(([title, answer], i) => <AccordionItem key={title} value={String(i)}><AccordionTrigger className="py-6 text-left text-sm">{title}</AccordionTrigger><AccordionContent className="max-w-2xl text-sm leading-7 text-muted-foreground">{answer}</AccordionContent></AccordionItem>)}</Accordion><div className="mt-10 flex flex-wrap gap-8"><Link href="/shop" className="house-link">The collection</Link><Link href="/policy" className="house-link">Order policies</Link></div></div></main><Footer /></div>;
}
