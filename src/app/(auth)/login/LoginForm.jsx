// src/app/(auth)/login/LoginForm.jsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/core/auth/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/dashboard";

  const [mode, setMode] = useState("google");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL: callbackUrl,
    });
    if (error) {
      toast.error(error.message ?? "Google sign-in failed");
      setLoading(false);
    }
  };

  const handleEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    const action = isSignUp
      ? authClient.signUp.email({ email, password, name })
      : authClient.signIn.email({ email, password });

    const { error } = await action;

    if (error) {
      toast.error(error.message ?? "Authentication failed");
      setLoading(false);
      return;
    }

    toast.success(isSignUp ? "Account created" : "Welcome back");
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {isSignUp ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isSignUp
            ? "Start your private workspace in seconds."
            : "Sign in to continue to your workspace."}
        </p>
      </div>

      <Button
        onClick={handleGoogle}
        disabled={loading}
        variant="outline"
        className="h-11 w-full gap-3"
      >
        <GoogleIcon className="h-4 w-4" />
        Continue with Google
      </Button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-background px-2 text-muted-foreground">
            or use email
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 rounded-lg border p-1">
        {["email", "google"].map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={`rounded-md py-1.5 text-xs capitalize transition ${
              mode === m
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground"
            }`}
          >
            {m === "email" ? "Email & password" : "Google"}
          </button>
        ))}
      </div>

      {mode === "email" && (
        <form onSubmit={handleEmail} className="space-y-3">
          {isSignUp && (
            <div>
              <label className="text-xs font-medium">Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                autoComplete="name"
                className="mt-1 h-11"
              />
            </div>
          )}
          <div>
            <label className="text-xs font-medium">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="mt-1 h-11"
            />
          </div>
          <div>
            <label className="text-xs font-medium">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={8}
              autoComplete={isSignUp ? "new-password" : "current-password"}
              className="mt-1 h-11"
            />
          </div>
          <Button type="submit" disabled={loading} className="h-11 w-full">
            {loading ? "Please wait…" : isSignUp ? "Create account" : "Sign in"}
          </Button>
        </form>
      )}

      <p className="text-center text-sm text-muted-foreground">
        {isSignUp ? "Already have an account?" : "New here?"}{" "}
        <button
          type="button"
          onClick={() => setIsSignUp((s) => !s)}
          className="font-medium text-primary hover:underline"
        >
          {isSignUp ? "Sign in" : "Create an account"}
        </button>
      </p>
    </div>
  );
}

function GoogleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z" />
    </svg>
  );
}