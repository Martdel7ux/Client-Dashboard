import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in — Atelier" };

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas px-4">
      {/* Ambient accent glows */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-accent/20 blur-[140px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-[320px] w-[320px] rounded-full bg-accent/10 blur-[120px]"
      />
      <Suspense>
        <LoginForm />
      </Suspense>
    </main>
  );
}
