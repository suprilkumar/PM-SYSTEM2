"use client";

import { useParams } from "next/navigation";
import VaultItemDetail from "@/modules/vault/components/VaultItemDetail";

export default function VaultItemDetailPage() {
  const { id } = useParams();
  return <VaultItemDetail id={id} />;
}