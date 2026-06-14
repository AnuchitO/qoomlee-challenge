import { Skeleton } from "../../../../components/skeletons/Skeleton";

export function SelectPassengersSkeleton() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-surface-bright border-b border-outline-variant shadow-sm sticky top-0 z-50 flex items-center px-container-margin-mobile h-16 gap-md">
        <Skeleton className="w-9 h-9 rounded-full" />
        <Skeleton className="h-5 w-40" />
      </header>

      <main className="pb-32 max-w-[500px] mx-auto w-full px-container-margin-mobile">
        {/* Progress stepper */}
        <section className="py-lg flex items-center justify-between px-md gap-sm">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-sm flex-1">
              <div className="flex flex-col items-center gap-1">
                <Skeleton className="w-8 h-8 rounded-full" />
                <Skeleton className="h-3 w-12" />
              </div>
              {i < 2 && <Skeleton className="flex-1 h-px" />}
            </div>
          ))}
        </section>

        {/* Flight summary */}
        <Skeleton className="h-24 rounded-xl mb-lg" />

        {/* Select all */}
        <Skeleton className="h-14 rounded-xl mb-sm" />

        {/* Passenger list */}
        <section className="space-y-sm">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex items-start gap-md shadow-sm"
            >
              <Skeleton className="mt-1 w-5 h-5 rounded" />
              <div className="flex-1 space-y-xs">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="w-5 h-5 rounded-full" />
            </div>
          ))}
        </section>
      </main>

      {/* Bottom action bar */}
      <div className="fixed bottom-0 left-0 w-full bg-surface-bright border-t border-outline-variant px-container-margin-mobile py-md shadow-lg z-50">
        <Skeleton className="h-14 rounded-xl" />
      </div>
    </div>
  );
}
