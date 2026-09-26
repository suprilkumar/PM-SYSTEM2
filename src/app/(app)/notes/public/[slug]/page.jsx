// src/app/(app)/notes/public/[slug]/page.js
// Note: this page is public — auth middleware must whitelist /notes/public/*
async function fetchNote(slug) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/public/notes/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function PublicNote({ params }) {
  const { slug } = await params;          // ← await here
  const note = await fetchNote(slug);
  if (!note) {
    return <p className="p-10 text-center">Note not found or is private.</p>;
  }

  return (
    <article className="mx-auto max-w-3xl p-6">
      <h1 className="text-3xl font-bold">{note.title}</h1>
      <p className="mt-1 text-xs text-muted-foreground">
        By {note.user.name ?? "Anonymous"} · {note.viewCount} views
      </p>
      <div className="prose mt-6">
        {note.content.blocks?.map((b) => (
          <p key={b.id}>{b.data.text}</p>
        ))}
      </div>
    </article>
  );
}