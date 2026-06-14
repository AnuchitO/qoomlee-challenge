import { Skeleton } from "../../components/skeletons/Skeleton";

export function BookingCardSkeleton() {
  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="bg-surface-container px-md py-sm flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>

      {/* Route info */}
      <div className="p-md flex items-center justify-between">
        <div className="space-y-xs">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-36" />
        </div>
        <div className="space-y-xs text-right flex flex-col items-end">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-6 w-20" />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-outline-variant px-md py-sm flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
    </div>
  );
}

export function BookingsListSkeleton() {
  return (
    <div className="space-y-lg">
      <Skeleton className="h-7 w-40" />
      {Array.from({ length: 3 }).map((_, i) => (
        <BookingCardSkeleton key={i} />
      ))}
    </div>
  );
}
