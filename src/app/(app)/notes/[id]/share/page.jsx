// src/app/(app)/notes/[id]/share/page.js
"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SharePage() {
  const { id } = useParams();
  const [link, setLink] = useState("");
  const [enabled, setEnabled] = useState(false);

  const toggle = async (on) => {
    const res = await fetch("/api/notes/share", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noteId: id, enable: on }),
    });
    const data = await res.json();
    setEnabled(data.isPublic);
    if (data.publicSlug) setLink(`${window.location.origin}/notes/public/${data.publicSlug}`);
    else setLink("");
  };

  return (
    <div className="mx-auto max-w-xl space-y-4 p-4 md:p-6">
      <h1 className="text-xl font-bold">Share note</h1>
      <div className="rounded-lg border p-4">
        <label className="flex items-center justify-between">
          <span>Public access</span>
          <input type="checkbox" checked={enabled} onChange={(e) => toggle(e.target.checked)} />
        </label>
        {link && (
          <div className="mt-3 flex gap-2">
            <Input readOnly value={link} />
            <Button onClick={() => navigator.clipboard.writeText(link)}>Copy</Button>
          </div>
        )}
      </div>
    </div>
  );
}