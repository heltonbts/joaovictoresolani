import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getPaymentClient } from "@/lib/mp";

// Mercado Pago notifica aqui quando o pagamento muda de status.
export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));

    const paymentId =
      body?.data?.id ||
      url.searchParams.get("data.id") ||
      url.searchParams.get("id");

    const type = body?.type || url.searchParams.get("type") || url.searchParams.get("topic");

    if (type && type !== "payment") {
      return NextResponse.json({ ignored: true });
    }
    if (!paymentId) return NextResponse.json({ ok: true });

    const client = getPaymentClient();
    if (!client) return NextResponse.json({ ok: true });

    const payment = await client.get({ id: String(paymentId) });
    const status = payment.status ?? "pending";
    const ref = payment.external_reference;

    if (ref) {
      // ref = order_id (checkout do carrinho) ou id antigo (compra unitária)
      await sql`
        UPDATE gift_payments SET status = ${status}
        WHERE order_id = ${String(ref)} OR id::text = ${String(ref)}
      `;
    } else {
      await sql`UPDATE gift_payments SET status = ${status} WHERE mp_payment_id = ${String(paymentId)}`;
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Erro no webhook:", e);
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true });
}
