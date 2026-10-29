import { cn } from '../lib/utils'

/** Shimmer block used by every loading state, so skeletons stay consistent. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('skeleton', className)} aria-hidden="true" />
}

/** A row of `count` skeleton lines with decreasing width — list placeholders. */
export function SkeletonRows({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={index}
          className={cn('h-3', index % 3 === 0 ? 'w-2/3' : index % 3 === 1 ? 'w-1/2' : 'w-3/5')}
        />
      ))}
    </div>
  )
}
