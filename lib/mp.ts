import { MercadoPagoConfig, Payment } from "mercadopago";

export function getPaymentClient() {
  const accessToken = process.env.MP_ACCESS_TOKEN;
  if (!accessToken) return null;
  const client = new MercadoPagoConfig({ accessToken });
  return new Payment(client);
}

export function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
