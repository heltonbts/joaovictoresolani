"use client";

import { useEffect, useState } from "react";

function diff(target: number) {
  const ms = Math.max(0, target - Date.now());
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return { days, hours, minutes, seconds };
}

export default function Countdown({ target }: { target: number }) {
  const [t, setT] = useState(() => diff(target));

  useEffect(() => {
    const id = setInterval(() => setT(diff(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const items = [
    { v: t.days, l: "dias" },
    { v: t.hours, l: "horas" },
    { v: t.minutes, l: "min" },
    { v: t.seconds, l: "seg" },
  ];

  return (
    <div className="flex items-start justify-center gap-6 sm:gap-10">
      {items.map((it) => (
        <div key={it.l} className="flex flex-col items-center">
          <span className="display text-4xl sm:text-5xl text-ink tabular-nums">
            {String(it.v).padStart(2, "0")}
          </span>
          <span className="label mt-2">{it.l}</span>
        </div>
      ))}
    </div>
  );
}
