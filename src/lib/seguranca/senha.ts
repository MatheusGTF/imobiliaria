import bcrypt from "bcryptjs";

export const SENHA_MIN = 12;
export const SENHA_MAX = 128;

const COMUNS = [
  "123456789012",
  "senha1234567",
  "imobiliaria123",
  "aguaclara1234",
  "qwertyuiop12",
  "administrador",
  "admin1234567",
];

export function hashSenha(senha: string): Promise<string> {
  return bcrypt.hash(senha, 12);
}

/** Devolve a mensagem de erro, ou null se a senha é aceitável. */
export function validarSenhaNova(senha: string, email?: string | null): string | null {
  if (senha.length < SENHA_MIN) return `A senha precisa ter pelo menos ${SENHA_MIN} caracteres.`;
  if (senha.length > SENHA_MAX) return `A senha pode ter no máximo ${SENHA_MAX} caracteres.`;
  if (!/[A-Za-z]/.test(senha) || !/[^A-Za-z]/.test(senha)) {
    return "Use letras e também números ou símbolos na senha.";
  }
  if (new Set(senha).size < 5) return "A senha tem caracteres repetidos demais.";
  const minuscula = senha.toLowerCase();
  if (COMUNS.some((c) => minuscula.includes(c))) return "Essa senha é muito comum. Escolha outra.";
  const parteEmail = email?.split("@")[0]?.toLowerCase();
  if (parteEmail && parteEmail.length >= 4 && minuscula.includes(parteEmail)) {
    return "A senha não pode conter o seu e-mail.";
  }
  return null;
}
