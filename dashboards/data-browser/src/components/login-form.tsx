"use client";

import { useState } from "react";
import { SupabaseClient } from "@supabase/supabase-js";

interface LoginFormProps {
  client: SupabaseClient;
  onSuccess: () => void;
}

export function LoginForm({ client, onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await client.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      onSuccess();
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-4 rounded-lg border border-border bg-bg-card p-6"
      >
        <h1 className="text-lg font-semibold text-text-primary">
          Data Browser
        </h1>
        <p className="text-sm text-text-secondary">
          Sign in with your Supabase account
        </p>

        {error && (
          <div className="rounded border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-sm text-text-secondary">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-text-secondary">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded border border-border bg-bg-secondary px-3 py-2 text-sm text-text-primary outline-none focus:border-accent"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-accent py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
