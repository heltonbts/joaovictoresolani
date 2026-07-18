"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { wedding } from "@/lib/config";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function EnvelopeInvite() {
  const [open, setOpen] = useState(false);
  const [hideEnv, setHideEnv] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [cd, setCd] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const envScreenRef = useRef<HTMLDivElement>(null);

  const target = wedding.date.getTime();

  useEffect(() => {
    function tick() {
      let d = target - Date.now();
      if (d < 0) d = 0;
      setCd({
        d: Math.floor(d / 86400000),
        h: Math.floor((d % 86400000) / 3600000),
        m: Math.floor((d % 3600000) / 60000),
        s: Math.floor((d % 60000) / 1000),
      });
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  // trava o scroll enquanto o envelope está fechado
  useEffect(() => {
    document.body.style.overflowY = "hidden";
    return () => {
      document.body.style.overflowY = "";
    };
  }, []);

  function abrir() {
    if (open) return;
    setOpen(true);
    setTimeout(() => {
      setHideEnv(true);
      setShowInvite(true);
      document.body.style.overflowY = "auto";
    }, 1400);
  }

  const mapsUrl = wedding.ceremony.mapsUrl;

  return (
    <>
      {/* ======= ENVELOPE ======= */}
      {!hideEnv && (
        <div id="envelope-screen" ref={envScreenRef}>
          <p className="call">Você está convidado</p>
          <div
            className={`envelope${open ? " open" : ""}`}
            onClick={abrir}
            role="button"
            aria-label="Abrir convite"
          >
            <div className="env-body" />
            <div className="letter">
              <span className="mono">
                {wedding.groom}
                <br />
                &amp; {wedding.bride}
              </span>
              <small>vão se casar</small>
            </div>
            <div className="aba base" />
            <div className="aba lado-esq" />
            <div className="aba lado-dir" />
            <div className="flap" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="seal" src="/lacre.png" alt="Lacre J&S" />
          </div>
          <p className="hint">toque para abrir</p>
        </div>
      )}

      {/* ======= CONVITE ======= */}
      <main id="invite" className={showInvite ? "show" : ""}>
        <div className="inv-wrap">
          <div className="hero">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/casal.jpg" alt={`${wedding.groom} e ${wedding.bride}`} />
            <div className="hero-txt">
              <p className="save">Vão se casar</p>
              <p className="nomes">
                {wedding.groom}
                <br />
                &amp; {wedding.bride}
              </p>
            </div>
          </div>

          <div className="bloco">
            <p className="verso">
              &ldquo;Portanto, o que Deus uniu, ninguém o separe.&rdquo;
            </p>
            <p className="verso-ref">Mateus 19:6</p>
          </div>

          <div className="divisor">♥</div>

          <div className="bloco">
            <p className="data-grande">Sábado</p>
            <p className="data-num">31 · 10 · 2026</p>
            <p className="data-sub">às {wedding.ceremony.time}</p>
          </div>

          <div className="countdown">
            <div className="cd-box">
              <div className="cd-num">{cd.d}</div>
              <div className="cd-lbl">dias</div>
            </div>
            <div className="cd-box">
              <div className="cd-num">{pad(cd.h)}</div>
              <div className="cd-lbl">horas</div>
            </div>
            <div className="cd-box">
              <div className="cd-num">{pad(cd.m)}</div>
              <div className="cd-lbl">min</div>
            </div>
            <div className="cd-box">
              <div className="cd-num">{pad(cd.s)}</div>
              <div className="cd-lbl">seg</div>
            </div>
          </div>

          <div className="divisor">♥</div>

          <div className="acoes">
            <Link className="acao" href="/confirmar">
              <div className="circ">💌</div>
              <span>Confirmar presença</span>
            </Link>
            <Link className="acao" href="/presentes">
              <div className="circ">🎁</div>
              <span>Lista de presentes</span>
            </Link>
            {mapsUrl && (
              <a className="acao" href={mapsUrl} target="_blank" rel="noopener noreferrer">
                <div className="circ">📍</div>
                <span>Como chegar</span>
              </a>
            )}
          </div>

          <p className="rodape">
            Com amor, {wedding.groom} &amp; {wedding.bride}{" "}
            <span className="coracao">♥</span>
          </p>
        </div>
      </main>
    </>
  );
}
