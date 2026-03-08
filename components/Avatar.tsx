import React from 'react';
import clsx from 'clsx';
import Image from 'next/image';

interface AvatarProps {
  src?: string;
  fallback: string;
  status?: 'online' | 'offline';
  className?: string;
  wrapperClassName?: string;
}

const Avatar: React.FC<AvatarProps> = ({ src, fallback, status, className, wrapperClassName }) => {
  return (
    <div className={clsx("relative inline-block shrink-0", wrapperClassName)}>
      <div className={clsx("w-10 h-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-200 font-semibold text-sm transition-colors duration-200 ring-1 ring-white/60 dark:ring-gray-700/80", className)}>
        {src ? (
          <Image src={src} alt="Avatar" width={40} height={40} className="w-full h-full object-cover" />
        ) : (
          <span>{fallback}</span>
        )}
      </div>
      {status && (
        <span
          className={clsx(
            "absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-gray-900 transition-colors duration-200",
            status === 'online' ? "bg-green-400" : "bg-gray-400"
          )}
        />
      )}
    </div>
  );
};

export default Avatar;
