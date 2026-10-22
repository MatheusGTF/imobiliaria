import Link from "next/link";
import Image from "next/image";
import { Bed, Bath, Car, Building2, MapPin } from "lucide-react";
import { PrecoImovel } from "@/components/shared/PrecoImovel";
import { labelFor, TIPOS_IMOVEL, FINALIDADE_IMOVEL } from "@/lib/comum/constants";

type ImovelCardData = {
  id: string;
  titulo: string;
  tipo: string;
  finalidade: string;
  cidade: string;
  estado: string;
  bairro: string | null;
  destaque?: boolean;
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
      className="group flex flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-brand-50">
        {capa ? (
          <Image
            src={capa.url}
            alt={imovel.titulo}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(min-width: 1024px) 320px, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-brand-200">
            <Building2 size={40} />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-0.5 text-xs font-semibold text-ink-700 shadow-sm">
          {labelFor(TIPOS_IMOVEL, imovel.tipo)}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-brand-600 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
          {labelFor(FINALIDADE_IMOVEL, imovel.finalidade)}
        </span>
        {imovel.destaque && (
          <span className="absolute bottom-3 left-3 rounded-full bg-ink-900/80 px-2.5 py-0.5 text-xs font-semibold text-white">
            Destaque
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="truncate font-display font-bold text-ink-900">{imovel.titulo}</h3>
        <p className="mt-0.5 flex items-center gap-1 truncate text-sm text-ink-500">
          <MapPin size={13} className="shrink-0" />
          {imovel.bairro ? `${imovel.bairro}, ` : ""}
          {imovel.cidade}/{imovel.estado}
        </p>

        {(imovel.quartos != null || imovel.banheiros != null || imovel.vagas != null) && (
          <div className="mt-3 flex items-center gap-4 text-xs text-ink-500">
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
        )}

        <PrecoImovel
          imovel={imovel}
          className="mt-auto pt-3 font-display text-lg font-extrabold text-brand-700"
        />
      </div>
    </Link>
  );
}
