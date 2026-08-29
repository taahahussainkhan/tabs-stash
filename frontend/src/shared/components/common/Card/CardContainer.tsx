import React from 'react';
import { cn } from '../../../../lib/utils';

interface CardContainerProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  layout?: 'grid' | 'list' | 'compact';
  size?: 'small' | 'medium' | 'large';
  hoverEffect?: boolean;
}

export const CardContainer: React.FC<CardContainerProps> = ({
  children,
  onClick,
  className,
  layout = 'grid',
  hoverEffect = true,
}) => {
  const isList = layout === 'list';
  
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-[#1e2026] border border-[#2e323c] rounded-[6px] overflow-hidden flex transition-all duration-150',
        isList ? 'p-3.5 sm:items-center gap-4' : 'flex-col h-full relative p-4',
        hoverEffect && 'group hover:border-[#424856] hover:bg-[#23262e] cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};
