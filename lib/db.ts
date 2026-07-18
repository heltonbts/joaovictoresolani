import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL não definida. Configure o .env.local");
}

// Cliente SQL do Neon (serverless, funciona em edge e node).
// Uso: const rows = await sql`SELECT * FROM rsvps`;
export const sql = neon(process.env.DATABASE_URL);
