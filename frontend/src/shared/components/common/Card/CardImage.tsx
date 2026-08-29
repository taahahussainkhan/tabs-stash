import React from 'react';
import { cn } from '../../../../lib/utils';

interface CardImageProps {
  src?: string | null;
  alt?: string;
  fallbackIcon: React.ReactNode;
  statusBadge?: React.ReactNode;
  className?: string;
  containerClass?: string;
  layout?: 'grid' | 'list' | 'compact';
}

export const CardImage: React.FC<CardImageProps> = ({
  src,
  alt,
  fallbackIcon,
  statusBadge,
  className,
  containerClass,
  layout = 'grid',
}) => {
  const isList = layout === 'list';

  return (
    <div className={cn(
      'relative overflow-hidden bg-[#121316] border border-[#2e323c] rounded-[4px]',
      isList ? 'w-14 h-18 rounded-[4px] shrink-0' : 'w-full aspect-[2/3] mb-3.5',
      containerClass
    )}>
      {src ? (
        <img 
          src={src} 
          alt={alt} 
          className={cn('w-full h-full object-cover transition-transform duration-300 group-hover:scale-105', className)} 
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-content-muted/30">
          {fallbackIcon}
        </div>
      )}
      
      {!isList && statusBadge && (
        <div className="absolute top-2.5 left-2.5 z-10">
          {statusBadge}
        </div>
      )}
    </div>
  );
};
