// src/modules/notes/components/EditorToolbar.jsx
"use client";

import {
  Bold, Italic, Underline, Strikethrough,
  Heading1, Heading2, Heading3,
  List, ListOrdered, ListChecks,
  Code, Quote, Link as LinkIcon, Undo, Redo, RemoveFormatting,
} from "lucide-react";
import { cn } from "@/core/utils/cn";

const GROUPS = [
  [
    { id: "undo", icon: Undo, label: "Undo" },
    { id: "redo", icon: Redo, label: "Redo" },
  ],
  [
    { id: "h1", icon: Heading1, label: "Heading 1", cmd: "formatBlock", arg: "H1" },
    { id: "h2", icon: Heading2, label: "Heading 2", cmd: "formatBlock", arg: "H2" },
    { id: "h3", icon: Heading3, label: "Heading 3", cmd: "formatBlock", arg: "H3" },
    { id: "p",  icon: RemoveFormatting, label: "Paragraph", cmd: "formatBlock", arg: "P" },
  ],
  [
    { id: "bold",      icon: Bold,          label: "Bold",      cmd: "bold" },
    { id: "italic",    icon: Italic,        label: "Italic",    cmd: "italic" },
    { id: "underline", icon: Underline,     label: "Underline", cmd: "underline" },
    { id: "strike",    icon: Strikethrough, label: "Strike",    cmd: "strikeThrough" },
  ],
  [
    { id: "ul",  icon: List,        label: "Bullet list",  cmd: "insertUnorderedList" },
    { id: "ol",  icon: ListOrdered, label: "Numbered list", cmd: "insertOrderedList" },
    { id: "todo", icon: ListChecks, label: "Checklist",    cmd: "insertUnorderedList", arg: null, custom: "checklist" },
  ],
  [
    { id: "code",  icon: Code,      label: "Code",  cmd: "formatBlock", arg: "PRE" },
    { id: "quote", icon: Quote,     label: "Quote", cmd: "formatBlock", arg: "BLOCKQUOTE" },
    { id: "link",  icon: LinkIcon,  label: "Link",  custom: "link" },
  ],
];

export default function EditorToolbar({ onCommand, className }) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-1 rounded-lg border bg-background p-1 shadow-sm",
        className
      )}
    >
      {GROUPS.map((group, gi) => (
        <div key={gi} className="flex items-center gap-0.5">
          {group.map(({ id, icon: Icon, label, cmd, arg, custom }) => (
            <button
              key={id}
              type="button"
              aria-label={label}
              title={label}
              // onMouseDown prevents editor focus loss — critical for execCommand to work
              onMouseDown={(e) => {
                e.preventDefault();
                onCommand(custom ? { custom } : { cmd, arg });
              }}
              className="rounded-md p-2 text-muted-foreground transition hover:bg-accent hover:text-accent-foreground"
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
          {gi < GROUPS.length - 1 && <div className="mx-1 h-5 w-px bg-border" />}
        </div>
      ))}
    </div>
  );
}