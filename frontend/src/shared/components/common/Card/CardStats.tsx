import React from 'react';
import { cn } from '../../../../lib/utils';

interface StatItemProps {
  icon: React.ElementType;
  label: React.ReactNode;
  className?: string;
  iconClass?: string;
  truncate?: boolean;
}

export const StatItem: React.FC<StatItemProps> = ({
  icon: Icon,
  label,
  className,
  iconClass,
  truncate = true,
}) => (
  <span className={cn('flex items-center gap-1.5 font-mono text-xs text-content-secondary', truncate && 'max-w-full truncate', className)}>
    <Icon className={cn('w-3.5 h-3.5 opacity-60 text-content-muted shrink-0', iconClass)} />
    <span className={cn(truncate && 'truncate')}>{label}</span>
  </span>
);

interface CardStatsProps {
  children: React.ReactNode;
  className?: string;
  layout?: 'grid' | 'list' | 'compact';
}

export const CardStats: React.FC<CardStatsProps> = ({
  children,
  className,
  layout = 'grid',
}) => {
  const isList = layout === 'list';
  
  return (
    <div className={cn(
      'grid gap-y-2 gap-x-3 text-xs text-content-secondary',
      isList ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4' : 'grid-cols-2 mb-4',
      className
    )}>
      {children}
    </div>
  );
};
