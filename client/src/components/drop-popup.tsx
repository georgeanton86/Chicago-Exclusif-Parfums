import { useEffect, useState } from "react";
import { nextDropLabel } from "@shared/rvltn";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Shown once per visit (browser session), so returning visitors see the code again.
const seenKey = "cep-next-series-popup-v2";
export const nextSeriesCode = "25ORION";

export default function DropPopup() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem(seenKey) === "1"; } catch { /* storage may be blocked */ }
    if (seen) return;
    const timer = window.setTimeout(() => setOpen(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  const close = (next: boolean) => {
    setOpen(next);
    if (!next) { try { sessionStorage.setItem(seenKey, "1"); } catch { /* ignore */ } }
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(nextSeriesCode); setCopied(true); } catch { setCopied(false); }
  };

  return <Dialog open={open} onOpenChange={close}>
    <DialogContent className="max-w-md border-border bg-background text-center">
      <DialogHeader className="items-center text-center sm:text-center">
        <p className="eyebrow text-primary">The Quantum Series sold out in 72 hours</p>
        <DialogTitle className="mt-3 font-serif text-4xl font-normal leading-tight">The next series drops {nextDropLabel}.</DialogTitle>
        <DialogDescription className="mt-3 text-sm leading-7 text-muted-foreground">
          Rarely does a series last long enough to buy. Be ready, and use this code for an exclusive 25% off when it drops.
        </DialogDescription>
      </DialogHeader>
      <div className="my-2 border border-primary px-6 py-5">
        <p className="eyebrow !text-[9px]">Your exclusive code</p>
        <p className="mt-2 font-serif text-5xl tracking-[.12em] text-primary" aria-label="Discount code 25 ORION">{nextSeriesCode}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button type="button" className="house-button" onClick={copy}>{copied ? "Copied" : "Copy code"}</button>
        <button type="button" className="house-link self-center" onClick={() => close(false)}>Close</button>
      </div>
    </DialogContent>
  </Dialog>;
}
