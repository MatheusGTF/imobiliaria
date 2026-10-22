"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { resizeToWebp } from "@/lib/midia/imageResize";
import { salvarLogo } from "@/app/admin/(dashboard)/configuracoes/actions";

export function UploadLogo() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function enviar() {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setErro("Escolha um arquivo primeiro.");
      return;
    }

    setEnviando(true);
    setErro(null);
    try {
      const otimizada = await resizeToWebp(file, 600, 0.9);
      const fd = new FormData();
      fd.append("logo", otimizada);
      const res = await salvarLogo(fd);
      if ("error" in res) {
        setErro(res.error);
        return;
      }
      window.location.reload();
    } catch (e) {
      setErro((e as Error).message || "Falha no envio. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          disabled={enviando}
          className="w-full max-w-full text-sm text-slate-600 sm:w-auto file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-200"
        />
        <Button type="button" size="sm" variant="secondary" onClick={enviar} disabled={enviando}>
          {enviando ? "Enviando..." : "Enviar logo"}
        </Button>
      </div>
      {erro && <p className="text-xs text-red-600">{erro}</p>}
    </div>
  );
}
