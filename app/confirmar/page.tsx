"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { wedding } from "@/lib/config";
import Crest from "@/components/Crest";

export default function ConfirmarPage() {
  const router = useRouter();
  const [attending, setAttending] = useState(true);
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">(
    "idle"
  );
  const [error, setError] = useState("");

  // após confirmar, leva automaticamente para a lista de presentes
  useEffect(() => {
    if (status !== "done") return;
    const t = setTimeout(() => router.push("/presentes"), 2500);
    return () => clearTimeout(t);
  }, [status, router]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setError("");
    const fd = new FormData(e.currentTarget);
    const payload = {
      name: fd.get("name"),
      contact: fd.get("contact"),
      attending,
      guests: fd.get("guests"),
      message: fd.get("message"),
    };
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
      <Link href="/" className="label hover:text-ink mb-10">
        ← Voltar
      </Link>

      <Crest size={110} />

      {status === "done" ? (
        <div className="text-center max-w-md mt-10">
          <h1 className="display text-4xl">Obrigado!</h1>
          <p className="mt-4 text-ink-soft">
            {attending
              ? "Sua presença foi confirmada com muito carinho. Mal podemos esperar para celebrar com você!"
              : "Sentiremos sua falta, mas agradecemos por avisar. Você estará em nossos corações."}
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
      ) : (
        <>
          <div className="text-center mt-8 mb-10">
            <span className="label">Confirmação de presença</span>
            <h1 className="display text-4xl sm:text-5xl mt-3">
              Você vai com a gente?
            </h1>
            <p className="text-ink-soft mt-3">
              Por favor, confirme até {wedding.rsvpDeadlineLabel}.
            </p>
          </div>

          <form onSubmit={onSubmit} className="w-full max-w-md flex flex-col gap-6">
            <Field label="Nome completo" name="name" required />
            <Field
              label="Telefone ou e-mail"
              name="contact"
              placeholder="(00) 00000-0000"
            />

            <div>
              <span className="label">Você vai comparecer?</span>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <Toggle
                  active={attending}
                  onClick={() => setAttending(true)}
                  label="Sim, eu vou!"
                />
                <Toggle
                  active={!attending}
                  onClick={() => setAttending(false)}
                  label="Não poderei"
                />
              </div>
            </div>

            {attending && (
              <Field
                label="Quantos acompanhantes? (além de você)"
                name="guests"
                type="number"
                defaultValue="0"
                min="0"
              />
            )}

            <div className="flex flex-col gap-2">
              <label className="label" htmlFor="message">
                Deixe um recado (opcional)
              </label>
              <textarea
                id="message"
                name="message"
                rows={3}
                className="border border-line bg-cream-soft px-4 py-3 outline-none focus:border-ink transition-colors resize-none"
              />
            </div>

            {status === "error" && (
              <p className="text-red-700 text-sm text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="mt-2 px-10 py-4 bg-tiffany text-ink label hover:bg-tiffany-deep hover:text-cream transition-colors disabled:opacity-50"
            >
              {status === "sending" ? "Enviando..." : "Confirmar presença"}
            </button>
            <Link
              href="/presentes"
              className="px-10 py-4 border border-ink text-ink label text-center hover:bg-ink hover:text-cream transition-colors"
            >
              Ir para lista de presentes
            </Link>
          </form>
        </>
      )}
    </main>
  );
}

function Field({
  label,
  name,
  type = "text",
  ...rest
}: {
  label: string;
  name: string;
  type?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-2">
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className="border border-line bg-cream-soft px-4 py-3 outline-none focus:border-ink transition-colors"
        {...rest}
      />
    </div>
  );
}

function Toggle({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`py-3 border label transition-colors ${
        active
          ? "bg-tiffany text-ink border-tiffany"
          : "bg-transparent text-ink border-line hover:border-ink"
      }`}
    >
      {label}
    </button>
  );
}
