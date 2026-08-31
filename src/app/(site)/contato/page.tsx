import type { Metadata } from "next";
import { MapPin, Phone, MessageCircle, BadgeCheck } from "lucide-react";
import { getEmpresa } from "@/lib/empresa";
import { parseInstagram, whatsappLink } from "@/lib/format";
import { InstagramIcon } from "@/components/site/InstagramIcon";

export const metadata: Metadata = { title: "Contato" };

// Reflete os dados de contato configurados no /admin sem precisar de rebuild.
export const dynamic = "force-dynamic";

export default async function ContatoPage() {
  const empresa = await getEmpresa();
  const instagram = parseInstagram(empresa.instagram);
  const telefones = [empresa.telefone, empresa.telefone2].filter(Boolean) as string[];
  const corretores = [
    { nome: empresa.responsavelNome, creci: empresa.responsavelCreci },
    { nome: empresa.responsavel2Nome, creci: empresa.responsavel2Creci },
  ].filter((c) => c.nome);
  const mapsUrl = empresa.endereco
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(empresa.endereco)}`
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-3xl font-extrabold text-ink-900">Fale com a {empresa.nome}</h1>
      <p className="mt-2 text-ink-500">
        Estamos à disposição para tirar dúvidas, agendar visitas e ajudar você a encontrar o imóvel
        certo.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {telefones.map((tel) => {
          const wa = whatsappLink(tel, "Olá! Vim pelo site da " + empresa.nome + ".");
          return (
            <div key={tel} className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm">
              <p className="flex items-center gap-2 text-sm font-semibold text-ink-500">
                <Phone size={16} className="text-brand-500" /> Telefone
              </p>
              <p className="mt-1 font-display text-lg font-bold text-ink-900">{tel}</p>
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                >
                  <MessageCircle size={15} /> WhatsApp
                </a>
              )}
            </div>
          );
        })}

        {instagram && (
          <a
            href={instagram.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-2xl border border-ink-100 bg-white p-5 shadow-sm transition-colors hover:border-brand-200"
          >
            <p className="flex items-center gap-2 text-sm font-semibold text-ink-500">
              <InstagramIcon size={16} className="text-brand-500" /> Instagram
            </p>
            <p className="mt-1 font-display text-lg font-bold text-ink-900 group-hover:text-brand-700">
              {instagram.handle}
            </p>
            <span className="mt-3 inline-block text-sm font-semibold text-brand-600">Seguir →</span>
          </a>
        )}

        {empresa.endereco && (
          <div className="rounded-2xl border border-ink-100 bg-white p-5 shadow-sm sm:col-span-2">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink-500">
              <MapPin size={16} className="text-brand-500" /> Endereço
            </p>
            <p className="mt-1 text-ink-900">{empresa.endereco}</p>
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700"
              >
                Ver no mapa →
              </a>
            )}
          </div>
        )}
      </div>

      {corretores.length > 0 && (
        <div className="mt-8">
          <h2 className="font-display text-xl font-bold text-ink-900">Nossos corretores</h2>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {corretores.map((c) => (
              <li
                key={c.nome}
                className="flex items-center gap-3 rounded-2xl border border-ink-100 bg-white p-4 shadow-sm"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <BadgeCheck size={20} />
                </span>
                <span>
                  <span className="block font-semibold text-ink-900">{c.nome}</span>
                  {c.creci && <span className="block text-sm text-ink-500">CRECI {c.creci}</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
