// src/app/(app)/notes/layout.jsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PanelRightClose, PanelRightOpen } from "lucide-react";
import NotesTreePanel from "@/modules/notes/components/NotesTreePanel";
import { cn } from "@/core/utils/cn";
import { on } from "@/core/utils/events";
import FolderDialog from "@/modules/notes/components/FolderDialog";
import useSWR from "swr";

export default function NotesLayout({ children }) {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Restore collapsed state from localStorage
    useEffect(() => {
        const saved = localStorage.getItem("notes:tree-collapsed");
        if (saved === "1") setCollapsed(true);
    }, []);

    // Close mobile drawer on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    const toggle = () => {
        setCollapsed((c) => {
            const next = !c;
            localStorage.setItem("notes:tree-collapsed", next ? "1" : "0");
            return next;
        });
    };

    const { data: tree, mutate: mutateTree } = useSWR("/api/notes/tree");
    const folders = tree?.folders ?? [];
    const [folderDialogOpen, setFolderDialogOpen] = useState(false);
    const [editingFolder, setEditingFolder] = useState(null);

    useEffect(() => {
        const off = on("notes:new-folder", () => {
            setEditingFolder(null);
            setFolderDialogOpen(true);
        });
        return off;
    }, []);

    // Extract note id if on a note detail page
    const idMatch = pathname.match(/^\/notes\/([^/]+)$/);
    const currentNoteId =
        idMatch && idMatch[1] !== "new" ? idMatch[1] : null;

    return (
        <div className="flex min-h-[calc(100vh-3.5rem)] w-full">
            {/* Main content */}
            <div className="min-w-0 flex-1">{children}</div>

            {/* Desktop right panel */}
            <div
                className={cn(
                    "hidden shrink-0 border-l border-border/60 bg-muted/20 transition-all duration-300 lg:flex lg:flex-col",
                    collapsed ? "w-0 overflow-hidden border-l-0" : "w-80"
                )}
            >
                {!collapsed && <NotesTreePanel currentNoteId={currentNoteId} />}
            </div>

            {/* Desktop collapse/expand button */}
            <button
                onClick={toggle}
                className="fixed right-4 top-[4.5rem] z-30 hidden h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-background/95 shadow-sm backdrop-blur transition hover:bg-accent lg:flex"
                aria-label={collapsed ? "Open notes sidebar" : "Close notes sidebar"}
                title={collapsed ? "Open notes sidebar" : "Close notes sidebar"}
            >
                {collapsed ? (
                    <PanelRightOpen className="h-4 w-4 text-muted-foreground" />
                ) : (
                    <PanelRightClose className="h-4 w-4 text-muted-foreground" />
                )}
            </button>

            {/* Mobile floating toggle */}
            <button
                onClick={() => setMobileOpen(true)}
                className="fixed bottom-24 right-4 z-30 grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-primary to-magenta-500 text-primary-foreground shadow-lg transition-transform active:scale-95 lg:hidden"
                aria-label="Open notes sidebar"
            >
                <PanelRightOpen className="h-5 w-5" />
            </button>

            {/* Mobile drawer */}
            {mobileOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
                        onClick={() => setMobileOpen(false)}
                    />
                    <div className="fixed inset-y-0 right-0 z-50 flex w-[85vw] max-w-sm flex-col border-l border-border/70 bg-background shadow-2xl lg:hidden">
                        <div className="flex items-center justify-between border-b px-4 py-3">
                            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Notes
                            </span>
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition hover:bg-accent"
                                aria-label="Close"
                            >
                                <PanelRightClose className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="min-h-0 flex-1">
                            <NotesTreePanel currentNoteId={currentNoteId} />
                        </div>
                    </div>
                </>
            )}
            <FolderDialog
                open={folderDialogOpen}
                onClose={() => {
                    setFolderDialogOpen(false);
                    setEditingFolder(null);
                }}
                initial={editingFolder}
                folders={folders}
                onSaved={() => {
                    mutateTree();
                    setFolderDialogOpen(false);
                    setEditingFolder(null);
                }}
            />
        </div>
    );
}