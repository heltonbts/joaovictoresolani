"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type InviteRow = {
  id: number;
  slug: string;
  title: string;
  message: string | null;
  invitedBy: string | null; // "noivo" | "noiva"
  guests: { id: number; name: string; confirmed: boolean | null }[];
};

type Tab = "todos" | "confirmados" | "pendentes";

// família "confirmada" = todos os convidados já responderam (vai ou não vai)
function isConfirmed(inv: InviteRow) {
  return inv.guests.length > 0 && inv.guests.every((g) => g.confirmed !== null);
}

export default function InviteManager({ invites }: { invites: InviteRow[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("todos");
  const [who, setWho] = useState<"todos" | "noivo" | "noiva">("todos");
  const [title, setTitle] = useState("");
  const [invitedBy, setInvitedBy] = useState<"noivo" | "noiva" | "">("");
  const [names, setNames] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  const byWho = who === "todos" ? invites : invites.filter((i) => i.invitedBy === who);
  const confirmadas = byWho.filter(isConfirmed);
  const pendentes = byWho.filter((i) => !isConfirmed(i));
  const shown =
    tab === "confirmados" ? confirmadas : tab === "pendentes" ? pendentes : byWho;

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
        body: JSON.stringify({ title, guests, invitedBy: invitedBy || null }),
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
          <span className="label">Quem convidou</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setInvitedBy((v) => (v === "noivo" ? "" : "noivo"))}
              className={`py-2 border label transition-colors ${
                invitedBy === "noivo"
                  ? "bg-tiffany text-ink border-tiffany"
                  : "bg-transparent text-ink border-line hover:border-ink"
              }`}
            >
              Noivo
            </button>
            <button
              type="button"
              onClick={() => setInvitedBy((v) => (v === "noiva" ? "" : "noiva"))}
              className={`py-2 border label transition-colors ${
                invitedBy === "noiva"
                  ? "bg-tiffany text-ink border-tiffany"
                  : "bg-transparent text-ink border-line hover:border-ink"
              }`}
            >
              Noiva
            </button>
          </div>
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
        {/* abas de status */}
        <div className="flex flex-wrap gap-2">
          <TabButton active={tab === "todos"} onClick={() => setTab("todos")}>
            Todos ({byWho.length})
          </TabButton>
          <TabButton
            active={tab === "confirmados"}
            onClick={() => setTab("confirmados")}
          >
            Confirmados ({confirmadas.length})
          </TabButton>
          <TabButton active={tab === "pendentes"} onClick={() => setTab("pendentes")}>
            Faltam confirmar ({pendentes.length})
          </TabButton>
        </div>

        {/* filtro por quem convidou */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="label text-ink-soft mr-1">Quem convidou:</span>
          <TabButton active={who === "todos"} onClick={() => setWho("todos")}>
            Todos
          </TabButton>
          <TabButton active={who === "noivo"} onClick={() => setWho("noivo")}>
            Noivo ({invites.filter((i) => i.invitedBy === "noivo").length})
          </TabButton>
          <TabButton active={who === "noiva"} onClick={() => setWho("noiva")}>
            Noiva ({invites.filter((i) => i.invitedBy === "noiva").length})
          </TabButton>
        </div>

        {invites.length === 0 && (
          <p className="text-ink-soft border border-line/70 p-6">
            Nenhum convite criado ainda. Crie o primeiro ao lado e envie o link
            para a família ou grupo.
          </p>
        )}
        {invites.length > 0 && shown.length === 0 && (
          <p className="text-ink-soft border border-line/70 p-6">
            {tab === "confirmados"
              ? "Nenhuma família confirmou todo mundo ainda."
              : "Todas as famílias já responderam. 🎉"}
          </p>
        )}
        {shown.map((inv) => {
          const going = inv.guests.filter((g) => g.confirmed === true).length;
          const notGoing = inv.guests.filter((g) => g.confirmed === false).length;
          const pending = inv.guests.length - going - notGoing;
          return (
            <div key={inv.id} className="border border-line/70 bg-cream-soft p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="display text-xl">{inv.title}</p>
                    {inv.invitedBy && (
                      <span
                        className={`px-2 py-0.5 text-xs label border ${
                          inv.invitedBy === "noivo"
                            ? "border-tiffany-deep bg-tiffany/30"
                            : "border-accent/60 bg-accent/10"
                        }`}
                      >
                        {inv.invitedBy === "noivo" ? "Noivo" : "Noiva"}
                      </span>
                    )}
                  </div>
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

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 border label transition-colors ${
        active
          ? "bg-ink text-cream border-ink"
          : "bg-transparent text-ink border-line hover:border-ink"
      }`}
    >
      {children}
    </button>
  );
}
