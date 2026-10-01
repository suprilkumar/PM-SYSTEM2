// src/app/home/CTA.jsx
import Link from "next/link";
import { LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CTA() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-5xl px-4">
        <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-gradient-to-br from-primary/5 via-background to-magenta-500/5 p-10 text-center shadow-xl shadow-primary/5 sm:p-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/20 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-magenta-500/20 blur-3xl"
          />

          <div className="relative">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-magenta-500 text-primary-foreground shadow-lg shadow-primary/20">
              <LineChart className="h-6 w-6" />
            </div>
            <h2 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
              Ready to get organized?
            </h2>
            <p className="mt-3 text-muted-foreground">
              Sign in with Google and start writing your first note in under 30 seconds.
            </p>
            <Link href="/login" className="mt-8 inline-block">
              <Button size="lg" className="group">
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