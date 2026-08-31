# Publicar na web (Vercel + Neon + Vercel Blob)

Runbook do deploy do portal Água Clara Imóveis. Depois de feito, o site
atualiza sozinho a cada `git push` na branch `main`.

## Visão geral

| Peça | Serviço | Plano |
|---|---|---|
| Aplicação (Next.js) | Vercel | Hobby (grátis) |
| Banco de dados | Neon (PostgreSQL), criado pela integração da Vercel | Free |
| Fotos dos imóveis | Vercel Blob | Free (1 GB) |
| Domínio | registro.br → `aguaclaraimoveis.com.br` | ~R$40/ano |

O código já está preparado: `src/lib/photos.ts` usa o Blob quando
`BLOB_READ_WRITE_TOKEN` existe; `prisma/schema.prisma` usa
`POSTGRES_PRISMA_URL` / `DATABASE_URL_UNPOOLED` (nomes criados pelo Neon);
`vercel.json` roda `prisma generate && prisma migrate deploy && next build`.

---

## 1. GitHub

Repositório: <https://github.com/MatheusGTF/imobiliaria> (branch `main`).
`git push` → a Vercel faz deploy automático.

## 2. Vercel — projeto, banco e storage

1. <https://vercel.com/new> → importar `MatheusGTF/imobiliaria`. **Não preencher
   env vars** na importação (elas trazem valores de exemplo do `.env.example`).
2. No projeto → **Storage** → **Create Database** → **Neon** → região mais
   próxima → **Create** → **Connect** ao projeto (Production + Preview,
   *sem* custom prefix). Isso injeta `DATABASE_URL`, `POSTGRES_PRISMA_URL`,
   `DATABASE_URL_UNPOOLED`, etc.
3. No projeto → **Storage** → **Create** → **Blob**. Injeta os `BLOB_*`.
4. No projeto → **Settings → Environment Variables**:
   - Apagar as que vieram do `.env.example` com valor de exemplo
     (`DATABASE_URL=file:./dev.db`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`).
   - `AUTH_SECRET` → **Edit** → colar um valor aleatório real
     (`openssl rand -base64 32`), Production + Preview.

## 3. Deploy

Um `git push` na `main` dispara o build. O `vercel.json` faz:
`prisma generate && prisma migrate deploy && next build` — a migration
`prisma/migrations/0_init` cria o schema no Neon automaticamente.

Deploy verde → site no ar em `imobiliaria-<hash>-<time>.vercel.app`.

## 4. Levar os dados atuais para o Neon

Os imóveis/contratos/configurações estão no SQLite local. Passo único:

```bash
# 1. gerar o retrato dos dados (com o .env local apontando pro dev.db)
npm run db:export                     # → prisma/data-export.json

# 2. importar no Neon (POSTGRES_PRISMA_URL/DATABASE_URL_UNPOOLED = Neon no .env)
npm run db:import
```

> As **fotos** (`public/uploads/*.webp`) só existiam no disco local — precisam
> ser reenviadas pelo `/admin` depois do deploy. São poucas.

## 5. Domínio

1. Registrar `aguaclaraimoveis.com.br` no <https://registro.br> (com o CNPJ).
2. Vercel → projeto → **Settings → Domains** → adicionar
   `aguaclaraimoveis.com.br` e `www.aguaclaraimoveis.com.br`.
3. No registro.br (DNS) criar os registros que a Vercel indicar
   (normalmente `A` → `76.76.21.21` e `CNAME` de `www` → `cname.vercel-dns.com`).
4. HTTPS é automático.

## 6. Antes de divulgar

- [ ] **Trocar a senha do admin.** O usuário `admin@imobiliaria.com` /
      `admin123` veio junto na importação dos dados. Trocar via um script
      pontual (`bcrypt.hash`) rodado contra o Neon, ou pelo Neon SQL Editor.
- [ ] Conferir se as fotos foram reenviadas.
- [ ] Testar: cadastrar imóvel → ver na home → gerar um contrato.

## Rotina depois

- Código: `git push` → Vercel publica em ~1 min.
- Schema do banco: `prisma migrate dev` local (contra um Postgres de dev),
  commit, push — o `migrate deploy` roda no build e atualiza o Neon.
