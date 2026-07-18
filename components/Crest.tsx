"use client";

import { useState } from "react";
import { wedding } from "@/lib/config";

/**
 * Mostra a logo real (public/logo.png) se existir; caso contrário,
 * desenha um brasão elegante em SVG no mesmo estilo (moldura oval + monograma).
 */
export default function Crest({ size = 320 }: { size?: number }) {
  const [imgOk, setImgOk] = useState(true);

  if (imgOk) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="/logo.png"
        alt={`Monograma ${wedding.monogram}`}
        width={size}
        height={size}
        onError={() => setImgOk(false)}
        style={{ width: size, height: "auto" }}
        className="select-none"
      />
    );
  }

  // Fallback desenhado (caso a logo ainda não tenha sido adicionada)
  return (
    <svg
      width={size}
      height={size * 1.32}
      viewBox="0 0 300 396"
      fill="none"
      className="select-none"
      aria-label={`Monograma ${wedding.monogram}`}
    >
      <ellipse cx="150" cy="198" rx="118" ry="170" stroke="var(--ink)" strokeWidth="1" />
      <ellipse cx="150" cy="198" rx="112" ry="163" stroke="var(--ink)" strokeWidth="0.6" />
      <text
        x="150"
        y="215"
        textAnchor="middle"
        fontFamily="var(--font-cormorant), serif"
        fontWeight="300"
        fontSize="150"
        fill="var(--ink)"
      >
        {wedding.monogram}
      </text>
      <text
        x="150"
        y="310"
        textAnchor="middle"
        fontFamily="var(--font-jost), sans-serif"
        letterSpacing="6"
        fontSize="15"
        fill="var(--ink-soft)"
      >
        {wedding.dateShort}
      </text>
    </svg>
  );
}
