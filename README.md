# Imobiliária

Sistema de gestão para imobiliárias: **portal público** de imóveis para locação
e venda + **painel administrativo** para gerenciar imóveis, proprietários,
inquilinos, contratos de locação e o financeiro (recebíveis).

## Tecnologias

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS 4
- **PostgreSQL** (Neon em produção) com **Prisma 6**
- **NextAuth v5** — login do painel com e-mail e senha (+ autenticador opcional)
- **sharp** — fotos convertidas para `.webp` · **Vercel Blob** — armazenamento das fotos

## Como rodar localmente

Pré-requisitos: Node 20+ e um PostgreSQL acessível.

```bash
cp .env.example .env     # preencha as URLs do banco, AUTH_SECRET e o admin do seed
npm install
npx prisma migrate deploy
npm run seed             # cria o usuário administrador (usa SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD)
npm run dev
```

- Portal público: <http://localhost:3000>
- Painel administrativo: <http://localhost:3000/admin/login>

No Windows há também `scripts/iniciar-local.bat`, que executa esses passos.

## Estrutura do projeto

```
src/
  app/
    (site)/            portal público (home, imóveis, contato, privacidade)
    admin/             painel administrativo (protegido por login)
      (dashboard)/     dashboard, imóveis, proprietários, inquilinos,
                       contratos, financeiro, configurações
      contratos/[id]/documento/   contrato pronto para impressão
      login/           tela de entrada
    api/auth/          rota do NextAuth
    f/                 entrega das fotos guardadas no storage privado
  components/
    admin/             peças do painel (upload de fotos, busca, exclusão)
    site/              peças do portal (logo, cards, galeria de fotos)
    shared/            usadas nos dois lados
    ui/                botões, campos, selos, cartões
  lib/
    auth/              login, sessão e proteção das ações
    comum/             formatação, dinheiro, constantes, validações
    contratos/         texto do contrato, avisos de vencimento
    db/                cliente do banco (Prisma)
    financeiro/        recebíveis e divisão aluguel × administração
    imoveis/           consultas e helpers de imóveis
    midia/             upload e redimensionamento de fotos
  proxy.ts             proteção do /admin e cabeçalhos de segurança
prisma/
  schema.prisma        modelo de dados
  migrations/          histórico do banco (aplicado no deploy)
  scripts/             seed, exportação e importação de dados
docs/                  documentação (veja abaixo)
scripts/               utilitários locais
```

## Documentação

| Arquivo | Assunto |
|---|---|
| [docs/PROJETO.md](docs/PROJETO.md) | estado atual, decisões técnicas, o que existe e o que não existe |
| [docs/DEPLOY.md](docs/DEPLOY.md) | publicação (Vercel + Neon + Blob) e rotina |
| [docs/SEGURANCA.md](docs/SEGURANCA.md) | proteções implementadas e o que fazer no dia a dia |
| [docs/LGPD.md](docs/LGPD.md) | dados pessoais tratados, bases legais, direitos dos titulares |

## Variáveis de ambiente

Veja o `.env.example`. As principais:

- `POSTGRES_PRISMA_URL` / `DATABASE_URL_UNPOOLED` — conexão do banco (criadas pelo Neon na Vercel)
- `AUTH_SECRET` — chave que assina as sessões (valor aleatório e secreto)
- `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` — só para criar o primeiro administrador

Nome fantasia, logo, telefones, Instagram, endereço e corretores do portal são
configurados em **Configurações** no painel — não por variável de ambiente.

## Decisões de escopo

- **Financeiro é manual**: não há emissão de boleto/PIX integrada — as parcelas
  são geradas ao criar o contrato e marcadas como pagas manualmente.
- **O contrato gerado é um modelo para impressão** (com botão "Imprimir / Salvar
  em PDF"), não uma assinatura digital. As cláusulas padrão (multa, juros,
  correção) ficam no código, em `src/lib/contratos/contratoTexto.ts`.
- **Contratos não são editáveis depois de criados** — encerre e crie outro. O
  histórico de locações do imóvel é mantido.
- **Uma imobiliária por instalação** (single-tenant).
- **Venda não gera parcelas** — só um registro simples ao marcar como vendido.
