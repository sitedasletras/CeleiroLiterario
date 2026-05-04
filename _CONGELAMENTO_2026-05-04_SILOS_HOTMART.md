# Congelamento funcional — Silos Multimídia e Hotmart

Data: 2026-05-04

Este documento registra o marco funcional atual do Celeiro Literário para evitar perda, retrabalho ou alterações indevidas no que já está funcionando.

## Regra de congelamento

Os itens abaixo estão considerados prontos em nível funcional inicial. Não devem ser reestruturados sem necessidade. Alterações futuras devem ser evolutivas, não destrutivas.

---

## 1. Plataforma no ar

Status: CONGELADO COMO FUNCIONAL.

- Projeto `CeleiroLiterario` publicado na Vercel.
- Link principal confirmado: `https://celeiro-literario.vercel.app`
- GitHub Pages continua como vitrine/porta estática quando necessário.
- Vercel passa a ser a ponte capaz de rodar APIs/serverless.

Regra: manter GitHub Pages como vitrine e Vercel como ambiente com backend.

---

## 2. Expedição Multimídia

Status: CONGELADA COMO BASE FUNCIONAL.

Arquivo principal:

- `expedicao_multimidia.html`

Funções já implantadas:

- leitura de material vindo dos Silos por localStorage;
- campo de confirmação/código de liberação;
- bloqueio sem pagamento local/código;
- liberação visual de material;
- histórico de sessão;
- saída para Download interno, YouTube, Instagram, TikTok, Web Rádio/Web TV quando aplicável;
- botão de retorno aos Silos;
- botão CICILE;
- botão sair.

Regra: a Expedição Multimídia é separada da Expedição Editorial/Lapidar.

---

## 3. Silo Multimídia / Ativação local

Status: CONGELADO COMO FUNCIONAL DE EMERGÊNCIA.

Arquivo:

- `silo_multimidia.html`

Funções:

- tela simples de ativação de pagamento local;
- códigos temporários `CELEIRO-10`, `CELEIRO-20`, `CELEIRO-30`, `CELEIRO-60`;
- armazenamento de `pagamento=true` e `tempo` no localStorage;
- usado como reserva administrativa enquanto a Hotmart real estiver em validação.

Regra: código manual é reserva; regra definitiva será Hotmart confirmada libera, Hotmart não confirmou bloqueia.

---

## 4. Silo Music

Status: CONGELADO COMO FUNCIONAL INICIAL.

Arquivo:

- `silo_music.html`

Funções:

- avatar textual: William Chapen — Maestro do Silo;
- upload universal via `js/celeiro_upload_universal.js`;
- material compartilhado por localStorage;
- seleção de tipo de produção;
- seleção de clima;
- envio para Expedição Multimídia;
- botões de retorno, CICILE e sair.

Regra: não desmontar este fluxo; usar como modelo para outros Silos.

---

## 5. Upload Universal dos Silos

Status: CONGELADO COMO FUNCIONAL.

Arquivo:

- `js/celeiro_upload_universal.js`

Funções:

- salva material atual dos Silos no localStorage;
- exibe nome, tipo, tamanho e origem;
- permite limpar material;
- deve ser reaproveitado nos outros Silos.

Regra: este arquivo é motor compartilhado. Alterações devem preservar compatibilidade com páginas já funcionando.

---

## 6. Backend Hotmart inicial

Status: CONGELADO COMO BASE TÉCNICA INICIAL.

Arquivos:

- `package.json`
- `api/hotmart.js`
- `api/verificar.js`

Funções atuais:

- estrutura serverless na Vercel;
- receptor inicial de webhook Hotmart;
- verificador inicial de pagamento por e-mail;
- uso previsto com Vercel KV.

Regra: ainda não é backend comercial final. Deve ser evoluído para modelo unificado Celeiro/Lapidar/SIGMAL/Caminho, mas a existência da pasta `api/` e do deploy Vercel fica congelada como decisão arquitetural correta.

---

## 7. Mapa de Produtos Hotmart

Status: CONGELADO COMO MAPA COMERCIAL INICIAL.

Arquivo:

- `HOTMART_PRODUTOS_CELEIRO.md`

Conteúdo registrado:

- Silos por tempo;
- Silo HQ por projeto;
- diagramação e capa por planos/saldo;
- serviços unitários do Lapidar;
- Caminho das Pedras com modelo completo e semestral;
- SIGMAL Brasil/Internacional;
- bônus Trajano Estrada de 1 mês;
- Mentoria Cibernética;
- tipos de acesso do backend.

Regra: este mapa será a base para configurar produtos na Hotmart e para atualizar o backend comercial.

---

## 8. Decisões arquiteturais congeladas

1. Silos ficam fora do Lapidar.
2. Expedição Multimídia é separada da Expedição Editorial/Lapidar.
3. Pagamento centralizado deve atender Celeiro, Lapidar, Caminho das Pedras, SIGMAL e Mentoria.
4. GitHub Pages é vitrine/interface estática; Vercel é servidor leve/API.
5. Hotmart confirmada libera; ausência de confirmação bloqueia.
6. Código manual é apenas reserva administrativa.
7. Diagramação e capa usam planos com saldo.
8. Capa conta como par: física + ePUB.
9. Silos usam tempo ou projeto.
10. Serviços do Lapidar, exceto diagramação/capa, são unitários.
11. Caminho das Pedras semestral libera 2 módulos por pagamento, até 8 módulos em 4 pagamentos.
12. SIGMAL é pagamento único: 300 BRL no Brasil, 300 USD exterior, com 1 mês grátis no módulo Trajano Estrada.

---

## 9. Itens NÃO congelados / pendentes

Não estão prontos e não devem ser tratados como finalizados:

- validação completa da Hotmart;
- webhook testado com compra real;
- Vercel KV plenamente configurado/testado;
- backend comercial definitivo com todos os produtos;
- padronização completa dos Silos Sonoro, Cinematográfico e HQ com upload universal e trava de pagamento;
- consumo real de tempo/saldo;
- avatares finais dos Silos Sonoro, Music, Cinematográfico e HQ;
- Expedição Editorial/Lapidar;
- integração do Lapidar com o backend comercial;
- criação real dos produtos na Hotmart.

---

## Próxima etapa recomendada

Escolher uma única linha de evolução por vez:

1. Padronizar todos os Silos com upload universal e pagamento local.
2. Depois testar Hotmart real com um produto simples.
3. Só depois expandir para Lapidar, Caminho das Pedras e SIGMAL.
