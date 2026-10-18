import React from 'react';

interface DukaanIqLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  iconOnly?: boolean;
}

export const DukaanIqLogo: React.FC<DukaanIqLogoProps> = ({
  className = '',
  size = 'md',
  iconOnly = false,
}) => {
  const sizeMap = {
    sm: { icon: 28, text: 'text-base', sub: 'text-[9px]' },
    md: { icon: 34, text: 'text-lg', sub: 'text-[10px]' },
    lg: { icon: 42, text: 'text-2xl', sub: 'text-xs' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Brand Icon Mark */}
      <div
        className="relative shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-700 text-white shadow-[2px_2px_0_0_#1E293B] border border-slate-900"
        style={{ width: currentSize.icon, height: currentSize.icon }}
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-5/6 h-5/6 drop-shadow-xs"
        >
          {/* Shopping Bag Outline */}
          <path
            d="M8 10H24L22.5 26H9.5L8 10Z"
            fill="currentColor"
            fillOpacity="0.15"
            stroke="white"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Bag Handle */}
          <path
            d="M12 10V7C12 4.79086 13.7909 3 16 3C18.2091 3 20 4.79086 20 7V10"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Spark IQ Node */}
          <circle cx="16" cy="18" r="3.2" fill="#FBBF24" />
          <path
            d="M16 13V15M16 21V23M11 18H13M19 18H21"
            stroke="#FBBF24"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

        {/* Ambient glow point */}
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-900 shadow-2xs" />
      </div>

      {/* Brand Typography */}
      {!iconOnly && (
        <div className="flex flex-col leading-tight">
          <div className={`font-black font-heading tracking-tight text-slate-950 flex items-center ${currentSize.text}`}>
            <span>Dukaan</span>
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              IQ
            </span>
          </div>
          <span className={`font-bold font-mono tracking-wider text-slate-400 uppercase ${currentSize.sub}`}>
            Retail AI Platform
          </span>
        </div>
      )}
    </div>
  );
};
