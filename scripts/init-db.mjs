// Cria as tabelas e popula a lista de presentes inicial.
// Rode com:  npm run db:init
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function main() {
  console.log("Criando tabelas...");

  await sql`
    CREATE TABLE IF NOT EXISTS rsvps (
      id          SERIAL PRIMARY KEY,
      name        TEXT NOT NULL,
      contact     TEXT,
      attending   BOOLEAN NOT NULL DEFAULT TRUE,
      guests      INTEGER NOT NULL DEFAULT 0,
      message     TEXT,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS gifts (
      id           SERIAL PRIMARY KEY,
      title        TEXT NOT NULL,
      description  TEXT,
      image_url    TEXT,
      price_cents  INTEGER NOT NULL,
      category     TEXT,
      sort_order   INTEGER NOT NULL DEFAULT 0,
      active       BOOLEAN NOT NULL DEFAULT TRUE,
      created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS gift_payments (
      id             SERIAL PRIMARY KEY,
      gift_id        INTEGER REFERENCES gifts(id),
      buyer_name     TEXT NOT NULL,
      buyer_email    TEXT,
      message        TEXT,
      amount_cents   INTEGER NOT NULL,
      quantity       INTEGER NOT NULL DEFAULT 1,
      order_id       TEXT,
      status         TEXT NOT NULL DEFAULT 'pending',
      mp_payment_id  TEXT,
      custom_title   TEXT,
      created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  // migração para bancos criados antes do presente personalizado
  await sql`ALTER TABLE gift_payments ADD COLUMN IF NOT EXISTS custom_title TEXT`;

  await sql`
    CREATE TABLE IF NOT EXISTS invites (
      id         SERIAL PRIMARY KEY,
      slug       TEXT UNIQUE NOT NULL,
      title      TEXT NOT NULL,
      message    TEXT,
      invited_by TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  // migração para bancos criados antes da tag de quem convidou
  await sql`ALTER TABLE invites ADD COLUMN IF NOT EXISTS invited_by TEXT`;

  await sql`
    CREATE TABLE IF NOT EXISTS invite_guests (
      id           SERIAL PRIMARY KEY,
      invite_id    INTEGER NOT NULL REFERENCES invites(id) ON DELETE CASCADE,
      name         TEXT NOT NULL,
      confirmed    BOOLEAN,
      confirmed_at TIMESTAMPTZ,
      sort_order   INTEGER NOT NULL DEFAULT 0
    );
  `;

  const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM gifts`;
  if (count === 0) {
    console.log("Populando lista de presentes inicial...");
    // [title, description, image_url, price_cents, category, sort_order]
    const seed = [
      ["Passeio de barco", "Um passeio a dois pelas águas, remando juntos pra mais uma aventura.", "/gifts/passeio.webp", 20000, "Lua de Mel", 1],
      ["Viagem para Paris", "Ajude com as passagens da nossa lua de mel para a Cidade Luz.", "/gifts/paris.webp", 150000, "Lua de Mel", 2],
      ["Manda um PIX", "Sem rodeios: manda o PIX e a gente faz a festa. 😎💸", "/gifts/manda-pix.webp", 40000, "Especial", 3],
      ["Uma corrida a dois", "Uma inscrição pra mais uma prova lado a lado — do nosso jeito. 🏃", "/gifts/corrida.webp", 8000, "Especial", 4],
      ["Vale night com o sogro", "Uma rodada por conta de vocês pra animar a resenha do genro com o sogro. 😄", "/gifts/sogro.webp", 10000, "Especial", 4],
      ["Skincare para o casal", "Uma tarde de autocuidado a dois — máscaras, risadas e pele renovada.", "/gifts/skincare.webp", 15000, "Especial", 5],
      ["Uma rodada de pôquer", "Fichas por conta de vocês pra uma noite de pôquer do noivo. 🃏", "/gifts/poker.webp", 18000, "Especial", 6],
      ["Creche da Paçoca", "Uma temporada na creche para a nossa Paçoca enquanto curtimos a lua de mel.", "/gifts/pacoca.webp", 35000, "Especial", 7],
      ["Um Botox para o JV", "Ajude a suavizar as expressões do noivo. Resultados não garantidos. 😄", "/gifts/botox.webp", 80000, "Especial", 8],
      ["Uma semana sem a Solani brigar com o JV", "Cota premium e por tempo limitado: sete dias de paz absoluta no relacionamento. 😄", "/gifts/solani.webp", 100000, "Especial", 9],
    ];
    for (const [title, description, image, price, category, order] of seed) {
      await sql`
        INSERT INTO gifts (title, description, image_url, price_cents, category, sort_order)
        VALUES (${title}, ${description}, ${image}, ${price}, ${category}, ${order})
      `;
    }
  }

  console.log("Pronto! Banco configurado.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
