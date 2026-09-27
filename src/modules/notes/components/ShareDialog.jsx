// src/modules/notes/components/ShareDialog.jsx
"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Link2, Mail, Copy, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/core/utils/cn";

export default function ShareDialog({ noteId, noteTitle }) {
  const [tab, setTab] = useState("public");
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Share "{noteTitle}"</h2>
        <p className="text-sm text-muted-foreground">
          Generate a public link, or invite a specific person by email.
        </p>
      </div>

      <div className="grid grid-cols-2 rounded-lg border p-1">
        <button
          type="button"
          onClick={() => setTab("public")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-md py-2 text-sm transition",
            tab === "public"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent"
          )}
        >
          <Link2 className="h-4 w-4" /> Public link
        </button>
        <button
          type="button"
          onClick={() => setTab("email")}
          className={cn(
            "flex items-center justify-center gap-2 rounded-md py-2 text-sm transition",
            tab === "email"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent"
          )}
        >
          <Mail className="h-4 w-4" /> Invite by email
        </button>
      </div>

      {tab === "public" ? (
        <PublicTab noteId={noteId} />
      ) : (
        <EmailTab noteId={noteId} />
      )}
    </div>
  );
}

/* ────────────────────────────────────────── */

function PublicTab({ noteId }) {
  const [enabled, setEnabled] = useState(false);
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Load current public state
    fetch(`/api/notes/${noteId}`)
      .then((r) => r.json())
      .then((n) => {
        setEnabled(!!n.isPublic);
        if (n.publicSlug) {
          setUrl(`${window.location.origin}/notes/public/${n.publicSlug}`);
        }
      })
      .catch(() => {});
  }, [noteId]);

  const toggle = async (on) => {
    setLoading(true);
    try {
      const res = await fetch("/api/notes/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "public", noteId, enable: on }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");

      setEnabled(data.isPublic);
      setUrl(data.url ? `${window.location.origin}${data.url}` : "");
      toast.success(on ? "Public link created" : "Public link disabled");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Link copied");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center justify-between rounded-lg border p-3">
        <span className="text-sm">
          <span className="font-medium">Public access</span>
          <span className="block text-xs text-muted-foreground">
            Anyone with the link can view this note
          </span>
        </span>
        <input
          type="checkbox"
          checked={enabled}
          disabled={loading}
          onChange={(e) => toggle(e.target.checked)}
          className="h-4 w-4"
        />
      </label>

      {enabled && url && (
        <div className="flex gap-2">
          <Input readOnly value={url} />
          <Button onClick={copy} variant="outline" size="md">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────── */

function EmailTab({ noteId }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const res = await fetch(`/api/notes/${noteId}/shares`);
    if (res.ok) {
      const data = await res.json();
      setShares(data.shares);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [noteId]);

  const invite = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/notes/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "email", noteId, email, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Failed");
      toast.success(`Invite sent to ${email}`);
      setEmail("");
      load();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const revoke = async (shareId) => {
    const res = await fetch(`/api/notes/${noteId}/shares`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shareId }),
    });
    if (res.ok) {
      toast.success("Access revoked");
      setShares((s) => s.filter((x) => x.id !== shareId));
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={invite} className="space-y-2">
        <div className="flex gap-2">
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="someone@example.com"
            required
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="rounded-lg border bg-background px-2 text-sm"
          >
            <option value="viewer">Viewer</option>
            <option value="editor">Editor</option>
          </select>
          <Button type="submit" disabled={loading}>
            Invite
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          They'll get an email with a link. They must sign in with this email to view.
        </p>
      </form>

      {shares.length > 0 && (
        <div className="divide-y rounded-lg border">
          {shares.map((s) => (
            <div key={s.id} className="flex items-center justify-between p-3">
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{s.email}</div>
                <div className="text-xs text-muted-foreground">
                  {s.role} · {s.status}
                </div>
              </div>
              <button
                type="button"
                onClick={() => revoke(s.id)}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label="Revoke"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}