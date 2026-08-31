import { formatCurrency, formatDate } from "@/lib/format";
import { numeroPorExtenso, mesesEntre } from "@/lib/extenso";
import type { Contrato, Empresa, Imovel, Inquilino, Proprietario } from "@prisma/client";

function juntar(partes: (string | null | undefined | false)[], separador = ", ") {
  return partes.filter(Boolean).join(separador);
}

export function enderecoImovel(imovel: Imovel) {
  return juntar([
    imovel.logradouro,
    imovel.numero,
    imovel.complemento,
    imovel.bairro,
    `${imovel.cidade}/${imovel.estado}`,
    imovel.cep,
  ]);
}

const DESCRICAO_TIPO: Record<string, string> = {
  APARTAMENTO: "um apartamento",
  CASA: "uma casa",
  COMERCIAL: "um imóvel comercial",
  TERRENO: "um terreno",
  OUTRO: "um imóvel",
};

export function descricaoTipoImovel(tipo: string) {
  return DESCRICAO_TIPO[tipo] ?? "um imóvel";
}

export function finalidadeUso(tipo: string) {
  return tipo === "COMERCIAL" ? "comerciais" : "residenciais";
}

export function qualificacaoEmpresa(empresa: Empresa) {
  return juntar([
    empresa.nome,
    "pessoa jurídica de direito privado",
    empresa.cnpj ? `inscrita no CNPJ sob o nº ${empresa.cnpj}` : null,
    empresa.endereco ? `com sede localizada em ${empresa.endereco}` : null,
    empresa.responsavelNome
      ? juntar(
          [
            `neste ato representada por ${empresa.responsavelNome}`,
            empresa.responsavelCreci ? `corretor(a) de imóveis regularmente inscrito(a) no CRECI nº ${empresa.responsavelCreci}` : null,
          ],
          ", "
        )
      : null,
  ]);
}

export function qualificacaoProprietario(proprietario: Proprietario) {
  return juntar([
    proprietario.nome,
    proprietario.nacionalidade,
    proprietario.estadoCivil,
    proprietario.profissao,
    proprietario.rg ? `portador(a) do RG nº ${proprietario.rg}` : null,
    proprietario.cpfCnpj ? `inscrito(a) no CPF/CNPJ sob o nº ${proprietario.cpfCnpj}` : null,
    proprietario.endereco ? `residente e domiciliado(a) em ${proprietario.endereco}` : null,
  ]);
}

export function qualificacaoInquilino(inquilino: Inquilino) {
  if (inquilino.tipoPessoa === "JURIDICA") {
    return juntar([
      inquilino.nome,
      "pessoa jurídica de direito privado",
      inquilino.cpfCnpj ? `inscrita no CNPJ sob o nº ${inquilino.cpfCnpj}` : null,
      inquilino.endereco ? `com sede em ${inquilino.endereco}` : null,
      inquilino.representanteLegalNome
        ? `neste ato representada por seu responsável legal, ${inquilino.representanteLegalNome}`
        : null,
    ]);
  }

  return juntar([
    inquilino.nome,
    inquilino.nacionalidade,
    inquilino.estadoCivil,
    inquilino.profissao,
    inquilino.rg ? `portador(a) do RG nº ${inquilino.rg}` : null,
    inquilino.cpfCnpj ? `inscrito(a) no CPF sob o nº ${inquilino.cpfCnpj}` : null,
    inquilino.endereco ? `residente e domiciliado(a) em ${inquilino.endereco}` : null,
  ]);
}

export function formaPagamentoTexto(empresa: Empresa) {
  if (empresa.chavePix) return `mediante PIX (chave: ${empresa.chavePix})`;
  if (empresa.cnpj) return `mediante PIX (CNPJ: ${empresa.cnpj})`;
  return "mediante PIX, boleto ou transferência bancária, conforme combinado entre as partes";
}

export function prazoTexto(dataInicio: Date, dataFim: Date) {
  const meses = mesesEntre(dataInicio, dataFim);
  const numero = String(meses).padStart(2, "0");
  return `${numero} (${numeroPorExtenso(meses)}) ${meses === 1 ? "mês" : "meses"}, com início em ${formatDate(
    dataInicio
  )} e término em ${formatDate(dataFim)}`;
}

export function valorLocacaoTexto(contrato: Contrato) {
  const total = contrato.valorAluguel + (contrato.valorCondominio ?? 0) + (contrato.valorIptu ?? 0);
  const extras = juntar(
    [
      contrato.valorCondominio ? `condomínio no valor de ${formatCurrency(contrato.valorCondominio)}` : null,
      contrato.valorIptu ? `IPTU no valor de ${formatCurrency(contrato.valorIptu)}` : null,
    ],
    " e "
  );

  return extras
    ? `${formatCurrency(contrato.valorAluguel)}, acrescido de ${extras}, totalizando ${formatCurrency(total)} mensais`
    : formatCurrency(contrato.valorAluguel);
}
