import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const gifts = await sql`
      SELECT id, title, description, image_url, price_cents, category
      FROM gifts
      WHERE active = TRUE
      ORDER BY sort_order ASC, id ASC
    `;
    return NextResponse.json({ gifts });
  } catch (e) {
    console.error("Erro ao listar presentes:", e);
    return NextResponse.json({ error: "Erro ao carregar." }, { status: 500 });
  }
}
