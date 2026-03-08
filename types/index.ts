export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  status: 'sending' | 'sent' | 'error';
  data?: Record<string, unknown> | Record<string, unknown>[] | null;
  meta?: {
    llmLogs?: string[];
  };
}

export interface WebhookPayload {
  message: string;
  content: string;
  timestamp: string;
  userId: string;
  metadata?: Record<string, unknown>;
}

export interface WebhookResponse {
  status?: string;
  message?: string;
  data?: Record<string, unknown> | Record<string, unknown>[] | null;
  logomarca?: string;
  LOGOMARCA?: string;
  meta?: {
    llm_logs?: string[];
  };
}
