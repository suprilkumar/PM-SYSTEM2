"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { toast } from "sonner";
import {
  KeyRound,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  X,
  Lock,
  Mail,
  Calendar,
  Loader2,
  Check,
} from "lucide-react";
import { useVault } from "@/modules/vault/context/VaultContext";
import { useVaultItems } from "@/modules/vault/hooks/useVaultItems";
import {
  deriveKey,
  deriveItemKey,
  wrapMasterKey,
  unwrapMasterKey,
  verifyCheckValue,
  makeCheckValue,
  encryptObject,
  encryptString,
  generateSalt,
  bytesToBase64,
  DEFAULT_KDF,
} from "@/modules/vault/crypto";
import {
  validatePassword,
  validatePin,
  validateDob,
} from "@/modules/vault/lib/password-policy";
import PageHeader from "@/components/layout/PageHeader";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import PinChangeModal from "@/modules/vault/components/settings/PinChangeModal";
import PasswordChangeModal from "@/modules/vault/components/settings/PasswordChangeModal";
import DeleteVaultModal from "@/modules/vault/components/settings/DeleteVaultModal";
import { Button } from "@/components/ui/button";
import { cn } from "@/core/utils/cn";

export default function VaultSettingsPage() {
  const router = useRouter();
  const { getMasterKey, lock } = useVault();
  const { data: settings, mutate: reloadSettings } = useSWR("/api/vault/settings");
  const { items, reload: reloadItems } = useVaultItems();

  const [openModal, setOpenModal] = useState(null); // "pin" | "password" | "delete" | null

  const tiles = [
    {
      id: "pin",
      icon: KeyRound,
      title: "Change PIN",
      description: "Verify your master password, then set a new 6-digit PIN.",
      accent: "from-primary to-magenta-500",
    },
    {
      id: "password",
      icon: ShieldCheck,
      title: "Change master password",
      description: "Verify your recovery email and DOB, then set a new password. All items are re-encrypted.",
      accent: "from-blue-500 to-cyan-500",
    },
    {
      id: "delete",
      icon: AlertTriangle,
      title: "Delete vault",
      description: "Permanently remove all items, settings, and recovery data.",
      accent: "from-red-500 to-rose-500",
      danger: true,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-8">
      <PageHeader
        title="Vault settings"
        description="Manage your PIN, password, and vault data"
        breadcrumbs={[
          { label: "Vault", href: "/vault" },
          { label: "Settings" },
        ]}
      />

      <div className="space-y-3">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setOpenModal(t.id)}
              className={cn(
                "group flex w-full items-center gap-4 rounded-2xl border bg-card p-4 text-left transition-all",
                "hover:-translate-y-0.5",
                t.danger
                  ? "border-destructive/30 hover:border-destructive/50 hover:shadow-lg hover:shadow-destructive/10"
                  : "border-border/70 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
              )}
            >
              <span
                className={cn(
                  "grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white shadow-sm",
                  t.accent
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className={cn("font-semibold", t.danger && "text-destructive")}>
                  {t.title}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {t.description}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5" />
            </button>
          );
        })}
      </div>

      {/* Modals */}
      <PinChangeModal
        open={openModal === "pin"}
        onClose={() => setOpenModal(null)}
        settings={settings}
        getMasterKey={getMasterKey}
        onSuccess={async () => {
          await reloadSettings();
          setOpenModal(null);
        }}
      />

      <PasswordChangeModal
        open={openModal === "password"}
        onClose={() => setOpenModal(null)}
        settings={settings}
        getMasterKey={getMasterKey}
        items={items}
        onSuccess={async () => {
          await reloadSettings();
          await reloadItems();
          await lock("password-changed");
          setOpenModal(null);
          router.replace("/vault/unlock");
        }}
      />

      <DeleteVaultModal
        open={openModal === "delete"}
        onClose={() => setOpenModal(null)}
        onSuccess={() => {
          setOpenModal(null);
          router.push("/vault");
        }}
      />
    </div>
  );
}