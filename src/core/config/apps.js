// src/core/config/apps.js
export const APPS = [
  {
    id: "dashboard",
    name: "Home",
    href: "/dashboard",
    icon: "Home",
    mobileNav: true,
    order: 0,
  },
  {
    id: "notes",
    name: "Notes",
    href: "/notes",
    icon: "StickyNote",
    mobileNav: true,
    order: 1,
    // module: "notes"  ← future flag for lazy loading
  },
  {
    id: "finance",
    name: "Finance",
    href: "/finance",
    icon: "Wallet",
    mobileNav: true,
    order: 2,
  },
  // Future apps — just append here, no other code changes:
  // { id: "finance", name: "Finance", href: "/finance", icon: "Wallet", mobileNav: true, order: 2 },
  // { id: "fitness", name: "Fitness", href: "/fitness", icon: "Dumbbell", mobileNav: true, order: 3 },
  // { id: "reminders", name: "Reminders", href: "/reminders", icon: "Bell", mobileNav: true, order: 4 },
];

export const SETTINGS_ITEM = {
  id: "settings",
  name: "Settings",
  href: "/settings",
  icon: "Settings",
};

export const PUBLIC_LINKS = {
  features: { name: "Features", href: "/#features" },
  pricing: { name: "Pricing", href: "/#pricing" },
  about: { name: "About", href: "/#about" },

};