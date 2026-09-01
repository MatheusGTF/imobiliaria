import Image from "next/image";
import { Star, ArrowLeft, ArrowRight } from "lucide-react";
import { DeleteButton } from "@/components/ui/DeleteButton";
import { UploadFotos } from "@/components/admin/UploadFotos";
import { deleteFoto, setFotoCapa, moveFoto } from "../actions";
import type { Foto } from "@prisma/client";

export function FotoManager({ imovelId, fotos }: { imovelId: string; fotos: Foto[] }) {
  return (
    <div className="space-y-6">
      <UploadFotos imovelId={imovelId} />

      {fotos.length === 0 ? (
        <p className="text-sm text-slate-500">Nenhuma foto cadastrada ainda.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {fotos.map((foto, index) => (
            <div key={foto.id} className="group relative overflow-hidden rounded-lg border border-slate-200">
              <div className="relative aspect-[4/3] w-full bg-slate-100">
                <Image src={foto.url} alt="" fill className="object-cover" sizes="200px" />
              </div>

              {foto.capa && (
                <span className="absolute left-2 top-2 flex items-center gap-1 rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-medium text-white">
                  <Star size={12} fill="white" /> Capa
                </span>
              )}

              <div className="flex items-center justify-between gap-1 bg-white p-2">
                <div className="flex gap-1">
                  <form action={moveFoto}>
                    <input type="hidden" name="id" value={foto.id} />
                    <input type="hidden" name="imovelId" value={imovelId} />
                    <input type="hidden" name="direction" value="up" />
                    <button
                      type="submit"
                      disabled={index === 0}
                      className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                      title="Mover para trás"
                    >
                      <ArrowLeft size={14} />
                    </button>
                  </form>
                  <form action={moveFoto}>
                    <input type="hidden" name="id" value={foto.id} />
                    <input type="hidden" name="imovelId" value={imovelId} />
                    <input type="hidden" name="direction" value="down" />
                    <button
                      type="submit"
                      disabled={index === fotos.length - 1}
                      className="rounded p-1 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                      title="Mover para frente"
                    >
                      <ArrowRight size={14} />
                    </button>
                  </form>
                  {!foto.capa && (
                    <form action={setFotoCapa}>
                      <input type="hidden" name="id" value={foto.id} />
                      <input type="hidden" name="imovelId" value={imovelId} />
                      <button
                        type="submit"
                        className="rounded p-1 text-slate-500 hover:bg-slate-100"
                        title="Definir como capa"
                      >
                        <Star size={14} />
                      </button>
                    </form>
                  )}
                </div>

                <form action={deleteFoto}>
                  <input type="hidden" name="id" value={foto.id} />
                  <input type="hidden" name="imovelId" value={imovelId} />
                  <DeleteButton confirmMessage="Remover esta foto?" label="Remover" />
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
