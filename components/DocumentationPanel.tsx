import React from 'react';
import MermaidDiagram from './MermaidDiagram';

const mermaidDiagram = `graph TD
    Webhook[Webhook de Entrada /capim] --> Planner(Planner Agent)
    Planner -->|Analisa e classifica intenção| Switch{Roteador Lógico}

    Switch -->|CONVERSATIONAL / OUT_OF_SCOPE| Ed[Agente: Ed]
    Switch -->|FINANCIAL_READY / FINANCIAL_MISSING_TICKER| Keila[Agente: Keila]

    Ed --> RespEd[Respond to Webhook]
    Keila --> RespKeila[Respond to Webhook]

    Keila -.->|Se o ticker estiver ausente| ToolAcoes[(Tool: Data Table 'ações')]
    ToolAcoes -.-> Keila
    Keila -.->|Consulta múltiplos ativos| ToolAPI[[Tool: Get Tickers]]
    ToolAPI -.->|Split + Loop + Aggregate| Keila

    subgraph Contexto e Memória
        Memoria[(Buffer Window Memory)]
        Memoria -.->|Chave de Sessão: userId| Planner
        Memoria -.->|Chave de Sessão: userId| Ed
        Memoria -.->|Chave de Sessão: userId| Keila
    end`;

const flowSteps = [
  {
    title: '1. Entrada de Dados (Webhook /capim)',
    text: 'Recebe requisição POST com message, metadados e userId. O userId é a chave de sessão no BufferWindowMemory para isolar o contexto por utilizador.'
  },
  {
    title: '2. Classificação de Intenção (Planner Agent)',
    text: 'O Planner (OpenAI gpt-5.1) classifica a intenção e usa Structured Output Parser para garantir saída estrita em JSON.'
  },
  {
    title: '3. Roteamento Lógico (Switch)',
    text: 'CONVERSATIONAL e OUT_OF_SCOPE vão para Ed. FINANCIAL_READY e FINANCIAL_MISSING_TICKER vão para Keila.'
  },
  {
    title: '4. Resposta ao Frontend',
    text: 'O fluxo converge em Respond to Webhook e devolve JSON pronto para renderização no capim-chat-ui.'
  }
] as const;

const plannerTypes = [
  'FINANCIAL_READY: intenção financeira com ativo identificado (ticker/empresa).',
  'FINANCIAL_MISSING_TICKER: intenção financeira sem ativo claro.',
  'OUT_OF_SCOPE: assuntos fora do universo da B3.',
  'CONVERSATIONAL: saudações, agradecimentos e dúvidas teóricas.'
] as const;

const edRules = [
  'Tom didático, amigável e sem economês.',
  'Explica conceitos como P/L e Dividend Yield.',
  'Recusa tópicos fora de escopo de forma educada.',
  'Não acessa dados em tempo real e nunca recomenda compra/venda.',
  'Retorna a chave data como null.'
] as const;

const keilaRules = [
  'Análise técnica, objetiva e baseada em dados reais.',
  'Aceita entrada direta por ticker (ex.: PETR4) ou por nome da empresa (ex.: Petrobras).',
  'Usa a tabela de ações da B3 para busca semântica e de/para entre nome e ticker.',
  'Com o ticker resolvido, chama a tool Get Tickers para coletar dados e calcular métricas.',
  'Usa a COTACOES_API para cotação, histórico e fundamentos.',
  'Entrega analise_textual e payload estruturado para o card do frontend.'
] as const;

const securityRules = [
  'Anti-Prompt Injection: empresa/ticker é tratado como dado literal.',
  'Anti-Function Deviation: bloqueia tentativas de desvio de escopo.',
  'Prevenção de Hallucination: proíbe inventar dados sem retorno das tools.',
  'Anti-System Leak: proíbe revelar prompts, schema ou regras internas.'
] as const;

const acoesToolInputs = [
  'tickers (string): aceita ticker(s) (PETR4,AURE3) ou nome(s) de empresa (Petrobras, Vale).',
  'analise (boolean): controla modo de execução para consumo do fluxo.',
  'nome (string): suporte explícito de nome corporativo para busca na tabela ações.'
] as const;

const acoesToolFlow = [
  'input (Execute Workflow Trigger): recebe parâmetros da Keila.',
  'Tool ações (Data Table B3): resolve semanticamente nome da empresa em ticker quando necessário.',
  'Split (Code): separa a string CSV em itens individuais de ticker.',
  'loop (Split In Batches): processa ticker por ticker.',
  'get data1 (HTTP Request): consulta /api/quote/{ticker}?range=3mo&interval=1d.',
  'Calculadora (Code): calcula variação, média móvel e volatilidade anualizada por ativo.',
  'Wait: aplica pausa entre iterações para reduzir risco de rate limit.',
  'Aggregate: consolida todas as análises em um único payload de saída.'
] as const;

const acoesToolMetrics = [
  'Fonte de preço: adjustedClose para reduzir distorções por dividendos.',
  'Curto prazo (7 dias): variação percentual, SMA e volatilidade anualizada.',
  'Médio prazo (30 dias): variação percentual, SMA e volatilidade anualizada.',
  'Volatilidade: desvio padrão dos retornos diários anualizado por √252.'
] as const;

const acoesToolOutput = [
  'Array agregado com um item por ativo.',
  'Cada item contém: ativo, empresa, preco_atual, analise_curto_prazo, analise_medio_prazo e logomarca.'
] as const;

