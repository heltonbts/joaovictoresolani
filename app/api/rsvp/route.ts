import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const contact = String(body.contact ?? "").trim();
    const attending = Boolean(body.attending);
    const guests = Math.max(0, Math.min(20, Number(body.guests) || 0));
    const message = String(body.message ?? "").trim();

    if (!name) {
      return NextResponse.json({ error: "Informe seu nome." }, { status: 400 });
    }

    await sql`
      INSERT INTO rsvps (name, contact, attending, guests, message)
      VALUES (${name}, ${contact}, ${attending}, ${attending ? guests : 0}, ${message})
    `;

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Erro no RSVP:", e);
    return NextResponse.json(
      { error: "Não foi possível salvar. Tente novamente." },
      { status: 500 }
    );
  }
}
