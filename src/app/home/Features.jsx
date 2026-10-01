// src/app/home/Features.jsx
import {
  StickyNote,
  Wallet,
  Dumbbell,
  Bell,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { cn } from "@/core/utils/cn";

const FEATURES = [
  {
    icon: StickyNote,
    title: "Rich Notes",
    desc: "Write, format, and export notes as PDF, PNG, or TXT. Share via public link when you want to.",
    available: true,
  },
  {
    icon: Wallet,
    title: "Finance Tracker",
    desc: "Track income, expenses, custom categories. Monthly, quarterly, yearly reports with charts.",
    available: true,
  },
  {
    icon: Dumbbell,
    title: "Fitness Analytics",
    desc: "Log weight, calories. See color-coded progress charts against your goals.",
    available: false,
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    desc: "Set reminders with email notifications before and at the event time.",
    available: false,
  },
  {
    icon: ShieldCheck,
    title: "Private by Design",
    desc: "Your data is yours alone. No admin can view your notes, finances, or health data.",
    available: true,
  },
  {
    icon: Smartphone,
    title: "Mobile-first UX",
    desc: "Designed for your phone. Swipe, tap, and get things done in seconds.",
    available: true,
  },
];

export default function Features() {
  return (
    <section id="features" className="relative border-t border-border/60 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/5 px-3 py-1 text-xs text-primary">
            Features
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need, in one place
          </h2>
          <p className="mt-3 text-muted-foreground">
            A growing suite of personal tools — each one private, fast, and mobile-first.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6",
                  "transition-all duration-300",
                  "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-glow)]"
                )}
                style={{ animationDelay: `${i * 40}ms` }}
              >
                {/* Hover gradient */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute -inset-px rounded-2xl bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 opacity-0 transition-opacity duration-300 group-hover:from-primary/5 group-hover:via-transparent group-hover:to-magenta-500/5 group-hover:opacity-100"
                />

                {!f.available && (
                  <span className="absolute right-4 top-4 rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Soon
                  </span>
                )}

                <div
                  className={cn(
                    "relative mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl",
                    "bg-gradient-to-br from-primary/15 to-magenta-500/10",
                    "text-primary transition-transform duration-300",
                    "group-hover:scale-110 group-hover:rotate-3"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="relative font-semibold">{f.title}</h3>
                <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}