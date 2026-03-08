import React from 'react';
import Avatar from './Avatar';
import { RotateCcw } from 'lucide-react';
import { ModeToggle } from './ModeToggle';

interface HeaderProps {
  onResetConversation: () => void;
  userId: string;
  isLoading?: boolean;
}

const Header: React.FC<HeaderProps> = ({ onResetConversation, userId, isLoading }) => {
  const shortUserId = userId ? userId.slice(0, 8) : '--------';

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-white/50 dark:bg-gray-900/50 border-b border-white/40 dark:border-gray-800/80 sticky top-0 z-10 backdrop-blur-xl transition-colors duration-200">
      <div className="flex items-center space-x-3">
        <div className="relative w-[52px] h-10">
          <Avatar
            fallback="KE"
            status="online"
            wrapperClassName="absolute left-0 top-0"
            className="w-10 h-10 bg-gradient-to-br from-fuchsia-500 to-indigo-600 text-white text-xs"
          />
          <Avatar
            fallback="ED"
            wrapperClassName="absolute right-0 bottom-0"
            className="w-7 h-7 bg-gradient-to-br from-slate-700 to-slate-900 text-white text-[10px]"
          />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100 tracking-tight">Keila & Ed Assistant</h1>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="text-xs text-green-600 dark:text-green-400 font-medium">Online</p>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/70 dark:bg-gray-800/80 text-gray-500 dark:text-gray-400 border border-gray-200/70 dark:border-gray-700/80">
              ID {shortUserId}
            </span>
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
