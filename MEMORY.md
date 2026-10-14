# Memória do projeto — Imobiliária

Este arquivo é um resumo de contexto para quem (humano) for continuar
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

Não é só dado de teste, e **o cliente adiciona/edita coisas pelo `/admin`
entre uma sessão e outra** (em set/2026 já eram ~6 imóveis — casas, um
terreno, um marcado como vendido —, 2 proprietários, 2 inquilinos, 2
contratos, 1 pagamento quitado). Sempre trate o conteúdo do banco como real.
Os dados da imobiliária em Configurações (nome fantasia, razão social, CNPJ,
endereço, telefones, Instagram, corretores, CRECIs, PIX) estão preenchidos.

Antes de qualquer migração/deploy, rode **`npm run db:export`** para tirar um
retrato fresco (`prisma/data-export.json`, gitignored).

**Cuidado ao mexer/testar**: não rode scripts de limpeza genéricos (tipo
`prisma.imovel.deleteMany()`) sem filtrar por nome/id específico.

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
- Automação de browser para testes (navegador automatizado): o `read_page`
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
  Ex. real: fantasia "Água Clara Imóveis" / razão social "[razão social]
  Imobiliária".
- **Portal público**: home com hero + vitrine "O que temos disponível"
  (cards por tipo de imóvel com contagem de disponíveis), listagem `/imoveis`
  com chips de tipo + filtros (cidade/finalidade/quartos/valor), detalhe do
  imóvel, **página `/contato`** (telefones + WhatsApp, Instagram, endereço com
  link pro mapa, corretores). Identidade visual da marca **Água Clara Imóveis**
  (paleta rosa `brand-*` + cinza quente `ink-*` em tokens no `globals.css`,
  títulos em Montserrat, símbolo dos dois telhados em SVG no `Logo.tsx`).
  - **Tudo do portal vem de Configurações** (`Empresa`): nome fantasia, logo,
    `telefone`, `telefone2`, `instagram`, `responsavelNome/Creci`,
    `responsavel2Nome/Creci`, endereço. Não há mais nenhuma env de conteúdo
    (`NEXT_PUBLIC_SITE_NAME` e `NEXT_PUBLIC_WHATSAPP_NUMBER` removidas). Sem
    logo enviada, o cabeçalho usa o símbolo SVG dos dois telhados. Logo real:
    enviar em `/admin/configuracoes` (vira `.webp` com transparência via sharp).
  - Helpers em `src/lib/format.ts`: `parseInstagram()`, `whatsappLink()`.
    Contagem por tipo: `contarDisponiveisPorTipo()` em `src/lib/imoveis.ts`.
  - Home, `/imoveis`, `/imoveis/[id]` e `/contato` são `force-dynamic`. As
    actions do `/admin` (imóveis, fotos, contratos) chamam `revalidarPortal()`
    (`src/lib/revalidate.ts` → `revalidatePath("/", "layout")`) para o portal
    refletir mudanças na hora.
  - **Home mostra TODOS os imóveis disponíveis** (destaque primeiro, até 6).
    A lógica antiga escondia o resto quando havia ≥1 destaque — o cliente
    achava que "o site não atualizava" (era isso, não cache).
  - **Endereço**: o cliente confirmou (31/08/2026) que o certo é
    **"Avenida Benevenuto Ottoni, nº 6, Água Clara/MS"** — já gravado em
    Configurações. O "nº 1.475, Centro" que aparecia no PDF de contrato usado
    como modelo estava errado/desatualizado. Como o documento de contrato é
    gerado a partir de `Empresa.endereco`, contratos gerados de agora em diante
    (e o de contrato antigo, se regerado) saem com o nº 6.
- **Fotos em produção**: o Blob criado na Vercel é **store privado** (não
  aceita `access:"public"`). O upload grava blob privado (`put access:"private"`,
  auth por OIDC via `BLOB_STORE_ID`) e as imagens são servidas pela rota
  **`src/app/f/[...path]/route.ts`** (`GET` faz `get()` com o token do servidor
  e devolve com cache imutável). O `Foto.url`/`Empresa.logoUrl` guardam
  `/f/uploads/xxx.webp`. O upload é **client-side**: `src/lib/imageResize.ts`
  redimensiona pra .webp no navegador, e `UploadFotos`/`UploadLogo`
  (`src/components/admin/`) chamam `adicionarFoto`/`salvarLogo` uma imagem por
  vez (server actions com limite de corpo de 3 MB no `next.config`). As
  3 fotos legadas `/uploads/*` da migração foram apagadas do banco.
