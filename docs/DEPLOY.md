# Publicar na web (Vercel + Neon + Vercel Blob)

Runbook do deploy do portal Água Clara Imóveis. Depois de feito, o site
atualiza sozinho a cada `git push` na branch `main`.

## Visão geral

| Peça | Serviço | Plano |
|---|---|---|
| Aplicação (Next.js) | Vercel | Hobby |
| Banco de dados | Neon (PostgreSQL), criado pela integração da Vercel | Free |
| Fotos dos imóveis | Vercel Blob (store **privado**) | Free (1 GB) |
| Domínio | registro.br → `aguaclaraimoveis.com.br` | ~R$ 40/ano |

O código já está preparado: `src/lib/midia/photos.ts` usa o Blob na Vercel;
`prisma/schema.prisma` usa `POSTGRES_PRISMA_URL` / `DATABASE_URL_UNPOOLED`
(nomes criados pelo Neon); `vercel.json` roda
`prisma generate && prisma migrate deploy && next build`.

---

## 1. GitHub

Repositório: <https://github.com/MatheusGTF/imobiliaria> (branch `main`).
`git push` → a Vercel faz deploy automático.

> **Recomendado: deixe o repositório PRIVADO** (GitHub → Settings → General →
> Danger Zone → Change visibility). O código não precisa ser público e o
> repositório privado reduz a superfície de ataque. A Vercel continua
> publicando normalmente.

## 2. Vercel — projeto, banco e storage

1. <https://vercel.com/new> → importar `MatheusGTF/imobiliaria`. **Não preencher
   env vars** na importação.
2. No projeto → **Storage** → **Create Database** → **Neon** → região mais
   próxima → **Create** → **Connect** ao projeto (Production + Preview,
   *sem* custom prefix). Isso injeta `DATABASE_URL`, `POSTGRES_PRISMA_URL`,
   `DATABASE_URL_UNPOOLED`, etc.
3. No projeto → **Storage** → **Create** → **Blob** (store privado). Injeta os `BLOB_*`.
4. No projeto → **Settings → Environment Variables**:
   - `AUTH_SECRET` → valor aleatório real (`openssl rand -base64 32`),
     Production + Preview. **Guarde uma cópia em local seguro:** ele também
     protege os segredos do autenticador (2FA).

## 3. Deploy

Um `git push` na `main` dispara o build. O `vercel.json` faz:
`prisma generate && prisma migrate deploy && next build` — as migrations de
`prisma/migrations/` são aplicadas no Neon automaticamente.

## 4. Primeiro administrador

Com as variáveis `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD` (senha de 12+
caracteres) definidas no ambiente, rode uma vez `npm run seed` apontando para
o banco de produção. Depois **ative o autenticador** em *Painel → Segurança*.

## 5. Domínio

1. Registrar `aguaclaraimoveis.com.br` no <https://registro.br> (com o CNPJ).
2. Vercel → projeto → **Settings → Domains** → adicionar
   `aguaclaraimoveis.com.br` e `www.aguaclaraimoveis.com.br`.
3. No registro.br (DNS, modo avançado) criar os registros que a Vercel indicar
   (hoje: `A` com nome vazio → `216.198.79.1` e `CNAME` de `www` →
   o valor mostrado na Vercel). O registro.br não aceita `@`.
4. HTTPS é automático.

## 6. Antes de divulgar

- [ ] Administrador com senha forte **e autenticador ativado**.
- [ ] Repositório do GitHub **privado**.
- [ ] Verificação em duas etapas ligada nas contas da Vercel, GitHub, Neon e registro.br.
- [ ] Fotos enviadas e site conferido (cadastrar imóvel → ver na home → gerar contrato).
- [ ] Preencher em *Configurações* o e-mail de contato para assuntos de privacidade (LGPD).

## Rotina depois

- Código: `git push` → a Vercel publica em ~2 min.
- Schema do banco: criar a migration em `prisma/migrations/`, commit, push — o
  `migrate deploy` roda no build e atualiza o Neon.
- Atualizações de segurança: rode `npm audit` de tempos em tempos e atualize
  o Next.js (`npm install next@<versão>`), conferindo `npm run build` antes.
