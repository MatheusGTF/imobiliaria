import type { Metadata } from "next";
import Link from "next/link";
import { getEmpresa } from "@/lib/comum/empresa";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como tratamos dados pessoais, conforme a Lei Geral de Proteção de Dados (LGPD).",
};

function Secao({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-xl font-bold text-ink-900">{titulo}</h2>
      <div className="mt-2 space-y-3 leading-relaxed text-ink-600">{children}</div>
    </section>
  );
}

export default async function PrivacidadePage() {
  const empresa = await getEmpresa();
  const nomeJuridico = empresa.razaoSocial || empresa.nome;
  const telefones = [empresa.telefone, empresa.telefone2].filter(Boolean).join(" · ");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <Link
        href="/"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-ink-500 hover:text-brand-700"
      >
        <ArrowLeft size={16} /> Voltar para o início
      </Link>

      <h1 className="font-display text-3xl font-extrabold text-ink-900">Política de Privacidade</h1>
      <p className="mt-2 text-sm text-ink-400">
        Conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 — LGPD). Última atualização: outubro de 2026.
      </p>

      <Secao titulo="1. Quem é o responsável pelos seus dados">
        <p>
          O controlador dos dados pessoais tratados por este site e pela atividade de intermediação imobiliária é{" "}
          <strong>{nomeJuridico}</strong>
          {empresa.nome !== nomeJuridico ? ` (${empresa.nome})` : ""}
          {empresa.cnpj ? `, CNPJ ${empresa.cnpj}` : ""}
          {empresa.endereco ? `, com endereço em ${empresa.endereco}` : ""}.
        </p>
      </Secao>

      <Secao titulo="2. Quais dados tratamos e para quê">
        <p>
          <strong>Quem apenas visita o site.</strong> Você não precisa se cadastrar e não pedimos dados pessoais para
          navegar pelos imóveis. O site <strong>não usa cookies de rastreamento nem de publicidade</strong>. Como em
          qualquer site, o provedor de hospedagem registra dados técnicos da visita (endereço IP, navegador, data e
          hora) para garantir o funcionamento e a segurança do serviço.
        </p>
        <p>
          <strong>Quem fala conosco.</strong> Ao clicar em &quot;Falar com um corretor&quot;, a conversa acontece pelo
          WhatsApp, serviço de terceiros com política própria. Recebemos o seu número de telefone, o seu nome de perfil
          e o que você escrever, e usamos apenas para responder ao seu contato e apresentar imóveis.
        </p>
        <p>
          <strong>Clientes: proprietários, inquilinos, compradores e seus representantes.</strong> Para elaborar e
          administrar contratos de locação e venda, tratamos nome, CPF/CNPJ, RG, nacionalidade, estado civil,
          profissão, endereço, telefone, e-mail e os dados do contrato e dos pagamentos (valores, datas, forma de
          pagamento). Esses dados ficam em um painel interno, de acesso restrito.
        </p>
      </Secao>

      <Secao titulo="3. Em que situações a lei nos permite tratar os dados">
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Execução de contrato e procedimentos preliminares</strong> (art. 7º, V): para elaborar, cumprir e
            administrar a locação ou a venda de que você é parte.
          </li>
          <li>
            <strong>Cumprimento de obrigação legal ou regulatória</strong> (art. 7º, II): por exemplo, guarda de
            documentos e registros exigidos pela lei.
          </li>
          <li>
            <strong>Exercício regular de direitos</strong> (art. 7º, VI): para nos defendermos ou fazermos valer o
            contrato, inclusive em processo judicial ou administrativo.
          </li>
          <li>
            <strong>Legítimo interesse</strong> (art. 7º, IX): para a segurança do site e do painel, prevenção a
            fraudes e ataques.
          </li>
          <li>
            <strong>Consentimento</strong> (art. 7º, I): quando for necessário e solicitado de forma específica.
          </li>
        </ul>
      </Secao>

      <Secao titulo="4. Com quem compartilhamos">
        <p>Não vendemos nem cedemos seus dados para fins de marketing. O compartilhamento acontece apenas com:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Prestadores de tecnologia (operadores)</strong> que armazenam e entregam o site, sob contrato:
            Vercel Inc. (hospedagem e armazenamento das fotos) e Neon Inc. (banco de dados). Esses serviços podem
            usar servidores fora do Brasil; nesses casos a transferência internacional ocorre com as garantias
            previstas no art. 33 da LGPD.
          </li>
          <li>
            <strong>As outras partes do contrato</strong> (por exemplo, proprietário e inquilino), na medida
            necessária para a locação ou a venda.
          </li>
          <li>
            <strong>Autoridades públicas</strong>, quando houver obrigação legal ou ordem judicial.
          </li>
        </ul>
      </Secao>

      <Secao titulo="5. Como protegemos os dados">
        <p>
          A comunicação com o site é criptografada (HTTPS). O painel interno exige senha forte, oferece verificação em
          duas etapas, limita tentativas de acesso, mantém registro de acessos e de operações sensíveis e não é
          indexado por buscadores. As fotos enviadas têm os metadados (como localização) removidos. Se ocorrer um
          incidente que possa causar risco ou dano relevante, comunicaremos os titulares e a Autoridade Nacional de
          Proteção de Dados (ANPD), como determina o art. 48 da LGPD.
        </p>
      </Secao>

      <Secao titulo="6. Por quanto tempo guardamos">
        <p>
          Dados de visitas técnicas ficam pelo prazo definido pelo provedor de hospedagem. Dados de clientes ficam
          durante a vigência do contrato e, depois, pelo tempo necessário para cumprir obrigações legais e defender
          direitos (em regra, até 5 anos após o fim do contrato, salvo prazo legal maior). Passado esse tempo, os
          dados são eliminados ou anonimizados. Os registros de acesso ao painel são apagados após 180 dias.
        </p>
      </Secao>

      <Secao titulo="7. Seus direitos (art. 18 da LGPD)">
        <p>Você pode pedir, a qualquer momento e gratuitamente:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>confirmação de que tratamos seus dados e acesso a eles;</li>
          <li>correção de dados incompletos, inexatos ou desatualizados;</li>
          <li>anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desacordo com a lei;</li>
          <li>portabilidade dos dados a outro fornecedor;</li>
          <li>eliminação dos dados tratados com base no seu consentimento;</li>
          <li>informação sobre com quem compartilhamos seus dados;</li>
          <li>informação sobre a possibilidade de não consentir e as consequências;</li>
          <li>revogação do consentimento.</li>
        </ul>
        <p>
          Responderemos em até 15 dias. Alguns dados não podem ser eliminados de imediato quando a lei exige que os
          guardemos (por exemplo, contratos vigentes).
        </p>
      </Secao>

      <Secao titulo="8. Como falar com a gente sobre seus dados">
        <p>
          {empresa.encarregadoNome ? (
            <>
              Responsável pelo atendimento: <strong>{empresa.encarregadoNome}</strong>.{" "}
            </>
          ) : null}
          {empresa.emailPrivacidade ? (
            <>
              E-mail: <a className="font-semibold text-brand-700 underline" href={`mailto:${empresa.emailPrivacidade}`}>{empresa.emailPrivacidade}</a>.{" "}
            </>
          ) : null}
          {telefones ? <>Telefone/WhatsApp: {telefones}. </> : null}
          {empresa.endereco ? <>Atendimento presencial: {empresa.endereco}.</> : null}
        </p>
        <p>
          Se achar que seus dados foram tratados de forma inadequada, você também pode registrar uma reclamação na
          Autoridade Nacional de Proteção de Dados (ANPD), em{" "}
          <a className="font-semibold text-brand-700 underline" href="https://www.gov.br/anpd" rel="noopener noreferrer" target="_blank">
            gov.br/anpd
          </a>
          .
        </p>
      </Secao>

      <Secao titulo="9. Mudanças nesta política">
        <p>
          Podemos atualizar esta política para refletir mudanças na lei ou no nosso serviço. A data da última
          atualização está no topo desta página.
        </p>
      </Secao>
    </div>
  );
}
