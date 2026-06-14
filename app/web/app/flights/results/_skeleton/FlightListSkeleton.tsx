import { Skeleton } from "../../../components/skeletons/Skeleton";

export function FlightCardSkeleton() {
  return (
    <section className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-md">
      <div className="flex flex-col gap-lg">
        {/* Airline & Price */}
        <div className="flex justify-between items-start gap-sm">
          <div className="flex items-center gap-md min-w-0">
            <Skeleton className="w-12 h-12 rounded-lg shrink-0" />
            <div className="min-w-0 space-y-xs">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-xs shrink-0">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-3 w-14" />
          </div>
        </div>

        {/* Journey */}
        <div className="flex items-center justify-between">
          <div className="space-y-xs">
            <Skeleton className="h-6 w-14" />
            <Skeleton className="h-3 w-10" />
          </div>
          <div className="flex-[2] flex flex-col items-center gap-xs px-md">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-px w-full" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="space-y-xs text-right flex flex-col items-end">
            <Skeleton className="h-6 w-14" />
            <Skeleton className="h-3 w-10" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-md border-t border-outline-variant/30">
          <div className="flex gap-md">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
          </div>
          <Skeleton className="h-9 w-24 rounded-xl" />
        </div>
      </div>
    </section>
  );
}

export function FlightListSkeleton() {
  return (
    <>
      {/* Filter chips */}
      <div className="sticky top-16 z-40 bg-background/80 backdrop-blur-md py-md -mx-container-margin-mobile px-container-margin-mobile">
        <div className="flex gap-sm overflow-x-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-full shrink-0" />
          ))}
        </div>
        <Skeleton className="h-3 w-40 mt-md" />
      </div>

      <div className="space-y-md mt-sm">
        {Array.from({ length: 3 }).map((_, i) => (
          <FlightCardSkeleton key={i} />
        ))}
      </div>
    </>
  );
}
