// src/app/(auth)/login/page.jsx
import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-16">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted border-t-primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}