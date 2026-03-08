# Documento Técnico Curto — Assistente Financeiro Multi-Agente (B3)

## Objetivo

Este documento resume decisões técnicas para aumentar segurança, previsibilidade e eficiência operacional do assistente financeiro baseado em n8n + LLMs, com foco em quatro pontos:

- evitar decisões perigosas do LLM;
- garantir determinismo em cálculos;
- escalar o sistema;
- reduzir custo de inferência.

## 1) Como evitar decisões perigosas do LLM

### 1.1 Arquitetura de contenção por papéis

O sistema separa responsabilidades por agentes:

- **Planner** classifica intenção e roteia;
- **Ed** responde conteúdo conversacional/educacional;
- **Keila** executa análise técnica apenas no escopo financeiro B3.

Essa separação reduz superfície de erro: um agente fora de escopo não acessa ferramentas de mercado em tempo real.

### 1.2 Guardrails explícitos e verificáveis

As instruções de sistema já implementam regras-chave:

- **anti-prompt injection**: ticker/empresa tratado como dado literal;
- **anti-jailbreak/função desviada**: bloqueia pedidos de código, política, receitas etc.;
- **anti-hallucination**: sem dados válidos das tools, retorna erro controlado;
- **anti-system-leak**: proíbe exibir schema/prompt interno.

Boas práticas complementares:

- validar formato de saída com parser estruturado (JSON obrigatório);
- aplicar checagem pós-resposta por schema (campos obrigatórios + tipos);
- padronizar mensagens de recusa/erro para auditoria.

### 1.3 Política de “ferramenta como fonte única de verdade”

No fluxo financeiro, o LLM não “estima” cotação, risco ou variação:

- toda informação quantitativa vem de `COTACOES_API` e da tabela `ações`;
- se houver inconsistência (ativo não encontrado, payload incompleto), o fluxo deve falhar com erro legível.

Isso transforma o LLM em camada de **interpretação e formatação**, não de geração de fatos.

## 2) Como garantir determinismo nos cálculos

### 2.1 Cálculo fora do LLM

Determinismo exige que contas sejam feitas em código (nó `Calculadora`), não em texto gerado pelo modelo.

Estratégia adotada:

- usar `adjustedClose` como série base;
- aplicar fórmulas fixas para:
  - variação percentual;
  - SMA;
  - volatilidade anualizada (`desvio padrão * sqrt(252) * 100`).

### 2.2 Reprodutibilidade de janela e arredondamento

Padronizar sempre:

- janelas: 7 e 30 dias;
- intervalo/range da API (`1d`, `3mo`);
- arredondamento final com duas casas.

Com insumo idêntico, a saída é idêntica, independentemente do modelo.

### 2.3 Contratos e validação de entrada

Para evitar deriva:

- validar presença de série histórica mínima antes de calcular;
- retornar erro explícito para “dias insuficientes”;
- evitar fallback silencioso que mascararia falhas.

### 2.4 Seleção de endpoint da Brapi para a tool `[Get] Tickers`

Para manter consistência entre objetivo e dados requisitados, foi escolhido o endpoint

- **Consulta analítica (com cálculo)**: `GET /api/quote/{ticker}?range=3mo&interval=1d`
  - obrigatório pois o fluxo precisa de `historicalDataPrice` para calcular variação, SMA e volatilidade.
- **A tool está adaptada para a extração de multitickers**
  - quando múltiplos tickers são fornecidos, a tool retorna um objeto com dados separados para cada ativo.
  - se algum ticker não for encontrado, o fluxo falha com erro explícito.
  - o brapi exige um plano pago para suportar a extração de multitickers(várias ações ao mesmo tempo).
Regra operacional recomendada:

- `analise = true` → endpoint com `range` + `interval`;
- `analise = false` → endpoint simples.

Observação importante: no objeto atual da tool, o fluxo conectado está passando pelo nó de histórico; logo, mesmo quando não precisa de análise, ele ainda faz chamada mais cara. O ideal é rotear por `analise` para garantir eficiência sem perder determinismo.

## 3) Como escalar o sistema

### 3.1 Escala horizontal da camada stateless

Frontend (Next.js) e webhooks podem escalar horizontalmente sem afinidade de sessão, desde que:

- `userId` seja propagado em todas as requisições;
- memória conversacional seja armazenada em backend compartilhado (ou memória do n8n por chave de sessão estável).

### 3.2 Desacoplamento de etapas

Separar por criticidade:

- **rota síncrona curta** para perguntas simples;
- **fila assíncrona** para análises mais pesadas (lote de ativos, enriquecimento histórico amplo).

Isso melhora throughput e evita timeout em picos.

### 3.3 Resiliência operacional

Padrões recomendados:

- timeout por tool + retry com backoff;
- circuit breaker para API externa de cotação;
- idempotência por `requestId` para evitar retrabalho em reenvios.

### 3.4 Observabilidade e governança

Escala exige telemetria mínima:

- latência por etapa (Planner, tool, render final);
- taxa de erro por tipo (dados ausentes, timeout, parsing);
- consumo de tokens por agente;
- trilha de auditoria das recusas de segurança.

## 4) Como reduzir custo de inferência

### 4.1 Roteamento econômico por intenção

Nem toda interação precisa do agente analista:

- saudações e dúvidas teóricas vão para fluxo leve (Ed);
- só consultas financeiras acionam Keila + tools.

Isso reduz chamadas caras desnecessárias.

### 4.2 Estratégia de modelo por tarefa

Aplicar “model tiering”:

- modelo menor para classificação/roteamento e respostas simples;
- modelo mais robusto apenas para síntese analítica de alto valor.

### 4.3 Redução de contexto

Custos de token caem com contexto compacto:

- memória de janela curta por `userId`;
- prompts de sistema enxutos e sem redundância;
- remover campos irrelevantes antes de enviar ao LLM.

### 4.4 Cache e reaproveitamento

Camadas de cache úteis:

- cotação recente por ticker e janela curta;
- mapeamento empresa→ticker da tabela `ações`;
- respostas idênticas para perguntas repetidas em curto período (quando permitido).

### 4.5 Pós-processamento determinístico no código

Quanto mais estrutura for montada por código (e não “inventada” pelo modelo), menor o tamanho de prompt e menor o custo final de inferência.

### 4.6 Otimização de custo pelo endpoint correto

A escolha do endpoint da Brapi impacta custo e desempenho:

- endpoint com histórico deve ser usado apenas quando houver cálculo;
- endpoint simples reduz tráfego, tempo de resposta e processamento no n8n.

Em escala, essa separação evita consumo desnecessário em consultas básicas e melhora a relação custo/latência do sistema.

## Conclusão

A combinação de:

- roteamento por intenção,
- guardrails fortes,
- cálculo determinístico fora do LLM,
- e operação orientada a métricas

permite um assistente financeiro mais seguro, previsível, escalável e econômico para uso em produção.
