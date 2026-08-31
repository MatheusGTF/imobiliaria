# Publicar na web (Vercel + Neon + Vercel Blob)

Guia de deploy do portal Água Clara Imóveis. Feito uma vez; depois disso o site
atualiza sozinho a cada `git push`.

## Visão geral

| Peça | Serviço | Plano |
|---|---|---|
| Aplicação (Next.js) | Vercel | Hobby (grátis) |
| Banco de dados | Neon (PostgreSQL) | Free |
| Fotos dos imóveis | Vercel Blob | Free (1 GB) |
| Domínio | registro.br | ~R$40/ano |

O código já está preparado para os três (storage de fotos, `postinstall` do
Prisma, `remotePatterns` de imagem, `trustHost` do NextAuth).

---

## 1. Repositório no GitHub

```bash
git remote add origin git@github.com:<usuario>/imobiliaria.git
git push -u origin master
```

O `.gitignore` já exclui `.env`, `prisma/dev.db`, `prisma/data-export.json` e
`public/uploads/` — nenhum segredo ou dado pessoal vai para o GitHub.

## 2. Banco de dados (Neon)

1. Criar projeto em <https://neon.tech> (região mais próxima: `AWS sa-east-1`).
2. Copiar as duas connection strings do painel:
   - **Pooled** (`...-pooler...`) → vai em `DATABASE_URL`
   - **Direct** (sem `-pooler`) → vai em `DIRECT_URL`

## 3. Trocar o Prisma para PostgreSQL

No `prisma/schema.prisma`:

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

Apagar a pasta `prisma/migrations/` (as migrations atuais são de SQLite) e gerar
a inicial já apontando para o Neon:

```bash
# .env com DATABASE_URL/DIRECT_URL do Neon
npx prisma migrate dev --name init
```

## 4. Levar os dados atuais para o Neon

```bash
# 1. com o .env apontando para o SQLite (file:./dev.db)
npm run db:export        # gera prisma/data-export.json

# 2. com o .env apontando para o Neon
npx prisma migrate deploy
npm run db:import        # insere imóveis, contratos, configurações...
```

> As **fotos** (`public/uploads/*.webp`) precisam ser reenviadas pelo `/admin`
> depois do deploy (elas ficavam só no disco local). São poucas.

## 5. Vercel Blob (fotos)

1. No projeto da Vercel → aba **Storage** → **Create** → **Blob**.
2. A Vercel injeta `BLOB_READ_WRITE_TOKEN` automaticamente nos deploys.
   Com essa variável presente, o upload de fotos passa a usar o Blob
   (ver `src/lib/photos.ts`).

## 6. Deploy na Vercel

1. <https://vercel.com/new> → importar o repositório do GitHub.
2. **Environment Variables** (Production):
   | Nome | Valor |
   |---|---|
   | `DATABASE_URL` | connection string **pooled** do Neon |
   | `DIRECT_URL` | connection string **direct** do Neon |
   | `AUTH_SECRET` | `openssl rand -base64 32` (valor novo!) |
   | `AUTH_URL` | `https://aguaclaraimoveis.com.br` |
   | `BLOB_READ_WRITE_TOKEN` | (criado no passo 5, geralmente já vem) |
3. **Deploy**. A build roda `prisma generate && next build`.
4. Rodar as migrations no banco de produção (uma vez):
   `npx prisma migrate deploy` local com o `.env` de produção, **ou**
   adicionar `prisma migrate deploy` ao script de build.

## 7. Domínio

1. Vercel → projeto → **Settings → Domains** → adicionar `aguaclaraimoveis.com.br`
   e `www.aguaclaraimoveis.com.br`.
2. No **registro.br**, painel de DNS, criar os registros que a Vercel indicar
   (normalmente um `A` para `76.76.21.21` e um `CNAME` de `www` para
   `cname.vercel-dns.com`). A propagação leva de minutos a algumas horas.
3. O HTTPS é emitido automaticamente pela Vercel.

## 8. Antes de divulgar

- [ ] Trocar a senha do admin (`admin@imobiliaria.com` / `admin123`).
      Rodar o seed com `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` novos **antes**
      de importar os dados, ou criar/atualizar o usuário direto no banco.
- [ ] Conferir se todas as fotos foram reenviadas.
- [ ] Testar: cadastrar um imóvel, ver na home, gerar um contrato.

## Depois: rotina

- Alterou algo no código → `git push` → a Vercel publica em ~1 min.
- Mudança no schema do banco → `prisma migrate dev` local, commit, push, e
  `prisma migrate deploy` no banco de produção.
