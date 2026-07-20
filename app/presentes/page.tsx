import Link from "next/link";
import { sql } from "@/lib/db";
import Crest from "@/components/Crest";
import Shop, { type Gift } from "@/components/Shop";

export const dynamic = "force-dynamic";

export default async function PresentesPage() {
  const gifts = (await sql`
    SELECT id, title, description, image_url, price_cents, category
    FROM gifts
    WHERE active = TRUE
    ORDER BY sort_order ASC, id ASC
  `) as Gift[];

  return (
    <main className="flex-1 px-6 py-16 flex flex-col items-center">
      <Link href="/" className="label hover:text-ink mb-10 self-center">
        ← Voltar
      </Link>

      <Crest size={110} />

      <div className="text-center mt-8 mb-14 max-w-xl">
        <span className="label">Lista de presentes</span>
        <h1 className="display text-4xl sm:text-5xl mt-3">
          Um carinho para começarmos
        </h1>
        <p className="text-ink-soft mt-4">
          Sua presença já é o nosso maior presente. Mas, se quiser nos mimar,
          escolha uma cota abaixo — o pagamento é por PIX ou cartão, rápido e
          seguro.
        </p>
        <p className="label mt-4">
          💳 No cartão de crédito você pode parcelar em até 12x
        </p>
      </div>

      <Shop gifts={gifts} />
    </main>
  );
}
