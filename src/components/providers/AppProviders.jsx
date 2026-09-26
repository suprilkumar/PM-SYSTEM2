// src/components/providers/AppProviders.jsx
"use client";

import { ThemeProvider } from "next-themes";

export default function AppProviders({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}