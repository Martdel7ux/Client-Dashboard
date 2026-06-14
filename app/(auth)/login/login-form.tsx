"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { login, type LoginState } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/logo";

const initialState: LoginState = { error: null };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? (
        <>
          <Loader2 className="animate-spin" /> Signing in
        </>
      ) : (
        <>
          Sign in <ArrowRight />
        </>
      )}
    </Button>
  );
}

export function LoginForm() {
  const [state, formAction] = useFormState(login, initialState);
  const redirect = useSearchParams().get("redirect") ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10 w-full max-w-[400px]"
    >
      <div className="mb-8 flex flex-col items-center text-center">
        <Logo className="mb-6" />
        <h1 className="text-2xl font-extrabold tracking-tight text-ink">
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm text-ink-muted">
          Sign in to your project portal
        </p>
      </div>

      <div className="card-premium noise p-7">
        <form action={formAction} className="space-y-5">
          <input type="hidden" name="redirect" value={redirect} />

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••••••"
              required
            />
          </div>

          {state.error && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-red-400"
            >
              {state.error}
            </motion.p>
          )}

          <SubmitButton />
        </form>
      </div>

      <p className="mt-5 text-center text-xs leading-relaxed text-ink-faint">
        First time here? Check your email for login details we sent when your
        project was set up.
      </p>
    </motion.div>
  );
}
