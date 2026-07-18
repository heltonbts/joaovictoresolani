import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getPaymentClient } from "@/lib/mp";

// O frontend chama aqui para verificar se o PIX já foi pago.
// Use ?order=<order_id> (checkout do carrinho).
export async function GET(req: Request) {
  try {
    const order = new URL(req.url).searchParams.get("order");
    if (!order) return NextResponse.json({ error: "order ausente" }, { status: 400 });

    const rows = await sql`
      SELECT id, mp_payment_id, status FROM gift_payments WHERE order_id = ${order}
    `;
    if (rows.length === 0) {
      return NextResponse.json({ error: "não encontrado" }, { status: 404 });
    }

    let status = rows[0].status as string;
    const mpId = rows[0].mp_payment_id as string | null;

    // consulta o status mais recente no Mercado Pago (útil em localhost, sem webhook)
    const client = getPaymentClient();
    if (client && mpId && status !== "approved") {
      try {
        const payment = await client.get({ id: String(mpId) });
        if (payment.status && payment.status !== status) {
          status = payment.status;
          await sql`UPDATE gift_payments SET status = ${status} WHERE order_id = ${order}`;
        }
      } catch {
        /* ignora falha pontual */
      }
    }

    return NextResponse.json({ status });
  } catch (e) {
    console.error("Erro ao consultar status:", e);
    return NextResponse.json({ error: "erro" }, { status: 500 });
  }
}
