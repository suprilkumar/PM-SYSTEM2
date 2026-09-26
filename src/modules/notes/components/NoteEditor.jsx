// src/modules/notes/components/NoteEditor.jsx
"use client";

import { useEffect, useRef, useState } from "react";
import EditorToolbar from "./EditorToolbar";
import { editorToPlainText } from "../lib/editor";
import { cn } from "@/core/utils/cn";

export default function NoteEditor({ initialHtml = "", onChange }) {
  const ref = useRef(null);
  const [showToolbar, setShowToolbar] = useState(true);

  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== initialHtml) {
      ref.current.innerHTML = initialHtml || "";
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emitChange = () => {
    if (!ref.current) return;
    const html = ref.current.innerHTML;
    const plainText = editorToPlainText(html);
    onChange?.({ html, plainText });
  };

  const runCommand = ({ cmd, arg, custom }) => {
    if (!ref.current) return;
    ref.current.focus();

    if (custom === "link") {
      const url = window.prompt("Enter URL");
      if (url) document.execCommand("createLink", false, url);
    } else if (custom === "checklist") {
      document.execCommand("insertText", false, "☐ ");
    } else if (cmd) {
      document.execCommand(cmd, false, arg ?? null);
    }
    emitChange();
  };

  const onKeyDown = (e) => {
    const mod = e.metaKey || e.ctrlKey;
    if (!mod) return;
    const key = e.key.toLowerCase();
    const map = {
      b: { cmd: "bold" },
      i: { cmd: "italic" },
      u: { cmd: "underline" },
      1: { cmd: "formatBlock", arg: "H1" },
      2: { cmd: "formatBlock", arg: "H2" },
      3: { cmd: "formatBlock", arg: "H3" },
      0: { cmd: "formatBlock", arg: "P" },
    };
    if (map[key]) {
      e.preventDefault();
      runCommand(map[key]);
    }
  };

  const onPaste = (e) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    emitChange();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">Formatting</span>
        <button
          type="button"
          onClick={() => setShowToolbar((s) => !s)}
          className="text-xs text-primary hover:underline"
        >
          {showToolbar ? "Hide" : "Show"} toolbar
        </button>
      </div>

      {showToolbar && <EditorToolbar onCommand={runCommand} />}

      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        onInput={emitChange}
        onBlur={emitChange}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        data-placeholder="Start writing…"
        className={cn(
          "min-h-[400px] w-full rounded-lg border bg-background p-4 text-sm leading-relaxed outline-none focus:ring-2 focus:ring-primary/30",
          "[&_h1]:my-3 [&_h1]:text-2xl [&_h1]:font-bold",
          "[&_h2]:my-2 [&_h2]:text-xl [&_h2]:font-semibold",
          "[&_h3]:my-2 [&_h3]:text-lg [&_h3]:font-semibold",
          "[&_p]:my-2",
          "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6",
          "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6",
          "[&_li]:my-1",
          "[&_blockquote]:my-2 [&_blockquote]:border-l-4 [&_blockquote]:border-border [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-muted-foreground",
          "[&_pre]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-xs",
          "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs",
          "[&_a]:text-primary [&_a]:underline",
          "empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground"
        )}
      />
    </div>
  );
}