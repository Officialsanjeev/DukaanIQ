import React from 'react';

interface ReceiptCardProps {
  children: React.ReactNode;
  className?: string;
  headerTitle?: string;
  headerSub?: string;
}

export const ReceiptCard: React.FC<ReceiptCardProps> = ({
  children,
  className = '',
  headerTitle,
  headerSub,
}) => {
  return (
    <div className={`relative bg-white border border-slate-200/90 shadow-trust rounded-t-xl pb-6 ${className}`}>
      {headerTitle && (
        <div className="p-4 border-b border-dashed border-slate-300 bg-slate-50/50 rounded-t-xl text-center">
          <div className="text-xs font-extrabold uppercase tracking-wider text-slate-900 font-heading">
            {headerTitle}
          </div>
          {headerSub && <div className="text-[10px] text-slate-500 font-mono mt-0.5">{headerSub}</div>}
        </div>
      )}

      <div className="p-4">{children}</div>

      {/* SVG Geometric Receipt Zigzag Edge */}
      <div className="absolute left-0 right-0 -bottom-2.5 h-3 overflow-hidden leading-none z-10 pointer-events-none">
        <svg
          viewBox="0 0 1200 12"
          className="w-full h-3 fill-white"
          preserveAspectRatio="none"
        >
          <path d="M0,0 L15,12 L30,0 L45,12 L60,0 L75,12 L90,0 L105,12 L120,0 L135,12 L150,0 L165,12 L180,0 L195,12 L210,0 L225,12 L240,0 L255,12 L270,0 L285,12 L300,0 L315,12 L330,0 L345,12 L360,0 L375,12 L390,0 L405,12 L420,0 L435,12 L450,0 L465,12 L480,0 L495,12 L510,0 L525,12 L540,0 L555,12 L570,0 L585,12 L600,0 L615,12 L630,0 L645,12 L660,0 L675,12 L690,0 L705,12 L720,0 L735,12 L750,0 L765,12 L780,0 L795,12 L810,0 L825,12 L840,0 L855,12 L870,0 L885,12 L900,0 L915,12 L930,0 L945,12 L960,0 L975,12 L990,0 L1005,12 L1020,0 L1035,12 L1050,0 L1065,12 L1080,0 L1095,12 L1110,0 L1125,12 L1140,0 L1155,12 L1170,0 L1185,12 L1200,0 L1200,0 L0,0 Z" />
        </svg>
      </div>
    </div>
  );
};
