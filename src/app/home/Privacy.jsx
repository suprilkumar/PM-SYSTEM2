// src/app/home/Pricing.jsx
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const PERKS = [
  "Unlimited notes",
  "PDF / PNG / TXT exports",
  "Public note sharing",
  "Sign in with Google",
  "Mobile + desktop apps",
  "All future apps included",
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="relative border-t border-border/60 bg-muted/20 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-3xl px-4 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1 text-xs text-primary">
          <Sparkles className="h-3 w-3" />
          Simple pricing
        </div>
        <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Free while we're building
        </h2>
        <p className="mt-3 text-muted-foreground">
          No credit card required. Everything included.
        </p>

        <div className="relative mt-12">
          <div
            aria-hidden
            className="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-primary/15 via-transparent to-magenta-500/10 blur-2xl"
          />
          <div className="rounded-3xl border border-border/70 bg-card p-8 text-left shadow-xl shadow-primary/5 sm:p-10">
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-bold tracking-tight">$0</span>
              <span className="text-muted-foreground">/ month</span>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Everything included. Forever, for now.
            </p>

            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {PERKS.map((p) => (
                <li key={p} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/15">
                    <Check className="h-3 w-3 text-primary" />
                  </span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>

            <Link href="/login" className="mt-8 block">
              <Button size="lg" className="group w-full">
                Get started free
                <span className="transition-transform group-hover:translate-x-0.5">
                  →
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}