import { notFound } from "next/navigation";
import { sql } from "@/lib/db";
import EnvelopeInvite from "@/components/EnvelopeInvite";

export const dynamic = "force-dynamic";

// Convite personalizado: /convite/helton-e-familia
export default async function ConvitePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [invite] = await sql`
    SELECT id, slug, title FROM invites WHERE slug = ${slug}
  `;
  if (!invite) notFound();

  const guests = await sql`
    SELECT name FROM invite_guests WHERE invite_id = ${invite.id} ORDER BY sort_order, id
  `;

  return (
    <EnvelopeInvite
      invite={{
        slug: invite.slug,
        title: invite.title,
        guests: guests.map((g) => g.name as string),
      }}
    />
  );
}
