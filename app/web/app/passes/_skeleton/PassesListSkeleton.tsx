import { Skeleton } from "../../components/skeletons/Skeleton";

export function PassCardSkeleton() {
  return (
    <article className="bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant overflow-hidden">
      {/* Header */}
      <Skeleton className="h-12 rounded-none" />

      {/* Route */}
      <div className="px-md pt-md pb-sm space-y-sm">
        <div className="flex items-center justify-between">
          <div className="space-y-xs">
            <Skeleton className="h-7 w-14" />
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-10 flex-1 mx-md" />
          <div className="space-y-xs text-right flex flex-col items-end">
            <Skeleton className="h-7 w-14" />
            <Skeleton className="h-3 w-12" />
          </div>
        </div>
        <Skeleton className="h-3 w-32" />
      </div>

      <div className="h-px bg-outline-variant/30" />

      {/* Stats + QR */}
      <div className="px-md py-md flex items-center justify-between gap-md">
        <div className="grid grid-cols-4 gap-md flex-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-8" />
          ))}
        </div>
        <Skeleton className="w-16 h-16 rounded-lg shrink-0" />
      </div>

      {/* Footer */}
      <div className="border-t border-outline-variant px-md py-sm flex items-center justify-between">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-12" />
      </div>
    </article>
  );
}

export function PassesListSkeleton() {
  return (
    <div className="space-y-lg">
      <header className="flex items-center justify-between">
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-24" />
      </header>
      {Array.from({ length: 2 }).map((_, i) => (
        <PassCardSkeleton key={i} />
      ))}
    </div>
  );
}
