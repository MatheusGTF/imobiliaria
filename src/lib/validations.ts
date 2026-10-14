import { z } from "zod";

const optionalString = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() !== "" ? v.trim() : undefined));

const numberFromForm = (opts?: { min?: number }) =>
  z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== "" ? Number(v) : undefined))
    .refine((v) => v === undefined || !Number.isNaN(v), "Valor inválido")
    .refine((v) => v === undefined || opts?.min === undefined || v >= opts.min, "Valor muito baixo");

const intFromForm = () =>
  z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== "" ? parseInt(v, 10) : undefined))
    .refine((v) => v === undefined || !Number.isNaN(v), "Valor inválido");

// <select> "Sim/Não" do formulário → boolean (ausente = Não)
const simNao = z
  .enum(["SIM", "NAO"])
  .optional()
  .transform((v) => v === "SIM");

export const imovelSchema = z
  .object({
    titulo: z.string().min(3, "Informe um título"),
    descricao: optionalString,
    tipo: z.string().min(1, "Selecione o tipo"),
    finalidade: z.enum(["ALUGUEL", "VENDA", "AMBOS"]),
    status: z.string().min(1),
    destaque: z.coerce.boolean().optional(),

    cep: optionalString,
    logradouro: optionalString,
    numero: optionalString,
    complemento: optionalString,
    bairro: optionalString,
    cidade: z.string().min(1, "Informe a cidade"),
    estado: z.string().min(2, "Informe o estado").max(2),

    valorAluguel: numberFromForm({ min: 0 }),
    valorVenda: numberFromForm({ min: 0 }),
    valorCondominio: numberFromForm({ min: 0 }),
    valorIptu: numberFromForm({ min: 0 }),
    areaM2: numberFromForm({ min: 0 }),
    quartos: intFromForm(),
    banheiros: intFromForm(),
    vagas: intFromForm(),
    mobiliado: z.coerce.boolean().optional(),
    aceitaPet: z.coerce.boolean().optional(),

    aguaInclusa: simNao,
    energiaInclusa: simNao,
    temCondominio: simNao,
    condominioDescricao: optionalString,

    proprietarioId: optionalString,
    inquilinoId: optionalString,
  })
  .superRefine((data, ctx) => {
    if ((data.finalidade === "ALUGUEL" || data.finalidade === "AMBOS") && data.valorAluguel === undefined) {
      ctx.addIssue({ code: "custom", path: ["valorAluguel"], message: "Informe o valor do aluguel" });
    }
    if ((data.finalidade === "VENDA" || data.finalidade === "AMBOS") && data.valorVenda === undefined) {
      ctx.addIssue({ code: "custom", path: ["valorVenda"], message: "Informe o valor de venda" });
    }
  });

const emailOptional = z
  .string()
  .optional()
  .transform((v) => (v && v.trim() !== "" ? v.trim() : undefined))
  .refine((v) => v === undefined || z.string().email().safeParse(v).success, "Email inválido");

export const proprietarioSchema = z.object({
  nome: z.string().min(3, "Informe o nome"),
  cpfCnpj: optionalString,
  rg: optionalString,
  nacionalidade: optionalString,
  estadoCivil: optionalString,
  profissao: optionalString,
  endereco: optionalString,
  email: emailOptional,
  telefone: optionalString,
  observacoes: optionalString,
});

export const inquilinoSchema = z.object({
  tipoPessoa: z.enum(["FISICA", "JURIDICA"]),
  nome: z.string().min(3, "Informe o nome"),
  cpfCnpj: optionalString,
  rg: optionalString,
  nacionalidade: optionalString,
  estadoCivil: optionalString,
  profissao: optionalString,
  representanteLegalNome: optionalString,
  email: emailOptional,
  telefone: optionalString,
  endereco: optionalString,
  observacoes: optionalString,
});

export const empresaSchema = z.object({
  nome: z.string().min(2, "Informe o nome da imobiliária"),
  razaoSocial: optionalString,
  cnpj: optionalString,
  endereco: optionalString,
  telefone: optionalString,
  telefone2: optionalString,
  instagram: optionalString,
  responsavelNome: optionalString,
  responsavelCreci: optionalString,
  responsavel2Nome: optionalString,
  responsavel2Creci: optionalString,
  chavePix: optionalString,
  taxaAdministracaoPercentual: numberFromForm({ min: 0 }).refine(
    (v) => v === undefined || v <= 100,
    "A taxa deve ficar entre 0 e 100%",
  ),
});

export const contratoSchema = z.object({
  imovelId: z.string().min(1, "Selecione o imóvel"),
  inquilinoId: z.string().min(1, "Selecione o inquilino"),
  dataInicio: z.string().min(1, "Informe a data de início"),
  dataFim: z.string().min(1, "Informe a data de término"),
  diaVencimento: intFromForm().refine(
    (v) => v !== undefined && v >= 1 && v <= 31,
    "Informe um dia entre 1 e 31"
  ),
  valorAluguel: numberFromForm({ min: 0 }).refine((v) => v !== undefined, "Informe o valor do aluguel"),
  valorCondominio: numberFromForm({ min: 0 }),
  valorIptu: numberFromForm({ min: 0 }),
  taxaAdministracaoPercentual: numberFromForm({ min: 0 }),
  valorCaucao: numberFromForm({ min: 0 }),
  bensInclusos: optionalString,
  observacoes: optionalString,
});

export const vendaSchema = z.object({
  valorVendaFinal: numberFromForm({ min: 0 }).refine((v) => v !== undefined, "Informe o valor da venda"),
  dataVenda: z.string().min(1, "Informe a data da venda"),
  compradorNome: optionalString,
  compradorContato: optionalString,
});

export const pagamentoSchema = z.object({
  valorPago: numberFromForm({ min: 0 }),
  dataPagamento: optionalString,
  formaPagamento: optionalString,
  status: z.string().min(1),
  observacoes: optionalString,
});