const acoesToolNotes = [
  'A entrada tickers usa o campo ticker singular após o Split para cada chamada HTTP.',
  'No estado atual, o fluxo usa endpoint analítico em todas as consultas do loop.',
  'Retornar erro controlado quando não houver dados suficientes.',
  'Remover tokens hardcoded e usar variável de ambiente no n8n.',
  'Manter fallback para resposta vazia da API sem inventar dados.'
] as const;

const n8nDownloads = [
  {
    label: '[Get] Tickers.json',
    href: '/api/download/get-tickers'
  },
  {
    label: 'Chat.json',
    href: '/api/download/chat'
  }
] as const;

const sectionCardClass =
  'rounded-2xl border border-gray-200/80 dark:border-gray-700/80 bg-white/85 dark:bg-gray-900/60 shadow-sm p-4 md:p-5';
const sectionTitleClass = 'text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100';
const listClass = 'mt-2 list-disc pl-4 space-y-1 text-xs md:text-sm text-gray-700 dark:text-gray-200';

const DocumentationPanel: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 bg-gradient-to-b from-emerald-50/40 via-transparent to-transparent dark:from-emerald-950/15 dark:via-transparent dark:to-transparent">
      <div className="max-w-5xl mx-auto space-y-4">
        <section className="rounded-3xl border border-emerald-200/70 dark:border-emerald-800/70 bg-white/90 dark:bg-gray-900/75 shadow-lg p-5 md:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200 px-2.5 py-1 text-[11px] md:text-xs font-semibold">
              B3
            </span>
            <span className="inline-flex items-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200 px-2.5 py-1 text-[11px] md:text-xs font-semibold">
              Multi-Agente
            </span>
            <span className="inline-flex items-center rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/50 dark:text-violet-200 px-2.5 py-1 text-[11px] md:text-xs font-semibold">
              n8n
            </span>
          </div>
          <h2 className="mt-3 text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">
            Arquitetura do Assistente Financeiro Multi-Agente
          </h2>
          <p className="mt-1 text-xs md:text-sm text-gray-600 dark:text-gray-300">
            Diagrama compilado com Mermaid JS e documentação técnica para operação no frontend e no n8n.
          </p>
          <MermaidDiagram
            chart={mermaidDiagram}
            className="mt-4 text-[11px] md:text-xs leading-relaxed whitespace-pre-wrap break-words text-gray-700 dark:text-gray-200 bg-white/80 dark:bg-gray-950/70 border border-gray-200/80 dark:border-gray-700/80 rounded-2xl p-4 overflow-x-auto [&_svg]:w-full [&_svg]:h-auto"
          />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className={sectionCardClass}>
            <h3 className={sectionTitleClass}>Fluxo de Execução</h3>
            <ul className="mt-2 space-y-2 text-xs md:text-sm text-gray-700 dark:text-gray-200">
              {flowSteps.map((item) => (
                <li key={item.title}>
                  <span className="font-semibold">{item.title}</span> {item.text}
                </li>
              ))}
            </ul>
          </div>

          <div className={sectionCardClass}>
            <h3 className={sectionTitleClass}>Classificações do Planner (type)</h3>
            <ul className={listClass}>
              {plannerTypes.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className={sectionCardClass}>
            <h3 className={sectionTitleClass}>Agente Ed (Educador)</h3>
            <ul className={listClass}>
              {edRules.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className={sectionCardClass}>
            <h3 className={sectionTitleClass}>Agente Keila (Analista)</h3>
            <ul className={listClass}>
              {keilaRules.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className={sectionCardClass}>
          <h3 className={sectionTitleClass}>Políticas de Segurança</h3>
          <ul className={listClass}>
            {securityRules.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className={sectionCardClass}>
          <h3 className={sectionTitleClass}>Tool de Ações ([Get] Tickers)</h3>

          <h4 className="mt-3 text-xs md:text-sm font-semibold text-gray-900 dark:text-gray-100">Entradas</h4>
          <ul className={listClass}>
            {acoesToolInputs.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h4 className="mt-4 text-xs md:text-sm font-semibold text-gray-900 dark:text-gray-100">Fluxo interno</h4>
          <ul className={listClass}>
            {acoesToolFlow.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h4 className="mt-4 text-xs md:text-sm font-semibold text-gray-900 dark:text-gray-100">Métricas calculadas</h4>
          <ul className={listClass}>
            {acoesToolMetrics.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h4 className="mt-4 text-xs md:text-sm font-semibold text-gray-900 dark:text-gray-100">Saída JSON</h4>
          <ul className={listClass}>
            {acoesToolOutput.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h4 className="mt-4 text-xs md:text-sm font-semibold text-gray-900 dark:text-gray-100">Boas práticas</h4>
          <ul className={listClass}>
            {acoesToolNotes.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className={sectionCardClass}>
          <h3 className={sectionTitleClass}>Seção n8n</h3>
          <p className="mt-2 text-xs md:text-sm text-gray-700 dark:text-gray-200">
            Baixe os workflows para importar diretamente no n8n.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {n8nDownloads.map((file) => (
              <a
                key={file.label}
                href={file.href}
                className="inline-flex items-center rounded-xl border border-emerald-300/80 dark:border-emerald-700/80 bg-emerald-50/80 dark:bg-emerald-900/30 px-3 py-1.5 text-xs md:text-sm font-medium text-emerald-800 dark:text-emerald-100 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
              >
                Download {file.label}
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DocumentationPanel;
