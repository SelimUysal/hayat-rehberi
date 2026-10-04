import React from 'react';
import { TajweedRuleInfo } from '../types/tajweed';

interface TajweedBadgeProps {
  rule: TajweedRuleInfo;
  size?: 'sm' | 'md' | 'lg';
  showDuration?: boolean;
  onClick?: () => void;
}

export const TajweedBadge: React.FC<TajweedBadgeProps> = ({
  rule,
  size = 'md',
  showDuration = true,
  onClick,
}) => {
  const sizeClasses = {
    sm: 'text-[10px] px-1.5 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  }[size];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded-lg border font-semibold transition-all shadow-2xs ${rule.color.badgeBg} ${sizeClasses} ${
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'
      }`}
      title={`${rule.titleTr}: ${rule.shortDesc}`}
    >
      <span
        className="h-2 w-2 rounded-full shrink-0 animate-pulse"
        style={{ backgroundColor: rule.color.hex }}
      />
      <span>{rule.titleTr}</span>
      {showDuration && rule.durationElif && (
        <span className="opacity-80 text-[10px] font-normal border-l border-current pl-1">
          {rule.durationElif}
        </span>
      )}
    </button>
  );
};
