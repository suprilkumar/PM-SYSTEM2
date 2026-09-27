// src/app/notes/public/[slug]/page.jsx
async function fetchNote(slug) {
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${base}/api/public/notes/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function PublicNote({ params }) {
  const { slug } = await params;
  const note = await fetchNote(slug);

  if (!note) {
    return (
      <div className="mx-auto max-w-3xl p-10 text-center">
        <h1 className="text-xl font-semibold">Note not found or is private</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The link may have expired or been disabled by the owner.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
          {note.user?.image && (
            <img src={note.user.image} alt="" className="h-6 w-6 rounded-full" />
          )}
          <span>
            By <strong>{note.user?.name ?? "Anonymous"}</strong> · {note.viewCount} views
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
          dangerouslySetInnerHTML={{ __html: note.content?.html ?? "" }}
        />
      </div>
    </div>
  );
}