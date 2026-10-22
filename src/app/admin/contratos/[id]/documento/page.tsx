import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/db/prisma";
import { getEmpresa } from "@/lib/comum/empresa";
import { formatCurrency, formatDate } from "@/lib/comum/format";
import { ehNaoResidencial } from "@/lib/comum/constants";
import {
  enderecoImovel,
  descricaoTipoImovel,
  finalidadeUso,
  clausulaDespesas,
  qualificacaoEmpresa,
  qualificacaoProprietario,
  qualificacaoInquilino,
  formaPagamentoTexto,
  prazoTexto,
  valorLocacaoTexto,
} from "@/lib/contratos/contratoTexto";
import { PrintButton } from "./PrintButton";
import { ArrowLeft } from "lucide-react";

type Item = { secao?: string; corpo?: string };

export default async function ContratoDocumentoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [contrato, empresa] = await Promise.all([
    prisma.contrato.findUnique({
      where: { id },
      include: { imovel: { include: { proprietario: true } }, inquilino: true },
    }),
    getEmpresa(),
  ]);

  if (!contrato) notFound();

  const { imovel, inquilino } = contrato;
  const proprietario = imovel.proprietario;
  const usoTexto = finalidadeUso(imovel.tipo);

  const itens: Item[] = [];

  if (proprietario) {
    itens.push({ secao: "Da Administração da Locação" });
    itens.push({
      corpo:
        "As partes reconhecem que este instrumento foi intermediado e será administrado pela LOCADORA, que atuará como intermediadora da relação, sendo o ponto de contato entre a LOCATÁRIA e o proprietário do imóvel para os assuntos relacionados a este contrato.",
    });
    itens.push({
      corpo: `A propriedade do imóvel pertence a ${qualificacaoProprietario(proprietario)}.`,
    });
  }

  itens.push({ secao: "Do Objeto de Locação" });
  itens.push({
    corpo: `A LOCADORA cede em locação para a LOCATÁRIA ${descricaoTipoImovel(imovel.tipo)}, localizado(a) em ${enderecoImovel(imovel)}.`,
  });
  itens.push({
    corpo:
      "O imóvel em locação foi previamente vistoriado pelas partes contratantes, que atestam estar ciente do seu estado de conservação no ato da entrega.",
  });

  itens.push({ secao: "Da Finalidade" });
  itens.push({
    corpo: `O imóvel objeto do presente instrumento destina-se, única e exclusivamente, para fins ${usoTexto}, sendo vedada sua utilização para outra finalidade, bem como a sublocação a terceiros sem autorização expressa e por escrito da LOCADORA.`,
  });

  itens.push({ secao: "Da Duração do Contrato" });
  itens.push({
    corpo: `O contrato de locação terá vigência de ${prazoTexto(contrato.dataInicio, contrato.dataFim)}, podendo ser renovado mediante acordo entre as partes.`,
  });
  itens.push({
    corpo:
      "Findo o prazo ajustado, se a LOCATÁRIA permanecer no imóvel por mais de 30 (trinta) dias sem oposição da LOCADORA, presumir-se-á prorrogada a locação, com correção do aluguel pelo índice IGP-M, mantidas as demais cláusulas.",
  });

  itens.push({ secao: "Do Valor da Locação" });
  itens.push({
    corpo: `A título de aluguel, a LOCATÁRIA pagará mensalmente à LOCADORA o valor de ${valorLocacaoTexto(contrato)}, cujo pagamento deverá ser efetuado até o dia ${contrato.diaVencimento} de cada mês, ${formaPagamentoTexto(empresa)}, sendo o comprovante considerado como recibo de quitação.`,
  });
  itens.push({ corpo: `Parágrafo primeiro — O primeiro pagamento ocorrerá em ${formatDate(contrato.dataInicio)}.` });

  itens.push({ secao: "Das Despesas" });
  itens.push({ corpo: clausulaDespesas(imovel) });

  itens.push({ secao: "Do Inadimplemento" });
  itens.push({
    corpo:
      "Em caso de atraso no pagamento do aluguel, o valor será acrescido de multa moratória de 10% (dez por cento), juros de 1% (um por cento) ao mês e correção pelo índice IGP-M.",
  });

  if (contrato.valorCaucao) {
    itens.push({ secao: "Da Caução" });
    itens.push({
      corpo: `A título de garantia, a LOCATÁRIA pagará à LOCADORA o valor de ${formatCurrency(contrato.valorCaucao)} a título de caução, no ato da assinatura do contrato. Ao final da locação, o valor será restituído, deduzindo-se eventuais débitos ou danos ao imóvel.`,
    });
  }

  if (contrato.bensInclusos) {
    itens.push({ secao: "Dos Bens Disponíveis no Imóvel" });
    itens.push({
      corpo: `O imóvel possui os seguintes bens/itens, que o integram: ${contrato.bensInclusos}, sendo de responsabilidade da LOCATÁRIA a sua conservação.`,
    });
  }

  itens.push({ secao: "Das Obrigações e Vedações" });
  itens.push({
    corpo:
      "A LOCATÁRIA compromete-se a manter o imóvel em boas condições de conservação, responsabilizando-se por danos decorrentes de mau uso.",
  });
  itens.push({
    corpo: "Qualquer modificação no imóvel deverá ser previamente autorizada, por escrito, pela LOCADORA, sem direito a indenização.",
  });
  itens.push({
    corpo:
      "Em caso de rescisão, a LOCATÁRIA deverá quitar todos os débitos pendentes e providenciar o desligamento dos serviços de água e energia em seu nome.",
  });
  itens.push({ corpo: "A LOCATÁRIA deverá permitir vistorias no imóvel mediante prévio aviso da LOCADORA." });
  itens.push({ corpo: "Reparos decorrentes de danos causados ao imóvel serão de responsabilidade da LOCATÁRIA." });
  itens.push({
    corpo: "Ao término da locação, o imóvel deverá ser devolvido pintado e nas mesmas condições em que foi entregue, salvo os desgastes naturais de uso.",
  });

  itens.push({ secao: "Da Multa" });
  itens.push({
    corpo:
      "A infração de qualquer cláusula deste contrato implicará multa equivalente a 03 (três) meses de aluguel, sem prejuízo da rescisão contratual.",
  });
  itens.push({
    corpo: "Parágrafo primeiro — Em caso de rescisão antecipada por qualquer das partes, será aplicada multa proporcional ao período restante do contrato.",
  });

  if (contrato.observacoes) {
    itens.push({ secao: "Disposições Adicionais" });
    itens.push({ corpo: contrato.observacoes });
  }

  itens.push({ secao: "Do Foro" });
  itens.push({
    corpo: `Fica eleito o foro da comarca de ${imovel.cidade}/${imovel.estado} para dirimir quaisquer questões oriundas do presente contrato.`,
  });

  let numero = 0;

  return (
    <div className="mx-auto max-w-3xl bg-white p-8 print:p-0">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Link href={`/admin/contratos/${contrato.id}`} className="flex items-center gap-1 text-sm text-slate-500 hover:underline">
          <ArrowLeft size={16} /> Voltar
        </Link>
        <PrintButton />
      </div>

      {(!empresa.cnpj || !empresa.responsavelNome) && (
        <p className="mb-4 rounded-md bg-amber-50 p-3 text-xs text-amber-800 print:hidden">
          Os dados da imobiliária estão incompletos (CNPJ, responsável). Preencha em{" "}
          <Link href="/admin/configuracoes" className="underline">
            Configurações
          </Link>{" "}
          para o contrato sair completo.
        </p>
      )}
      <p className="mb-6 rounded-md bg-amber-50 p-3 text-xs text-amber-800 print:hidden">
        Este documento é gerado automaticamente a partir dos dados cadastrados. Revise as
        cláusulas e, se possível, consulte um advogado antes de assinar.
      </p>

      <header className="mb-6 flex items-center gap-3 border-b border-slate-300 pb-4">
        {empresa.logoUrl && (
          <Image src={empresa.logoUrl} alt="" width={56} height={56} className="object-contain" />
        )}
        <div>
          <p className="font-semibold text-slate-900">{empresa.nome}</p>
          {empresa.endereco && <p className="text-xs text-slate-500">{empresa.endereco}</p>}
          {empresa.telefone && <p className="text-xs text-slate-500">Fone: {empresa.telefone}</p>}
        </div>
      </header>

      <article className="space-y-3 text-sm leading-relaxed text-slate-800">
        <h1 className="mb-4 text-center text-base font-bold uppercase underline">
          Contrato Particular de Locação {ehNaoResidencial(imovel.tipo) ? "Não Residencial" : "Residencial"}
        </h1>

        <p>
          Pelo presente instrumento particular, de um lado {qualificacaoEmpresa(empresa)}, doravante
          denominada <strong>LOCADORA</strong>, e do outro lado {qualificacaoInquilino(inquilino)},
          doravante denominada <strong>LOCATÁRIA</strong>, firmam o presente CONTRATO DE LOCAÇÃO,
          ajustando o que a seguir mutuamente outorgam, aceitam e prometem cumprir.
        </p>

        {itens.map((item, i) => {
          if (item.secao) {
            return (
              <h2 key={i} className="pt-2 font-semibold uppercase">
                {item.secao}
              </h2>
            );
          }
          numero += 1;
          return (
            <p key={i} className="whitespace-pre-wrap">
              <strong>Cláusula {numero}ª — </strong>
              {item.corpo}
            </p>
          );
        })}

        <p className="pt-4">E, por estarem assim justos e contratados, firmam o presente instrumento.</p>

        <p className="pt-6 text-center">
          {imovel.cidade}/{imovel.estado}, {formatDate(new Date())}.
        </p>

        <div className="grid grid-cols-1 gap-10 pt-16 sm:grid-cols-2">
          <div className="border-t border-slate-400 pt-2 text-center">
            <p className="font-medium">{empresa.responsavelNome || "LOCADORA"}</p>
            {empresa.responsavelCreci && <p className="text-xs text-slate-500">CRECI nº {empresa.responsavelCreci}</p>}
            <p className="text-xs text-slate-500">LOCADORA</p>
          </div>
          <div className="border-t border-slate-400 pt-2 text-center">
            <p className="font-medium">
              {inquilino.tipoPessoa === "JURIDICA" ? inquilino.representanteLegalNome || inquilino.nome : inquilino.nome}
            </p>
            <p className="text-xs text-slate-500">LOCATÁRIA</p>
          </div>
        </div>
      </article>

      {empresa.endereco && (
        <footer className="mt-10 border-t border-slate-300 pt-3 text-center text-xs text-slate-400">
          {empresa.endereco}
          {empresa.telefone ? ` · Fone: ${empresa.telefone}` : ""}
        </footer>
      )}
    </div>
  );
}
