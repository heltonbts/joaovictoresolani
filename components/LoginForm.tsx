"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Crest from "@/components/Crest";

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: fd.get("password") }),
    });
    setLoading(false);
    if (res.ok) {
      router.refresh();
    } else {
      setError("Senha incorreta.");
    }
  }

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-6">
      <Crest size={120} />
      <h1 className="display text-3xl mt-8">Painel dos noivos</h1>
      <form onSubmit={onSubmit} className="w-full max-w-xs flex flex-col gap-4 mt-8">
        <input
          name="password"
          type="password"
          placeholder="Senha"
          autoFocus
          className="border border-line bg-cream-soft px-4 py-3 outline-none focus:border-ink text-center"
        />
        {error && <p className="text-red-700 text-sm text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-tiffany text-ink label hover:bg-tiffany-deep hover:text-cream transition-colors disabled:opacity-50"
        >
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
