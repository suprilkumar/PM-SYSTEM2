// src/core/config/apps.js
export const APPS = [
  {
    id: "dashboard",
    name: "Home",
    href: "/dashboard",
    icon: "Home",
    order: 0,
  },
  {
    id: "notes",
    name: "Notes",
    href: "/notes",
    icon: "StickyNote",
    order: 1,
    // src/core/config/apps.js — notes children
    children: [
      { name: "My notes", href: "/notes", icon: "FileText" },
      { name: "New note", href: "/notes/new", icon: "Plus" },
      { name: "New folder", action: "notes:new-folder", icon: "FolderPlus" },
      { name: "All folders", href: "/notes/folders", icon: "Folders" },
      { name: "Shared by me", href: "/notes/shared", icon: "Share2" },
      { name: "Public links", href: "/notes/public-links", icon: "Globe" },
    ],
  },
  {
    id: "finance",
    name: "Finance",
    href: "/finance",
    icon: "Wallet",
    order: 2,
    children: [
      { name: "Dashboard", href: "/finance", icon: "LayoutDashboard" },
      { name: "Add transaction", href: "/finance/transactions/new", icon: "Plus" },
      { name: "Transactions", href: "/finance/transactions", icon: "List" },
      { name: "Categories", href: "/finance/categories", icon: "FolderTree" },
      { name: "Reports", href: "/finance/reports", icon: "BarChart3" },
    ],
  },
  // Future apps go here
];

export const SETTINGS_ITEM = {
  id: "settings",
  name: "Settings",
  href: "/settings",
  icon: "Settings",
  children: [
    { name: "Profile", href: "/settings/profile", icon: "User" },
    { name: "Notifications", href: "/settings/notifications", icon: "Bell" },
    { name: "Appearance", href: "/settings/appearance", icon: "Palette" },
    { name: "Your data", href: "/settings/data", icon: "Database" },
  ],
};

export const PUBLIC_LINKS = {
  features: { name: "Features", href: "/#features" },
  pricing: { name: "Pricing", href: "/#pricing" },
  about: { name: "About", href: "/#about" },
};