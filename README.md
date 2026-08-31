# Imobiliária

Sistema de gestão para corretores/imobiliárias: portal público de imóveis para
locação e venda + painel administrativo para gerenciar imóveis, proprietários,
inquilinos, contratos de locação e o financeiro (recebíveis).

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS
- **Prisma 6** + SQLite em desenvolvimento (trocar para PostgreSQL em produção — veja abaixo)
- **NextAuth v5** (login com email/senha) para proteger o painel `/admin`
- **sharp** para otimizar as fotos enviadas (convertidas para `.webp`)

## Como rodar localmente

```bash
npm install
npm run seed   # cria o usuário admin (admin@imobiliaria.com / admin123)
npm run dev
```

Acesse:
- Portal público: http://localhost:3000
- Painel administrativo: http://localhost:3000/admin/login

As credenciais do usuário criado pelo seed podem ser trocadas antes de rodar
`npm run seed`, definindo `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD` no `.env`.

## Estrutura

- `src/app/(site)` — portal público (home, listagem de imóveis com filtros de
  aluguel/venda, detalhe do imóvel)
- `src/app/admin` — painel administrativo (protegido por login)
  - `imoveis` — cadastro de imóveis (finalidade: aluguel, venda ou ambos),
    upload/gerenciamento de fotos (capa, ordem, remoção) e registro de venda
    (comprador, valor final, data — com opção de reabrir o anúncio)
  - `proprietarios` / `inquilinos` — cadastros de pessoas (física ou jurídica,
    com qualificação completa: RG/CPF ou CNPJ, nacionalidade, estado civil,
    profissão, endereço — usados no contrato gerado)
  - `contratos` — vincula imóvel + inquilino, gera automaticamente as parcelas
    mensais (recebíveis) e **ao ser criado já redireciona para o contrato de
    locação pronto para impressão/PDF**, preenchido com os dados de todas as
    partes, do imóvel e do negócio
  - `financeiro` — controle manual de pagamentos (marcar como pago, editar valor/data/forma)
  - `configuracoes` — dados da imobiliária (nome, CNPJ, endereço, corretor(a)
    responsável, CRECI, chave PIX, logo) usados no cabeçalho do contrato gerado
- `prisma/schema.prisma` — modelo de dados
- `src/lib/` — helpers (Prisma client, auth, upload de fotos, cálculo de vencimentos)

## Banco de dados

Por padrão o projeto usa **SQLite** (`prisma/dev.db`), para zero configuração
local. O schema não usa nenhum recurso exclusivo do SQLite, então migrar para
PostgreSQL é só:

1. Trocar `provider = "sqlite"` para `provider = "postgresql"` em `prisma/schema.prisma`
2. Trocar `DATABASE_URL` no `.env` para a connection string do Postgres
3. Rodar `npx prisma migrate dev`

## Fotos dos imóveis

As fotos enviadas ficam em `public/uploads` (ignorado pelo git). Ao trocar de
servidor/hospedagem, essa pasta precisa ser migrada junto (ou trocada por um
storage externo tipo S3/Cloudinary, se preferir).

## Variáveis de ambiente (`.env`)

Veja `.env.example`. As principais:

- `DATABASE_URL` — conexão do banco
- `AUTH_SECRET` — chave usada pelo NextAuth para assinar sessões (gere uma nova em produção)
- `NEXT_PUBLIC_WHATSAPP_NUMBER` — número para o botão de contato (formato `55DDD9XXXXXXXX`, só números)

O nome e a logo exibidos no portal público são configurados em **Configurações**
no painel `/admin` (campo "Nome fantasia" e upload de logo), não por variável de
ambiente.

## Decisões de escopo (v1)

- **Financeiro é manual**: não há emissão de boleto/PIX integrada — os
  recebíveis são gerados automaticamente ao criar um contrato, e marcados como
  pagos manualmente.
- **Contrato gerado é um modelo para impressão** (`/admin/contratos/[id]/documento`,
  com botão "Imprimir / Salvar em PDF"), não uma assinatura digital. O texto
  segue o modelo real fornecido pela imobiliária (locadora/administradora +
  proprietário real do imóvel + locatário, com todas as cláusulas padrão:
  prazo, valor, despesas, multa por atraso, caução, bens inclusos, obrigações,
  multa por infração e foro). Cláusulas condicionais (proprietário, caução,
  bens inclusos, observações) só aparecem quando os dados existem, e a
  numeração das cláusulas se ajusta automaticamente.
- **Contratos não são editáveis após criados** — apenas encerrados ou excluídos
  (se ainda não tiverem pagamentos registrados). Para corrigir um contrato,
  encerre-o e crie um novo.
- **Single-tenant**: uma imobiliária, múltiplos usuários poderiam ser
  adicionados depois se necessário.
- **Venda não tem contrato/parcelas**: ao contrário da locação, um imóvel à
  venda não gera recebíveis — só um registro simples (comprador, valor final,
  data) quando marcado como vendido. Se precisar de comissão de venda,
  histórico de propostas, etc., isso ainda não existe e precisaria ser desenhado.
- **Cláusulas "padrão" do contrato são fixas no código**, não configuráveis
  pelo painel: multa por atraso 10%, juros 1% ao mês, correção pelo IGP-M,
  multa por infração de 3 meses de aluguel, obrigações/vedações do locatário.
  Elas ficam em [contratoTexto.ts](src/lib/contratoTexto.ts) e
  [documento/page.tsx](src/app/admin/contratos/[id]/documento/page.tsx) — se
  a imobiliária quiser mudar esses termos padrão, é uma edição de código, não
  uma tela de configuração.
