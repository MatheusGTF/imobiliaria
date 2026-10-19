import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getEmpresa } from "@/lib/empresa";
import { formatCurrency, whatsappLink } from "@/lib/format";
import { labelFor, TIPOS_IMOVEL, FINALIDADE_IMOVEL, aceitaAluguel, aceitaVenda } from "@/lib/constants";
import { PrecoImovel } from "@/components/PrecoImovel";
import { GaleriaFotos } from "@/components/site/GaleriaFotos";
import {
  Bed,
  Bath,
  Car,
  Ruler,
  PawPrint,
  Sofa,
  MessageCircle,
  MapPin,
  ArrowLeft,
  Droplets,
  Zap,
  Building,
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

  // A capa vem primeiro; o resto segue a ordem definida no painel.
  const capa = imovel.fotos.find((f) => f.capa) ?? imovel.fotos[0];
  const fotosOrdenadas = (capa ? [capa, ...imovel.fotos.filter((f) => f.id !== capa.id)] : []).map((f) => ({
    id: f.id,
    url: f.url,
  }));

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
    imovel.aceitaPet ||
    imovel.aguaInclusa ||
    imovel.energiaInclusa ||
    imovel.temCondominio;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link
        href="/imoveis"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-ink-500 hover:text-brand-700"
      >
        <ArrowLeft size={16} /> Voltar para a lista
      </Link>

      <GaleriaFotos fotos={fotosOrdenadas} titulo={imovel.titulo} />

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
              {imovel.aguaInclusa && (
                <span className="flex items-center gap-2">
                  <Droplets size={18} className="text-brand-500" /> Água inclusa
                </span>
              )}
              {imovel.energiaInclusa && (
                <span className="flex items-center gap-2">
                  <Zap size={18} className="text-brand-500" /> Energia elétrica inclusa
                </span>
              )}
              {imovel.temCondominio && (
                <span className="flex items-center gap-2">
                  <Building size={18} className="text-brand-500" /> Condomínio
                  {imovel.valorCondominio ? ` ${formatCurrency(imovel.valorCondominio)}` : ""}
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

          {imovel.temCondominio && imovel.condominioDescricao && (
            <div className="mt-6">
              <h2 className="mb-2 font-display font-bold text-ink-900">Como funciona o condomínio</h2>
              <p className="whitespace-pre-wrap leading-relaxed text-ink-600">
                {imovel.condominioDescricao}
              </p>
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
