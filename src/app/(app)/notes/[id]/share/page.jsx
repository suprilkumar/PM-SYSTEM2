// src/app/(app)/notes/[id]/share/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ShareDialog from "@/modules/notes/components/ShareDialog";
import { Button } from "@/components/ui/button";

export default function SharePage() {
  const { id } = useParams();
  const router = useRouter();
  const [note, setNote] = useState(null);

  useEffect(() => {
    fetch(`/api/notes/${id}`)
      .then((r) => r.json())
      .then(setNote)
      .catch(() => {});
  }, [id]);

  if (!note) return <p className="p-6 text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="mx-auto max-w-xl space-y-4 p-4 md:p-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        ← Back
      </Button>
      <ShareDialog noteId={id} noteTitle={note.title} />
    </div>
  );
}