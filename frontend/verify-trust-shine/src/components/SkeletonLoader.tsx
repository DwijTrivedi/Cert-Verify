/**
 * SkeletonLoader — shimmer placeholder rows for async data.
 * Uses the `.skeleton` CSS utility defined in index.css.
 */

interface SkeletonRowProps {
  /** How many shimmer rows to render */
  rows?: number;
  /** Extra Tailwind classes on the container */
  className?: string;
}

const SkeletonRow = () => (
  <div className="flex items-center gap-3 rounded-lg border border-border/30 p-3">
    <div className="skeleton h-4 w-12 shrink-0" />
    <div className="flex-1 space-y-1.5">
      <div className="skeleton h-3.5 w-3/4" />
      <div className="skeleton h-2.5 w-1/2" />
    </div>
    <div className="skeleton h-5 w-16 shrink-0 rounded-full" />
    <div className="skeleton h-3 w-14 shrink-0 hidden sm:block" />
  </div>
);

const SkeletonLoader = ({ rows = 5, className = "" }: SkeletonRowProps) => (
  <div className={`space-y-2 ${className}`} aria-label="Loading…" role="status">
    {Array.from({ length: rows }).map((_, i) => (
      <SkeletonRow key={i} />
    ))}
  </div>
);

export default SkeletonLoader;
