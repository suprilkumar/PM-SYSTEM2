// src/modules/finance/constants.js

export const CURRENCY = "INR";
export const CURRENCY_SYMBOL = "₹";

export const TRANSACTION_TYPES = {
  INCOME: "income",
  EXPENSE: "expense",
};

export const PAYMENT_METHODS = [
  { value: "cash", label: "Cash" },
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
  { value: "netbanking", label: "Netbanking" },
  { value: "other", label: "Other" },
];

export const REPORT_RANGES = [
  { value: "month", label: "This month" },
  { value: "quarter", label: "This quarter" },
  { value: "year", label: "This year" },
  { value: "last6", label: "Last 6 months" },
  { value: "all", label: "All time" },
];

/**
 * Pre-built category tree. Seeded once per user.
 * `children` create nested rows; `parentId` is resolved during seed.
 */
export const DEFAULT_CATEGORIES = [
  // ── INCOME ──
  {
    name: "Salary",
    type: "income",
    icon: "Wallet",
    color: "#22c55e",
    children: [],
  },
  {
    name: "Bonus",
    type: "income",
    icon: "Gift",
    color: "#22c55e",
    children: [],
  },
  {
    name: "Freelance",
    type: "income",
    icon: "Briefcase",
    color: "#22c55e",
    children: [],
  },
  {
    name: "Other Income",
    type: "income",
    icon: "Plus",
    color: "#22c55e",
    children: [],
  },

  // ── EXPENSE ──
  {
    name: "Food",
    type: "expense",
    icon: "UtensilsCrossed",
    color: "#f97316",
    children: [
      { name: "Restaurant", icon: "Utensils", color: "#f97316" },
      { name: "Grocery", icon: "ShoppingBasket", color: "#f97316" },
      { name: "Dairy", icon: "Milk", color: "#f97316" },
    ],
  },
  {
    name: "Travel",
    type: "expense",
    icon: "Plane",
    color: "#3b82f6",
    children: [
      { name: "Fuel", icon: "Fuel", color: "#3b82f6" },
      { name: "Public Transport", icon: "Bus", color: "#3b82f6" },
      { name: "Cab", icon: "Car", color: "#3b82f6" },
      { name: "Flight/Train", icon: "Train", color: "#3b82f6" },
    ],
  },
  {
    name: "Home",
    type: "expense",
    icon: "Home",
    color: "#a855f7",
    children: [
      { name: "Rent", icon: "House", color: "#a855f7" },
      { name: "Utilities", icon: "Zap", color: "#a855f7" },
      { name: "Home Essentials", icon: "Package", color: "#a855f7" },
      { name: "Maintenance", icon: "Wrench", color: "#a855f7" },
    ],
  },
  {
    name: "Shopping",
    type: "expense",
    icon: "ShoppingBag",
    color: "#ec4899",
    children: [
      { name: "Clothing", icon: "Shirt", color: "#ec4899" },
      { name: "Electronics", icon: "Smartphone", color: "#ec4899" },
      { name: "Personal Care", icon: "Sparkles", color: "#ec4899" },
    ],
  },
  {
    name: "Recharges",
    type: "expense",
    icon: "Smartphone",
    color: "#06b6d4",
    children: [
      { name: "Mobile", icon: "Phone", color: "#06b6d4" },
      { name: "DTH", icon: "Tv", color: "#06b6d4" },
      { name: "Subscriptions", icon: "Repeat", color: "#06b6d4" },
    ],
  },
  {
    name: "Health",
    type: "expense",
    icon: "HeartPulse",
    color: "#ef4444",
    children: [
      { name: "Medicine", icon: "Pill", color: "#ef4444" },
      { name: "Doctor", icon: "Stethoscope", color: "#ef4444" },
      { name: "Insurance", icon: "ShieldCheck", color: "#ef4444" },
    ],
  },
  {
    name: "Investments",
    type: "expense",
    icon: "TrendingUp",
    color: "#10b981",
    children: [
      { name: "Stocks", icon: "LineChart", color: "#10b981" },
      { name: "SIP / Mutual Funds", icon: "PieChart", color: "#10b981" },
      { name: "Crypto", icon: "Bitcoin", color: "#10b981" },
    ],
  },
  {
    name: "Miscellaneous",
    type: "expense",
    icon: "MoreHorizontal",
    color: "#64748b",
    children: [],
  },
];

// src/modules/finance/constants.js — expand FOLDER_ICONS into a full icon set

export const CATEGORY_COLORS = [
  "#e11d48", "#f97316", "#eab308", "#84cc16",
  "#10b981", "#06b6d4", "#3b82f6", "#6366f1",
  "#8b5cf6", "#a855f7", "#ec4899", "#14b8a6",
  "#64748b", "#0ea5e9", "#f43f5e", "#22c55e",
];

export const CATEGORY_ICONS = [
  // Food
  "UtensilsCrossed", "Utensils", "ShoppingBasket", "Milk", "Coffee", "Pizza",
  "Apple", "IceCream", "Cake",
  // Travel
  "Plane", "Car", "Bus", "Train", "Fuel", "Bike", "Ship", "MapPin",
  // Home
  "Home", "House", "Zap", "Package", "Wrench", "Sofa", "Lamp", "Bed",
  // Shopping
  "ShoppingBag", "Shirt", "Smartphone", "Sparkles", "Watch", "Glasses",
  // Recharge / Subscription
  "Phone", "Tv", "Repeat", "Wifi", "Plug", "Radio",
  // Health
  "HeartPulse", "Pill", "Stethoscope", "ShieldCheck", "Activity",
  // Investment / Finance
  "TrendingUp", "LineChart", "PieChart", "Bitcoin", "Coins", "Wallet",
  "CreditCard", "Banknote", "Landmark", "Receipt", "Briefcase",
  // Misc
  "Gift", "Star", "Heart", "Music", "Camera", "Book", "Code",
  "Lightbulb", "MoreHorizontal", "Circle",
];