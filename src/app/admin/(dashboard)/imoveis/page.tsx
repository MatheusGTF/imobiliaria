import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { STATUS_IMOVEL, TIPOS_IMOVEL, FINALIDADE_IMOVEL, labelFor } from "@/lib/constants";
import { PrecoImovel } from "@/components/PrecoImovel";
import { Plus, Building2 } from "lucide-react";

export default async function ImoveisPage() {
  const imoveis = await prisma.imovel.findMany({
    include: { fotos: { where: { capa: true }, take: 1 } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Imóveis</h1>
        <Link href="/admin/imoveis/novo">
          <Button>
            <Plus size={16} /> Novo imóvel
          </Button>
        </Link>
      </div>

      {imoveis.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 p-12 text-center text-slate-500">
          <Building2 className="mx-auto mb-3 text-slate-300" size={40} />
          Nenhum imóvel cadastrado ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {imoveis.map((imovel) => {
            const status = STATUS_IMOVEL.find((s) => s.value === imovel.status);
            const capa = imovel.fotos[0];
            return (
              <Link
                key={imovel.id}
                href={`/admin/imoveis/${imovel.id}`}
                className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[4/3] w-full bg-slate-100">
                  {capa ? (
                    <Image src={capa.url} alt={imovel.titulo} fill className="object-cover" sizes="300px" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-300">
                      <Building2 size={40} />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <Badge color={status?.color}>{status?.label}</Badge>
                    <span className="text-xs text-slate-400">
                      {labelFor(TIPOS_IMOVEL, imovel.tipo)} · {labelFor(FINALIDADE_IMOVEL, imovel.finalidade)}
                    </span>
                  </div>
                  <h2 className="truncate font-medium text-slate-900">{imovel.titulo}</h2>
                  <p className="truncate text-sm text-slate-500">
                    {imovel.bairro ? `${imovel.bairro}, ` : ""}
                    {imovel.cidade}/{imovel.estado}
                  </p>
                  <PrecoImovel imovel={imovel} className="mt-2 text-sm font-semibold text-emerald-700" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
