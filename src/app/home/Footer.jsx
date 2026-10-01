// src/app/home/Footer.jsx
// src/components/marketing/Footer.jsx
import Link from "next/link";
import { SITE } from "@/core/config/site";
import { APPS, SETTINGS_ITEM } from "@/core/config/apps";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative mt-24 border-t border-border/60">
      {/* Subtle magenta glow */}
      <div
        className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent"
        aria-hidden
      />

      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 md:grid-cols-4">
        {/* Brand */}
        <div className="sm:col-span-2">
          <div className="flex items-center gap-2.5 font-semibold">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-magenta-500 text-primary-foreground shadow-sm">
              P
            </span>
            {SITE.name}
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            {SITE.description}
          </p>
          <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-soft" />
            All systems operational
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Apps</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {APPS.map((app) => (
              <li key={app.id}>
                <Link
                  href={app.href}
                  className="transition hover:text-foreground"
                >
                  {app.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Company</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="/#about" className="transition hover:text-foreground">
                About
              </a>
            </li>
            <li>
              <a href="/#pricing" className="transition hover:text-foreground">
                Pricing
              </a>
            </li>
            <li>
              <a
                href={`mailto:${SITE.email}`}
                className="transition hover:text-foreground"
              >
                Contact
              </a>
            </li>
            <li>
              <Link
                href={SETTINGS_ITEM.href}
                className="transition hover:text-foreground"
              >
                Settings
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {year} {SITE.name}. All rights reserved.
          </p>
          <p>Built with privacy in mind.</p>
        </div>
      </div>
    </footer>
  );
}