import React, { useState } from 'react';
import clsx from 'clsx';
import { Send, Loader2 } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isLoading) {
      onSendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className="border-t border-white/40 dark:border-gray-800/80 px-4 py-3 bg-white/40 dark:bg-gray-900/40 backdrop-blur-xl transition-colors duration-200">
      <form onSubmit={handleSubmit} className="flex items-center space-x-3 rounded-2xl border border-white/70 dark:border-gray-700/80 bg-white/70 dark:bg-gray-800/70 p-2 shadow-lg shadow-sky-100/30 dark:shadow-none">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Pergunte para Warren Buffet Consultoria..."
          className="flex-1 px-3 py-2 bg-transparent text-sm text-gray-900 dark:text-gray-100 rounded-xl focus:outline-none placeholder-gray-500 dark:placeholder-gray-400"
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className={clsx(
            "p-2.5 rounded-xl text-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900",
            !inputValue.trim() || isLoading
              ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-[1.03]"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
