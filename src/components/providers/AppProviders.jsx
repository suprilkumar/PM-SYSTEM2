// src/components/providers/AppProviders.jsx
"use client";

import { ThemeProvider } from "next-themes";
import { SWRConfig } from "swr";

const fetcher = async (url) => {
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data.error ?? "Request failed");
    err.status = res.status;
    throw err;
  }
  return data;
};

export default function AppProviders({ children }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <SWRConfig
        value={{
          fetcher,
          revalidateOnFocus: false,
          revalidateOnReconnect: true,
          dedupingInterval: 5000,
          keepPreviousData: true,
          errorRetryCount: 2,
        }}
      >
        {children}
      </SWRConfig>
    </ThemeProvider>
  );
}