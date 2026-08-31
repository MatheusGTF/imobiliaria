# Memória do projeto — Imobiliária

Este arquivo é um resumo de contexto para quem (humano ou Claude) for continuar
este projeto. O [README.md](README.md) tem instruções de setup e decisões de
escopo — leia os dois. Este arquivo foca no *estado atual* e no *porquê* de
algumas escolhas que não são óbvias só olhando o código.

## O que é

Sistema para uma imobiliária real (Água Clara Imóveis, Água Clara/MS) que
atua com **locação e venda** de imóveis:

- Portal público (`/`) — vitrine de imóveis para alugar e comprar, com fotos,
  filtros e botão de contato via WhatsApp.
- Painel administrativo (`/admin`, login obrigatório) — cadastro de imóveis,
  proprietários, inquilinos, contratos de locação (com geração automática de
  recebíveis mensais e do contrato pronto para impressão/assinatura),
  controle financeiro manual e configurações da imobiliária.

## Estado atual: funcional, testado e commitado no git

Todo o sistema (schema, páginas, actions, etc.) foi construído em cima do
commit inicial do `create-next-app` e ficou muito tempo **sem commit**. Isso
foi resolvido: o primeiro commit real do projeto é
`47106a9 Implementa sistema de gestão da imobiliária (portal + painel admin)`.
A partir daqui, trabalhe com commits normais. O banco (`prisma/dev.db`) e as
fotos (`public/uploads/`) continuam **fora do versionamento** de propósito —
cuidado ao trocar de máquina.

Rodei `npm run build` e `npm run lint` limpos como última verificação (sem
erros). O fluxo completo (cadastro → contrato → recebíveis → documento
impresso) foi testado manualmente no navegador.

## Já tem dados reais no banco (`prisma/dev.db`)

Não é só dado de teste. No banco local atual já existem, inseridos pelo
usuário real entre uma sessão e outra:

- 3 imóveis (incluindo um já alugado)
- 1 inquilino real (Matheus Fioratti Gato)
- 1 contrato ativo com 14 parcelas geradas
- Os dados reais da imobiliária em Configurações (nome "Água Clara Imóveis",
  CNPJ, endereço, corretor(a) responsável, CRECI, chave PIX) — vieram de um
  PDF de contrato assinado que o usuário enviou como modelo.

**Cuidado ao mexer/testar**: não rode scripts de limpeza genéricos (tipo
`prisma.imovel.deleteMany()`) sem filtrar por nome/id específico — filtrei
manualmente nas sessões anteriores para não apagar esses registros reais.

## Stack e decisões técnicas importantes

- **Next.js 16** (App Router, Turbopack) + TypeScript + Tailwind CSS v4.
- **Prisma fixado em 6.19.3** (não 7 nem 8). O `latest` do npm aponta pra
  8.0.0-rc — uma release candidate com CLI totalmente diferente (novo
  formato de output, "agent skills"). O 7 exige driver adapters obrigatórios
  e um novo generator (`prisma-client` em vez de `prisma-client-js`). Ambos
  são mudanças estruturais grandes; 6.19.3 é a última versão do fluxo
  "clássico" (schema com `url = env(...)`, `new PrismaClient()` direto,
  `prisma migrate dev`) — mais estável e documentado. Se for atualizar,
  planeje uma migração dedicada, não um bump casual.
- **SQLite em dev, Postgres em produção** — o schema não usa nada exclusivo
  do SQLite de propósito. Trocar é só mudar `provider` + `DATABASE_URL` e
  rodar `prisma migrate dev` de novo (veja README).
- **Next.js 16 renomeou `middleware.ts` para `proxy.ts`** — um arquivo
  `middleware.ts` esquecido é **ignorado silenciosamente** (sem erro), o que
  destrava o `/admin` sem autenticação. Já migrado (`src/proxy.ts`), mas é
  a armadilha mais perigosa desse projeto se alguém criar um novo middleware
  do jeito antigo por hábito.
- **NextAuth v5** (beta) com Credentials provider, sessão JWT.
- **sharp** converte toda foto enviada para `.webp` e redimensiona (aplica
  tanto às fotos de imóvel quanto à logo da imobiliária).
- Automação de browser para testes (Claude Browser pane): o `read_page`
  (accessibility snapshot) às vezes mostra campos como vazios mesmo quando o
  valor real no DOM/banco está correto — sempre confirme mudanças de dados
  lendo o banco direto (`node -e "...prisma..."`) ou tirando `screenshot`,
  não confie só no `read_page` para verificar se um form foi preenchido.

## O que está implementado

- **Imóveis**: CRUD completo, fotos múltiplas (capa, reordenar, remover),
  campos de aluguel e/ou venda (`finalidade`: ALUGUEL | VENDA | AMBOS),
  status (Disponível/Alugado/Vendido/Inativo), marcar como vendido com
  registro de comprador/valor/data (e reabrir anúncio).
