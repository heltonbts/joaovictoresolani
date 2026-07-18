import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// Confirmação individual dos convidados de um convite.
export async function POST(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const [invite] = await sql`SELECT id FROM invites WHERE slug = ${slug}`;
    if (!invite) {
      return NextResponse.json({ error: "Convite não encontrado." }, { status: 404 });
    }

    const body = await req.json();
    const confirmations: { id: number; confirmed: boolean }[] = Array.isArray(
      body.confirmations
    )
      ? body.confirmations
      : [];
    const message = String(body.message ?? "").trim().slice(0, 1000);

    if (confirmations.length === 0) {
      return NextResponse.json(
        { error: "Selecione ao menos uma pessoa." },
        { status: 400 }
      );
    }

    for (const c of confirmations) {
      // só atualiza convidados que pertencem a este convite
      await sql`
        UPDATE invite_guests
        SET confirmed = ${Boolean(c.confirmed)}, confirmed_at = now()
        WHERE id = ${Number(c.id)} AND invite_id = ${invite.id}
      `;
    }

    if (message) {
      await sql`UPDATE invites SET message = ${message} WHERE id = ${invite.id}`;
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Erro ao confirmar convite:", e);
    return NextResponse.json({ error: "Erro ao enviar a confirmação." }, { status: 500 });
  }
}
