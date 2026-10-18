import React from 'react';
import { ArrowRight } from 'lucide-react';

interface CandyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  withArrow?: boolean;
  children: React.ReactNode;
}

export const CandyButton: React.FC<CandyButtonProps> = ({
  variant = 'primary',
  size = 'md',
  withArrow = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: 'px-4 py-1.5 text-xs h-9 min-h-[36px]',
    md: 'px-5 py-2.5 text-xs font-bold h-11 min-h-[44px]',
    lg: 'px-7 py-3.5 text-sm font-extrabold h-13 min-h-[52px]',
  };

  let variantClasses = '';

  if (variant === 'primary') {
    variantClasses =
      'bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] hover:from-[#2563EB] hover:to-[#1E40AF] text-white border-2 border-slate-900 shadow-pop hover:shadow-pop-hover hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-pop-active active:translate-x-0.5 active:translate-y-0.5 transition-bounce';
  } else if (variant === 'secondary') {
    variantClasses =
      'bg-white text-slate-900 border-2 border-slate-900 shadow-pop hover:shadow-pop-hover hover:bg-[#FBBF24] hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-pop-active active:translate-x-0.5 active:translate-y-0.5 transition-bounce';
  } else if (variant === 'danger') {
    variantClasses =
      'bg-red-500 text-white border-2 border-slate-900 shadow-pop hover:shadow-pop-hover hover:bg-red-600 hover:-translate-x-0.5 hover:-translate-y-0.5 active:shadow-pop-active active:translate-x-0.5 active:translate-y-0.5 transition-bounce';
  } else {
    // ghost (product UI row actions)
    variantClasses =
      'bg-transparent text-indigo-600 hover:bg-indigo-50 hover:text-indigo-900 rounded-lg font-semibold transition-colors';
  }

  const baseClasses =
    variant === 'ghost'
      ? 'inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:pointer-events-none'
      : 'inline-flex items-center justify-center gap-2.5 rounded-full select-none cursor-pointer disabled:opacity-50 disabled:pointer-events-none tracking-tight';

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      <span>{children}</span>
      {withArrow && variant !== 'ghost' && (
        <span className="w-5 h-5 rounded-full bg-white text-indigo-700 flex items-center justify-center shadow-xs shrink-0 group-hover:translate-x-0.5 transition-transform">
          <ArrowRight className="w-3 h-3 stroke-[2.5]" />
        </span>
      )}
    </button>
  );
};
