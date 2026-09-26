// src/app/home/Features.jsx
import {
  StickyNote,
  Wallet,
  Dumbbell,
  Bell,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

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
    available: false,
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
    <section id="features" className="border-t bg-muted/20 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need, in one place
          </h2>
          <p className="mt-3 text-muted-foreground">
            A growing suite of personal tools — each one private, fast, and mobile-first.
          </p>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="group relative rounded-xl border bg-background p-6 transition hover:shadow-md"
              >
                {!f.available && (
                  <span className="absolute right-4 top-4 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    Soon
                  </span>
                )}
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}