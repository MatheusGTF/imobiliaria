"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { resizeToWebp } from "@/lib/imageResize";
import { adicionarFoto } from "@/app/admin/(dashboard)/imoveis/actions";

export function UploadFotos({ imovelId }: { imovelId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [progresso, setProgresso] = useState("");

  async function enviar() {
    const files = Array.from(inputRef.current?.files ?? []);
    if (files.length === 0) {
      setErro("Escolha uma ou mais fotos primeiro.");
      return;
    }

    setEnviando(true);
    setErro(null);
    try {
      for (let i = 0; i < files.length; i++) {
        setProgresso(`Enviando ${i + 1} de ${files.length}...`);
        const otimizada = await resizeToWebp(files[i]);
        const fd = new FormData();
        fd.append("foto", otimizada);
        const res = await adicionarFoto(imovelId, fd);
        if ("error" in res) {
          setErro(`Foto ${i + 1}: ${res.error}`);
          return;
        }
      }
      window.location.reload();
    } catch (e) {
      setErro((e as Error).message || "Falha no envio. Tente novamente.");
    } finally {
      setEnviando(false);
      setProgresso("");
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          disabled={enviando}
          className="text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium hover:file:bg-slate-200"
        />
        <Button type="button" size="sm" onClick={enviar} disabled={enviando}>
          {enviando ? "Enviando..." : "Enviar fotos"}
        </Button>
      </div>
      {progresso && <p className="text-xs text-slate-500">{progresso}</p>}
      {erro && <p className="text-xs text-red-600">{erro}</p>}
    </div>
  );
}
