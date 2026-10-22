# LGPD — Lei Geral de Proteção de Dados (Lei 13.709/2018)

> Este documento organiza o que o **sistema** faz e o que a **imobiliária**
> precisa fazer. É um guia técnico-organizacional, não parecer jurídico:
> recomenda-se que um advogado revise a política de privacidade
> (`/privacidade`), os modelos de contrato e os prazos de guarda.

## 1. Papéis

| Papel | Quem |
|---|---|
| **Controlador** (decide sobre os dados) | A imobiliária (razão social/CNPJ em *Configurações*) |
| **Operadores** (tratam dados em nome do controlador) | Vercel Inc. (hospedagem e fotos) e Neon Inc. (banco de dados) |
| **Titulares** (donos dos dados) | Proprietários, inquilinos, compradores e seus representantes; visitantes do site; usuários do painel |
| **Encarregado (DPO)** | Pessoa indicada em *Configurações → Responsável pelos dados pessoais* |

## 2. Inventário dos dados pessoais

| Dado | Quem é o titular | Para quê | Base legal (art. 7º) | Onde fica | Quem acessa | Guarda |
|---|---|---|---|---|---|---|
| Nome, CPF/CNPJ, RG, nacionalidade, estado civil, profissão, endereço, telefone, e-mail | Proprietário | Elaborar e administrar locação/venda, repasses | V (contrato), II (obrigação legal), VI (direitos) | Banco (Neon) | Administrador do painel | Contrato + ~5 anos |
| Os mesmos dados | Inquilino (PF/PJ e representante) | Elaborar contrato, cobrar aluguel | V, II, VI | Banco (Neon) | Administrador | Contrato + ~5 anos |
| Nome e contato do comprador, valor e data | Comprador | Registrar a venda | V, VI | Banco (Neon) | Administrador | Venda + ~5 anos |
| Valores, datas e forma de pagamento | Inquilino/proprietário | Financeiro e prestação de contas | V, II | Banco (Neon) | Administrador | ~5 anos |
| Fotos dos imóveis | — (podem mostrar pessoas/objetos) | Anúncio | IX (legítimo interesse) | Vercel Blob (privado) | Público (imagens do anúncio) | Enquanto anunciado |
| E-mail, senha (hash), segredo do autenticador (criptografado) | Usuário do painel | Acesso seguro | IX | Banco (Neon) | Sistema | Enquanto houver acesso |
| Registro de atividade (ID do usuário, ação, IP, data) | Usuário do painel; quem tentou entrar | Segurança e rastreabilidade (art. 46) | IX | Banco (Neon) | Administrador | 180 dias (automático) |
| IP/navegador das visitas ao site | Visitante | Funcionamento e segurança | IX | Logs da Vercel | Vercel | Conforme a Vercel |
| Número e mensagens de WhatsApp | Interessado | Atendimento | V (procedimentos preliminares) | WhatsApp (Meta) | Corretores | Conforme a conversa |

O site **não usa cookies de rastreamento, anúncios nem analytics**. Os únicos
cookies são o de sessão do painel (HttpOnly) para quem faz login — por isso não
há banner de cookies. Se algum dia for instalado analytics/pixel, será preciso
um aviso de cookies e atualizar `/privacidade`.

## 3. O que o sistema faz pela LGPD

- **Princípio da transparência**: página pública `/privacidade`, ligada ao rodapé,
  com controlador, finalidades, bases legais, compartilhamento, prazos, direitos
  e canal de contato (preenchido em *Configurações*).
- **Segurança (art. 46)**: veja [SEGURANCA.md](SEGURANCA.md) — senha forte,
  autenticador, bloqueio de tentativas, controle de acesso em todas as ações,
  criptografia em trânsito (HTTPS) e do segredo do autenticador, painel sem cache.
- **Rastreabilidade/prestação de contas (art. 37 e 6º, X)**: registro de
  atividade em *Painel → Segurança*.
