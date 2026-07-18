# Convite de Casamento — João Victor & Solani

Site de convite de casamento em **Next.js 16 + Tailwind v4 + Neon (Postgres)**, com:

- Página inicial com a logo (monograma JS), indicador "arraste para baixo", história, contagem regressiva e detalhes do evento
- Confirmação de presença (RSVP)
- Lista de presentes com pagamento via **PIX (Mercado Pago)**
- Dashboard dos noivos protegido por senha (`/dashboard`)

## Rodando localmente

```bash
npm install
npm run db:init   # cria as tabelas no Neon e popula a lista de presentes
npm run dev       # http://localhost:3000
```

## O que falta personalizar

1. **Logo** — salve a imagem da logo em `public/logo.png`. Enquanto não existir, o site mostra um brasão desenhado automaticamente como substituto.

2. **Dados do evento** — edite `lib/config.ts`:
   - local e endereço da cerimônia e recepção
   - horários e links do Google Maps
   - texto da história do casal

3. **Pagamento PIX** — em `.env.local`, preencha `MP_ACCESS_TOKEN` com o Access Token da sua conta Mercado Pago (painel → Suas integrações → Credenciais). Sem isso, a geração de PIX fica desativada.

4. **Senha do painel** — troque `ADMIN_PASSWORD` em `.env.local`.

5. **Lista de presentes** — os presentes ficam na tabela `gifts` (semente em `scripts/init-db.mjs`). Para adicionar fotos, preencha a coluna `image_url`.

## Estrutura

```
app/
  page.tsx                 # convite (home)
  confirmar/page.tsx       # RSVP
  presentes/page.tsx       # lista de presentes
  dashboard/page.tsx       # painel dos noivos (senha)
  api/rsvp                 # grava confirmações
  api/gifts                # lista presentes
  api/payment              # gera PIX (Mercado Pago)
  api/payment/status       # consulta status do PIX (polling)
  api/payment/webhook      # notificação do Mercado Pago
  api/auth/login           # login/logout do painel
components/                # Crest, Countdown, GiftList, etc.
lib/                       # config, db (Neon), mp (Mercado Pago), auth
```

## Deploy (Vercel)

1. Suba o repositório no GitHub e importe na Vercel.
2. Configure as variáveis de ambiente (`DATABASE_URL`, `ADMIN_PASSWORD`, `MP_ACCESS_TOKEN`, `NEXT_PUBLIC_BASE_URL` com a URL final).
3. No painel do Mercado Pago, aponte o webhook para `https://SEU-DOMINIO/api/payment/webhook`.
