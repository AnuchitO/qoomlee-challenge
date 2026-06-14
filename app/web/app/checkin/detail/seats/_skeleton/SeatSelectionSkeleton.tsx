import { Skeleton } from "../../../../components/skeletons/Skeleton";

export function SeatSelectionSkeleton() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-surface-bright border-b border-outline-variant sticky top-0 z-50 px-container-margin-mobile h-16 flex justify-between items-center">
        <div className="flex items-center gap-md">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="h-5 w-36" />
        </div>
        <Skeleton className="h-4 w-10" />
      </header>

      <main className="pb-36">
        {/* Flight pill */}
        <section className="px-container-margin-mobile pt-md">
          <Skeleton className="h-16 rounded-xl" />
        </section>

        {/* Legend */}
        <section className="px-container-margin-mobile py-md flex gap-lg flex-wrap">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-xs">
              <Skeleton className="w-5 h-5 rounded-lg" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </section>

        {/* Seat map */}
        <div className="mx-auto max-w-[360px] bg-surface-container-lowest border-x border-outline-variant/30 rounded-t-[100px] shadow-sm pt-xl pb-xxl overflow-hidden px-md space-y-sm">
          {Array.from({ length: 8 }).map((_, row) => (
            <div key={row} className="grid grid-cols-[32px_1fr] gap-md items-center">
              <Skeleton className="h-4 w-4 mx-auto" />
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 7 }).map((_, col) => (
                  <Skeleton key={col} className="h-9 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Bottom action */}
      <div className="fixed bottom-0 left-0 w-full bg-surface-bright border-t border-outline-variant px-container-margin-mobile py-md shadow-lg z-50 space-y-sm">
        <div className="flex justify-between items-center">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-6 w-12" />
        </div>
        <Skeleton className="h-14 rounded-xl" />
      </div>
    </div>
  );
}
