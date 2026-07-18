import { createHash } from "crypto";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "admin_session";

export function expectedToken() {
  const pw = process.env.ADMIN_PASSWORD || "admin";
  return createHash("sha256").update(`convite-js::${pw}`).digest("hex");
}

export function checkPassword(password: string) {
  return password === (process.env.ADMIN_PASSWORD || "admin");
}

export async function isAuthed() {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value === expectedToken();
}
