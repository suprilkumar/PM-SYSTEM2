// src/app/home/Hero.jsx
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SITE } from "@/core/config/site";

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Background: grid + gradient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_75%)]"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.35]" />
      </div>

      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-[900px] -translate-x-1/2 blur-3xl"
      >
        <div className="h-full w-full bg-gradient-to-b from-primary/25 via-primary/10 to-transparent" />
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-24 pt-20 sm:pt-28 md:pb-32">
        <div className="mx-auto max-w-3xl text-center">
          <div className="animate-float-up inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1 text-xs text-primary backdrop-blur">
            <Sparkles className="h-3 w-3" />
            Notes app is live — more coming soon
          </div>

          <h1 className="animate-float-up mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl [animation-delay:60ms]">
            Your notes,{" "}
            <span className="bg-gradient-to-r from-primary via-magenta-500 to-primary bg-clip-text text-transparent">
              finance, fitness
            </span>{" "}
            — one private workspace
          </h1>

          <p className="animate-float-up mt-6 text-base text-muted-foreground sm:text-lg [animation-delay:120ms]">
            {SITE.description}
          </p>

          <div className="animate-float-up mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row [animation-delay:180ms]">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="group w-full sm:w-auto">
                Get started free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <Link href="#features" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                See features
              </Button>
            </Link>
          </div>

          <p className="animate-float-up mt-5 text-xs text-muted-foreground [animation-delay:240ms]">
            Sign in with Google — no credit card, no setup.
          </p>
        </div>

        {/* Preview card */}
        <div className="animate-float-up mx-auto mt-16 max-w-4xl [animation-delay:300ms]">
          <div className="relative rounded-2xl border border-border/70 bg-card/70 p-2 shadow-2xl shadow-primary/5 backdrop-blur">
            <div
              aria-hidden
              className="absolute inset-x-8 -top-px h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
            />
            <div className="rounded-xl bg-gradient-to-br from-muted/50 via-background to-muted/30 p-6 sm:p-10">
              {/* Fake dashboard stats */}
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Notes", value: "24", accent: "from-primary to-magenta-500" },
                  { label: "Savings", value: "₹32k", accent: "from-emerald-500 to-green-500" },
                  { label: "Streak", value: "12d", accent: "from-amber-500 to-orange-500" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border bg-background p-4">
                    <div
                      className={`mb-3 h-1 w-8 rounded-full bg-gradient-to-r ${s.accent}`}
                    />
                    <div className="text-2xl font-semibold tabular-nums">
                      {s.value}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              {/* Fake note */}
              <div className="mt-3 rounded-xl border bg-background p-4">
                <div className="h-2 w-1/3 rounded-full bg-primary/20" />
                <div className="mt-3 space-y-2">
                  <div className="h-2 w-full rounded-full bg-muted" />
                  <div className="h-2 w-5/6 rounded-full bg-muted" />
                  <div className="h-2 w-4/6 rounded-full bg-muted" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}