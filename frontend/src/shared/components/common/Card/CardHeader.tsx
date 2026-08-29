import React from 'react';
import { MoreVertical } from 'lucide-react';
import { cn } from '../../../../lib/utils';

interface CardHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  status?: string;
  statusColorClass?: string;
  statusDotClass?: string;
  icons?: React.ReactNode;
  dropdownItems?: React.ReactNode;
  className?: string;
  layout?: 'grid' | 'list' | 'compact';
}

export const CardHeader: React.FC<CardHeaderProps> = ({
  title,
  subtitle,
  status,
  statusColorClass,
  statusDotClass,
  icons,
  dropdownItems,
  className,
  layout = 'grid',
}) => {
  const isList = layout === 'list';

  return (
    <div className={cn('flex items-start justify-between gap-3', !isList && 'mb-3', className)}>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <h3 className={cn(
            'font-bold text-content-primary truncate tracking-tight',
            isList ? 'text-base' : 'text-base'
          )} title={title}>
            {title}
          </h3>
          
          {status && (
            <span className={cn(
              'px-1.5 py-0.5 rounded-[3px] text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 border',
              statusColorClass || 'bg-surface-light text-content-muted border-[#2e323c]'
            )}>
              {statusDotClass && (
                <span className={cn('w-1.5 h-1.5 rounded-full', statusDotClass)}></span>
              )}
              {status}
            </span>
          )}
          
          {icons}
        </div>
        
        {subtitle && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-mono text-content-muted">
            {subtitle}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        {dropdownItems && (
          <div className="dropdown dropdown-end" onClick={(e) => e.stopPropagation()}>
            <div 
              tabIndex={0} 
              role="button" 
              className="p-1.5 rounded-[4px] text-content-muted hover:text-content-primary hover:bg-[#262830] transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </div>
            <ul tabIndex={0} className="dropdown-content z-20 menu p-1.5 bg-[#1e2026] border border-[#2e323c] rounded-[6px] shadow-2xl w-48 mt-1">
              {dropdownItems}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
