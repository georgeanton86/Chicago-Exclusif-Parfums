import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { Loader2, CheckCircle } from "lucide-react";
import type { Product, ProductVariant } from "@shared/schema";
import { chicagoSetDiscountCents, countChicagoSets, isChicagoVariant } from "@shared/chicago";
import { cartMatchesInventory, inventoryLimit, reconcileCart } from "@shared/cart-inventory";
import { fetchCheckoutInventory } from "@/lib/checkout-inventory";
import { isPreorderVariant, preorderTerms, preorderTermsVersion } from "@shared/rvltn";
import { cartPricing, parsePromoCodes } from "@shared/promotions";

interface CartItem {
  variant: ProductVariant;
  product: Product;
  quantity: number;
}

const checkoutDraftKey = "stripeCheckoutDraft";

type DeliveryAddress = {
  line1: string; line2: string; city: string; state: string; postal_code: string; country: string;
};

type CheckoutDraft = {
  checkoutKey: string;
  customerName: string;
  customerEmail: string;
  address: DeliveryAddress;
  policyAcknowledged: boolean;
  decantAcknowledged: boolean;
  preorderAcknowledged?: boolean;
  preorderTermsVersion?: string;
};

function readCheckoutDraft(checkoutKey: string): CheckoutDraft | null {
  const saved = sessionStorage.getItem(checkoutDraftKey);
  if (!saved) return null;
  try {
    const draft = JSON.parse(saved) as CheckoutDraft;
    const address = draft?.address;
    if (draft.checkoutKey === checkoutKey &&
      typeof draft.customerName === "string" && typeof draft.customerEmail === "string" &&
      typeof draft.policyAcknowledged === "boolean" && typeof draft.decantAcknowledged === "boolean" &&
      address && ["line1", "line2", "city", "state", "postal_code", "country"]
        .every(key => typeof address[key as keyof DeliveryAddress] === "string")) {
      return draft;
    }
  } catch {
    // Discard invalid or obsolete browser data.
  }
  sessionStorage.removeItem(checkoutDraftKey);
  return null;
}

