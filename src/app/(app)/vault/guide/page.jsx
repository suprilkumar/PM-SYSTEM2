import VaultGuide from "@/modules/vault/components/VaultGuide";

export default function GuidePage() {
  return (
    <div className="mx-auto w-full max-w-3xl p-4 md:p-8">
      <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
        How your vault works
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        A complete walkthrough of setup, saving, and recovering.
      </p>
      <div className="mt-6">
        <VaultGuide />
      </div>
    </div>
  );
}