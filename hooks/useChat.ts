import { useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import { Message, WebhookPayload, WebhookResponse } from '../types';

const WEBHOOK_URL = process.env.NEXT_PUBLIC_WEBHOOK_URL || 'https://n8n.maiainteligencia.cloud/webhook/capim';

const parseMaybeJson = (value: unknown): unknown => {
  if (typeof value !== 'string') {
    return value;
  }
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const normalizeWebhookResponse = (raw: unknown): WebhookResponse => {
  const parsedRaw = parseMaybeJson(raw);

  if (Array.isArray(parsedRaw) && parsedRaw.length > 0) {
    const firstItem = parsedRaw[0] as { text?: unknown; output?: unknown };
    const parsedText = parseMaybeJson(firstItem?.text);
    if (typeof parsedText === 'object' && parsedText !== null) {
      return parsedText as WebhookResponse;
    }
    const parsedOutput = parseMaybeJson(firstItem?.output);
    if (typeof parsedOutput === 'object' && parsedOutput !== null) {
      return parsedOutput as WebhookResponse;
    }
    if (parsedRaw.every((item) => typeof item === 'object' && item !== null)) {
      return {
        status: 'success',
        message: 'Análise de múltiplos ativos concluída.',
        data: parsedRaw as Record<string, unknown>[],
      };
    }
  }

  if (typeof parsedRaw === 'object' && parsedRaw !== null) {
    const candidate = parsedRaw as { text?: unknown; output?: unknown };
    const parsedText = parseMaybeJson(candidate.text);
    if (typeof parsedText === 'object' && parsedText !== null) {
      return parsedText as WebhookResponse;
    }
    const parsedOutput = parseMaybeJson(candidate.output);
    if (typeof parsedOutput === 'object' && parsedOutput !== null) {
      return parsedOutput as WebhookResponse;
    }
    return parsedRaw as WebhookResponse;
  }

  return {
    status: 'success',
    message: String(parsedRaw ?? ''),
    data: null,
  };
};

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string>('');
  const userIdRef = useRef<string>('');

  const assignUserId = useCallback((nextUserId: string) => {
    userIdRef.current = nextUserId;
    setUserId(nextUserId);
    localStorage.setItem('chat_user_id', nextUserId);
  }, []);

  useEffect(() => {
    const storedUserId = localStorage.getItem('chat_user_id');
    if (storedUserId) {
      assignUserId(storedUserId);
    } else {
      const newUserId = crypto.randomUUID();
      assignUserId(newUserId);
    }
  }, [assignUserId]);

  const resetConversation = useCallback(() => {
    const newUserId = crypto.randomUUID();
    assignUserId(newUserId);
    setMessages([]);
    setError(null);
    setIsLoading(false);
  }, [assignUserId]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;

    const newMessage: Message = {
      id: crypto.randomUUID(),
      content,
      sender: 'user',
      timestamp: new Date().toISOString(),
      status: 'sending',
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const timestamp = new Date().toISOString();
      const activeUserId = userIdRef.current || userId || crypto.randomUUID();
      if (!userIdRef.current || !userId) {
        assignUserId(activeUserId);
      }
      const payload: WebhookPayload = {
        message: content,
        content,
        timestamp,
        userId: activeUserId,
        metadata: {
          userAgent: navigator.userAgent,
          source: 'capim-chat-ui',
        },
      };

      const response = await axios.post(WEBHOOK_URL, payload);
      const responseData = normalizeWebhookResponse(response.data);
      
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        )
      );

      const normalizedText = responseData.message || 'Resposta recebida com sucesso.';
      const normalizedData =
        responseData.data &&
        (Array.isArray(responseData.data) || typeof responseData.data === 'object')
          ? responseData.data
          : null;

      const botMessage: Message = {
        id: crypto.randomUUID(),
        content: normalizedText,
        sender: 'assistant',
        timestamp: new Date().toISOString(),
        status: 'sent',
        data: normalizedData,
        meta: {
          llmLogs: responseData.meta?.llm_logs || [],
        },
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === newMessage.id ? { ...msg, status: 'error' } : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [assignUserId, userId]);

  return {
    messages,
    sendMessage,
    resetConversation,
    isLoading,
    error,
    userId,
  };
};
