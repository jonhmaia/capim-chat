import React, { useRef, useEffect } from 'react';
import { Message } from '../types';
import MessageBubble from './MessageBubble';

interface MessageListProps {
  messages: Message[];
}

const MessageList: React.FC<MessageListProps> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-transparent transition-colors duration-200">
      {messages.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-16">
          <p className="text-sm font-medium">Keila e Ed prontos para analisar o mercado</p>
          <p className="text-xs mt-1 opacity-80">Digite um ativo da B3 para começar.</p>
        </div>
      ) : (
        messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))
      )}
      <div ref={bottomRef} />
    </div>
  );
};

export default MessageList;
