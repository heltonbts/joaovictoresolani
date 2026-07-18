import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { sql } from "@/lib/db";

type Item = {
  giftId?: number;
  qty?: number;
  // presente personalizado: o convidado escolhe título e valor
  custom?: boolean;
  title?: string;
  amountCents?: number;
};

const CUSTOM_MIN_CENTS = 100; // R$ 1,00 (mínimo aceito pelo Mercado Pago)

// Cria o pedido (linhas pendentes em gift_payments) e devolve orderId + total.
// O pagamento em si é processado depois pelo Payment Brick em /api/payment/process.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const buyerName = String(body.buyerName ?? "").trim();
    const buyerEmail = String(body.buyerEmail ?? "").trim();
    const message = String(body.message ?? "").trim();
    const items: Item[] = Array.isArray(body.items) ? body.items : [];

    if (!buyerName) {
      return NextResponse.json({ error: "Informe seu nome." }, { status: 400 });
    }
    if (items.length === 0) {
      return NextResponse.json({ error: "Seu carrinho está vazio." }, { status: 400 });
    }

    // busca os presentes reais para confirmar preços (nunca confie no preço do cliente)
    const ids = items.filter((i) => !i.custom).map((i) => Number(i.giftId)).filter(Boolean);
    const gifts = ids.length
      ? await sql`SELECT id, title, price_cents FROM gifts WHERE id = ANY(${ids}) AND active = TRUE`
      : [];
    const giftMap = new Map(gifts.map((g) => [g.id, g]));

    const lines: { giftId: number | null; title: string; qty: number; lineTotal: number }[] = [];
    for (const i of items) {
      const qty = Math.max(1, Math.min(50, Number(i.qty) || 1));
      if (i.custom) {
        // presente personalizado: título livre, valor escolhido pelo convidado (com limites)
        const title = String(i.title ?? "").trim().slice(0, 120) || "Presente personalizado";
        const cents = Math.round(Number(i.amountCents));
        if (!Number.isFinite(cents) || cents < CUSTOM_MIN_CENTS) {
          return NextResponse.json(
            { error: "Valor do presente personalizado inválido (mínimo R$ 1,00)." },
            { status: 400 }
          );
        }
        lines.push({ giftId: null, title, qty, lineTotal: cents * qty });
      } else {
        const g = giftMap.get(Number(i.giftId));
        if (!g) continue;
        lines.push({ giftId: g.id, title: g.title, qty, lineTotal: g.price_cents * qty });
      }
    }

    if (lines.length === 0) {
      return NextResponse.json({ error: "Itens inválidos." }, { status: 400 });
    }

    if (!process.env.MP_ACCESS_TOKEN) {
      return NextResponse.json(
        { error: "Pagamento ainda não configurado. Defina MP_ACCESS_TOKEN no .env.local." },
        { status: 503 }
      );
    }

    const totalCents = lines.reduce((s, l) => s + l.lineTotal, 0);
    const orderId = randomUUID();

    // registra cada linha do pedido (pendente), agrupadas pelo order_id
    for (const l of lines) {
      await sql`
        INSERT INTO gift_payments (gift_id, custom_title, buyer_name, buyer_email, message, amount_cents, quantity, order_id, status)
        VALUES (${l.giftId}, ${l.giftId === null ? l.title : null}, ${buyerName}, ${buyerEmail}, ${message}, ${l.lineTotal}, ${l.qty}, ${orderId}, 'pending')
      `;
    }

    const description =
      lines.length === 1
        ? `Presente: ${lines[0].title}`
        : `Presentes (${lines.length} itens) — ${buyerName}`;

    return NextResponse.json({
      ok: true,
      orderId,
      amountCents: totalCents,
      description,
    });
  } catch (e) {
    console.error("Erro no checkout:", e);
    return NextResponse.json(
      { error: "Não foi possível iniciar o pagamento. Tente novamente." },
      { status: 500 }
    );
  }
}
