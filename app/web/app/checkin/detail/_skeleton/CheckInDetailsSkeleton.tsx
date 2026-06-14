import { Skeleton } from "../../../components/skeletons/Skeleton";

export function CheckInDetailsSkeleton() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-surface-container-low border-b border-outline-variant shadow-sm sticky top-0 z-50 flex items-center justify-between px-container-margin-mobile h-16">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="w-8 h-8 rounded-full" />
      </header>

      {/* Tabs */}
      <div className="flex gap-md bg-surface-bright border-b border-outline-variant sticky top-16 z-40 px-container-margin-mobile py-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-20" />
        ))}
      </div>

      <main className="pb-32 max-w-[600px] mx-auto w-full px-container-margin-mobile py-lg space-y-lg">
        <section className="bg-surface-container-lowest p-lg rounded-xl shadow-sm border border-outline-variant space-y-md">
          <div className="flex items-center gap-md">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="grid grid-cols-2 gap-md">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-xs">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            ))}
          </div>
          <Skeleton className="h-4 w-28" />
        </section>
      </main>

      {/* Bottom action */}
      <div className="fixed bottom-0 left-0 w-full bg-surface-bright border-t border-outline-variant px-container-margin-mobile py-md shadow-lg z-50">
        <Skeleton className="h-14 rounded-xl" />
      </div>
    </div>
  );
}
