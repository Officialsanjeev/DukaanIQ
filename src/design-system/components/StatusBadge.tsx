import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Sparkles } from 'lucide-react';

export type StatusType = 'healthy' | 'risk' | 'critical' | 'ai';

interface StatusBadgeProps {
  status: StatusType;
  label: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, className = '' }) => {
  const config = {
    healthy: {
      bg: 'bg-[#ECFDF5]',
      text: 'text-[#059669]',
      border: 'border-[#A7F3D0]',
      icon: CheckCircle,
    },
    risk: {
      bg: 'bg-[#FFFBEB]',
      text: 'text-[#B45309]',
      border: 'border-[#FDE68A]',
      icon: AlertTriangle,
    },
    critical: {
      bg: 'bg-[#FEF2F2]',
      text: 'text-[#B91C1C]',
      border: 'border-[#FECACA]',
      icon: XCircle,
    },
    ai: {
      bg: 'bg-[#EEF2FF]',
      text: 'text-[#4338CA]',
      border: 'border-[#C7D2FE]',
      icon: Sparkles,
    },
  };

  const item = config[status];
  const Icon = item.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${item.bg} ${item.text} ${item.border} ${className}`}
    >
      <Icon className="w-3 h-3 shrink-0" />
      <span>{label}</span>
    </span>
  );
};
