import { useEffect, useState } from "react";

const pad = (value: number) => String(value).padStart(2, "0");

/** Live countdown to a fixed moment. Counts from the viewer's clock, so it is correct in every time zone. */
export default function Countdown({ target, doneLabel = "The drop is live now.", compact = false }: { target: string; doneLabel?: string; compact?: boolean }) {
  const end = new Date(target).getTime();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const left = Math.max(0, end - now);
  if (!Number.isFinite(end) || left === 0) {
    return <p className={compact ? "font-serif text-2xl text-primary" : "font-serif text-4xl text-primary sm:text-6xl"}>{doneLabel}</p>;
  }
  const days = Math.floor(left / 86_400_000);
  const hours = Math.floor(left / 3_600_000) % 24;
  const minutes = Math.floor(left / 60_000) % 60;
  const seconds = Math.floor(left / 1000) % 60;
  const label = `${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds remaining`;

  return <div role="timer" aria-label={label} className={`mx-auto grid grid-cols-4 gap-px bg-border ${compact ? "w-full" : "max-w-3xl"}`}>
    {[["Days", String(days)], ["Hours", pad(hours)], ["Minutes", pad(minutes)], ["Seconds", pad(seconds)]].map(([unit, value]) =>
      <div key={unit} className={compact ? "bg-background px-1 py-4" : "bg-background px-2 py-6 sm:py-9"}>
        <p className={`font-serif tabular-nums text-primary ${compact ? "text-3xl sm:text-4xl" : "text-5xl sm:text-7xl md:text-8xl"}`} aria-hidden="true">{value}</p>
        <p className={`eyebrow !text-[9px] sm:!text-[10px] ${compact ? "mt-2" : "mt-3"}`} aria-hidden="true">{unit}</p>
      </div>)}
  </div>;
}
