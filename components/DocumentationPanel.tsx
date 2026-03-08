import React from 'react';

const mermaidDiagram = `graph TD
     %% Nós de Entrada e Saída
     Start((Webhook)) --> PlannerAgent(Agente: Planner)
     
     %% Agente Roteador
     subgraph Roteamento
         PlannerAgent --> SwitchNode{Switch}
     end
 
     %% Agente Ed
     subgraph "Ed (Educador Financeiro)"
         EdAgent(Agente: Ed)
         EdLLM((LLM: 5.1)) -.-> EdAgent
         EdMem[(Memory)] -.-> EdAgent
     end
 
     %% Agente Keila
     subgraph "Keila (Analista Sênior)"
         KeilaAgent(Agente: Keila)
         KeilaLLM((LLM: 5.2)) -.-> KeilaAgent
         KeilaMem[(Memory1)] -.-> KeilaAgent
         ToolAcoes[[Tool: ações]] -.-> KeilaAgent
         ToolAPI[[Tool: COTACOES_API]] -.-> KeilaAgent
     end
     
     %% Nós de Resposta
     RespEd(Respond to Webhook)
     RespKeila(Respond to Webhook1)
 
     %% Conexões Condicionais do Switch
     SwitchNode -->|CONVERSATIONAL| EdAgent
     SwitchNode -->|OUT_OF_SCOPE| EdAgent
     
     SwitchNode -->|FINANCIAL_READY| KeilaAgent
     SwitchNode -->|FINANCIAL_MISSING_TICKER| KeilaAgent
 
     %% Saídas
     EdAgent --> RespEd
     KeilaAgent --> RespKeila
 
     %% Estilização
     classDef webhook fill:#f9d0c4,stroke:#333,stroke-width:2px;
     classDef agent fill:#dae8fc,stroke:#6c8ebf,stroke-width:2px;
     classDef tool fill:#d5e8d4,stroke:#82b366,stroke-width:1px;
     
     class Start,RespEd,RespKeila webhook;
     class PlannerAgent,EdAgent,KeilaAgent agent;
     class ToolAcoes,ToolAPI tool;`;

const DocumentationPanel: React.FC = () => {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-5">
      <div className="rounded-2xl border border-white/60 dark:border-gray-700/90 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg p-4 md:p-5">
        <h2 className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100">1. Diagrama de Roteamento de Agentes</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-3">Mermaid</p>
        <pre className="text-[11px] md:text-xs leading-relaxed whitespace-pre-wrap break-words text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-gray-900/60 border border-gray-200/70 dark:border-gray-700/80 rounded-xl p-3 overflow-x-auto">
          {mermaidDiagram}
        </pre>
      </div>
    </div>
  );
};

export default DocumentationPanel;
