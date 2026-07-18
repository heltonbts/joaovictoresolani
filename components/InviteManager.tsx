"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type InviteRow = {
  id: number;
  slug: string;
  title: string;
  message: string | null;
  guests: { id: number; name: string; confirmed: boolean | null }[];
};

export default function InviteManager({ invites }: { invites: InviteRow[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [names, setNames] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      const guests = names
        .split("\n")
        .map((n) => n.trim())
        .filter(Boolean);
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, guests }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Erro ao criar o convite.");
      setTitle("");
      setNames("");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar o convite.");
    } finally {
      setSending(false);
    }
  }

  function copyLink(inv: InviteRow) {
    const url = `${window.location.origin}/convite/${inv.slug}`;
    navigator.clipboard.writeText(url);
    setCopied(inv.id);
    setTimeout(() => setCopied((c) => (c === inv.id ? null : c)), 1500);
  }

  async function remove(inv: InviteRow) {
    // primeiro clique arma a exclusão, segundo confirma
    if (deleting !== inv.id) {
      setDeleting(inv.id);
      setTimeout(() => setDeleting((d) => (d === inv.id ? null : d)), 3000);
      return;
    }
    setDeleting(null);
    await fetch(`/api/invites?id=${inv.id}`, { method: "DELETE" });
    router.refresh();
  }

  return (
    <div className="grid lg:grid-cols-[minmax(280px,340px)_1fr] gap-6 items-start">
      {/* criar convite */}
      <form
        onSubmit={create}
        className="border border-line/70 bg-cream-soft p-6 flex flex-col gap-4"
      >
        <h3 className="display text-xl">Novo convite</h3>
        <div className="flex flex-col gap-2">
          <label className="label" htmlFor="inv-title">
            Nome do convite
          </label>
          <input
            id="inv-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex.: Helton e família"
            required
            className="border border-line bg-cream px-4 py-3 outline-none focus:border-ink transition-colors"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="label" htmlFor="inv-names">
            Convidados (um por linha)
          </label>
          <textarea
            id="inv-names"
            value={names}
            onChange={(e) => setNames(e.target.value)}
            placeholder={"Helton\nRaquel\nBianca"}
            rows={5}
            required
            className="border border-line bg-cream px-4 py-3 outline-none focus:border-ink transition-colors resize-none"
          />
        </div>
        {error && <p className="text-red-700 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={sending}
          className="py-3 bg-tiffany text-ink label hover:bg-tiffany-deep hover:text-cream transition-colors disabled:opacity-50"
        >
          {sending ? "Criando..." : "Criar convite"}
        </button>
      </form>

      {/* lista de convites */}
      <div className="flex flex-col gap-4">
        {invites.length === 0 && (
          <p className="text-ink-soft border border-line/70 p-6">
            Nenhum convite criado ainda. Crie o primeiro ao lado e envie o link
            para a família ou grupo.
          </p>
        )}
        {invites.map((inv) => {
          const going = inv.guests.filter((g) => g.confirmed === true).length;
          const notGoing = inv.guests.filter((g) => g.confirmed === false).length;
          const pending = inv.guests.length - going - notGoing;
          return (
            <div key={inv.id} className="border border-line/70 bg-cream-soft p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="display text-xl">{inv.title}</p>
                  <p className="text-ink-soft text-sm mt-1">
                    /convite/{inv.slug} — {going} confirmado{going === 1 ? "" : "s"} ·{" "}
                    {notGoing} não {notGoing === 1 ? "vai" : "vão"} · {pending} pendente
                    {pending === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => copyLink(inv)}
                    className="px-4 py-2 border border-ink label hover:bg-ink hover:text-cream transition-colors"
                  >
                    {copied === inv.id ? "Link copiado!" : "Copiar link"}
                  </button>
                  <button
                    onClick={() => remove(inv)}
                    className="px-4 py-2 border border-red-700 text-red-700 label hover:bg-red-700 hover:text-cream transition-colors"
                  >
                    {deleting === inv.id ? "Confirmar?" : "Excluir"}
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {inv.guests.map((g) => (
                  <span
                    key={g.id}
                    className={`px-3 py-1.5 text-sm border ${
                      g.confirmed === true
                        ? "border-tiffany-deep bg-tiffany/40"
                        : g.confirmed === false
                          ? "border-red-700/40 text-red-700 line-through"
                          : "border-line text-ink-soft"
                    }`}
                  >
                    {g.name}
                    {g.confirmed === true && " ✓"}
                  </span>
                ))}
              </div>
              {inv.message && (
                <p className="text-ink-soft text-sm mt-3 italic">“{inv.message}”</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
