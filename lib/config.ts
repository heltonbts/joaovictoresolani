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
