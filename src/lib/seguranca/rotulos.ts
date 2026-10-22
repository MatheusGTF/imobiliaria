// Nomes legíveis para as ações do registro de atividade (tela Segurança).
export const ROTULOS_AUDITORIA: Record<string, string> = {
  LOGIN_OK: "Entrou no painel",
  LOGIN_FALHA: "Tentativa de acesso recusada",
  LOGIN_BLOQUEADO: "Acesso bloqueado (muitas tentativas)",
  CODIGO_RECUPERACAO_USADO: "Usou um código de recuperação",
  SENHA_ALTERADA: "Senha alterada",
  EMAIL_ALTERADO: "E-mail de acesso alterado",
  DOIS_FATORES_ATIVADO: "Autenticador ativado",
  DOIS_FATORES_DESATIVADO: "Autenticador desativado",
  CODIGOS_RECUPERACAO_GERADOS: "Novos códigos de recuperação gerados",
  CONTRATO_CRIADO: "Contrato criado",
  CONTRATO_ENCERRADO: "Contrato encerrado",
  CONTRATO_EXCLUIDO: "Contrato excluído",
  CONTRATO_DOCUMENTO_VISUALIZADO: "Abriu o documento de um contrato",
  INQUILINO_CRIADO: "Inquilino cadastrado",
  INQUILINO_ALTERADO: "Inquilino alterado",
  INQUILINO_EXCLUIDO: "Inquilino excluído",
  PROPRIETARIO_CRIADO: "Proprietário cadastrado",
  PROPRIETARIO_ALTERADO: "Proprietário alterado",
  PROPRIETARIO_EXCLUIDO: "Proprietário excluído",
  IMOVEL_EXCLUIDO: "Imóvel excluído",
  PAGAMENTO_MARCADO_PAGO: "Pagamento marcado como pago",
  PAGAMENTO_ALTERADO: "Pagamento alterado",
  CONFIGURACOES_ALTERADAS: "Configurações da imobiliária alteradas",
};

export function rotuloAuditoria(acao: string): string {
  return ROTULOS_AUDITORIA[acao] ?? acao;
}

/** Ações que merecem atenção (aparecem destacadas). */
export function acaoSuspeita(acao: string): boolean {
  return acao === "LOGIN_FALHA" || acao === "LOGIN_BLOQUEADO";
}
