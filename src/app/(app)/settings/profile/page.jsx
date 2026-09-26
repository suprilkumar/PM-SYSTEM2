// src/app/(app)/settings/profile/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/core/auth/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ProfileSettingsPage() {
  const { data: session, refetch } = useSession();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name);
  }, [session]);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Update failed");
      await refetch();
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.message ?? "Could not update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Update your display name and profile picture.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border bg-card p-4">
        <div>
          <label className="text-xs font-medium">Display name</label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-xs font-medium">Email</label>
          <Input
            value={session?.user?.email ?? ""}
            disabled
            className="mt-1 bg-muted"
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Email comes from your sign-in provider and can't be changed here.
          </p>
        </div>
        <div className="flex justify-end">
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}