# Capim Chat UI — Frontend

Frontend web do **Assistente Financeiro Multi-Agente (B3)**, construído com Next.js.  
A aplicação oferece:

- chat com integração a webhook n8n;
- renderização de payload financeiro estruturado;
- alternância de tema claro/escuro;
- painel de documentação técnica com diagrama Mermaid;
- download dos workflows n8n diretamente pela interface.

## Sumário

- [Visão Geral](#visão-geral)
- [Stack](#stack)
- [Arquitetura do Frontend](#arquitetura-do-frontend)
- [Fluxo de Dados](#fluxo-de-dados)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Configuração de Ambiente](#configuração-de-ambiente)
- [Execução Local](#execução-local)
- [Scripts Disponíveis](#scripts-disponíveis)
- [Contrato de Integração com Webhook](#contrato-de-integração-com-webhook)
- [Endpoint Interno de Downloads (n8n)](#endpoint-interno-de-downloads-n8n)
- [Qualidade e Testes](#qualidade-e-testes)
- [Troubleshooting](#troubleshooting)

## Visão Geral

O app tem duas abas principais:

- **Chat**: envio de mensagem ao backend n8n e exibição da resposta (texto + dados estruturados).
- **Documentação**: arquitetura do sistema multi-agente, regras de segurança, detalhes da tool de ações e downloads de workflows.

O frontend mantém um `userId` persistido em `localStorage` para continuidade de sessão e isolamento de contexto no backend.

## Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 + TypeScript (strict)
- **Estilo**: Tailwind CSS v4
- **HTTP client**: Axios
- **Tema**: next-themes
- **Diagramas**: Mermaid JS
- **Lint**: ESLint (config Next)
- **Testes**: Jest + Testing Library (infra configurada)

## Arquitetura do Frontend

### Entradas principais

- `app/page.tsx`: entrada do app no cliente.
- `components/ChatInterface.tsx`: shell principal, alterna entre abas `chat` e `docs`.

### Camada de estado e integração

- `hooks/useChat.ts`:
  - gera/persiste `userId`;
  - envia mensagens para o webhook;
  - normaliza diferentes formatos de resposta do n8n;
  - controla loading, erro e status de envio por mensagem.

### Camada de apresentação

- `components/Header.tsx`: cabeçalho com estado da conexão, troca de abas e reset.
- `components/MessageList.tsx`: lista de mensagens com auto-scroll.
- `components/MessageBubble.tsx`: renderização de texto, indicadores financeiros e logs.
- `components/MessageInput.tsx`: input com validação e bloqueio durante loading.
- `components/DocumentationPanel.tsx`: documentação técnica visual.
- `components/MermaidDiagram.tsx`: compilação/renderização Mermaid no client.

### Tema e layout global

- `app/layout.tsx`: fonte, metadados e provider de tema.
- `components/ThemeProvider.tsx` e `components/ModeToggle.tsx`: tema claro/escuro.

## Fluxo de Dados

1. Usuário digita no `MessageInput`.
2. `useChat.sendMessage` cria mensagem local com status `sending`.
3. Frontend envia `POST` para `NEXT_PUBLIC_WEBHOOK_URL`.
4. Resposta é normalizada (objeto, array ou JSON em string).
5. Mensagem do usuário vira `sent`; mensagem da assistente é adicionada.
6. `MessageBubble` renderiza conteúdo textual e card técnico quando `data` existe.

## Estrutura de Pastas

```text
capim-chat/
├─ app/
│  ├─ api/download/[workflow]/route.ts
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
├─ components/
│  ├─ ChatInterface.tsx
│  ├─ DocumentationPanel.tsx
│  ├─ Header.tsx
│  ├─ MermaidDiagram.tsx
│  ├─ MessageBubble.tsx
│  ├─ MessageInput.tsx
│  ├─ MessageList.tsx
│  ├─ ModeToggle.tsx
│  └─ ThemeProvider.tsx
├─ hooks/
│  └─ useChat.ts
├─ types/
│  └─ index.ts
├─ __tests__/
│  └─ MessageInput.test.tsx
├─ Chat.json
└─ [Get] Tickers.json
```

## Configuração de Ambiente

Crie `.env.local` com base em `.env.local.example`.

```bash
cp .env.local.example .env.local
```

Variáveis:

```bash
NEXT_PUBLIC_WEBHOOK_URL=https://n8n.maiainteligencia.cloud/webhook/capim
```

Se não for definida, o frontend usa esse mesmo valor como fallback.

## Execução Local

```bash
npm install
npm run dev
```

Acesse:

```text
http://localhost:3000
```

## Scripts Disponíveis

```bash
npm run dev     # ambiente de desenvolvimento
npm run build   # build de produção
npm run start   # sobe a aplicação em modo produção
npm run lint    # análise estática com ESLint
```

## Contrato de Integração com Webhook

Payload enviado pelo frontend:

```json
{
  "message": "texto digitado",
  "content": "texto digitado",
  "timestamp": "ISO-8601",
  "userId": "uuid",
  "metadata": {
    "userAgent": "browser ua",
    "source": "capim-chat-ui"
  }
}
```

Campos esperados na resposta (flexível):

```json
{
  "status": "success",
  "message": "texto da resposta",
  "data": {},
  "LOGOMARCA": "url-opcional",
  "meta": {
    "llm_logs": []
  }
}
```

Observações:

- `data` pode vir como objeto, array ou `null`.
- o frontend tenta normalizar respostas em formatos alternativos (`text`, `output`, JSON serializado).
- em caso de erro no request, a mensagem do usuário passa para status `error`.

## Endpoint Interno de Downloads (n8n)

O app expõe downloads de workflows n8n via API interna:

- `GET /api/download/get-tickers` → baixa `[Get] Tickers.json`
- `GET /api/download/chat` → baixa `Chat.json`

Esse endpoint é usado na aba **Documentação** para facilitar importação no n8n.

## Qualidade e Testes

### Lint

```bash
npm run lint
```

### Testes

Existe configuração de Jest + Testing Library e teste de exemplo em `__tests__/MessageInput.test.tsx`.

Para executar manualmente:

```bash
npx jest
```
