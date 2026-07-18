import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

// Dados públicos de um convite: título e convidados com status.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const [invite] = await sql`
    SELECT id, slug, title FROM invites WHERE slug = ${slug}
  `;
  if (!invite) {
    return NextResponse.json({ error: "Convite não encontrado." }, { status: 404 });
  }
  const guests = await sql`
    SELECT id, name, confirmed FROM invite_guests
    WHERE invite_id = ${invite.id}
    ORDER BY sort_order, id
  `;
  return NextResponse.json({
    slug: invite.slug,
    title: invite.title,
    guests: guests.map((g) => ({ id: g.id, name: g.name, confirmed: g.confirmed })),
  });
}