- **Proprietários e Inquilinos**: cadastro com qualificação jurídica completa
  (RG/CPF, nacionalidade, estado civil, profissão, endereço). Inquilino pode
  ser pessoa física ou jurídica (com responsável legal).
- **Contratos**: vincula imóvel (só os disponíveis para aluguel) + inquilino,
  gera as parcelas mensais (`Pagamento`) automaticamente para todo o período,
  e **ao criar já redireciona para o contrato pronto para impressão**
  (`/admin/contratos/[id]/documento`). O texto do contrato foi montado a
  partir de um modelo real fornecido pelo usuário (PDF assinado) — ver
  `src/lib/contratoTexto.ts` e a página do documento. Cláusulas condicionais
  (proprietário do imóvel, caução, bens inclusos, observações) só aparecem
  se os dados existirem; a numeração das cláusulas se ajusta sozinha.
- **Financeiro**: lista de recebíveis por mês/status, marcar como pago,
  editar valor/data/forma de pagamento.
- **Configurações**: dados da imobiliária (nome fantasia, razão social, CNPJ,
  endereço, responsável, CRECI, chave PIX, logo). O **nome fantasia**
  (`Empresa.nome`) aparece no portal e no cabeçalho do contrato; a **razão
  social** (`Empresa.razaoSocial`, opcional) é usada na qualificação jurídica
  da LOCADORA no contrato gerado — cai no nome fantasia se estiver vazia.
  Ex. real: fantasia "Água Clara Imóveis" / razão social "Andressiele Marques
  Imobiliária".
- **Portal público**: home, listagem com filtros (cidade/tipo/finalidade/
  quartos/valor), detalhe do imóvel, botão de WhatsApp.
- `start.bat` — script para leigos rodarem o projeto localmente (instala
  dependências, aplica migrações, roda seed, abre o navegador).

## O que NÃO está implementado (decisão de escopo, ver README)

- Venda não gera parcelas/recebíveis, só um registro simples ao marcar como
  vendido. Sem comissão de venda, propostas, negociação.
- Contratos não são editáveis depois de criados (só encerrar ou excluir sem
  pagamentos). Termos "padrão" do contrato (multa 10%, juros 1% a.m., IGP-M,
  multa de 3 meses por infração) estão fixos no código, não configuráveis
  pelo painel.
- Sem emissão de boleto/PIX integrada — financeiro é 100% manual.
- Single-tenant (uma imobiliária só, sem multi-usuário/permissões granulares).
- Sem testes automatizados (unitários/e2e) — toda verificação até agora foi
  manual via browser + `npm run build`/`lint`.

## Sugestões de próximos passos

1. **Commitar o projeto no git** (prioridade zero, ver acima).
2. Decidir hospedagem (Postgres gerenciado + Vercel/Railway/VPS) — ainda não
   escolhida, ver README.
3. Se for demonstrar/vender esse sistema para outras imobiliárias, o
   single-tenant vira uma limitação real — precisaria desenhar multi-tenant.
4. Perguntar ao usuário se os termos fixos do contrato (multa, juros, IGP-M)
   deveriam virar configuráveis por contrato ou por imobiliária.
5. **Bug conhecido na geração de recebíveis**: `gerarMesesReferencia`
   (`src/lib/pagamentos.ts`) inclui o mês da `dataFim` mesmo quando o contrato
   dura exatamente N meses e termina no mesmo dia do mês em que começou. Ex.:
   contrato de 07/04/2026 a 07/04/2027 ("12 meses") gera **13** parcelas
   (abr/26 a abr/27), sendo a de abr/27 indevida. O texto do contrato mostra
   "12 (doze) meses" certo (`mesesEntre` está correto). Contornar excluindo a
   última parcela no Financeiro, ou corrigir o algoritmo para parar no mês
   anterior à `dataFim` quando o dia de término ≤ dia de início.

## Contratos reais já cadastrados (modelos usados)

- Contrato Matheus Fioratti Gato (imóvel Av. Julio Maia 4078) — primeiro
  modelo, base do texto em `contratoTexto.ts` / página do documento.
- Contrato **Auto Locadora Irigaray Ltda** (imóvel Casa Rua Jorge Amado 20,
  proprietária Dayane Rosa Peres) — 2º modelo real (PDF assinado). Cadastrado
  pelo painel em 31/08/2026; validou o campo razão social. Diferenças do PDF
  que NÃO foram implementadas no gerador (ficam como melhorias futuras):
  numeração "CLÁUSULA PRIMEIRA" por extenso + seções numeradas, seção "DA
  GARANTIA" sempre presente ("firmado sem caução"), qualificação completa
  da proprietária/responsável (nacionalidade, estado civil, endereço),
  parágrafo "moradia de colaborador" quando o locatário é PJ, bloco de
  assinatura da LOCATÁRIA PJ com razão social + CNPJ + responsável legal.
