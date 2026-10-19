"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Building2, ChevronLeft, ChevronRight, Images, X } from "lucide-react";

type Foto = { id: string; url: string };

/**
 * Galeria do imóvel no portal: a grade de fotos (capa + miniaturas) e, ao
 * clicar em qualquer foto, um visualizador em tela cheia para passar para o
 * lado (setas, teclado ←/→ e deslizar o dedo no celular).
 */
export function GaleriaFotos({ fotos, titulo }: { fotos: Foto[]; titulo: string }) {
  const [aberta, setAberta] = useState<number | null>(null);

  if (fotos.length === 0) {
    return (
      <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-brand-50 text-brand-200 sm:aspect-[16/7]">
        <Building2 size={48} />
      </div>
    );
  }

  const [capa, ...outras] = fotos;

  function ir(delta: number) {
    setAberta((atual) => (atual === null ? atual : (atual + delta + fotos.length) % fotos.length));
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => setAberta(0)}
          aria-label={`Ampliar foto de ${titulo}`}
          className="group relative aspect-[4/3] cursor-zoom-in overflow-hidden rounded-2xl bg-brand-50 sm:col-span-3 sm:row-span-2 sm:aspect-auto"
        >
          <Image
            src={capa.url}
            alt={titulo}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            sizes="(min-width: 640px) 66vw, 100vw"
            priority
          />
          {fotos.length > 1 && (
            <span className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-ink-900 shadow-md">
              <Images size={14} /> Ver as {fotos.length} fotos
            </span>
          )}
        </button>

        {outras.slice(0, 2).map((foto, i) => (
          <button
            key={foto.id}
            type="button"
            onClick={() => setAberta(i + 1)}
            aria-label={`Ampliar foto ${i + 2} de ${fotos.length}`}
            className="group relative hidden aspect-[4/3] cursor-zoom-in overflow-hidden rounded-2xl bg-brand-50 sm:block"
          >
            <Image
              src={foto.url}
              alt=""
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="25vw"
            />
          </button>
        ))}
      </div>

      {/* No celular todas as outras fotos aparecem aqui; a partir de sm só as que não estão ao lado da capa. */}
      {outras.length > 0 && (
        <div className={`mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6 ${outras.length > 2 ? "" : "sm:hidden"}`}>
          {outras.map((foto, i) => (
            <button
              key={foto.id}
              type="button"
              onClick={() => setAberta(i + 1)}
              aria-label={`Ampliar foto ${i + 2} de ${fotos.length}`}
              className={`group relative aspect-square cursor-zoom-in overflow-hidden rounded-xl bg-brand-50 ${
                i < 2 ? "sm:hidden" : ""
              }`}
            >
              <Image
                src={foto.url}
                alt=""
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="150px"
              />
            </button>
          ))}
        </div>
      )}

      {aberta !== null && (
        <Visualizador
          fotos={fotos}
          titulo={titulo}
          indice={aberta}
          onIr={ir}
          onIrPara={setAberta}
          onFechar={() => setAberta(null)}
        />
      )}
    </>
  );
}

function Visualizador({
  fotos,
  titulo,
  indice,
  onIr,
  onIrPara,
  onFechar,
}: {
  fotos: Foto[];
  titulo: string;
  indice: number;
  onIr: (delta: number) => void;
  onIrPara: (i: number) => void;
  onFechar: () => void;
}) {
  const fecharRef = useRef<HTMLButtonElement>(null);
  const toque = useRef<{ x: number; y: number } | null>(null);
  const varias = fotos.length > 1;

  // Teclado: ← → passam as fotos, Esc fecha.
  useEffect(() => {
    function aoTeclar(e: KeyboardEvent) {
      if (e.key === "Escape") onFechar();
      else if (e.key === "ArrowLeft") onIr(-1);
      else if (e.key === "ArrowRight") onIr(1);
    }
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [onIr, onFechar]);

  // Trava a rolagem da página atrás e devolve o foco a quem abriu.
  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    fecharRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      anterior?.focus?.();
    };
  }, []);

  // Carrega a foto anterior e a próxima para a troca ser instantânea.
  useEffect(() => {
    if (!varias) return;
    for (const delta of [-1, 1]) {
      const vizinha = fotos[(indice + delta + fotos.length) % fotos.length];
      const img = new window.Image();
      img.src = vizinha.url;
    }
  }, [indice, fotos, varias]);

  function aoTocarInicio(e: React.TouchEvent) {
    const t = e.touches[0];
    toque.current = { x: t.clientX, y: t.clientY };
  }

  function aoTocarFim(e: React.TouchEvent) {
    const inicio = toque.current;
    toque.current = null;
    if (!inicio || !varias) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - inicio.x;
    const dy = t.clientY - inicio.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) onIr(dx < 0 ? 1 : -1);
  }

  const foto = fotos[indice];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Fotos de ${titulo}`}
      className="fixed inset-0 z-50 flex flex-col bg-black"
    >
      <div className="flex items-center justify-between px-4 py-3 text-white">
        <p className="min-w-0 truncate text-sm">
          <span className="font-semibold">
            {indice + 1} / {fotos.length}
          </span>
          <span className="ml-3 hidden text-white/70 sm:inline">{titulo}</span>
        </p>
        <button
          ref={fecharRef}
          type="button"
          onClick={onFechar}
          aria-label="Fechar fotos"
          className="rounded-full bg-white/10 p-2 transition-colors hover:bg-white/25"
        >
          <X size={22} />
        </button>
      </div>

      <div
        className="relative min-h-0 flex-1"
        onTouchStart={aoTocarInicio}
        onTouchEnd={aoTocarFim}
        onClick={(e) => {
          if (e.target === e.currentTarget) onFechar();
        }}
      >
        <Image
          key={foto.id}
          src={foto.url}
          alt={`${titulo} — foto ${indice + 1} de ${fotos.length}`}
          fill
          unoptimized
          priority
          sizes="100vw"
          className="select-none object-contain"
          draggable={false}
        />

        {varias && (
          <>
            <button
              type="button"
              onClick={() => onIr(-1)}
              aria-label="Foto anterior"
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2.5 text-white transition-colors hover:bg-white/30 sm:left-4 sm:p-3"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              type="button"
              onClick={() => onIr(1)}
              aria-label="Próxima foto"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2.5 text-white transition-colors hover:bg-white/30 sm:right-4 sm:p-3"
            >
              <ChevronRight size={28} />
            </button>
          </>
        )}
      </div>

      {varias && (
        <div className="flex gap-2 overflow-x-auto px-4 py-3">
          {fotos.map((f, i) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onIrPara(i)}
              aria-label={`Ir para a foto ${i + 1}`}
              aria-current={i === indice}
              ref={(el) => {
                if (el && i === indice) el.scrollIntoView({ inline: "center", block: "nearest" });
              }}
              className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-md transition-opacity ${
                i === indice ? "opacity-100 ring-2 ring-white" : "opacity-50 hover:opacity-90"
              }`}
            >
              <Image src={f.url} alt="" fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