- **Minimização (art. 6º, III)**: as fotos enviadas têm os metadados (incluindo
  GPS) removidos; o registro de atividade guarda só IDs; o site público não
  exibe proprietário nem inquilino.
- **Eliminação**: registros de atividade são apagados sozinhos após 180 dias.

## 4. Atendimento aos direitos dos titulares (art. 18)

Prazo: responder em **até 15 dias** (art. 19, II). Roteiro:

1. **Confirmar a identidade** de quem pede (documento com foto ou o contato que
   já consta no cadastro). Nunca entregue dados a quem não for o titular.
2. **Registrar o pedido** (data, quem pediu, o que pediu) em um documento fora
   do sistema — ele serve de prova.
3. Atender:
   - **Confirmação/acesso**: reúna os dados do titular (cadastro em
     Proprietários/Inquilinos, contratos e pagamentos ligados a ele) e envie em
     formato legível, por canal seguro.
   - **Correção**: edite o cadastro no painel (a alteração fica no registro de atividade).
   - **Eliminação/anonimização**: dados de **contrato vigente ou dentro do prazo
     legal de guarda não podem ser apagados** (execução de contrato, obrigação
     legal e defesa em processo). Explique isso por escrito ao titular. Vencido o
     prazo: exclua o contrato (e suas parcelas) e depois o cadastro da pessoa
     (o sistema só deixa excluir o cadastro quando não há contrato/imóvel vinculado).
   - **Portabilidade/informação sobre compartilhamento**: use o inventário acima.
4. **Responder por escrito** dentro do prazo, mesmo que seja para negar com justificativa.

## 5. Incidente de segurança (art. 48)

Exemplos: acesso indevido ao painel, vazamento de contrato/PDF, perda de
computador com `data-export.json`.

1. **Conter**: troque senhas, troque o `AUTH_SECRET` na Vercel, revogue acessos
   (roteiro em [SEGURANCA.md](SEGURANCA.md)).
2. **Avaliar**: quais dados, de quantas pessoas, por quanto tempo, risco/dano possível.
   O registro de atividade ajuda a reconstruir o que aconteceu.
3. **Comunicar** quando houver risco ou dano relevante: à **ANPD** e aos
   **titulares afetados**, em prazo razoável (a regulamentação da ANPD fixa em
   regra **3 dias úteis** a partir do conhecimento). Conteúdo mínimo: descrição
   do incidente e dos dados, titulares afetados, medidas tomadas, riscos, contato
   do encarregado.
4. **Documentar** tudo (linha do tempo, decisões, medidas corretivas).

## 6. Transferência internacional

Vercel e Neon podem processar dados fora do Brasil. A transferência é
admitida com garantias contratuais (art. 33). **Ação do dono**: aceitar/guardar
os termos de tratamento de dados (DPA) desses fornecedores, disponíveis nas
páginas legais da Vercel e da Neon, e preferir regiões próximas ao Brasil quando
houver opção.

## 7. Pendências para a imobiliária (não dependem de código)

- [ ] Indicar o **encarregado** e preencher e-mail e nome em *Configurações*
      (aparecem em `/privacidade`).
- [ ] **Revisão jurídica** de `/privacidade` e dos modelos de contrato.
- [ ] Avaliar incluir nos contratos uma **cláusula de proteção de dados**
      (ciência do tratamento pela LOCADORA para as finalidades do contrato) —
      hoje o texto gerado não tem essa cláusula; mudar o contrato é decisão
      jurídica.
- [ ] Definir o **prazo de guarda** adotado e uma rotina anual para eliminar
      o que venceu (seção 4).
- [ ] **Treinar** quem acessa o painel: não compartilhar senha, não enviar
      contratos por canais inseguros, bloquear a tela, usar o autenticador.
- [ ] Manter **fora do computador/pasta de trabalho** PDFs de contratos
      antigos e exportações do banco que não são mais necessários.
- [ ] Deixar o repositório do GitHub **privado** e ligar a verificação em duas
      etapas nas contas (GitHub, Vercel, Neon, registro.br).
