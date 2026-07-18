"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { wedding } from "@/lib/config";
import Crest from "@/components/Crest";

type InviteGuest = { id: number; name: string; confirmed: boolean | null };
type Invite = { slug: string; title: string; guests: InviteGuest[] };

export default function ConfirmarPage() {
  return (
    <Suspense fallback={null}>
      <Confirmar />
    </Suspense>
  );
}

function Confirmar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = searchParams.get("convite");

  const [invite, setInvite] = useState<Invite | null>(null);
  const [loading, setLoading] = useState(Boolean(slug));
  const [answers, setAnswers] = useState<Record<number, boolean | null>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // carrega o convite personalizado
  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const res = await fetch(`/api/invites/${slug}`);
        if (!res.ok) throw new Error();
        const d: Invite = await res.json();
        setInvite(d);
        const initial: Record<number, boolean | null> = {};
        for (const g of d.guests) initial[g.id] = g.confirmed;
        setAnswers(initial);
      } catch {
        setInvite(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  // após confirmar, leva automaticamente para a lista de presentes
  useEffect(() => {
    if (status !== "done") return;
    const t = setTimeout(() => router.push("/presentes"), 3000);
    return () => clearTimeout(t);
  }, [status, router]);

  const answered = Object.values(answers).filter((v) => v !== null).length;
  const someoneGoes = Object.values(answers).some((v) => v === true);

  async function submit() {
    if (!invite) return;
    setStatus("sending");
    setError("");
    try {
      const confirmations = Object.entries(answers)
        .filter(([, v]) => v !== null)
        .map(([id, confirmed]) => ({ id: Number(id), confirmed }));
      const res = await fetch(`/api/invites/${invite.slug}/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmations, message }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || "Erro ao enviar.");
      }
      setStatus("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao enviar.");
      setStatus("error");
    }
  }

  return (
    <main className="flex-1 px-6 py-16 flex flex-col items-center">
      <Link
        href={invite ? `/convite/${invite.slug}` : "/"}
        className="label hover:text-ink mb-10"
      >
        ← Voltar
      </Link>

      <Crest size={110} />

      {status === "done" ? (
        <div className="text-center max-w-md mt-10">
          <h1 className="display text-4xl">Obrigado!</h1>
          <p className="mt-4 text-ink-soft">
            {someoneGoes
              ? "Presença confirmada com muito carinho. Mal podemos esperar para celebrar com vocês!"
              : "Sentiremos a falta de vocês, mas agradecemos por avisar. Estarão em nossos corações."}
          </p>
          <p className="label mt-8 animate-pulse">
            Levando você para a lista de presentes...
          </p>
          <Link
            href="/presentes"
            className="inline-block mt-6 px-10 py-4 bg-tiffany text-ink label hover:bg-tiffany-deep hover:text-cream transition-colors"
          >
            Ver lista de presentes agora
          </Link>
        </div>
      ) : loading ? (
        <p className="label mt-12 animate-pulse">Carregando convite...</p>
      ) : invite ? (
        <>
          <div className="text-center mt-8 mb-10">
            <span className="label">Confirmação de presença</span>
            <h1 className="display text-4xl sm:text-5xl mt-3">{invite.title}</h1>
            <p className="text-ink-soft mt-3">
              Confirme cada pessoa até {wedding.rsvpDeadlineLabel}.
            </p>
          </div>

          <div className="w-full max-w-md flex flex-col gap-4">
            {invite.guests.map((g) => (
              <div
                key={g.id}
                className="border border-line/70 bg-cream-soft px-5 py-4 flex items-center justify-between gap-4"
              >
                <span className="display text-xl">{g.name}</span>
                <div className="flex gap-2">
                  <GuestToggle
                    active={answers[g.id] === true}
                    onClick={() =>
                      setAnswers((a) => ({ ...a, [g.id]: true }))
                    }
                    label="Vai"
                  />
                  <GuestToggle
                    active={answers[g.id] === false}
                    onClick={() =>
                      setAnswers((a) => ({ ...a, [g.id]: false }))
                    }
                    label="Não vai"
                    negative
                  />
                </div>
              </div>
            ))}

            <div className="flex flex-col gap-2 mt-2">
              <label className="label" htmlFor="message">
                Deixe um recado (opcional)
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                className="border border-line bg-cream-soft px-4 py-3 outline-none focus:border-ink transition-colors resize-none"
              />
            </div>

            {status === "error" && (
              <p className="text-red-700 text-sm text-center">{error}</p>
            )}

            <button
              onClick={submit}
              disabled={status === "sending" || answered === 0}
              className="mt-2 px-10 py-4 bg-tiffany text-ink label hover:bg-tiffany-deep hover:text-cream transition-colors disabled:opacity-50"
            >
              {status === "sending" ? "Enviando..." : "Enviar confirmação"}
            </button>
            <Link
              href="/presentes"
              className="px-10 py-4 border border-ink text-ink label text-center hover:bg-ink hover:text-cream transition-colors"
            >
              Ir para lista de presentes
            </Link>
          </div>
        </>
      ) : (
        <div className="text-center max-w-md mt-10">
          <h1 className="display text-4xl">Confirmação de presença</h1>
          <p className="mt-4 text-ink-soft">
            {slug
              ? "Não encontramos este convite. Confira o link ou fale com os noivos."
              : "A confirmação é feita pelo link personalizado do seu convite. Se você ainda não recebeu o seu, fale com os noivos. ♥"}
          </p>
          <Link
            href="/presentes"
            className="inline-block mt-8 px-10 py-4 border border-ink text-ink label hover:bg-ink hover:text-cream transition-colors"
          >
            Ver lista de presentes
          </Link>
        </div>
      )}
    </main>
  );
}

function GuestToggle({
  active,
  onClick,
  label,
  negative = false,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  negative?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-4 py-2 border label transition-colors ${
        active
          ? negative
            ? "bg-ink text-cream border-ink"
            : "bg-tiffany text-ink border-tiffany"
          : "bg-transparent text-ink border-line hover:border-ink"
      }`}
    >
      {label}
    </button>
  );
}
