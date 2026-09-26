// src/app/home/Footer.jsx
import Link from "next/link";
import { SITE } from "@/core/config/site";
import { APPS, SETTINGS_ITEM } from "@/core/config/apps";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2">
          <div className="flex items-center gap-2 font-semibold">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground">
              P
            </span>
            {SITE.name}
          </div>
          <p className="mt-3 max-w-sm text-sm text-muted-foreground">
            {SITE.description}
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold">Apps</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {APPS.map((app) => (
              <li key={app.id}>
                <Link href={app.href} className="hover:text-foreground">
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
              <a href="/#about" className="hover:text-foreground">
                About
              </a>
            </li>
            <li>
              <a href="/#pricing" className="hover:text-foreground">
                Pricing
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="hover:text-foreground">
                Contact
              </a>
            </li>
            <li>
              <Link href={SETTINGS_ITEM.href} className="hover:text-foreground">
                Settings
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t">
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