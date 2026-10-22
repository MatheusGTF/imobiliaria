# Segurança

O sistema guarda **dados pessoais de proprietários, inquilinos e contratos**.
Este documento descreve o que está protegido, o que depende de configurações
fora do código e o que fazer em caso de problema. Veja também [LGPD.md](LGPD.md).

## 1. O que está implementado

| Proteção | Como funciona | Onde está |
|---|---|---|
| **Dependências sem falhas conhecidas** | Next.js 16.4.2 e demais pacotes de execução atualizados. Restam 8 avisos do `npm audit` só em ferramentas de desenvolvimento (lint e CLI do Prisma), que não vão para o site. | `package.json` |
| **Login em camadas** | Senha com bcrypt (custo 12), mensagens genéricas ("e-mail ou senha inválidos"), tempo de resposta igual para e-mail inexistente. | `src/lib/seguranca/login.ts` |
| **Bloqueio de tentativas em massa** | 5 erros em 15 min vindos do mesmo IP bloqueiam aquele IP; 30 erros contra a mesma conta (vindos de IPs diferentes) bloqueiam a conta. O dono, de outro IP, não fica trancado do lado de fora por um atacante. | `limiteExcedido()` |
| **Autenticador em duas etapas (TOTP)** | Código de 6 números do celular (Google/Microsoft Authenticator, Authy…). O segredo fica **criptografado** (AES-256-GCM) no banco; cada código vale uma vez só; 10 códigos de recuperação de uso único (guardados como hash). | `src/lib/seguranca/totp.ts`, `cripto.ts` |
| **Sessão curta** | O login expira em 8 horas (antes: 30 dias). | `src/lib/auth/auth.ts` |
| **Toda ação confere o login** | O `proxy.ts` protege as páginas, mas as ações do painel podem ser chamadas diretamente. Por isso **cada uma das 23 ações** começa com `exigirAdmin()`, que também confere no banco se o usuário ainda existe e é administrador. As páginas do painel e o documento do contrato impresso também conferem. | `src/lib/auth/acesso.ts` |
| **Política de Segurança de Conteúdo (CSP)** | Só scripts com um código único por visita (`nonce`) executam: bloqueia injeção de código (XSS). Também: HTTPS obrigatório (HSTS), proibido embutir o site em outro (anti-clickjacking), câmera/microfone/localização desligados. | `src/proxy.ts`, `next.config.ts` |
| **Painel sem cache e sem indexação** | `Cache-Control: no-store` e `noindex` em tudo que é `/admin`; `robots.txt` bloqueia `/admin`. | `next.config.ts`, `src/app/robots.ts` |
| **Upload de fotos seguro** | O servidor abre o arquivo de verdade (não confia no nome/tipo informado), só aceita JPG/PNG/WebP/GIF até 5 MB, converte para WebP novo e **remove os metadados (incluindo localização GPS)**. | `src/lib/midia/photos.ts` |
| **Entrega de fotos restrita** | A rota `/f/...` só entrega `uploads/<nome>.(webp\|jpg\|png)`; o tipo da resposta vem da extensão, com `nosniff` e CSP restrita. As fotos são guardadas na CDN (menos carga). | `src/app/f/[...path]/route.ts` |
| **Busca pública à prova de lixo na URL** | Filtros inválidos são ignorados (antes `quartos=abc` derrubava a página) e a lista tem limite de 60 imóveis. | `src/app/(site)/imoveis/page.tsx` |
| **Registro de atividade** | Logins, falhas, bloqueios, trocas de senha/autenticador, e criação/alteração/exclusão de contratos, inquilinos, proprietários e imóveis, e quem abriu o documento de um contrato. Só guarda IDs (nunca dados pessoais) e é apagado após 180 dias. Visível em **Painel → Segurança**. | `src/lib/seguranca/auditoria.ts` |
| **Sem senha padrão** | O `seed` exige e-mail e senha (12+ caracteres) por variável de ambiente. | `prisma/scripts/seed.ts` |

## 2. O que você precisa fazer (fora do código)

Nenhuma configuração de código substitui estes passos:

1. **Deixe o repositório do GitHub PRIVADO** (Settings → General → Danger Zone →
   Change visibility). Enquanto for público, qualquer pessoa lê o código e o
   histórico. A Vercel continua publicando normalmente.
