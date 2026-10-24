"use client";

import { useParams } from "next/navigation";
import { useVaultItems } from "@/modules/vault/hooks/useVaultItems";
import VaultItemEditor from "@/modules/vault/components/VaultItemEditor";

export default function EditVaultItemPage() {
  const { id } = useParams();
  const { items, isLoading } = useVaultItems();
  const item = items.find((i) => i.id === id);

  if (isLoading) return <p className="p-6 text-sm text-muted-foreground">Loading…</p>;
  if (!item) return <p className="p-6 text-sm">Item not found</p>;

  return <VaultItemEditor initial={item} />;
}