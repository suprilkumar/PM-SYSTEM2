// src/components/layout/Topbar.jsx
import UserMenu from "./UserMenu";
import ThemeToggle from "@/components/theme-toggle";

export default function Topbar() {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur">
      <div className="font-semibold md:hidden">Personal Suite</div>
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}