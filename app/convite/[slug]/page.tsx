import { cache } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import { wedding } from "@/lib/config";
import EnvelopeInvite from "@/components/EnvelopeInvite";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

// cache() dedupa a consulta entre o generateMetadata e o render da pagina
const getInvite = cache(async (slug: string) => {
  const [invite] = await sql`
    SELECT id, slug, title FROM invites WHERE slug = ${slug}
  `;
  return invite ?? null;
});

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const invite = await getInvite(slug);
  if (!invite) return {};

  const title = `${wedding.groom} & ${wedding.bride} convidam ${invite.title}`;
  const description = `Você está convidado para o nosso casamento — ${wedding.dateLabel}. Confirme sua presença.`;

  // openGraph/twitter definidos aqui substituem os do layout raiz por inteiro,
  // entao a imagem precisa ser repetida.
  return {
    title,
    description,
    openGraph: {
      type: "website",
      locale: "pt_BR",
      title,
      description,
      images: [
        {
          url: "/og.jpg",
          width: 1200,
          height: 630,
          alt: `${wedding.groom} e ${wedding.bride}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.jpg"],
    },
  };
}

// Convite personalizado: /convite/helton-e-familia
export default async function ConvitePage({ params }: Props) {
  const { slug } = await params;
  const invite = await getInvite(slug);
  if (!invite) notFound();

  const guests = await sql`
    SELECT name FROM invite_guests WHERE invite_id = ${invite.id} ORDER BY sort_order, id
  `;

  return (
    <EnvelopeInvite
      invite={{
        slug: invite.slug as string,
        title: invite.title as string,
        guests: guests.map((g) => g.name as string),
      }}
    />
  );
}
