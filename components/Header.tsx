import React from 'react';
import Avatar from './Avatar';
import { RotateCcw } from 'lucide-react';
import { ModeToggle } from './ModeToggle';

interface HeaderProps {
  onResetConversation: () => void;
  userId: string;
  isLoading?: boolean;
  activeTab: 'chat' | 'docs';
  onTabChange: (tab: 'chat' | 'docs') => void;
}

const Header: React.FC<HeaderProps> = ({ onResetConversation, userId, isLoading, activeTab, onTabChange }) => {
  const shortUserId = userId ? userId.slice(0, 8) : '--------';

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white/50 dark:bg-gray-900/50 border-b border-white/40 dark:border-gray-800/80 sticky top-0 z-10 backdrop-blur-xl transition-colors duration-200">
      <div className="flex items-center space-x-3">
        <Avatar
          fallback="WB"
          status="online"
          className="w-9 h-9 bg-blue-600 text-white text-[11px]"
        />
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight">Warren Buffet Consultoria</h1>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">Online</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/70 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 border border-gray-200/70 dark:border-gray-700/80">
              ID {shortUserId}
            </span>
            <div className="inline-flex items-center rounded-full p-0.5 bg-white/70 dark:bg-gray-800/80 border border-gray-200/70 dark:border-gray-700/80">
              <button
                onClick={() => onTabChange('chat')}
                className={activeTab === 'chat'
                  ? "px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-600 text-white transition-colors"
                  : "px-2.5 py-1 rounded-full text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/60 transition-colors"}
              >
                Chat
              </button>
              <button
                onClick={() => onTabChange('docs')}
                className={activeTab === 'docs'
                  ? "px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-600 text-white transition-colors"
                  : "px-2.5 py-1 rounded-full text-[10px] font-medium text-gray-600 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-700/60 transition-colors"}
              >
                Documentação
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onResetConversation}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-200 border border-gray-200/80 dark:border-gray-700/80 hover:bg-white dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Resetar
        </button>
        <ModeToggle />
      </div>
    </div>
  );
};

export default Header;
