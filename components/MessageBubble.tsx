import React from 'react';
import clsx from 'clsx';
import { format } from 'date-fns';
import Image from 'next/image';
import { Message } from '../types';
import Avatar from './Avatar';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const content = message.content || '';
  const rawData = message.data;
  const dataEntries = Array.isArray(rawData)
    ? rawData.filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    : rawData && typeof rawData === 'object'
      ? [rawData]
      : [];
  const hasData = dataEntries.length > 0;
  const llmLogs = message.meta?.llmLogs || [];
  const hasLlmLogs = llmLogs.length > 0;
  const parseEntry = (entry: Record<string, unknown>) => {
    const ativo = typeof entry.ativo === 'string' ? entry.ativo : '';
    const precoAtual = typeof entry.preco_atual === 'number' || typeof entry.preco_atual === 'string' ? String(entry.preco_atual) : '';
    const variacao7Dias = typeof entry.variacao_7_dias === 'number' || typeof entry.variacao_7_dias === 'string' ? String(entry.variacao_7_dias) : '';
    const indicadorTendencia = typeof entry.indicador_tendencia === 'string' ? entry.indicador_tendencia : '';
    const mediaMovel30Dias = typeof entry.media_movel_30_dias === 'number' || typeof entry.media_movel_30_dias === 'string' ? String(entry.media_movel_30_dias) : '';
    const statusMedia = typeof entry.status_media === 'string' ? entry.status_media : '';
    const nivelRisco = typeof entry.nivel_risco === 'string' ? entry.nivel_risco : '';
    const analiseTextual = typeof entry.analise_textual === 'string' ? entry.analise_textual : '';
    const disclaimer = typeof entry.disclaimer === 'string' ? entry.disclaimer : '';
    const logomarcaRaw = entry.LOGOMARCA ?? entry.logomarca;
    const logomarca = typeof logomarcaRaw === 'string' ? logomarcaRaw.trim() : '';
    const hasKnownFinancialFields = Boolean(
      ativo ||
        precoAtual ||
        variacao7Dias ||
        indicadorTendencia ||
        mediaMovel30Dias ||
        statusMedia ||
        nivelRisco ||
        analiseTextual ||
        disclaimer ||
        logomarca
    );
    return {
      ativo,
      precoAtual,
      variacao7Dias,
      indicadorTendencia,
      mediaMovel30Dias,
      statusMedia,
      nivelRisco,
      analiseTextual,
      disclaimer,
      logomarca,
      hasKnownFinancialFields,
    };
  };
  const startsWithKeila = /^\s*keila\b/i.test(content);
  const startsWithEd = /^\s*ed\b/i.test(content);
  const mentionsKeila = /\bkeila\b/i.test(content);
  const mentionsEd = /\bed\b/i.test(content);
  const assistantProfile = startsWithEd || (!startsWithKeila && mentionsEd && !mentionsKeila)
    ? {
        fallback: 'ED',
        name: 'Ed',
        avatarClass: 'w-8 h-8 bg-yellow-400 text-gray-900 text-[11px]',
      }
    : startsWithKeila || mentionsKeila
      ? {
          fallback: 'KE',
          name: 'Keila',
          avatarClass: 'w-8 h-8 bg-green-500 text-white text-[11px]',
        }
      : {
          fallback: 'AI',
          name: 'Assistant',
          avatarClass: 'w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-[11px]',
        };

  return (
    <div
      className={clsx(
        "flex w-full mt-4 space-x-3 max-w-3xl mx-auto",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar
          fallback={assistantProfile.fallback}
          wrapperClassName="mt-1"
          className={assistantProfile.avatarClass}
        />
      )}
      
      <div
        className={clsx(
          "relative px-4 py-3 rounded-2xl shadow-lg text-sm break-words max-w-[88%] md:max-w-[72%] transition-colors duration-200 backdrop-blur-lg",
          isUser
            ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none border border-blue-400/50"
            : "bg-white/80 dark:bg-gray-800/80 text-gray-800 dark:text-gray-100 rounded-tl-none border border-white/60 dark:border-gray-700/90"
        )}
      >
        <div className="mb-1 whitespace-pre-wrap leading-relaxed">
          {!isUser && (
            <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">
              {assistantProfile.name}
            </p>
          )}
          {message.content}
        </div>
        
        {hasData && (
          <div className="mt-3 text-xs border-t border-gray-200/50 dark:border-gray-700/50 pt-2 space-y-1.5 bg-white/50 dark:bg-gray-900/40 -mx-4 -mb-3 px-4 py-3 rounded-b-2xl">
            {dataEntries.map((entry, index) => {
              const {
                ativo,
                precoAtual,
                variacao7Dias,
                indicadorTendencia,
                mediaMovel30Dias,
                statusMedia,
                nivelRisco,
                analiseTextual,
                disclaimer,
                logomarca,
                hasKnownFinancialFields,
              } = parseEntry(entry);

              if (!hasKnownFinancialFields) {
                return (
                  <pre key={`${message.id}-data-${index}`} className="text-[10px] text-gray-600 dark:text-gray-300 whitespace-pre-wrap break-words">
                    {JSON.stringify(entry, null, 2)}
                  </pre>
                );
              }

              return (
                <div key={`${message.id}-card-${index}`} className="rounded-xl border border-gray-200/70 dark:border-gray-700/70 bg-white/80 dark:bg-gray-950/40 overflow-hidden">
                  <div className="px-3 py-2 bg-gradient-to-r from-indigo-500/10 to-sky-500/10 dark:from-indigo-400/10 dark:to-sky-400/10 border-b border-gray-200/70 dark:border-gray-700/70">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold tracking-wide text-gray-700 dark:text-gray-200 uppercase">
                        Resumo Técnico {dataEntries.length > 1 ? `#${index + 1}` : ''}
                      </p>
                      {logomarca && (
                        <div className="w-7 h-7 rounded-md overflow-hidden border border-gray-200/80 dark:border-gray-600/70 bg-white/90 dark:bg-gray-900/80">
                          <Image
                            src={logomarca}
                            alt={`Logo ${ativo || 'ativo'}`}
                            width={28}
                            height={28}
                            className="w-full h-full object-cover"
                            unoptimized
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="p-3 space-y-2.5">
                    {ativo && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400">Ativo</span>
                        <span className="font-semibold text-gray-800 dark:text-gray-100">{ativo}</span>
                      </div>
                    )}
                    {precoAtual && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400">Preço Atual</span>
                        <span className="font-semibold text-gray-900 dark:text-gray-100">R$ {precoAtual}</span>
                      </div>
                    )}
                    {variacao7Dias && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400">Variação (7d)</span>
                        <span className={clsx("font-semibold", Number(variacao7Dias) >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
                          {variacao7Dias}%
                        </span>
                      </div>
                    )}
                    {mediaMovel30Dias && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400">Média Móvel (30d)</span>
                        <span className="font-medium text-gray-900 dark:text-gray-100">R$ {mediaMovel30Dias}</span>
                      </div>
                    )}
                    {statusMedia && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400">Status da Média</span>
                        <span className="text-gray-800 dark:text-gray-100 font-medium">{statusMedia}</span>
                      </div>
                    )}
                    {indicadorTendencia && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400">Tendência</span>
                        <span className={clsx("font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wide", {
                          'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300': indicadorTendencia.toLowerCase() === 'positiva',
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300': indicadorTendencia.toLowerCase() === 'neutra',
                          'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300': indicadorTendencia.toLowerCase() === 'negativa',
                        })}>
                          {indicadorTendencia}
                        </span>
                      </div>
                    )}
                    {nivelRisco && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500 dark:text-gray-400">Nível de Risco</span>
                        <span className={clsx("font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wide", {
                          'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300': nivelRisco === 'Baixo',
                          'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300': nivelRisco === 'Moderado',
                          'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300': nivelRisco === 'Alto' || nivelRisco === 'Elevado',
                        })}>
                          {nivelRisco}
                        </span>
                      </div>
                    )}
                  </div>
                  {analiseTextual && (
                    <div className="border-t border-gray-200/70 dark:border-gray-700/70 px-3 py-2.5">
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">Análise</p>
                      <p className="text-[11px] text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{analiseTextual}</p>
                    </div>
                  )}
                  {disclaimer && (
                    <div className="border-t border-gray-200/70 dark:border-gray-700/70 px-3 py-2">
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 italic leading-relaxed">{disclaimer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!isUser && hasLlmLogs && (
          <details className="mt-2 border-t border-dashed border-gray-200/80 dark:border-gray-700 pt-2">
            <summary className="cursor-pointer select-none text-[10px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
              Logs do agente ({llmLogs.length})
            </summary>
            <div className="mt-2 text-[10px] text-gray-500 dark:text-gray-400 space-y-1">
              {llmLogs.map((log, index) => (
                <p key={`${message.id}-log-${index}`}>• {log}</p>
              ))}
            </div>
          </details>
        )}

        <div className={clsx("text-[10px] mt-1 text-right opacity-70 flex items-center justify-end gap-1", isUser ? "text-blue-100" : "text-gray-400 dark:text-gray-500")}>
          {format(new Date(message.timestamp), 'HH:mm')}
          {isUser && (
            <span>
              {message.status === 'sending' && '🕒'}
              {message.status === 'sent' && '✓'}
              {message.status === 'error' && '❌'}
            </span>
          )}
        </div>
      </div>

      {isUser && (
        <Avatar
          fallback="ED"
          wrapperClassName="mt-1"
          className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-[11px]"
        />
      )}
    </div>
  );
};

export default MessageBubble;
