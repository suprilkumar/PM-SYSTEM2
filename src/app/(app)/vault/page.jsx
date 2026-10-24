"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { useVault } from "@/modules/vault/context/VaultContext";
import VaultItemList from "@/modules/vault/components/VaultItemList";

export default function VaultRoot() {
  const router = useRouter();
  const { isUnlocked } = useVault();
  const { data, isLoading } = useSWR("/api/vault/settings");

  useEffect(() => {
    if (isLoading) return;
    if (!data?.configured) router.replace("/vault/setup");
    else if (!isUnlocked) router.replace("/vault/unlock");
  }, [data, isLoading, isUnlocked, router]);

  if (isLoading || !isUnlocked) {
    return <p className="p-6 text-sm text-muted-foreground">Loading vault…</p>;
  }

  return <VaultItemList />;
}