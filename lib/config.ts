// =============================================================
//  Dados do casamento — edite aqui livremente
// =============================================================

export const wedding = {
  bride: "Solani",
  groom: "João Victor",
  // monograma exibido na logo
  monogram: "JS",
  // data oficial do casamento (ano, mês [1-12], dia, hora, minuto)
  date: new Date(2026, 9, 31, 16, 0), // 31/10/2026 16:00
  dateLabel: "31 de Outubro de 2026",
  dateShort: "31.10.26",
  // local — ajuste com os dados reais
  ceremony: {
    title: "Cerimônia",
    place: "Porto Cabeção Bar",
    address: "Confira a localização no mapa",
    time: "16h00",
    mapsUrl: "https://share.google/DNPCjdnSR0xCcYCqv",
  },
  reception: {
    title: "Recepção",
    place: "Porto Cabeção Bar",
    address: "Confira a localização no mapa",
    time: "16h00",
    mapsUrl: "https://share.google/DNPCjdnSR0xCcYCqv",
  },
  // breve história do casal (aparece na home)
  story:
    "Entre passeios, cafés e a companhia fiel da nossa salsichinha, descobrimos que a vida fica melhor a dois. Agora queremos celebrar esse amor ao lado de quem amamos. Será uma honra ter você conosco.",
  // dados do PIX para presentes (chave para recebimento via Mercado Pago)
  pix: {
    receiverName: "João Victor & Solani",
  },
  rsvpDeadlineLabel: "30 de Setembro de 2026",
} as const;

// URL pública do site. Usada no og:image e na notification_url do Mercado
// Pago — ambos precisam de uma URL absoluta e acessível de fora.
// NEXT_PUBLIC_BASE_URL só vale se for https: um valor de dev sobrando no
// ambiente (http://localhost:3000) quebraria os dois silenciosamente.
export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_BASE_URL;
  if (configured?.startsWith("https://")) return configured.replace(/\/$/, "");

  // injetada automaticamente pela Vercel, sem protocolo
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}