function CheckoutForm({ total, clientSecret, onSuccess }: {
  total: number; clientSecret: string; onSuccess: (result: any) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paidIntentId, setPaidIntentId] = useState<string | null>(null);

  const confirmOrder = async (paymentIntentId: string) => {
    const response = await apiRequest("POST", "/api/complete-stripe-payment", {
      paymentIntentId, clientSecret,
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message || "Could not confirm order");
    onSuccess(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    let paymentCaptured = Boolean(paidIntentId);

    try {
      if (paidIntentId) {
        await confirmOrder(paidIntentId);
        return;
      }
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/checkout",
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      if (paymentIntent && paymentIntent.status === 'succeeded') {
        paymentCaptured = true;
        setPaidIntentId(paymentIntent.id);
        await confirmOrder(paymentIntent.id);
      } else {
        toast({ title: "Payment pending", description: "Please wait for payment confirmation." });
        setIsProcessing(false);
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      toast({
        title: "Order Error",
        description: paymentCaptured
          ? "Your payment succeeded, but we could not confirm the order. Retry confirmation; do not pay again."
          : err.message || "Something went wrong. Please contact support.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        size="lg"
        data-testid="button-submit-payment"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          paidIntentId ? "Retry order confirmation" : `Pay $${total.toFixed(2)}`
        )}
      </Button>
    </form>
  );
}

export default function StripeCheckout() {
  const [clientSecret, setClientSecret] = useState("");
  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null);
  const [total, setTotal] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [checkoutKey, setCheckoutKey] = useState("");
  const [, setLocation] = useLocation();
  const [showSuccess, setShowSuccess] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [isLoadingCart, setIsLoadingCart] = useState(true);
  const [isPreparing, setIsPreparing] = useState(false);
  const [error, setError] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [policyAcknowledged, setPolicyAcknowledged] = useState(false);
  const [decantAcknowledged, setDecantAcknowledged] = useState(false);
  const [preorderAcknowledged, setPreorderAcknowledged] = useState(false);
  const [address, setAddress] = useState({
    line1: "", line2: "", city: "", state: "", postal_code: "", country: "US",
  });
  const restoredKey = useRef("");

  const finishOrder = (data: any) => {
    localStorage.removeItem("checkoutCart");
    window.dispatchEvent(new Event("rvltn-cart"));
    sessionStorage.removeItem(checkoutDraftKey);
    sessionStorage.setItem("checkoutConfirmation", JSON.stringify(data));
    window.history.replaceState({}, "", "/checkout?order=success");
    setOrderData(data);
    setShowSuccess(true);
    void queryClient.invalidateQueries({ queryKey: ["/api/product-variants"] });
  };

  const { data: products, isError: productsError, refetch: refetchProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: variants, isError: stockError, refetch: refetchStock } = useQuery<ProductVariant[]>({
    queryKey: ["checkout-availability", checkoutKey],
    queryFn: () => fetchCheckoutInventory(checkoutKey),
    enabled: Boolean(checkoutKey) && !clientSecret && !showSuccess,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });
  const lines = cartItems.map(item => ({ ...item, variantId: item.variant.id }));
  const stockChanged = Boolean(variants && !cartMatchesInventory(lines, variants));
  const hasChicagoDecant = cartItems.some(item => isChicagoVariant(item.variant.id));
   const hasPreorder = cartItems.some(item => isPreorderVariant(item.variant.id));
   const hasAvailableItems = cartItems.some(item => !isPreorderVariant(item.variant.id));
  const setCount = countChicagoSets(cartItems.map(item => ({ variantId: item.variant.id, quantity: item.quantity })));
  const [promoInput, setPromoInput] = useState("");
  const [promoMessage, setPromoMessage] = useState("");
  const subtotalCents = cartItems.reduce((sum, item) => sum + Math.round(Number(item.variant.price) * 100) * item.quantity, 0);
  const pricing = (() => {
    try { return cartPricing(subtotalCents, setCount * chicagoSetDiscountCents, promoCode); }
    catch { return cartPricing(subtotalCents, setCount * chicagoSetDiscountCents, null); }
  })();
  const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;
  const applyPromo = () => {
    const raw = promoInput.trim();
    if (!raw) { setPromoCode(null); setPromoMessage(""); return; }
    try {
      const codes = parsePromoCodes(raw);
      setPromoCode(codes.join(" "));
      setPromoMessage(`Code ${codes.join(" ")} applied.`);
    } catch (err) {
      setPromoMessage(err instanceof Error ? err.message : "Promo code is invalid or no longer available.");
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("order") === "success") {
      try {
        const saved = sessionStorage.getItem("checkoutConfirmation");
        if (saved) {
          sessionStorage.removeItem(checkoutDraftKey);
          setOrderData(JSON.parse(saved));
          setShowSuccess(true);
          setIsLoadingCart(false);
          return;
        }
      } catch {
        sessionStorage.removeItem("checkoutConfirmation");
      }
    }
    const paymentIntentId = params.get("payment_intent");
    const returnedSecret = params.get("payment_intent_client_secret");
    if (paymentIntentId && returnedSecret) {
      apiRequest("POST", "/api/complete-stripe-payment", {
        paymentIntentId, clientSecret: returnedSecret,
      }).then(res => res.json()).then(data => {
        if (!data.success) throw new Error(data.message || "Payment could not be confirmed");
        finishOrder(data);
      }).catch(() => {
        setError("We couldn't confirm your payment yet. Please reload this page to retry. Do not pay again.");
      });
      setIsLoadingCart(false);
      return;
    }

    const cartDataStr = localStorage.getItem('checkoutCart');
    if (!cartDataStr) {
      setLocation('/shop');
      return;
    }

    try {
      const cartData = JSON.parse(cartDataStr);
      // Older saved carts may predate checkout keys. Persist one for reloads
      // and other tabs instead of generating a new key on every request.
      if (!cartData.checkoutKey) {
        cartData.checkoutKey = crypto.randomUUID();
        localStorage.setItem("checkoutCart", JSON.stringify(cartData));
      }
      setCheckoutKey(cartData.checkoutKey);
      if (restoredKey.current !== cartData.checkoutKey) {
        const draft = readCheckoutDraft(cartData.checkoutKey);
        setCustomerName(draft?.customerName ?? "");
        setCustomerEmail(draft?.customerEmail ?? "");
        setAddress(draft?.address ?? {
          line1: "", line2: "", city: "", state: "", postal_code: "", country: "US",
        });
        setPolicyAcknowledged(draft?.policyAcknowledged ?? false);
        setDecantAcknowledged(draft?.decantAcknowledged ?? false);
        setPreorderAcknowledged(draft?.preorderTermsVersion === preorderTermsVersion && draft.preorderAcknowledged === true);
        restoredKey.current = cartData.checkoutKey;
      }
      
      // Wait for products and variants to load
      if (!products || !variants) {
        return;
      }

      // Build cart items from variant IDs
      const items: CartItem[] = [];
      for (const cartItem of cartData.cart) {
        const variant = variants.find(v => v.id === cartItem.variantId);
        if (!variant) throw new Error("An item is no longer available");
        
        const product = products.find(p => p.id === variant.productId);
        if (!product) throw new Error("An item is no longer available");
        if (!Number.isInteger(cartItem.quantity) || cartItem.quantity < 1 ||
          items.some(item => item.variant.id === cartItem.variantId)) throw new Error("Invalid cart quantity");

        items.push({
          variant,
          product,
          quantity: cartItem.quantity
        });
      }

      if (items.length === 0) {
        setLocation('/shop');
        return;
      }

      setCartItems(items);
      setPromoCode(cartData.promoCode);
      setIsLoadingCart(false);
    } catch (error) {
      console.error('Cart parsing error:', error);
      setLocation('/shop');
    }
  }, [setLocation, products, variants]);

  useEffect(() => {
    if (!checkoutKey || restoredKey.current !== checkoutKey || showSuccess) return;
    const draft: CheckoutDraft = {
      checkoutKey, customerName, customerEmail, address, policyAcknowledged, decantAcknowledged, preorderAcknowledged, preorderTermsVersion,
    };
    sessionStorage.setItem(checkoutDraftKey, JSON.stringify(draft));
  }, [checkoutKey, customerName, customerEmail, address, policyAcknowledged, decantAcknowledged, preorderAcknowledged, showSuccess]);

  const updateCartStock = (available: ProductVariant[]) => {
    const updated = reconcileCart(lines, available);
    setCartItems(updated);
    localStorage.setItem("checkoutCart", JSON.stringify({
      checkoutKey, promoCode,
      cart: updated.map(item => ({ variantId: item.variant.id, quantity: item.quantity })),
    }));
    window.dispatchEvent(new Event("rvltn-cart"));
    setPreorderAcknowledged(false);
    setError(updated.length
      ? "Availability changed. Your cart was adjusted to current stock and backorder limits. Review your order before continuing."
      : "These items are no longer available. Please return to the shop.");
  };

  const startPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreparing || !cartItems.length) return;
    if (hasPreorder && !preorderAcknowledged) {
      setError("Please acknowledge the paid backorder terms before continuing to payment.");
      return;
    }
    if (!policyAcknowledged) {
      setError("Please accept the no-returns policy before paying.");
      return;
    }
    if (hasChicagoDecant && !decantAcknowledged) {
      setError("Please acknowledge that the decant bottle differs from the illustration.");
      return;
    }
    setIsPreparing(true);
    setError("");
    try {
      const available = await fetchCheckoutInventory(checkoutKey);
      queryClient.setQueryData(["checkout-availability", checkoutKey], available);
      if (!cartMatchesInventory(lines, available)) {
        updateCartStock(available);
        return;
      }
      const response = await apiRequest("POST", "/api/create-payment-intent", {
        items: cartItems.map(item => ({ variantId: item.variant.id, quantity: item.quantity })),
        checkoutKey, promoCode, customerEmail, customerName, policyAcknowledged, decantAcknowledged, preorderAcknowledged, preorderTermsVersion, address,
      });
      const data = await response.json();
      const configResponse = await fetch("/api/stripe/config", { credentials: "include" });
      if (!configResponse.ok) throw new Error("Payments are unavailable");
      const config = await configResponse.json();
      setStripePromise(loadStripe(config.publishableKey));
      setClientSecret(data.clientSecret);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not prepare checkout");
    } finally {
      setIsPreparing(false);
    }
  };

  if (showSuccess && orderData) {
    return (
      <div className="min-h-[100dvh] bg-background">
        <Header />
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <Card className="border border-border">
            <CardHeader className="text-center">
              <CheckCircle className="w-12 h-12 text-primary mx-auto mb-4" />
              <p className="eyebrow text-primary">RVLTN Parfums</p>
              <CardTitle className="text-4xl font-serif font-normal">Order confirmed.</CardTitle>
              <CardDescription>Thank you for your purchase from RVLTN Parfums.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-warm-gray p-4 space-y-2 break-words">
                <p className="text-sm"><strong>Order Total:</strong> ${orderData.total}</p>
                <p className="text-sm"><strong>Email:</strong> {orderData.customerEmail}</p>
                <p className="text-sm"><strong>Order ID:</strong> {orderData.orderId}</p>
                <p className="text-sm text-muted-foreground">Keep this order ID for your records.</p>
              </div>
              <div className="bg-background border border-border p-4">
                {orderData.hasPreorder === true ? <div className="mb-4 text-sm leading-7">
                  <p className="eyebrow mb-2 text-primary">Paid backorder confirmed — not ready to ship</p>
                  <p>{orderData.preorderTerms || preorderTerms}</p>
                  <p className="mt-3 font-semibold">Your order, including any available limited-release items, ships together when all items are ready.</p>
                </div> : orderData.hasPreorder === false ? <p className="mb-4 text-sm">Available-stock order confirmed. No backorder items are included.</p> : null}
                <p className="text-sm text-muted-foreground">
                  <strong>Important:</strong> All sales are final except where required by law. Our policy and statutory protections apply.
                </p>
              </div>
              <Button
                onClick={() => setLocation('/shop')}
                className="w-full"
                data-testid="button-continue-shopping"
              >
                Explore the collection
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  if (isLoadingCart && (stockError || productsError)) {
    return <div className="min-h-[100dvh] bg-background"><Header /><main className="mx-auto max-w-2xl px-4 py-32">
      <p role="alert">Could not check stock. Your checkout details are unchanged.</p>
      <Button className="mt-4" onClick={() => { void refetchStock(); void refetchProducts(); }}>Retry catalog and stock check</Button>
    </main><Footer /></div>;
  }

  if (isLoadingCart || new URLSearchParams(window.location.search).has("payment_intent") && !error && !showSuccess) {
    return (
      <div className="min-h-[100dvh] bg-background">
        <Header />
        <div className="h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-5 h-4 w-48 animate-pulse bg-muted" />
            <p className="text-sm text-muted-foreground">RVLTN Parfums — preparing secure checkout…</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <Header />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <Card>
          <CardHeader>
            <p className="eyebrow text-primary">RVLTN Parfums</p>
            <CardTitle className="text-4xl font-serif font-normal">Secure checkout</CardTitle>
            <CardDescription>Your order details, kept together.</CardDescription>
          </CardHeader>
          <CardContent>
            {hasPreorder && <div className="mb-6 border border-primary p-4 text-sm leading-7"><p className="eyebrow mb-3 text-primary">Backorder / full payment now</p><p>{preorderTerms}</p><p className="mt-3 font-semibold">{hasAvailableItems ? "This is a mixed order. " : ""}Orders containing backorders ship together when all items are ready, including any available limited-release items.</p></div>}
            {error && <p role="alert" className="mb-4 text-[#edaaa0]">{error}</p>}
            {!clientSecret && !new URLSearchParams(window.location.search).has("payment_intent") && (
              <form onSubmit={startPayment} className="space-y-4">
                <div className="space-y-2 pb-4 border-b">
                  <h3 className="font-semibold">Order summary</h3>
                  {cartItems.map(item => <div key={item.variant.id} className="flex justify-between text-sm">
                     <span>{item.product.name} ({item.variant.size} {item.variant.concentration}) × {item.quantity}<span className="block text-xs text-primary">{isPreorderVariant(item.variant.id) ? "Backorder · paid waitlist · no confirmed shipping date" : "Available-stock item · subject to final availability check"}</span></span>
                    <span>${(Number(item.variant.price) * item.quantity).toFixed(2)}</span>
                  </div>)}
                  {stockChanged && <div role="alert" className="space-y-2 text-sm text-[#edaaa0]">
                    <p>Some quantities are no longer available. Update your cart before paying.</p>
                    {cartItems.filter(item => item.quantity > inventoryLimit(variants?.find(v => v.id === item.variant.id)))
                      .map(item => <p key={item.variant.id}>{item.product.name}: {inventoryLimit(variants?.find(v => v.id === item.variant.id))} {isPreorderVariant(item.variant.id) ? "maximum order quantity (not physical stock)" : "available at this size"}.</p>)}
                    <Button type="button" variant="outline" disabled={isPreparing} onClick={() => variants && updateCartStock(variants)}>Update cart to available stock</Button>
                  </div>}
                  {stockError && <p role="alert" className="text-sm text-[#edaaa0]">Could not refresh stock. We will check again before payment.</p>}
                  {!cartItems.length && <Button type="button" onClick={() => setLocation("/shop")}>Return to shop</Button>}
                   {setCount > 0 && <div className="flex justify-between text-sm text-muted-foreground"><span>Collection set savings × {setCount}</span><span>-${(setCount * chicagoSetDiscountCents / 100).toFixed(2)}</span></div>}
                   {hasChicagoDecant && <p className="mt-3 border-l-2 border-primary pl-3 text-sm text-muted-foreground">Collection artwork does not specify the packaging of an existing order. Refer to the details recorded with that order.</p>}
                  <div className="flex justify-between pt-4 font-semibold"><span>Subtotal</span><span>${(cartItems.reduce((sum, item) => sum + Number(item.variant.price) * item.quantity, 0) - setCount * chicagoSetDiscountCents / 100).toFixed(2)}</span></div>
                  <div className="flex items-end gap-2 pt-2">
                    <div className="flex-1"><Label htmlFor="promo">Discount code</Label><Input id="promo" autoCapitalize="characters" value={promoInput} onChange={e => setPromoInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); applyPromo(); } }} /></div>
                    <Button type="button" variant="outline" onClick={applyPromo}>Apply</Button>
                  </div>
                  {promoMessage && <p role="status" className="text-sm text-muted-foreground">{promoMessage}</p>}
                  {pricing.discountCents > 0 && <div className="flex justify-between text-sm"><span>Discount ({pricing.discountPercent}% off)</span><span>-{money(pricing.discountCents)}</span></div>}
                  <div className="flex justify-between text-sm"><span>Shipping</span><span>{pricing.shippingCents === 0 ? "Free" : money(pricing.shippingCents)}</span></div>
                  <p className="text-xs text-muted-foreground">Free shipping on orders over $50. Sales tax is not calculated.</p>
                  <div className="flex justify-between pt-2 font-semibold"><span>Total</span><span>{money(pricing.totalCents)}</span></div>
                  <Button type="button" variant="outline" onClick={() => setLocation("/shop")}>Edit bag in the shop</Button>
                </div>
                <div><Label htmlFor="name">Full name</Label><Input id="name" required value={customerName} onChange={e => setCustomerName(e.target.value)} /></div>
                <div><Label htmlFor="email">Email</Label><Input id="email" type="email" required value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} /></div>
                <h3 className="font-semibold pt-2">Delivery address (US)</h3>
                {([
                  ["line1", "Street address"], ["line2", "Apartment or suite (optional)"],
                  ["city", "City"], ["state", "State"], ["postal_code", "ZIP code"],
                ] as const).map(([key, label]) => (
                  <div key={key}><Label htmlFor={key}>{label}</Label>
                    <Input id={key} required={key !== "line2"} value={address[key]}
                      onChange={e => setAddress(previous => ({ ...previous, [key]: e.target.value }))} />
                  </div>
                ))}
                <div className="flex items-start gap-2">
                  <Checkbox id="policy" checked={policyAcknowledged} onCheckedChange={checked => setPolicyAcknowledged(checked === true)} />
                  <label htmlFor="policy" className="text-sm">I accept the <a href="/policy" target="_blank" rel="noopener noreferrer" className="underline">no-returns policy</a>. All sales are final except where required by law.</label>
                </div>
                {hasChicagoDecant && <div className="flex items-start gap-2">
                  <Checkbox id="decant" checked={decantAcknowledged} onCheckedChange={checked => { setDecantAcknowledged(checked === true); setError(""); }} />
                  <label htmlFor="decant" className="text-sm">I have reviewed the packaging and size details recorded for my order.</label>
                </div>}
                {hasPreorder && <div className="flex items-start gap-3 border border-primary p-4">
                  <Checkbox id="preorder" checked={preorderAcknowledged} onCheckedChange={checked => { setPreorderAcknowledged(checked === true); setError(""); }} />
                  <label htmlFor="preorder" className="text-sm leading-7">I understand this is a paid backorder / waitlist, not a ready-to-ship purchase. I pay the full price now, there is no confirmed restock or shipping date, and the order is nonrefundable except where required by law. My entire order ships together when all items are ready.</label>
                </div>}
                <Button type="submit" disabled={isPreparing || !cartItems.length || stockChanged || !policyAcknowledged || (hasChicagoDecant && !decantAcknowledged) || (hasPreorder && !preorderAcknowledged)} className="w-full">
                  {isPreparing ? "Preparing payment..." : "Continue to payment"}
                </Button>
              </form>
            )}
            {clientSecret && stripePromise && (
              <div><div className="mb-6 border-b border-border pb-5 text-sm leading-7">{cartItems.map(item => <p key={item.variant.id}>{item.product.name} · {item.variant.size} × {item.quantity} — {isPreorderVariant(item.variant.id) ? "Paid backorder" : "Available-stock item"}</p>)}<p className="mt-3 font-semibold">Total due now: ${total.toFixed(2)}</p></div><Elements stripe={stripePromise} options={{ clientSecret, appearance: {
                theme: "night",
                variables: { colorPrimary: "#c9a76b", colorBackground: "#201f1c", colorText: "#f2eadb", colorTextSecondary: "#bcb4a5", colorDanger: "#edaaa0", fontFamily: "Manrope, sans-serif", borderRadius: "2px" },
                rules: { ".Input": { borderColor: "#766a55" }, ".Input:focus": { borderColor: "#c9a76b", boxShadow: "0 0 0 1px #c9a76b" }, ".Tab": { borderColor: "#766a55" }, ".Tab--selected": { borderColor: "#c9a76b", color: "#c9a76b" } },
              } }}>
                <CheckoutForm total={total} clientSecret={clientSecret} onSuccess={finishOrder} />
              </Elements></div>
            )}
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
