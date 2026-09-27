// src/app/share/[token]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/core/auth/client";
import { Button } from "@/components/ui/button";

export default function SharedNotePage() {
  const { token } = useParams();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const [state, setState] = useState({ loading: true });
  const [contentRef, setContentRef] = useState(null);

  useEffect(() => {
    if (isPending) return;

    // If not signed in, redirect to /login with callback back here
    if (!session?.user) {
      router.replace(`/login?callbackUrl=/share/${token}`);
      return;
    }

    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/shares/${token}`, { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          setState({ loading: false, error: data.error, meta: data });
        } else {
          setState({ loading: false, note: data.note, owner: data.owner });
        }
      } catch {
        if (!cancelled) setState({ loading: false, error: "Failed to load" });
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [token, session, isPending, router]);

  if (state.loading || isPending) {
    return <p className="p-10 text-center text-sm text-muted-foreground">Loading…</p>;
  }

  if (state.error) {
    return (
      <div className="mx-auto max-w-lg p-10 text-center">
        <h1 className="text-xl font-semibold">{state.error}</h1>
        {state.meta?.expectedEmail && (
          <p className="mt-2 text-sm text-muted-foreground">
            This note was shared with{" "}
            <strong>{state.meta.expectedEmail}</strong>, but you're signed in as{" "}
            <strong>{state.meta.yourEmail}</strong>.
          </p>
        )}
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/dashboard">
            <Button variant="outline">Go to dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const { note, owner } = state;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          {owner.image && (
            <img src={owner.image} alt="" className="h-6 w-6 rounded-full" />
          )}
          <span>
            Shared by <strong>{owner.name ?? owner.email}</strong>
          </span>
        </div>

        <h1 className="text-3xl font-bold tracking-tight">{note.title}</h1>

        <article
          className="prose mt-6 max-w-none text-sm leading-relaxed
            [&_h1]:my-3 [&_h1]:text-2xl [&_h1]:font-bold
            [&_h2]:my-2 [&_h2]:text-xl [&_h2]:font-semibold
            [&_p]:my-2
            [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6
            [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6
            [&_blockquote]:my-2 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic
            [&_pre]:my-2 [&_pre]:rounded [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-xs"
          // HTML comes from a trusted editor — safe enough for personal use.
          // For multi-tenant, sanitize with DOMPurify before rendering.
          dangerouslySetInnerHTML={{ __html: note.content?.html ?? "" }}
        />
      </div>
    </div>
  );
}