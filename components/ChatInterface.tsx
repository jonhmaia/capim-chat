import React from 'react';
import { useChat } from '../hooks/useChat';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import Header from './Header';

const ChatInterface = () => {
  const { messages, sendMessage, resetConversation, isLoading, error, userId } = useChat();

  return (
    <div className="relative flex flex-col h-screen bg-gradient-to-b from-sky-100/60 via-white to-violet-100/40 dark:from-gray-950 dark:via-gray-950 dark:to-slate-900 md:py-8 transition-colors duration-300 overflow-hidden">
      <div className="absolute -top-28 -left-20 w-72 h-72 rounded-full bg-cyan-300/25 dark:bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-28 -right-20 w-72 h-72 rounded-full bg-violet-300/25 dark:bg-violet-500/10 blur-3xl pointer-events-none" />
      <div className="relative flex-1 flex flex-col max-w-3xl mx-auto w-full bg-white/45 dark:bg-gray-900/45 shadow-2xl overflow-hidden md:rounded-3xl border border-white/70 dark:border-gray-800/80 backdrop-blur-2xl">
        <Header onResetConversation={resetConversation} userId={userId} isLoading={isLoading} />
        
        {error && (
          <div className="bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-900/70 text-red-700 dark:text-red-400 p-3 mx-4 mt-3 text-sm rounded-xl" role="alert">
            <p className="font-bold">Erro</p>
            <p>{error}</p>
          </div>
        )}

        <div className="flex-1 overflow-hidden relative flex flex-col min-h-0">
           <MessageList messages={messages} />
        </div>

        <MessageInput onSendMessage={sendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default ChatInterface;
