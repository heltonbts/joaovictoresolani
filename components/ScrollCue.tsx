"use client";

export default function ScrollCue({ targetId }: { targetId: string }) {
  return (
    <button
      onClick={() =>
        document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" })
      }
      className="flex flex-col items-center gap-3 text-ink-soft hover:text-ink transition-colors cursor-pointer"
      aria-label="Arraste para baixo"
    >
      <span className="label">arraste para baixo</span>
      <span className="animate-nudge">
        <svg width="22" height="34" viewBox="0 0 22 34" fill="none">
          <rect x="0.5" y="0.5" width="21" height="33" rx="10.5" stroke="currentColor" />
          <circle cx="11" cy="9" r="2.5" fill="currentColor" />
        </svg>
      </span>
    </button>
  );
}
