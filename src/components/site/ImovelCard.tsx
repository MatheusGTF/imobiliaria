import Link from "next/link";
import Image from "next/image";
import { Bed, Bath, Car, Building2 } from "lucide-react";
import { PrecoImovel } from "@/components/PrecoImovel";
import { labelFor, TIPOS_IMOVEL, FINALIDADE_IMOVEL } from "@/lib/constants";

type ImovelCardData = {
  id: string;
  titulo: string;
  tipo: string;
  finalidade: string;
  cidade: string;
  estado: string;
  bairro: string | null;
  valorAluguel: number | null;
  valorVenda: number | null;
  quartos: number | null;
  banheiros: number | null;
  vagas: number | null;
  fotos: { url: string }[];
};

export function ImovelCard({ imovel }: { imovel: ImovelCardData }) {
  const capa = imovel.fotos[0];

  return (
    <Link
      href={`/imoveis/${imovel.id}`}
      className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] w-full bg-slate-100">
        {capa ? (
          <Image src={capa.url} alt={imovel.titulo} fill className="object-cover" sizes="(min-width: 1024px) 320px, 50vw" />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">
            <Building2 size={40} />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-medium text-slate-700">
          {labelFor(TIPOS_IMOVEL, imovel.tipo)}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-emerald-600/90 px-2.5 py-0.5 text-xs font-medium text-white">
          {labelFor(FINALIDADE_IMOVEL, imovel.finalidade)}
        </span>
      </div>
      <div className="p-4">
        <h3 className="truncate font-medium text-slate-900">{imovel.titulo}</h3>
        <p className="truncate text-sm text-slate-500">
          {imovel.bairro ? `${imovel.bairro}, ` : ""}
          {imovel.cidade}/{imovel.estado}
        </p>

        <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
          {imovel.quartos != null && (
            <span className="flex items-center gap-1">
              <Bed size={14} /> {imovel.quartos}
            </span>
          )}
          {imovel.banheiros != null && (
            <span className="flex items-center gap-1">
              <Bath size={14} /> {imovel.banheiros}
            </span>
          )}
          {imovel.vagas != null && (
            <span className="flex items-center gap-1">
              <Car size={14} /> {imovel.vagas}
            </span>
          )}
        </div>

        <PrecoImovel imovel={imovel} className="mt-3 text-lg font-semibold text-emerald-700" />
      </div>
    </Link>
  );
}
