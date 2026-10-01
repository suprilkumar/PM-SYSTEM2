// src/app/(auth)/layout.jsx
import Link from "next/link";
import { SITE } from "@/core/config/site";

export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — form */}
      <div className="relative flex flex-col">
        {/* Background glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 -z-10 h-96 w-96 -translate-x-1/2 blur-3xl"
        >
          <div className="h-full w-full bg-gradient-to-b from-primary/20 to-transparent" />
        </div>

        <header className="flex h-14 items-center px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-magenta-500 text-primary-foreground shadow-sm">
              P
            </span>
            {SITE.name}
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
          <div className="w-full max-w-sm">{children}</div>
        </div>

        <footer className="px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
          By continuing, you agree to our{" "}
          <a href="#" className="underline hover:text-foreground">
            Terms
          </a>{" "}
          and{" "}
          <a href="#" className="underline hover:text-foreground">
            Privacy Policy
          </a>
          .
        </footer>
      </div>

      {/* Right — feature panel */}
      <div className="relative hidden border-l border-border/60 bg-muted/20 lg:block">
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-magenta-500/10"
        />
        <div className="relative flex h-full flex-col justify-center px-12">
          <h2 className="text-3xl font-bold tracking-tight">
            Your{" "}
            <span className="bg-gradient-to-r from-primary to-magenta-500 bg-clip-text text-transparent">
              private workspace
            </span>
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Notes today. Finance, fitness, and reminders tomorrow. All under one login.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { title: "Rich notes", desc: "Format, export, share." },
              { title: "Private by default", desc: "Only you see your data." },
              { title: "Mobile-first", desc: "Built for your phone." },
            ].map((f) => (
              <div
                key={f.title}
                className="rounded-xl border border-border/60 bg-background/60 p-4 backdrop-blur"
              >
                <div className="font-medium">{f.title}</div>
                <div className="text-sm text-muted-foreground">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}