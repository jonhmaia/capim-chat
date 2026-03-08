import React, { useState } from 'react';
import { useChat } from '../hooks/useChat';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import Header from './Header';
import DocumentationPanel from './DocumentationPanel';

const ChatInterface = () => {
  const { messages, sendMessage, resetConversation, isLoading, error, userId } = useChat();
  const [activeTab, setActiveTab] = useState<'chat' | 'docs'>('chat');

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center px-2 md:px-4 py-2 md:py-6 bg-gradient-to-b from-sky-100/60 via-white to-violet-100/40 dark:from-gray-950 dark:via-gray-950 dark:to-slate-900 transition-colors duration-300 overflow-hidden">
      <div className="absolute -top-28 -left-20 w-72 h-72 rounded-full bg-cyan-300/25 dark:bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-28 -right-20 w-72 h-72 rounded-full bg-violet-300/25 dark:bg-violet-500/10 blur-3xl pointer-events-none" />
      <div data-chat-shell className="relative flex flex-col h-[min(900px,calc(100vh-1rem))] md:h-[min(900px,calc(100vh-3rem))] max-w-3xl w-full bg-white/45 dark:bg-gray-900/45 shadow-2xl overflow-hidden rounded-3xl border border-white/70 dark:border-gray-800/80 backdrop-blur-2xl">
        <Header
          onResetConversation={resetConversation}
          userId={userId}
          isLoading={isLoading}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        {activeTab === 'chat' && error && (
          <div className="bg-red-50/80 dark:bg-red-900/20 border border-red-200 dark:border-red-900/70 text-red-700 dark:text-red-400 p-3 mx-4 mt-3 text-sm rounded-xl" role="alert">
            <p className="font-bold">Erro</p>
            <p>{error}</p>
          </div>
        )}

        {activeTab === 'chat' ? (
          <>
            <div className="flex-1 overflow-hidden relative flex flex-col min-h-0">
              <MessageList messages={messages} isThinking={isLoading} />
            </div>
            <MessageInput onSendMessage={sendMessage} isLoading={isLoading} />
          </>
        ) : (
          <DocumentationPanel />
        )}
      </div>
    </div>
  );
};

export default ChatInterface;
