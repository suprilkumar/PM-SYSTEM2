// src/app/(auth)/layout.js
import Link from "next/link";
import { SITE } from "@/core/config/site";

export default function AuthLayout({ children }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Left — form */}
      <div className="flex flex-col">
        <header className="flex h-14 items-center px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
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
          <a href="#" className="underline hover:text-foreground">Terms</a> and{" "}
          <a href="#" className="underline hover:text-foreground">Privacy Policy</a>.
        </footer>
      </div>

      {/* Right — marketing panel (hidden on mobile) */}
      <div className="relative hidden border-l bg-muted/30 lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
        <div className="relative flex h-full flex-col justify-center px-12">
          <h2 className="text-3xl font-bold tracking-tight">
            Your private workspace.
          </h2>
          <p className="mt-4 text-muted-foreground">
            Notes today. Finance, fitness, and reminders tomorrow. All under one login.
          </p>

          <div className="mt-10 space-y-4">
            {[
              { title: "Rich notes", desc: "Format, export, share." },
              { title: "Private by default", desc: "Only you see your data." },
              { title: "Mobile-first", desc: "Built for your phone." },
            ].map((f) => (
              <div key={f.title} className="rounded-lg border bg-background/60 p-4 backdrop-blur">
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