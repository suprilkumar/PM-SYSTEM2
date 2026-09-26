// src/app/home/Privacy.jsx
import { ShieldCheck, Check } from "lucide-react";

export default function Privacy() {
  return (
    <section id="about" className="py-16 sm:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 md:grid-cols-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Privacy isn't a feature. It's the foundation.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Your notes, finances, and health data are isolated at the database level.
            Even site administrators cannot see what you save.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Row-level data isolation per user",
              "Encrypted sessions",
              "No third-party analytics on your content",
              "Export or delete your data anytime",
            ].map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-6 w-6 text-green-600" />
            <span className="font-semibold">Your data vault</span>
          </div>
          <div className="mt-4 space-y-3">
            {["Notes", "Finance", "Fitness", "Reminders"].map((row) => (
              <div
                key={row}
                className="flex items-center justify-between rounded-lg border bg-muted/30 p-3"
              >
                <span className="text-sm">{row}</span>
                <span className="text-xs text-muted-foreground">Only you</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}