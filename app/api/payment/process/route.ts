import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { getPaymentClient } from "@/lib/mp";
import { siteUrl } from "@/lib/config";

// Recebe o formData do Payment Brick (cartão ou PIX) e cria o pagamento no MP.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const orderId = String(body.orderId ?? "").trim();
    const formData = body.formData;

    if (!orderId || !formData || typeof formData !== "object") {
      return NextResponse.json({ error: "Dados de pagamento inválidos." }, { status: 400 });
    }

    const rows = await sql`
      SELECT buyer_name, amount_cents, status FROM gift_payments WHERE order_id = ${orderId}
    `;
    if (rows.length === 0) {
      return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
    }
    if (rows.some((r) => r.status === "approved")) {
      return NextResponse.json({ error: "Este pedido já foi pago." }, { status: 409 });
    }

    // total sempre recalculado no servidor (nunca confie no valor do cliente)
    const totalCents = rows.reduce((s, r) => s + Number(r.amount_cents), 0);
    const buyerName = String(rows[0].buyer_name ?? "");

    const client = getPaymentClient();
    if (!client) {
      return NextResponse.json(
        { error: "Pagamento ainda não configurado. Defina MP_ACCESS_TOKEN no .env.local." },
        { status: 503 }
      );
    }

    // MP exige que notification_url seja uma URL pública HTTPS — em dev
    // (localhost) o create falha com erro 4020 se ela for enviada.
    const base = siteUrl();
    const notificationUrl = base.startsWith("https://")
      ? `${base}/api/payment/webhook`
      : undefined;

    const result = await client.create({
      body: {
        ...formData,
        transaction_amount: Number((totalCents / 100).toFixed(2)),
        description: `Presentes de casamento — ${buyerName}`,
        external_reference: orderId,
        ...(notificationUrl ? { notification_url: notificationUrl } : {}),
      },
      requestOptions: { idempotencyKey: orderId },
    });

    const status = result.status ?? "pending";
    await sql`
      UPDATE gift_payments
      SET mp_payment_id = ${String(result.id)}, status = ${status}
      WHERE order_id = ${orderId}
    `;

    const tx = result.point_of_interaction?.transaction_data;

    return NextResponse.json({
      ok: true,
      paymentId: result.id,
      status,
      statusDetail: result.status_detail ?? null,
      qrCode: tx?.qr_code ?? null,
      qrCodeBase64: tx?.qr_code_base64 ?? null,
      ticketUrl: tx?.ticket_url ?? null,
    });
  } catch (e) {
    console.error("Erro ao processar pagamento:", e);
    return NextResponse.json(
      { error: "Não foi possível processar o pagamento. Tente novamente." },
      { status: 500 }
    );
  }
}
