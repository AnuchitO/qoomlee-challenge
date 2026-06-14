interface SkeletonProps {
  className?: string;
}

/** Base pulsing block used to compose skeleton layouts. Pass sizing/shape via className. */
export function Skeleton({ className = "" }: SkeletonProps) {
  return <div className={`animate-pulse rounded-md bg-surface-container-high ${className}`} />;
}
