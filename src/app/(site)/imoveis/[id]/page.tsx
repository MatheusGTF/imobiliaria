import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getEmpresa } from "@/lib/empresa";
import { formatCurrency, whatsappLink } from "@/lib/format";
import { labelFor, TIPOS_IMOVEL, FINALIDADE_IMOVEL, aceitaAluguel, aceitaVenda } from "@/lib/constants";
import { PrecoImovel } from "@/components/PrecoImovel";
import {
  Bed,
  Bath,
  Car,
  Ruler,
  PawPrint,
  Sofa,
  Building2,
  MessageCircle,
  MapPin,
  ArrowLeft,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ImovelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [imovel, empresa] = await Promise.all([
    prisma.imovel.findUnique({
      where: { id },
      include: { fotos: { orderBy: { ordem: "asc" } } },
    }),
    getEmpresa(),
  ]);

  if (!imovel || imovel.status === "INATIVO") notFound();

  const capa = imovel.fotos.find((f) => f.capa) ?? imovel.fotos[0];
  const outrasFotos = imovel.fotos.filter((f) => f.id !== capa?.id);

  const interesse =
    aceitaAluguel(imovel.finalidade) && !aceitaVenda(imovel.finalidade)
      ? "alugar"
      : aceitaVenda(imovel.finalidade) && !aceitaAluguel(imovel.finalidade)
        ? "comprar"
        : "alugar ou comprar";
  const whatsappUrl = whatsappLink(
    empresa.telefone,
    `Olá! Tenho interesse em ${interesse} o imóvel "${imovel.titulo}".`,
  );

  const temCaracteristicas =
    imovel.areaM2 != null ||
    imovel.quartos != null ||
    imovel.banheiros != null ||
    imovel.vagas != null ||
    imovel.mobiliado ||
    imovel.aceitaPet;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link
        href="/imoveis"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-ink-500 hover:text-brand-700"
      >
        <ArrowLeft size={16} /> Voltar para a lista
      </Link>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-brand-50 sm:col-span-3 sm:row-span-2 sm:aspect-auto">
          {capa ? (
            <Image
              src={capa.url}
              alt={imovel.titulo}
              fill
              className="object-cover"
              sizes="(min-width: 640px) 66vw, 100vw"
              priority
            />
          ) : (
            <div className="flex h-full min-h-64 items-center justify-center text-brand-200">
              <Building2 size={48} />
            </div>
          )}
        </div>
        {outrasFotos.slice(0, 2).map((foto) => (
          <div
            key={foto.id}
            className="relative hidden aspect-[4/3] overflow-hidden rounded-2xl bg-brand-50 sm:block"
          >
            <Image src={foto.url} alt="" fill className="object-cover" sizes="25vw" />
          </div>
        ))}
      </div>

      {outrasFotos.length > 2 && (
        <div className="mt-2 grid grid-cols-4 gap-2 sm:grid-cols-6">
          {outrasFotos.slice(2).map((foto) => (
            <div
              key={foto.id}
              className="relative aspect-square overflow-hidden rounded-xl bg-brand-50"
            >
              <Image src={foto.url} alt="" fill className="object-cover" sizes="150px" />
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            {labelFor(TIPOS_IMOVEL, imovel.tipo)} · {labelFor(FINALIDADE_IMOVEL, imovel.finalidade)}
          </span>
          <h1 className="mt-2 font-display text-3xl font-extrabold text-ink-900">{imovel.titulo}</h1>
          <p className="mt-1 flex items-center gap-1 text-ink-500">
            <MapPin size={15} />
            {imovel.bairro ? `${imovel.bairro}, ` : ""}
            {imovel.cidade}/{imovel.estado}
          </p>

          {temCaracteristicas && (
            <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-y border-ink-100 py-4 text-sm text-ink-600">
              {imovel.areaM2 != null && (
                <span className="flex items-center gap-2">
                  <Ruler size={18} className="text-brand-500" /> {imovel.areaM2} m²
                </span>
              )}
              {imovel.quartos != null && (
                <span className="flex items-center gap-2">
                  <Bed size={18} className="text-brand-500" /> {imovel.quartos} quarto(s)
                </span>
              )}
              {imovel.banheiros != null && (
                <span className="flex items-center gap-2">
                  <Bath size={18} className="text-brand-500" /> {imovel.banheiros} banheiro(s)
                </span>
              )}
              {imovel.vagas != null && (
                <span className="flex items-center gap-2">
                  <Car size={18} className="text-brand-500" /> {imovel.vagas} vaga(s)
                </span>
              )}
              {imovel.mobiliado && (
                <span className="flex items-center gap-2">
                  <Sofa size={18} className="text-brand-500" /> Mobiliado
                </span>
              )}
              {imovel.aceitaPet && (
                <span className="flex items-center gap-2">
                  <PawPrint size={18} className="text-brand-500" /> Aceita pet
                </span>
              )}
            </div>
          )}

          {imovel.descricao && (
            <div className="mt-6">
              <h2 className="mb-2 font-display font-bold text-ink-900">Descrição</h2>
              <p className="whitespace-pre-wrap leading-relaxed text-ink-600">{imovel.descricao}</p>
            </div>
          )}
        </div>

        <div>
          <div className="sticky top-24 rounded-2xl border border-ink-100 bg-white p-6 shadow-lg">
            <PrecoImovel
              imovel={imovel}
              className="font-display text-2xl font-extrabold text-brand-700"
            />
            {(imovel.valorCondominio || imovel.valorIptu) && (
              <p className="mt-1 text-sm text-ink-500">
                {imovel.valorCondominio ? `Condomínio: ${formatCurrency(imovel.valorCondominio)}` : ""}
                {imovel.valorCondominio && imovel.valorIptu ? " · " : ""}
                {imovel.valorIptu ? `IPTU: ${formatCurrency(imovel.valorIptu)}` : ""}
              </p>
            )}

            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 rounded-full bg-brand-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-brand-700"
              >
                <MessageCircle size={18} /> Falar com um corretor
              </a>
            ) : (
              <Link
                href="/contato"
                className="mt-4 flex items-center justify-center gap-2 rounded-full bg-brand-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-brand-700"
              >
                <MessageCircle size={18} /> Fale conosco
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
