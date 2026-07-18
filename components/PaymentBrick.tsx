"use client";

import { initMercadoPago, Payment } from "@mercadopago/sdk-react";

const publicKey = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY;
if (typeof window !== "undefined" && publicKey) {
  initMercadoPago(publicKey, { locale: "pt-BR" });
}

export default function PaymentBrick({
  amountCents,
  payerEmail,
  onPay,
  onError,
}: {
  amountCents: number;
  payerEmail?: string;
  onPay: (formData: Record<string, unknown>) => Promise<void>;
  onError: (message: string) => void;
}) {
  if (!publicKey) {
    return (
      <p className="text-red-700 text-sm">
        Pagamento indisponível: defina NEXT_PUBLIC_MP_PUBLIC_KEY no .env.local.
      </p>
    );
  }

  return (
    <Payment
      initialization={{
        amount: Number((amountCents / 100).toFixed(2)),
        payer: payerEmail ? { email: payerEmail } : undefined,
      }}
      customization={{
        paymentMethods: {
          creditCard: "all",
          debitCard: "all",
          bankTransfer: "all",
          maxInstallments: 12,
        },
      }}
      onSubmit={async ({ formData }) => {
        await onPay(formData as unknown as Record<string, unknown>);
      }}
      onError={(error) => {
        console.error("Erro no Payment Brick:", error);
        onError("Não foi possível carregar o pagamento. Recarregue a página.");
      }}
    />
  );
}
