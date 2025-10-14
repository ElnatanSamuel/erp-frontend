"use client";

import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { fromPromise } from "@elnatan/better-state/async";
import { useResource } from "@elnatan/better-state/react";
import { api } from "../../utils/api";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [res, setRes] = useState<ReturnType<typeof fromPromise> | null>(null);
  const idleRes = useMemo(() => fromPromise(Promise.resolve(null as any)), []);
  const snap = useResource(res ?? idleRes);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const r = fromPromise(
      api<{ ok: boolean; message?: string }>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      })
        .then((data) => {
          setMessage(data.message || "If an account exists, we've sent a reset code.");
          return true as const;
        })
        .catch((err) => {
          setError(err?.message || "Failed to send reset email");
          return false as const;
        })
    );
    setRes(r);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label className="block text-sm text-gray-600 mb-2">Email address</Label>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Enter email address"
          required
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {message && <p className="text-sm text-green-600">{message}</p>}
      <Button
        type="submit"
        disabled={snap.loading}
        className="w-full h-12 rounded-xl bg-gradient-to-r from-[#1D75FF] via-[#5B6EF5] to-[#1B57E9] hover:brightness-105 shadow-sm"
      >
        {snap.loading ? "Sending…" : "Send"}
      </Button>
    </form>
  );
}