- **Exclusões no `/admin`**: `deleteContrato/Inquilino/Proprietario/Imovel`
  recebem `id` e retornam `{ ok } | { error }` (não lançam mais). O
  `src/components/admin/BotaoExcluir.tsx` mostra o motivo da recusa inline.
  `src/app/admin/(dashboard)/error.tsx` é a rede de segurança pro resto.
  Contrato com parcela **paga**: a exclusão é recusada, mas a tela oferece
  "Excluir mesmo assim" (`deleteContrato(id, forcar)`, `podeForcar` no
  `ResultadoAcao`), com confirmação reforçada — apaga contrato + parcelas,
  inclusive as pagas. "Encerrar contrato" é a opção que mantém o histórico.
- **Inquilino no imóvel** (`Imovel.inquilinoId`, FK opcional): aparece no
  cadastro do imóvel quando o status é "Alugado"
  (`imoveis/StatusEPessoasFields.tsx`). Contrato novo preenche; encerrar ou
  excluir contrato limpa; mudar o status para outro que não Alugado também
  limpa (`parseImovelForm`). A lista do `/admin` mostra proprietário e
  inquilino; o portal público **nunca** mostra. Excluir inquilino registrado
  em imóvel é recusado.
- **Tipos de imóvel e despesas** (out/2026): `TIPOS_IMOVEL` em
  `src/lib/constants.ts` (Casa, Sobrado, Apartamento, Kitnet, Terreno,
  Chácara/Sítio, Galpão/Barracão, Sala comercial, Prédio/Imóvel inteiro,
  Comercial legado, Outro) — `tipo` é string livre, sem enum no banco. A
  vitrine da home mostra Casa/Apartamento/Terreno sempre e os outros tipos só
  com disponível (`TIPOS_VITRINE_FIXOS`). `ehNaoResidencial()` (Comercial,
  Galpão, Sala comercial) decide "residenciais/comerciais" e o título do
  contrato. `Imovel.aguaInclusa/energiaInclusa/temCondominio/
  condominioDescricao` (form: `imoveis/DespesasFields.tsx`); valor do
  condomínio só é gravado se `temCondominio`. O site só mostra os selos quando
  "Sim" (nunca afirma "não inclusa", pois imóveis antigos nasceram com Não por
  padrão). A cláusula de despesas do contrato (`clausulaDespesas`) muda só
  quando água/energia estão marcadas; sem marcação o texto é o de sempre.
- **IPTU, entrada e avisos de término** (out/2026): `Imovel.iptuResponsavel`
  (`PROPRIETARIO` padrão | `LOCATARIO`, select em `DespesasFields`) troca a
  frase do IPTU em `clausulaDespesas`. `Contrato.dataEntrada` (opcional, quando
  o inquilino recebe as chaves) é preenchida em `contratos/novo` e aparece no
  detalhe do contrato — não entra no texto do documento. **Avisos**:
  `src/lib/avisos.ts` (`DIAS_AVISO_TERMINO = 60`) alimenta o card "Avisos de
  término e renovação" do dashboard (contratos ATIVOS com `dataFim` em até 60
  dias ou já vencidos, com telefone de proprietário e inquilino) e o selo
  "Vence em N dias" na lista de contratos. É só **aviso na tela**: não há envio
  de e-mail/WhatsApp (precisaria de provedor + cron — decisão do cliente). A
  separação imóvel × locação já existe: o imóvel é cadastrado uma vez; cada
  locação é um `Contrato`, e encerrar + novo contrato mantém o histórico.
- **Imóvel × Inquilino × Contrato conectados** (out/2026): o vínculo nasce no
  **contrato** (`createContrato` marca o imóvel ALUGADO + `inquilinoId`).
  `/admin/imoveis` é uma tabela (foto, título, tipo, endereço, bairro, valor,
  status, inquilino atual, proprietário) com busca `?q=` (`BuscaForm`, GET,
  server-side; `tiposQueCasam()` em `src/lib/locacao.ts` casa o nome do tipo).
  `/admin/imoveis/[id]` mostra dados + **Locação atual** + **Histórico de
  locações** (todos os contratos do imóvel) e, abaixo, fotos/edição/venda/
  exclusão. `/admin/inquilinos` lista imóvel alugado, endereço, início/término,
  aluguel, status (Ativo / Sem locação ativa) e nº de contratos;
  `/admin/inquilinos/[id]` mostra imóvel, contrato, despesas e histórico.
  **Encerrar contrato** agora tem o checkbox "o inquilino já saiu" (padrão
  marcado): desmarcado, o contrato encerra mas o imóvel segue ALUGADO e a tela
  do imóvel oferece "Confirmar saída" (`liberarImovel` em `imoveis/actions.ts`).
  `/admin/contratos/novo?imovelId=…&inquilinoId=…` pré-seleciona. Contratos
  nunca são apagados na troca de inquilino — só ficam ENCERRADO.
