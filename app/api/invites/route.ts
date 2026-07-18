import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { isAuthed } from "@/lib/auth";

function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// Cria um convite nomeado com a lista de convidados (somente noivos).
export async function POST(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  try {
    const body = await req.json();
    const title = String(body.title ?? "").trim().slice(0, 120);
    const guests: string[] = (Array.isArray(body.guests) ? body.guests : [])
      .map((g: unknown) => String(g ?? "").trim().slice(0, 80))
      .filter(Boolean);

    if (!title) {
      return NextResponse.json({ error: "Informe o nome do convite." }, { status: 400 });
    }
    if (guests.length === 0) {
      return NextResponse.json({ error: "Informe ao menos um convidado." }, { status: 400 });
    }

    const base = slugify(title) || "convite";
    let slug = base;
    let invite: { id: number } | null = null;
    for (let n = 2; !invite; n++) {
      try {
        const [row] = await sql`
          INSERT INTO invites (slug, title) VALUES (${slug}, ${title}) RETURNING id
        `;
        invite = row as { id: number };
      } catch {
        if (n > 50) throw new Error("Não foi possível gerar um link único.");
        slug = `${base}-${n}`;
      }
    }

    for (let i = 0; i < guests.length; i++) {
      await sql`
        INSERT INTO invite_guests (invite_id, name, sort_order)
        VALUES (${invite.id}, ${guests[i]}, ${i})
      `;
    }

    return NextResponse.json({ ok: true, id: invite.id, slug });
  } catch (e) {
    console.error("Erro ao criar convite:", e);
    return NextResponse.json({ error: "Erro ao criar o convite." }, { status: 500 });
  }
}

// Exclui um convite e seus convidados (somente noivos).
export async function DELETE(req: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }
  const id = Number(new URL(req.url).searchParams.get("id"));
  if (!id) {
    return NextResponse.json({ error: "Convite inválido." }, { status: 400 });
  }
  await sql`DELETE FROM invites WHERE id = ${id}`;
  return NextResponse.json({ ok: true });
}
