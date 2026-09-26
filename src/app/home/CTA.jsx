// src/app/home/CTA.jsx
import Link from "next/link";
import { LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CTA() {
  return (
    <section className="py-16 sm:py-24">
      <div className="mx-auto max-w-4xl rounded-2xl border bg-gradient-to-br from-primary/5 via-background to-primary/10 p-10 text-center">
        <LineChart className="mx-auto h-10 w-10 text-primary" />
        <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to get organized?
        </h2>
        <p className="mt-3 text-muted-foreground">
          Sign in with Google and start writing your first note in under 30 seconds.
        </p>
        <Link href="/login" className="mt-6 inline-block">
          <Button size="lg">Get started free</Button>
        </Link>
      </div>
    </section>
  );
}