- **Capa e ordem das fotos**: a **primeira foto é a capa** (`Foto.capa` =
  posição 0, sempre sincronizado). `imoveis/[id]/FotoManager.tsx` é client com
  `@dnd-kit` (arrastar com mouse; no celular segurar ~200ms; setas e estrela
  "Usar como capa" como alternativa). Mudanças ficam locais até clicar em
  "Salvar ordem e capa" → `reordenarFotos(imovelId, ids)` em
  `imoveis/actions.ts` (grava `ordem` e `capa` numa transação). Os antigos
  `moveFoto`/`setFotoCapa` foram removidos. Ao testar o drag localmente sem
  banco, use uma página temporária com fotos `data:` e apague depois (e
  limpe `.next`, senão o `tsc` do build reclama da rota removida).
- **Dinheiro nos formulários**: usar sempre `MoneyField`/`MoneyInput`
  (`src/components/ui/MoneyInput.tsx`, lógica em `src/lib/money.ts`) — ponto é
  milhar, vírgula é decimal, e o servidor recebe "5000.50". **Nunca**
  `<input type="number">` para reais: em pt-BR "5.000" era lido como 5.
- **Taxa de administração** (`Empresa.taxaAdministracaoPercentual`, padrão 10,
  editável em Configurações) NÃO aparece em contrato nem no portal — só no
  Financeiro (`src/lib/financeiro.ts`: aluguel → administração → repasse; a
  administração incide só sobre o aluguel, não sobre condomínio/IPTU).
  `Contrato.taxaAdministracaoPercentual` continua na tabela como override
  opcional, mas o formulário de contrato não pede mais.
- **`/admin` ainda usa o visual antigo** (emerald/slate). O redesign da marca
  foi só no portal público até agora.
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

1. **Commitar o projeto no git** — feito (ver acima).
2. **Deploy — NO AR** (31/08/2026). **Vercel + Neon (Postgres) + Vercel Blob**.
   - Repo: <https://github.com/MatheusGTF/imobiliaria> (branch `main`, **público**).
     Push → deploy automático.
   - Time/projeto Vercel: `fiotec1` / `imobiliaria`.
   - **URL de produção atual**: `https://imobiliaria-ashen-delta.vercel.app`
     (portal) e `/admin` (painel). Vira `aguaclaraimoveis.com.br` quando o DNS
     propagar.
   - **Domínio** `aguaclaraimoveis.com.br` registrado no registro.br (CNPJ) e
     adicionado na Vercel. DNS **pendente** — em 31/08 o domínio ainda estava
     "em transição" (~2h). Registros a adicionar na zona DNS do registro.br
     (Modo Avançado): `A` nome vazio → `216.198.79.1`; `CNAME` nome `www` →
     `bfcea31a14102d4a.vercel-dns-017.com.` (o registro.br não aceita `@`).
   - Neon e Blob conectados pela integração da Vercel. O schema usa
     `POSTGRES_PRISMA_URL` (pooled) e `DATABASE_URL_UNPOOLED` (direct).
     `AUTH_SECRET` foi definido manualmente nas env vars da Vercel.
   - Dados migrados: `npm run db:export` (do dev.db) → `npm run db:import`
     (no Neon). Migration `prisma/migrations/0_init` roda no build da Vercel.
   - **Senha do admin trocada** da default. Credenciais atuais na memória
     privada do projeto (fora do repo, que é público).
   - **Falta ainda**: DNS propagar; **reenviar as 3 fotos** dos imóveis pelo
     `/admin` (as URLs `/uploads/*` importadas apontam pra arquivos que não
     existem na Vercel — os cards mostram placeholder até lá).
   - Dev local agora exige Postgres. `npm run build` local falha com EPERM se o
     `next dev` estiver rodando (DLL do Prisma travada) — só no Windows.
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

- Contrato [locatário PF] (imóvel [endereço]) — primeiro
  modelo, base do texto em `contratoTexto.ts` / página do documento.
- Contrato **[locatária PJ]** (imóvel Casa [endereço],
  proprietária [proprietária]) — 2º modelo real (PDF assinado). Cadastrado
  pelo painel em 31/08/2026; validou o campo razão social. Diferenças do PDF
  que NÃO foram implementadas no gerador (ficam como melhorias futuras):
  numeração "CLÁUSULA PRIMEIRA" por extenso + seções numeradas, seção "DA
  GARANTIA" sempre presente ("firmado sem caução"), qualificação completa
  da proprietária/responsável (nacionalidade, estado civil, endereço),
  parágrafo "moradia de colaborador" quando o locatário é PJ, bloco de
  assinatura da LOCATÁRIA PJ com razão social + CNPJ + responsável legal.
