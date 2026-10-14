"use client";

import { useState } from "react";
import Image from "next/image";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowLeft, ArrowRight, GripVertical, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { UploadFotos } from "@/components/admin/UploadFotos";
import { deleteFoto, reordenarFotos } from "../actions";

type FotoItem = { id: string; url: string; capa: boolean; ordem: number };

/**
 * Ordem em que as fotos aparecem de fato no portal: a capa primeiro e as
 * outras pela ordem salva. Parte daqui para o gerenciador mostrar o mesmo que
 * o visitante vê, mesmo em imóveis antigos em que capa e ordem divergiam.
 */
function ordemEfetiva(fotos: FotoItem[]) {
  const ordenadas = [...fotos].sort((a, b) => a.ordem - b.ordem);
  const capa = ordenadas.find((f) => f.capa);
  return capa ? [capa, ...ordenadas.filter((f) => f.id !== capa.id)] : ordenadas;
}

function FotoCard({
  foto,
  index,
  total,
  bloqueado,
  onMover,
  onCapa,
  onRemover,
}: {
  foto: FotoItem;
  index: number;
  total: number;
  bloqueado: boolean;
  onMover: (de: number, para: number) => void;
  onCapa: (id: string) => void;
  onRemover: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: foto.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 20 : undefined }}
      className={`overflow-hidden rounded-lg border bg-white ${
        index === 0 ? "border-emerald-500 ring-2 ring-emerald-200" : "border-slate-200"
      } ${isDragging ? "opacity-90 shadow-xl" : ""}`}
    >
      {/* A foto inteira é a "alça": segure e arraste (no celular, segure um instante). */}
      <div
        {...attributes}
        {...listeners}
        className="relative aspect-[4/3] w-full cursor-grab bg-slate-100 active:cursor-grabbing"
        aria-label={`Foto ${index + 1}. Arraste para mudar a ordem.`}
      >
        <Image src={foto.url} alt="" fill draggable={false} className="select-none object-cover" sizes="220px" />
        <span
          className={`absolute left-2 top-2 flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium text-white ${
            index === 0 ? "bg-emerald-600" : "bg-slate-900/60"
          }`}
        >
          {index === 0 ? (
            <>
              <Star size={12} fill="white" /> Capa
            </>
          ) : (
            index + 1
          )}
        </span>
        <span className="absolute right-2 top-2 rounded bg-white/80 p-1 text-slate-600">
          <GripVertical size={14} />
        </span>
      </div>

      <div className="flex items-center justify-between gap-1 p-2">
        <div className="flex gap-1">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMover(index, index - 1)}
            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
            title="Mover para trás"
          >
            <ArrowLeft size={14} />
          </button>
          <button
            type="button"
            disabled={index === total - 1}
            onClick={() => onMover(index, index + 1)}
            className="rounded p-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
            title="Mover para frente"
          >
            <ArrowRight size={14} />
          </button>
          {index > 0 && (
            <button
              type="button"
              onClick={() => onCapa(foto.id)}
              className="rounded p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700"
              title="Usar como capa"
            >
              <Star size={14} />
            </button>
          )}
        </div>
        <button
          type="button"
          disabled={bloqueado}
          onClick={() => onRemover(foto.id)}
          className="rounded p-1.5 text-red-600 hover:bg-red-50 disabled:opacity-30"
          title={bloqueado ? "Salve ou desfaça a nova ordem antes de remover" : "Remover foto"}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export function FotoManager({ imovelId, fotos }: { imovelId: string; fotos: FotoItem[] }) {
  const [inicial] = useState(() => ordemEfetiva(fotos));
  const [lista, setLista] = useState(inicial);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // No celular, segurar um instante antes de arrastar mantém a rolagem normal da página.
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const alterado = lista.some((f, i) => f.id !== inicial[i]?.id);

  function mover(de: number, para: number) {
    if (para < 0 || para >= lista.length) return;
    setLista((atual) => arrayMove(atual, de, para));
    setErro(null);
  }

  function aoSoltar(evento: DragEndEvent) {
    const { active, over } = evento;
    if (!over || active.id === over.id) return;
    const de = lista.findIndex((f) => f.id === active.id);
    const para = lista.findIndex((f) => f.id === over.id);
    mover(de, para);
  }

  function usarComoCapa(id: string) {
    const de = lista.findIndex((f) => f.id === id);
    mover(de, 0);
  }

  async function salvar() {
    setSalvando(true);
    setErro(null);
    const res = await reordenarFotos(
      imovelId,
      lista.map((f) => f.id),
    );
    if ("error" in res) {
      setErro(res.error);
      setSalvando(false);
      return;
    }
    // Recarrega para o resto da página (prévia, locação) refletir a nova capa.
    window.location.reload();
  }

  async function remover(id: string) {
    if (!confirm("Remover esta foto?")) return;
    const fd = new FormData();
    fd.set("id", id);
    fd.set("imovelId", imovelId);
    await deleteFoto(fd);
    window.location.reload();
  }

  return (
    <div className="space-y-6">
      <UploadFotos imovelId={imovelId} />

      {lista.length === 0 ? (
        <p className="text-sm text-slate-500">Nenhuma foto cadastrada ainda.</p>
      ) : (
        <>
          <p className="text-sm text-slate-600">
            <strong>Arraste as fotos</strong> para mudar a ordem — a <strong>primeira é a capa</strong> do anúncio.
            Ou use as setas e a estrela (&quot;Usar como capa&quot;) em cada foto.
          </p>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={aoSoltar}>
            <SortableContext items={lista.map((f) => f.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {lista.map((foto, index) => (
                  <FotoCard
                    key={foto.id}
                    foto={foto}
                    index={index}
                    total={lista.length}
                    bloqueado={alterado || salvando}
                    onMover={mover}
                    onCapa={usarComoCapa}
                    onRemover={remover}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {alterado && (
            <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 shadow-md">
              <p className="text-sm text-emerald-900">
                A ordem mudou. Salve para atualizar a capa e a sequência no site.
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={() => setLista(inicial)} disabled={salvando}>
                  Desfazer
                </Button>
                <Button type="button" onClick={salvar} disabled={salvando}>
                  {salvando ? "Salvando..." : "Salvar ordem e capa"}
                </Button>
              </div>
            </div>
          )}
          {erro && <p className="text-sm text-red-600">{erro}</p>}
        </>
      )}
    </div>
  );
}
