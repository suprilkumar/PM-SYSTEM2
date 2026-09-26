// src/app/home/Hero.jsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SITE } from "@/core/config/site";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-16 sm:pt-24 md:pb-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Notes app is live — more coming soon
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            {SITE.tagline}
          </h1>

          <p className="mt-6 text-base text-muted-foreground sm:text-lg">
            {SITE.description}
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                Get started free
              </Button>
            </Link>
            <Link href="#features" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                See features
              </Button>
            </Link>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            Sign in with Google — no credit card, no setup.
          </p>
        </div>

        {/* Preview */}
        <div className="mx-auto mt-14 max-w-4xl">
          <div className="rounded-xl border bg-card p-2 shadow-xl">
            <div className="rounded-lg bg-muted/40 p-6 sm:p-10">
              <div className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: "Notes", value: "24", color: "bg-blue-500" },
                  { label: "Saved", value: "18", color: "bg-green-500" },
                  { label: "Shared", value: "3", color: "bg-purple-500" },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg border bg-background p-4">
                    <div className={`mb-2 h-1 w-8 rounded-full ${s.color}`} />
                    <div className="text-2xl font-bold">{s.value}</div>
                    <div className="text-xs text-muted-foreground">{s.label}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4 rounded-lg border bg-background p-4">
                <div className="h-2 w-1/3 rounded bg-muted" />
                <div className="mt-3 space-y-2">
                  <div className="h-2 w-full rounded bg-muted" />
                  <div className="h-2 w-5/6 rounded bg-muted" />
                  <div className="h-2 w-4/6 rounded bg-muted" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}