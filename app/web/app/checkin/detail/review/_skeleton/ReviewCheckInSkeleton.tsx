import { Skeleton } from "../../../../components/skeletons/Skeleton";

export function ReviewCheckInSkeleton() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-surface-bright border-b border-outline-variant shadow-sm sticky top-0 z-50 flex items-center px-container-margin-mobile h-16 gap-md">
        <Skeleton className="w-9 h-9 rounded-full" />
        <Skeleton className="h-5 w-40" />
      </header>

      <main className="pb-32 max-w-[500px] mx-auto w-full px-container-margin-mobile py-lg space-y-lg">
        {/* Progress */}
        <div className="flex items-center justify-between px-lg py-sm gap-sm">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-xs flex-1">
              <div className="flex flex-col items-center gap-xs">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-3 w-12" />
              </div>
              {i < 2 && <Skeleton className="flex-1 h-px" />}
            </div>
          ))}
        </div>

        {/* Header */}
        <section className="space-y-xs">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </section>

        {/* Passenger cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant shadow-sm space-y-md"
            >
              <div className="flex justify-between items-start">
                <div className="space-y-xs">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="w-6 h-6 rounded-full" />
              </div>
              <div className="grid grid-cols-2 gap-sm">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-12 rounded-lg" />
                ))}
              </div>
              <Skeleton className="h-3 w-24" />
            </div>
          ))}
        </div>

        {/* Flight summary */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm space-y-md">
          <Skeleton className="h-3 w-32" />
          <div className="flex items-center justify-between">
            <div className="space-y-xs">
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-3 w-10" />
            </div>
            <Skeleton className="w-6 h-6 rounded-full" />
            <div className="space-y-xs text-right flex flex-col items-end">
              <Skeleton className="h-6 w-12" />
              <Skeleton className="h-3 w-10" />
            </div>
          </div>
          <Skeleton className="h-3 w-48" />
        </section>

        <Skeleton className="h-3 w-full" />
      </main>

      {/* Bottom action */}
      <div className="fixed bottom-0 left-0 w-full bg-surface-bright border-t border-outline-variant px-container-margin-mobile py-md shadow-lg z-50">
        <Skeleton className="h-14 rounded-xl" />
      </div>
    </div>
  );
}
