# Celeiro Literário — API Proxy (Vercel)

Proxy serverless que protege a chave Anthropic e serve os Silos Multimídia.

## Estrutura

```
celeiro-literario-api/
├── api/
│   └── claude.js   ← função serverless
└── package.json
```

## Deploy (5 minutos)

### 1. Criar repositório no GitHub
- Acesse github.com e crie um repositório novo: `celeiro-literario-api`
- Pode ser privado (recomendado)
- Faça upload dos dois arquivos: `api/claude.js` e `package.json`

### 2. Conectar ao Vercel
- Acesse vercel.com e entre com sua conta GitHub
- Clique em **Add New → Project**
- Selecione o repositório `celeiro-literario-api`
- Clique em **Deploy** (sem alterar nada)

### 3. Adicionar a chave Anthropic
- No painel do projeto no Vercel, vá em **Settings → Environment Variables**
- Clique em **Add**
- Nome: `ANTHROPIC_API_KEY`
- Valor: sua chave `sk-ant-...` (de console.anthropic.com)
- Clique em **Save**
- Vá em **Deployments → Redeploy** para aplicar

### 4. Anotar a URL
Após o deploy, sua API estará em:
```
https://celeiro-literario-api.vercel.app/api/claude
```
(O nome pode variar — copie a URL exata do painel do Vercel)

### 5. Atualizar o HTML dos Silos
No arquivo `silo_multimidia_integrado.html`, a URL já está configurada
para usar esta API. Apenas substitua a constante ENGINE_URL se a sua
URL for diferente.

## Segurança
- A chave Anthropic **nunca aparece no código**
- Fica somente nas variáveis de ambiente do Vercel (criptografadas)
- O CORS está configurado para aceitar apenas `sitedasletras.github.io`
- Plano gratuito do Vercel: 100 GB de banda e 100.000 invocações/mês
