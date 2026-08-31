import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { labelFor, TIPOS_IMOVEL, FINALIDADE_IMOVEL, aceitaAluguel, aceitaVenda } from "@/lib/constants";
import { PrecoImovel } from "@/components/PrecoImovel";
import { Bed, Bath, Car, Ruler, PawPrint, Sofa, Building2, MessageCircle } from "lucide-react";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

export default async function ImovelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const imovel = await prisma.imovel.findUnique({
    where: { id },
    include: { fotos: { orderBy: { ordem: "asc" } } },
  });

  if (!imovel || imovel.status === "INATIVO") notFound();

  const capa = imovel.fotos.find((f) => f.capa) ?? imovel.fotos[0];
  const outrasFotos = imovel.fotos.filter((f) => f.id !== capa?.id);

  const interesse = aceitaAluguel(imovel.finalidade) && !aceitaVenda(imovel.finalidade)
    ? "alugar"
    : aceitaVenda(imovel.finalidade) && !aceitaAluguel(imovel.finalidade)
      ? "comprar"
      : "alugar ou comprar";
  const whatsappMsg = encodeURIComponent(`Olá! Tenho interesse em ${interesse} o imóvel "${imovel.titulo}".`);

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
        <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-slate-100 sm:col-span-3 sm:aspect-auto sm:row-span-2">
          {capa ? (
            <Image src={capa.url} alt={imovel.titulo} fill className="object-cover" sizes="(min-width: 640px) 66vw, 100vw" priority />
          ) : (
            <div className="flex h-full min-h-64 items-center justify-center text-slate-300">
              <Building2 size={48} />
            </div>
          )}
        </div>
        {outrasFotos.slice(0, 2).map((foto) => (
          <div key={foto.id} className="relative hidden aspect-[4/3] overflow-hidden rounded-lg bg-slate-100 sm:block">
            <Image src={foto.url} alt="" fill className="object-cover" sizes="25vw" />
          </div>
        ))}
      </div>

      {outrasFotos.length > 2 && (
        <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {outrasFotos.slice(2).map((foto) => (
            <div key={foto.id} className="relative aspect-square overflow-hidden rounded-md bg-slate-100">
              <Image src={foto.url} alt="" fill className="object-cover" sizes="150px" />
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <span className="text-sm font-medium text-emerald-700">
            {labelFor(TIPOS_IMOVEL, imovel.tipo)} · {labelFor(FINALIDADE_IMOVEL, imovel.finalidade)}
          </span>
          <h1 className="mt-1 text-2xl font-semibold text-slate-900">{imovel.titulo}</h1>
          <p className="mt-1 text-slate-500">
            {imovel.bairro ? `${imovel.bairro}, ` : ""}
            {imovel.cidade}/{imovel.estado}
          </p>

          <div className="mt-6 flex flex-wrap gap-6 border-y border-slate-200 py-4 text-sm text-slate-600">
            {imovel.areaM2 != null && (
              <span className="flex items-center gap-2">
                <Ruler size={18} /> {imovel.areaM2} m²
              </span>
            )}
            {imovel.quartos != null && (
              <span className="flex items-center gap-2">
                <Bed size={18} /> {imovel.quartos} quarto(s)
              </span>
            )}
            {imovel.banheiros != null && (
              <span className="flex items-center gap-2">
                <Bath size={18} /> {imovel.banheiros} banheiro(s)
              </span>
            )}
            {imovel.vagas != null && (
              <span className="flex items-center gap-2">
                <Car size={18} /> {imovel.vagas} vaga(s)
              </span>
            )}
            {imovel.mobiliado && (
              <span className="flex items-center gap-2">
                <Sofa size={18} /> Mobiliado
              </span>
            )}
            {imovel.aceitaPet && (
              <span className="flex items-center gap-2">
                <PawPrint size={18} /> Aceita pet
              </span>
            )}
          </div>

          {imovel.descricao && (
            <div className="mt-6">
              <h2 className="mb-2 font-medium text-slate-900">Descrição</h2>
              <p className="whitespace-pre-wrap text-slate-600">{imovel.descricao}</p>
            </div>
          )}
        </div>

        <div>
          <div className="sticky top-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <PrecoImovel imovel={imovel} className="text-2xl font-semibold text-emerald-700" />
            {(imovel.valorCondominio || imovel.valorIptu) && (
              <p className="mt-1 text-sm text-slate-500">
                {imovel.valorCondominio ? `Condomínio: ${formatCurrency(imovel.valorCondominio)}` : ""}
                {imovel.valorCondominio && imovel.valorIptu ? " · " : ""}
                {imovel.valorIptu ? `IPTU: ${formatCurrency(imovel.valorIptu)}` : ""}
              </p>
            )}

            {WHATSAPP ? (
              <a
                href={`https://wa.me/${WHATSAPP}?text=${whatsappMsg}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 py-3 font-medium text-white hover:bg-emerald-700"
              >
                <MessageCircle size={18} /> Falar com um corretor
              </a>
            ) : (
              <p className="mt-4 text-sm text-slate-500">Entre em contato para mais informações.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