2. **Ative o autenticador no painel** (Painel → Segurança) e guarde os códigos
   de recuperação em papel ou em um gerenciador de senhas.
3. **Troque o e-mail de acesso** (o e-mail padrão antigo ficou público no
   histórico do repositório) e a senha, em Painel → Segurança.
4. **Verificação em duas etapas nas contas** que controlam o site: GitHub,
   Vercel, Neon e registro.br (quem entra nelas controla tudo).
5. **Vercel → Firewall**: ative o *Attack Challenge Mode* se o site for atacado
   e crie uma regra de limite de requisições (rate limit) para `/admin/login`.
   A Vercel já absorve ataques de rede em grande volume; essas regras cobrem
   abuso no nível da aplicação.
6. **Guarde o `AUTH_SECRET`** em local seguro. Ele protege as sessões **e** o
   segredo do autenticador: se for trocado, todos precisam entrar de novo e o
   autenticador precisa ser refeito (veja "perdi o acesso" abaixo).
7. **Neon**: confirme que o *point-in-time restore* (backup) está ligado no seu
   plano, e teste restaurar uma vez.
8. **Apague arquivos de dados do seu computador** que não usa mais:
   `prisma/data-export.json` e `prisma/dev.db` têm dados pessoais em texto puro
   (estão fora do Git, mas estão no disco).
9. Rode `npm audit` uma vez por mês e atualize o Next.js quando sair correção.

## 3. Limitações conhecidas

- **Ataque de grande volume (DDoS)** é tratado pela Vercel, não pelo código.
- A sessão é um token (JWT): ao **trocar a senha**, outras sessões já abertas
  continuam valendo até expirar (no máximo 8 horas). Para derrubar todas na
  hora, troque o `AUTH_SECRET` na Vercel (isso também exige refazer o autenticador).
- O bloqueio por IP pode atingir várias pessoas que usam a mesma rede (por
  exemplo, a mesma internet do escritório): 5 erros bloqueiam por 15 minutos.
- Só existe um papel de usuário (administrador). Não há permissões por corretor.
- O contrato impresso (`/admin/contratos/[id]/documento`) tem dados pessoais:
  ao imprimir/salvar em PDF, o arquivo sai do controle do sistema.

## 4. Procedimentos

### Perdi o celular **e** os códigos de recuperação
Com acesso ao banco de produção (variáveis do Neon no ambiente), rode:

```bash
npx tsx prisma/scripts/redefinir-acesso.ts --email seu@email.com --desativar-2fa
```

Depois entre só com a senha e ative o autenticador de novo. Para definir uma
nova senha: `NOVA_SENHA="..." npx tsx prisma/scripts/redefinir-acesso.ts --email seu@email.com`.

### Suspeita de invasão
1. Painel → Segurança → **Atividade recente**: procure acessos que não foram seus.
2. Troque a senha e gere novos códigos de recuperação.
3. Na Vercel, troque o `AUTH_SECRET` (derruba todas as sessões) e faça redeploy.
4. Troque as senhas das contas Vercel/GitHub/Neon e revogue acessos desconhecidos.
5. Se houve acesso a dados pessoais, siga o roteiro de incidentes em [LGPD.md](LGPD.md).

### Atualizar dependências
```bash
npm audit                     # lista as falhas conhecidas
npm install next@<versão>     # versão corrigida indicada pelo audit
npm run lint && npm run build # confira antes de publicar
```

## 5. Regras para quem for programar aqui

- **Toda ação nova** (`"use server"`) começa com `const admin = await exigirAdmin();`.
  Páginas novas dentro de `src/app/admin/(dashboard)` já são cobertas pelo layout;
  páginas fora dele precisam chamar `exigirAdmin()`.
- Não coloque dados pessoais no registro de atividade (`registrarAuditoria`): só IDs.
- Toda tela nova deve ser testada em `next build` + `next start` (a CSP só vale
  de verdade em produção) e conferir o console do navegador.
- Nunca versione `.env*`, exportações do banco, PDFs de contratos ou fotos de clientes.
- Páginas novas ficam dinâmicas por padrão (`export const dynamic = "force-dynamic"`
  no layout raiz) — necessário para o `nonce` da CSP.
