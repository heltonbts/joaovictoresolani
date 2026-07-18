"use client";

import { useEffect, useMemo, useState } from "react";
import PaymentBrick from "./PaymentBrick";

export type Gift = {
  id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  price_cents: number;
  category: string | null;
};

type CartItem = {
  id: number | string;
  title: string;
  priceCents: number;
  qty: number;
  custom?: boolean;
};

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

const STORAGE_KEY = "wedding-cart";

export default function Shop({ gifts }: { gifts: Gift[] }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [added, setAdded] = useState<number | null>(null);

  // carrega/salva carrinho no localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCart(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.priceCents * i.qty, 0);

  function add(g: Gift) {
    setCart((c) => {
      const found = c.find((i) => i.id === g.id);
      if (found) {
        return c.map((i) => (i.id === g.id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...c, { id: g.id, title: g.title, priceCents: g.price_cents, qty: 1 }];
    });
    setAdded(g.id);
    setTimeout(() => setAdded((a) => (a === g.id ? null : a)), 1200);
  }

  function addCustom(title: string, priceCents: number) {
    setCart((c) => [
      ...c,
      {
        id: `custom-${Date.now()}`,
        title: title.trim() || "Presente personalizado",
        priceCents,
        qty: 1,
        custom: true,
      },
    ]);
  }

  function setQty(id: number | string, qty: number) {
    if (qty <= 0) return setCart((c) => c.filter((i) => i.id !== id));
    setCart((c) => c.map((i) => (i.id === id ? { ...i, qty } : i)));
  }

  const categories = useMemo(
    () => Array.from(new Set(gifts.map((g) => g.category ?? "Outros"))),
    [gifts]
  );

  return (
    <div className="w-full max-w-5xl">
      {categories.map((cat) => (
        <div key={cat} className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <span className="hairline flex-1" />
            <span className="label whitespace-nowrap">{cat}</span>
            <span className="hairline flex-1" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {gifts
              .filter((g) => (g.category ?? "Outros") === cat)
              .map((g) => (
                <div
                  key={g.id}
                  className="border border-line/70 bg-cream-soft p-6 flex flex-col"
                >
                  {g.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={g.image_url}
                      alt={g.title}
                      className="w-full h-72 object-cover mb-5"
                    />
                  ) : (
                    <div className="w-full h-72 mb-5 flex items-center justify-center border border-line/60 bg-tiffany-soft">
                      <span className="script text-5xl text-accent">♥</span>
                    </div>
                  )}
                  <h3 className="display text-2xl">{g.title}</h3>
                  {g.description && (
                    <p className="text-ink-soft text-sm mt-2 flex-1">{g.description}</p>
                  )}
                  <div className="mt-5">
                    <span className="display text-xl text-accent">
                      {formatBRL(g.price_cents)}
                    </span>
                  </div>
                  <button
                    onClick={() => add(g)}
                    className="mt-4 w-full py-3 bg-tiffany text-ink label hover:bg-tiffany-deep hover:text-cream transition-colors"
                  >
                    {added === g.id ? "Adicionado ✓" : "Adicionar ao carrinho"}
                  </button>
                </div>
              ))}
          </div>
        </div>
      ))}

      {/* presente personalizado */}
      <div className="mb-16">
        <div className="flex items-center gap-4 mb-8">
          <span className="hairline flex-1" />
          <span className="label whitespace-nowrap">Presente personalizado</span>
          <span className="hairline flex-1" />
        </div>
        <CustomGiftCard onAdd={addCustom} />
      </div>

      {/* botão flutuante do carrinho */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-3 px-5 py-4 bg-ink text-cream shadow-lg hover:bg-ink-soft transition-colors"
      >
        <CartIcon />
        <span className="label text-cream">{count}</span>
      </button>

      {open && (
        <CartDrawer
          cart={cart}
          total={total}
          onClose={() => setOpen(false)}
          setQty={setQty}
          clear={() => setCart([])}
        />
      )}
    </div>
  );
}

// aceita "150", "150,50" e "1.500,00" (e também "150.50")
function parseValueToCents(v: string) {
  let s = v.replace(/[R$\s]/g, "");
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  const n = parseFloat(s);
  return isFinite(n) && n > 0 ? Math.round(n * 100) : 0;
}

function CustomGiftCard({ onAdd }: { onAdd: (title: string, cents: number) => void }) {
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [added, setAdded] = useState(false);

  const cents = parseValueToCents(value);
  const valid = cents >= 100; // mínimo R$ 1,00

  function add() {
    if (!valid) return;
    onAdd(title, cents);
    setTitle("");
    setValue("");
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="max-w-xl mx-auto border border-line/70 bg-cream-soft p-8 flex flex-col gap-5">
      <div className="text-center">
        <span className="script text-5xl text-accent">♥</span>
        <p className="text-ink-soft text-sm mt-3">
          Não achou o presente ideal? Escreva o que o seu coração mandar e escolha o valor.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        <label className="label" htmlFor="custom-title">
          Seu presente
        </label>
        <input
          id="custom-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="Ex.: Um jantar romântico para os noivos"
          className="border border-line bg-cream px-4 py-3 outline-none focus:border-ink transition-colors"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label className="label" htmlFor="custom-value">
          Valor (R$)
        </label>
        <input
          id="custom-value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          inputMode="decimal"
          placeholder="Ex.: 100,00"
          className="border border-line bg-cream px-4 py-3 outline-none focus:border-ink transition-colors"
        />
        {value && !valid && (
          <p className="text-red-700 text-sm">Informe um valor a partir de R$ 1,00.</p>
        )}
      </div>
      <button
        onClick={add}
        disabled={!valid}
        className="w-full py-3 bg-tiffany text-ink label hover:bg-tiffany-deep hover:text-cream transition-colors disabled:opacity-40"
      >
        {added ? "Adicionado ✓" : valid ? `Adicionar ${formatBRL(cents)}` : "Adicionar ao carrinho"}
      </button>
    </div>
  );
}

function CartDrawer({
  cart,
  total,
  onClose,
  setQty,
  clear,
}: {
  cart: CartItem[];
  total: number;
  onClose: () => void;
  setQty: (id: number | string, qty: number) => void;
  clear: () => void;
}) {
  const [step, setStep] = useState<"cart" | "form" | "pay" | "pix" | "review" | "done">("cart");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<{
    orderId: string;
    amountCents: number;
    email: string;
  } | null>(null);
  const [pix, setPix] = useState<{
    orderId: string;
    amountCents: number;
    qrCode: string | null;
    qrCodeBase64: string | null;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // polling do status (PIX aguardando pagamento / cartão em análise)
  useEffect(() => {
    const orderId = step === "pix" ? pix?.orderId : step === "review" ? order?.orderId : null;
    if (!orderId) return;
    const id = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/status?order=${orderId}`);
        const d = await res.json();
        if (d.status === "approved") {
          clearInterval(id);
          clear();
          setStep("done");
        }
      } catch {
        /* segue tentando */
      }
    }, 4000);
    return () => clearInterval(id);
  }, [step, pix, order, clear]);

  // cria o pedido e abre o Payment Brick
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSending(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerName: fd.get("buyerName"),
          buyerEmail: fd.get("buyerEmail"),
          message: fd.get("message"),
          items: cart.map((i) =>
            i.custom
              ? { custom: true, title: i.title, amountCents: i.priceCents, qty: i.qty }
              : { giftId: i.id, qty: i.qty }
          ),
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Erro ao iniciar o pagamento.");
      setOrder({
        orderId: d.orderId,
        amountCents: d.amountCents,
        email: String(fd.get("buyerEmail") ?? ""),
      });
      setStep("pay");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao iniciar o pagamento.");
    } finally {
      setSending(false);
    }
  }

  // chamado pelo Payment Brick com os dados do cartão ou do PIX
  async function processPayment(formData: Record<string, unknown>) {
    if (!order) return;
    setError("");
    const res = await fetch("/api/payment/process", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: order.orderId, formData }),
    });
    const d = await res.json();
    if (!res.ok) {
      setError(d.error || "Não foi possível processar o pagamento.");
      throw new Error(d.error);
    }
    if (d.status === "approved") {
      clear();
      setStep("done");
      return;
    }
    if (d.qrCode || d.qrCodeBase64) {
      setPix({
        orderId: order.orderId,
        amountCents: order.amountCents,
        qrCode: d.qrCode,
        qrCodeBase64: d.qrCodeBase64,
      });
      setStep("pix");
      return;
    }
    if (d.status === "in_process" || d.status === "pending") {
      setStep("review");
      return;
    }
    setError("Pagamento recusado. Verifique os dados e tente novamente.");
    throw new Error("rejected");
  }

  function copyCode() {
    if (!pix?.qrCode) return;
    navigator.clipboard.writeText(pix.qrCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
      <aside
        className="relative bg-cream w-full max-w-md h-full overflow-y-auto p-8 shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-8">
          <h2 className="display text-3xl">
            {step === "cart" && "Seu carrinho"}
            {step === "form" && "Seus dados"}
            {step === "pay" && "Pagamento"}
            {step === "pix" && "Pagamento PIX"}
            {step === "review" && "Em análise"}
            {step === "done" && "Tudo certo!"}
          </h2>
          <button onClick={onClose} className="text-ink-soft hover:text-ink text-3xl leading-none">
            ×
          </button>
        </div>

        {step === "cart" && (
          <>
            {cart.length === 0 ? (
              <p className="text-ink-soft flex-1">Seu carrinho está vazio.</p>
            ) : (
              <div className="flex-1 flex flex-col gap-5">
                {cart.map((i) => (
                  <div key={i.id} className="flex items-center gap-4 border-b border-line/50 pb-5">
                    <div className="flex-1">
                      <p className="display text-xl">{i.title}</p>
                      <p className="text-ink-soft text-sm">{formatBRL(i.priceCents)} cada</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Qty onClick={() => setQty(i.id, i.qty - 1)}>−</Qty>
                      <span className="w-6 text-center">{i.qty}</span>
                      <Qty onClick={() => setQty(i.id, i.qty + 1)}>+</Qty>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8">
              <div className="flex justify-between items-center mb-6">
                <span className="label">Total</span>
                <span className="display text-3xl text-accent">{formatBRL(total)}</span>
              </div>
              <button
                disabled={cart.length === 0}
                onClick={() => setStep("form")}
                className="w-full py-4 bg-tiffany text-ink label hover:bg-tiffany-deep hover:text-cream transition-colors disabled:opacity-40"
              >
                Ir para o pagamento
              </button>
              <button
                onClick={onClose}
                className="w-full mt-3 py-4 border border-ink text-ink label hover:bg-ink hover:text-cream transition-colors"
              >
                Continuar escolhendo presentes
              </button>
            </div>
          </>
        )}

        {step === "form" && (
          <form onSubmit={submit} className="flex flex-col gap-5 flex-1">
            <p className="text-ink-soft text-sm">
              Total: <span className="text-ink">{formatBRL(total)}</span>
            </p>
            <Input label="Seu nome" name="buyerName" required />
            <Input label="E-mail (para o comprovante)" name="buyerEmail" type="email" />
            <div className="flex flex-col gap-2">
              <label className="label" htmlFor="message">
                Recado para os noivos (opcional)
              </label>
              <textarea
                id="message"
                name="message"
                rows={3}
                className="border border-line bg-cream-soft px-4 py-3 outline-none focus:border-ink resize-none"
              />
            </div>
            {error && <p className="text-red-700 text-sm">{error}</p>}
            <div className="mt-auto flex gap-3">
              <button
                type="button"
                onClick={() => setStep("cart")}
                className="px-6 py-4 border border-ink label hover:bg-ink hover:text-cream transition-colors"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={sending}
                className="flex-1 py-4 bg-tiffany text-ink label hover:bg-tiffany-deep hover:text-cream transition-colors disabled:opacity-50"
              >
                {sending ? "Preparando..." : "Ir para o pagamento"}
              </button>
            </div>
          </form>
        )}

        {step === "pay" && order && (
          <div className="flex flex-col flex-1">
            <p className="text-ink-soft text-sm mb-4">
              Total: <span className="text-ink">{formatBRL(order.amountCents)}</span> — pague
              com cartão ou PIX.
            </p>
            <PaymentBrick
              amountCents={order.amountCents}
              payerEmail={order.email || undefined}
              onPay={processPayment}
              onError={setError}
            />
            {error && <p className="text-red-700 text-sm mt-3">{error}</p>}
            <button
              type="button"
              onClick={() => {
                setOrder(null);
                setError("");
                setStep("form");
              }}
              className="mt-4 px-6 py-4 border border-ink label hover:bg-ink hover:text-cream transition-colors"
            >
              Voltar
            </button>
          </div>
        )}

        {step === "review" && (
          <div className="flex flex-col items-center text-center gap-4 flex-1 justify-center">
            <h3 className="display text-3xl">Pagamento em análise</h3>
            <p className="text-ink-soft">
              Seu pagamento está sendo processado. Assim que for aprovado, esta tela será
              atualizada automaticamente.
            </p>
            <p className="label mt-2 animate-pulse">Aguardando confirmação...</p>
          </div>
        )}

        {step === "pix" && pix && (
          <div className="flex flex-col items-center text-center gap-4 flex-1">
            <p className="text-ink-soft text-sm">
              Escaneie o QR Code ou copie o código no app do seu banco.
            </p>
            <p className="display text-3xl text-accent">{formatBRL(pix.amountCents)}</p>
            {pix.qrCodeBase64 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`data:image/png;base64,${pix.qrCodeBase64}`}
                alt="QR Code PIX"
                className="w-56 h-56 border border-line"
              />
            ) : (
              <p className="text-ink-soft text-sm">QR Code indisponível.</p>
            )}
            {pix.qrCode && (
              <button
                onClick={copyCode}
                className="w-full px-6 py-3 border border-ink label hover:bg-ink hover:text-cream transition-colors"
              >
                {copied ? "Código copiado!" : "Copiar código PIX"}
              </button>
            )}
            <p className="label mt-2 animate-pulse">Aguardando pagamento...</p>
          </div>
        )}

        {step === "done" && (
          <div className="flex flex-col items-center text-center gap-4 flex-1 justify-center">
            <span className="script text-7xl text-accent">♥</span>
            <h3 className="display text-3xl">Pagamento confirmado!</h3>
            <p className="text-ink-soft">
              Muito obrigado pelo carinho. Seu presente foi recebido com amor!
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-8 py-4 bg-tiffany text-ink label hover:bg-tiffany-deep hover:text-cream transition-colors"
            >
              Fechar
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

function Qty({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-8 h-8 border border-line hover:border-ink flex items-center justify-center text-lg leading-none"
    >
      {children}
    </button>
  );
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 4h2l2.4 12.4a1 1 0 0 0 1 .8h8.7a1 1 0 0 0 1-.8L21 8H6" />
      <circle cx="9" cy="20" r="1" />
      <circle cx="18" cy="20" r="1" />
    </svg>
  );
}

function Input({
  label,
  name,
  type = "text",
  ...rest
}: { label: string; name: string; type?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="flex flex-col gap-2">
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className="border border-line bg-cream-soft px-4 py-3 outline-none focus:border-ink transition-colors"
        {...rest}
      />
    </div>
  );
}
