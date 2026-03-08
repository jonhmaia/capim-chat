import React, { useRef, useEffect } from 'react';
import { Message } from '../types';
import MessageBubble from './MessageBubble';
import Avatar from './Avatar';

interface MessageListProps {
  messages: Message[];
  isThinking?: boolean;
}

const MessageList: React.FC<MessageListProps> = ({ messages, isThinking }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking]);

  return (
    <div ref={scrollRef} data-chat-scroll-area className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-transparent transition-colors duration-200">
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-16">
          <p className="text-sm font-medium">Warren Buffet Consultoria pronta para analisar o mercado</p>
          <p className="text-xs mt-1 opacity-80">Digite um ativo da B3 para começar.</p>
        </div>
      ) : (
        messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))
      )}
      {isThinking && (
        <div className="flex w-full mt-2 space-x-3 max-w-3xl mx-auto justify-start">
          <Avatar
            fallback="WB"
            wrapperClassName="mt-1"
            className="w-8 h-8 bg-blue-600 text-white text-[11px]"
          />
          <div className="px-4 py-3 rounded-2xl rounded-tl-none border border-white/60 dark:border-gray-700/90 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg shadow-lg">
            <p className="text-[10px] uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1">Warren Buffet Consultoria</p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-400/80 dark:bg-gray-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-gray-400/80 dark:bg-gray-500 animate-bounce [animation-delay:120ms]" />
              <span className="w-2 h-2 rounded-full bg-gray-400/80 dark:bg-gray-500 animate-bounce [animation-delay:240ms]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageList;
