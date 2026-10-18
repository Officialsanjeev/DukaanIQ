import React from 'react';

interface PriceTagBadgeProps {
  children: React.ReactNode;
  color?: 'amber' | 'mint' | 'pink' | 'indigo' | 'white';
  rotated?: boolean;
  size?: 'sm' | 'md';
  className?: string;
}

export const PriceTagBadge: React.FC<PriceTagBadgeProps> = ({
  children,
  color = 'amber',
  rotated = false,
  size = 'md',
  className = '',
}) => {
  const colorMap = {
    amber: 'bg-[#FBBF24] text-slate-900',
    mint: 'bg-[#34D399] text-slate-900',
    pink: 'bg-[#F472B6] text-slate-900',
    indigo: 'bg-indigo-100 text-indigo-950',
    white: 'bg-white text-slate-900',
  };

  const sizeMap = {
    sm: 'text-[10px] py-0.5 px-2.5',
    md: 'text-xs py-1 px-3',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold font-heading rounded-full border-2 border-slate-900 shadow-pop-active select-none ${
        colorMap[color]
      } ${sizeMap[size]} ${rotated ? '-rotate-3 hover:rotate-0 transition-transform' : ''} ${className}`}
    >
      {/* Punched hole cutout */}
      <span className="w-1.5 h-1.5 rounded-full bg-slate-900/30 border border-slate-900/20 inline-block shrink-0" />
      <span>{children}</span>
    </span>
  );
};
