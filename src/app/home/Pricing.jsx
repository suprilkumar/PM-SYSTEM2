// src/app/home/Pricing.jsx
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Pricing() {
  return (
    <section id="pricing" className="border-t bg-muted/20 py-16 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Simple pricing
        </h2>
        <p className="mt-3 text-muted-foreground">
          Free while we're building. No credit card required.
        </p>

        <div className="mt-10 rounded-2xl border bg-background p-8 text-left">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">$0</span>
            <span className="text-muted-foreground">/ month</span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Everything included. Forever, for now.
          </p>

          <ul className="mt-6 space-y-3">
            {[
              "Unlimited notes",
              "PDF / PNG / TXT exports",
              "Public note sharing",
              "Sign in with Google",
              "Mobile + desktop apps",
              "All future apps included",
            ].map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                <span>{p}</span>
              </li>
            ))}
          </ul>

          <Link href="/login" className="mt-6 block">
            <Button className="w-full" size="lg">
              Get started free
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}