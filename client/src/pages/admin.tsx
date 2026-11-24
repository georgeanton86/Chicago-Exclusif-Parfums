import { useCallback, useEffect, useState } from "react";

type Shipping = { name?: string; address?: { line1?: string; line2?: string; city?: string; state?: string; postal_code?: string; country?: string } };
type Order = {
  id: string; paymentIntentId: string; createdAt: string; amountCents: number; currency: string;
  customerName: string; customerEmail: string; shipping: Shipping;
  items: { name: string; size: string; quantity: number; backorder: boolean }[];
};
type Data = { orders: Order[]; totals: { orders: number; grossCents: number; mlSold: number; byProduct: { name: string; ml: number; units: number }[] } };

const storageKey = "cep-admin-password";
const money = (cents: number) => `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function addressLines(shipping: Shipping): string[] {
  const a = shipping?.address ?? {};
  return [shipping?.name, a.line1, a.line2, [a.city, a.state, a.postal_code].filter(Boolean).join(" "), a.country].filter((line): line is string => Boolean(line));
}

export default function Admin() {
  const [password, setPassword] = useState(() => { try { return sessionStorage.getItem(storageKey) ?? ""; } catch { return ""; } });
  const [input, setInput] = useState("");
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState("");

  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots"; meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    return () => { document.head.removeChild(meta); };
  }, []);

  const load = useCallback(async (pw: string) => {
    if (!pw) return;
    setLoading(true); setError("");
    try {
      const response = await fetch("/api/admin/orders", { headers: { "x-admin-password": pw }, cache: "no-store" });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setData(null);
        if (response.status === 401) { setPassword(""); try { sessionStorage.removeItem(storageKey); } catch { /* ignore */ } }
        throw new Error(body.message || "Could not load orders.");
      }
      setData(body as Data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load orders.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!password) return;
    void load(password);
    const timer = window.setInterval(() => void load(password), 60_000);
    return () => window.clearInterval(timer);
  }, [password, load]);

  const signIn = (event: React.FormEvent) => {
    event.preventDefault();
    try { sessionStorage.setItem(storageKey, input); } catch { /* ignore */ }
    setPassword(input); setInput("");
  };
  const copyAddress = async (order: Order) => {
    try { await navigator.clipboard.writeText(addressLines(order.shipping).join("\n")); setCopied(order.id); window.setTimeout(() => setCopied(""), 1500); } catch { /* ignore */ }
  };

  if (!password) {
    return <main className="mx-auto flex min-h-[100dvh] max-w-sm flex-col justify-center px-6">
      <p className="eyebrow text-primary">Chicago Exclusif Parfums</p>
      <h1 className="mt-4 font-serif text-4xl">Orders</h1>
      <form onSubmit={signIn} className="mt-8 space-y-4">
        <label htmlFor="admin-password" className="eyebrow block">Password</label>
        <input id="admin-password" type="password" autoComplete="current-password" autoFocus value={input} onChange={e => setInput(e.target.value)}
          className="w-full border border-border bg-transparent p-3 text-base" />
        {error && <p role="alert" className="text-sm text-[#edaaa0]">{error}</p>}
        <button type="submit" className="house-button w-full" disabled={!input}>Open orders</button>
      </form>
    </main>;
  }

  return <main className="house-wrap py-10 md:py-16">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="eyebrow text-primary">Chicago Exclusif Parfums</p><h1 className="mt-2 font-serif text-5xl">Orders</h1></div>
      <div className="flex gap-3">
        <button type="button" className="house-button" onClick={() => void load(password)} disabled={loading}>{loading ? "Refreshing…" : "Refresh"}</button>
        <button type="button" className="house-link" onClick={() => { setPassword(""); setData(null); try { sessionStorage.removeItem(storageKey); } catch { /* ignore */ } }}>Sign out</button>
      </div>
    </div>
    {error && <p role="alert" className="mt-6 text-sm text-[#edaaa0]">{error}</p>}
    {data && <>
      <div className="mt-10 grid gap-px bg-border sm:grid-cols-3">
        {[["Orders", String(data.totals.orders)], ["Revenue", money(data.totals.grossCents)], ["mL sold", data.totals.mlSold.toLocaleString("en-US")]].map(([label, value]) =>
          <div key={label} className="bg-background p-6"><p className="eyebrow !text-[10px]">{label}</p><p className="mt-2 font-serif text-5xl text-primary">{value}</p></div>)}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">Revenue is what customers paid, including shipping. Refunds and Stripe fees are not subtracted here; check Stripe for those.</p>
      {data.totals.byProduct.length > 0 && <section className="mt-10">
        <h2 className="eyebrow text-primary">Sold by fragrance</h2>
        <div className="mt-4 divide-y divide-border border-y border-border">
          {data.totals.byProduct.map(row => <div key={row.name} className="flex items-baseline justify-between gap-4 py-3 text-sm"><span>{row.name}</span><span className="text-muted-foreground">{row.units} {row.units === 1 ? "bottle" : "bottles"} · <span className="text-foreground">{row.ml.toLocaleString("en-US")} mL</span></span></div>)}
        </div>
      </section>}
      <section className="mt-12">
        <h2 className="eyebrow text-primary">All orders · newest first</h2>
        {data.orders.length === 0 && <p className="mt-6 text-sm text-muted-foreground">No orders yet.</p>}
        <div className="mt-4 space-y-px bg-border">
          {data.orders.map(order => <article key={order.id} className="bg-background p-5 md:p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-serif text-3xl text-primary">{money(order.amountCents)}</p>
              <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
            </div>
            <div className="mt-4 grid gap-6 md:grid-cols-2">
              <div>
                <p className="eyebrow !text-[10px]">Items</p>
                <ul className="mt-2 space-y-1 text-sm">{order.items.map((item, index) => <li key={index}>{item.quantity} × {item.name} <span className="text-muted-foreground">{item.size}</span>{item.backorder && <span className="ml-2 text-primary">backorder</span>}</li>)}</ul>
              </div>
              <div>
                <p className="eyebrow !text-[10px]">Ship to</p>
                <p className="mt-2 whitespace-pre-line text-sm">{addressLines(order.shipping).join("\n")}</p>
                <p className="mt-2 text-sm"><a className="house-link" href={`mailto:${order.customerEmail}`}>{order.customerEmail}</a></p>
                <button type="button" className="house-link mt-3 text-xs" onClick={() => void copyAddress(order)}>{copied === order.id ? "Copied" : "Copy address"}</button>
              </div>
            </div>
            <p className="mt-4 break-all text-[10px] text-muted-foreground">Stripe payment {order.paymentIntentId}</p>
          </article>)}
        </div>
      </section>
    </>}
  </main>;
}
