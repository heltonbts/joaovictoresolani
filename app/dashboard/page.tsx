import Link from "next/link";
import { sql } from "@/lib/db";
import { isAuthed } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";
import LogoutButton from "@/components/LogoutButton";

export const dynamic = "force-dynamic";

function formatBRL(cents: number) {
  return ((cents || 0) / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function formatDate(d: string | Date) {
  return new Date(d).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function DashboardPage() {
  if (!(await isAuthed())) {
    return <LoginForm />;
  }

  const rsvps = await sql`SELECT * FROM rsvps ORDER BY created_at DESC`;
  const payments = await sql`
    SELECT p.*, COALESCE(g.title, p.custom_title) AS gift_title
    FROM gift_payments p
    LEFT JOIN gifts g ON g.id = p.gift_id
    ORDER BY p.created_at DESC
  `;

  const confirmados = rsvps.filter((r) => r.attending);
  const recusas = rsvps.filter((r) => !r.attending);
  const totalPessoas = confirmados.reduce((s, r) => s + 1 + (r.guests || 0), 0);

  const approved = payments.filter((p) => p.status === "approved");
  const arrecadado = approved.reduce((s, p) => s + (p.amount_cents || 0), 0);

  const stats = [
    { label: "Confirmados", value: confirmados.length },
    { label: "Total de pessoas", value: totalPessoas },
    { label: "Não vão", value: recusas.length },
    { label: "Presentes pagos", value: approved.length },
    { label: "Arrecadado", value: formatBRL(arrecadado) },
  ];

  return (
    <main className="flex-1 px-6 py-12 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-10">
        <div>
          <span className="label">Painel dos noivos</span>
          <h1 className="display text-4xl mt-1">João &amp; Solani</h1>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="label hover:text-ink">
            Ver site
          </Link>
          <LogoutButton />
        </div>
      </div>

      {/* estatísticas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-14">
        {stats.map((s) => (
          <div key={s.label} className="border border-line/70 bg-cream-soft p-5 text-center">
            <p className="display text-3xl text-ink">{s.value}</p>
            <p className="label mt-2">{s.label}</p>
          </div>
        ))}
      </div>

      {/* confirmações */}
      <section className="mb-16">
        <h2 className="display text-2xl mb-5">Confirmações de presença</h2>
        <div className="overflow-x-auto border border-line/70">
          <table className="w-full text-sm">
            <thead className="bg-cream-soft">
              <tr className="text-left">
                <Th>Nome</Th>
                <Th>Contato</Th>
                <Th>Vai?</Th>
                <Th>Acomp.</Th>
                <Th>Recado</Th>
                <Th>Quando</Th>
              </tr>
            </thead>
            <tbody>
              {rsvps.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-ink-soft">
                    Nenhuma confirmação ainda.
                  </td>
                </tr>
              )}
              {rsvps.map((r) => (
                <tr key={r.id} className="border-t border-line/50">
                  <Td>{r.name}</Td>
                  <Td>{r.contact || "—"}</Td>
                  <Td>
                    <span className={r.attending ? "text-accent" : "text-red-700"}>
                      {r.attending ? "Sim" : "Não"}
                    </span>
                  </Td>
                  <Td>{r.guests}</Td>
                  <Td className="max-w-xs">{r.message || "—"}</Td>
                  <Td>{formatDate(r.created_at)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* presentes */}
      <section>
        <h2 className="display text-2xl mb-5">Presentes</h2>
        <div className="overflow-x-auto border border-line/70">
          <table className="w-full text-sm">
            <thead className="bg-cream-soft">
              <tr className="text-left">
                <Th>De</Th>
                <Th>Presente</Th>
                <Th>Valor</Th>
                <Th>Status</Th>
                <Th>Recado</Th>
                <Th>Quando</Th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-ink-soft">
                    Nenhum presente ainda.
                  </td>
                </tr>
              )}
              {payments.map((p) => (
                <tr key={p.id} className="border-t border-line/50">
                  <Td>{p.buyer_name}</Td>
                  <Td>{p.gift_title || "—"}</Td>
                  <Td>{formatBRL(p.amount_cents)}</Td>
                  <Td>
                    <StatusBadge status={p.status} />
                  </Td>
                  <Td className="max-w-xs">{p.message || "—"}</Td>
                  <Td>{formatDate(p.created_at)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 label font-normal">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    approved: "text-accent",
    pending: "text-ink-soft",
    rejected: "text-red-700",
    cancelled: "text-red-700",
  };
  const labels: Record<string, string> = {
    approved: "Pago",
    pending: "Pendente",
    rejected: "Recusado",
    cancelled: "Cancelado",
  };
  return <span className={map[status] || "text-ink-soft"}>{labels[status] || status}</span>;
}
