import Header from "@/components/header";
import Footer from "@/components/footer";
import { Card, CardContent } from "@/components/ui/card";
import { preorderTerms } from "@shared/rvltn";

export default function Policy() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <Header />
      
      <section className="bg-background pb-20 pt-36">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="eyebrow mb-4 text-primary">Chicago Exclusif Parfums · Independent fragrance house</p>
            <h1 className="mb-4 font-serif text-5xl sm:text-7xl">Terms & Conditions</h1>
            <p className="text-sm text-muted-foreground">Important information regarding your purchase</p>
          </div>
          
          <Card className="rounded-none border border-border border-l-4 border-l-primary bg-card text-foreground">
            <CardContent className="p-8">
              <h2 className="mb-6 font-serif text-3xl text-primary">No return, no refund policy</h2>
              
              <div className="space-y-6 text-sm leading-7 text-muted-foreground [&_h3]:text-foreground">
                <div className="border-y border-border py-6">
                  <h3 className="mb-3 font-semibold text-lg">BACKORDERS / PAID WAITLIST</h3>
                  <p>{preorderTerms}</p>
                  <p className="mt-3">Every earlier series, including Dreamer, Sleep Paralysis, Green Monster, Duality and PREX2026, has sold out and cannot be purchased. Each Quantum Series fragrance is an available-stock limited release of 50 mL, shared across its sizes, and the complete set is five 50 mL bottles for $400. Orders ship together.</p>
                  <p className="mt-3">Sizes are 5, 10, 20 and 30 mL decants. Fragrance artwork is displayed unchanged and does not represent the decant bottle supplied. Dreamer remains a sold-out archive.</p>
                  <p className="mt-3 font-semibold">Nothing in these terms limits refunds, cancellation rights or other remedies required by applicable law.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">OVERVIEW</h3>
                  <p className="leading-relaxed">
                    Due to health, safety, and hygiene considerations governing fragrance products, Chicago Exclusif Parfums operates under a strict <strong>NO RETURN, NO REFUND</strong> policy for purchases.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">COVERAGE</h3>
                  <p className="leading-relaxed">
                    This policy applies to all:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Perfumes and fragrances</li>
                    <li>Cosmetics and makeup products</li>
                    <li>Skincare items</li>
                    <li>Personal care products</li>
                    <li>Gift sets and limited editions</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">NO RETURNS ACCEPTED</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li><strong>Opened Products</strong>: No returns accepted once protective seals are broken</li>
                    <li><strong>Unopened Products</strong>: No returns for change of mind, color/scent preference, or buyer's remorse</li>
                    <li><strong>Custom/Personalized Items</strong>: All engraved or personalized products are final sale</li>
                    <li><strong>Damaged Packaging</strong>: Items with damaged outer packaging cannot be returned</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">HYGIENE & SAFETY COMPLIANCE</h3>
                  <p className="leading-relaxed">
                    Fragrance products are handled under hygiene standards; we cannot accept returns of products that may have come into contact with skin, hair, or other surfaces due to contamination risks.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">QUALITY ASSURANCE</h3>
                  <p className="leading-relaxed">
                    We stand behind our product quality. If you receive a defective, damaged, or materially different product than ordered, use the contact information provided with your order.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">EXCEPTIONS</h3>
                  <p className="leading-relaxed">
                    Returns will only be processed in the following circumstances:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Product manufacturing defects</li>
                    <li>Shipping damage during transit</li>
                    <li>Incorrect item shipped by our error</li>
                    <li>Products past expiration date upon receipt</li>
                  </ul>
                  <p className="mt-2 text-sm">
                    <strong>Documentation Required</strong>: Original receipt, order confirmation, and photographic evidence of defect/damage.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">CUSTOMER RESPONSIBILITIES</h3>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Examine all products immediately upon delivery</li>
                    <li>Report any issues within 48 hours of receipt</li>
                    <li>Retain original packaging and documentation</li>
                    <li>Review product descriptions, ingredients, and specifications before purchase</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">LEGAL COMPLIANCE</h3>
                  <p className="leading-relaxed">
                    This policy complies with applicable consumer protection laws. Where legally required, refunds for defective products will be honored regardless of this policy.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">POLICY MODIFICATIONS</h3>
                  <p className="leading-relaxed">
                    We reserve the right to modify this policy at any time. Updates will be posted on our website with the effective date. Continued use of our services constitutes acceptance of policy changes.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2 text-lg">CONTACT INFORMATION</h3>
                  <p className="leading-relaxed">
                    This storefront does not publish a support email or social handle. Please refer to seller-provided order documentation for any support contact details.
                  </p>
                </div>
              </div>
              
               <div className="mt-8 border-t border-border pt-6">
                 <p className="text-xs text-muted-foreground">
                  <strong>Effective Date</strong>: December 1, 2024 | <strong>Last Updated</strong>: December 1, 2024
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
