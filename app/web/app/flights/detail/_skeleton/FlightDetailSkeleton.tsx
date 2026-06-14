import { Skeleton } from "../../../components/skeletons/Skeleton";

export function FlightDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface-bright border-b border-outline-variant sticky top-0 z-50 flex items-center px-container-margin-mobile h-16 gap-md">
        <Skeleton className="w-10 h-10 rounded-full" />
        <Skeleton className="h-5 w-32" />
      </header>

      <main className="max-w-[500px] mx-auto pt-md px-container-margin-mobile pb-24 space-y-lg">
        {/* Airline header */}
        <Skeleton className="h-12 rounded-xl" />

        {/* Route timeline */}
        <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md shadow-sm">
          <div className="flex gap-md">
            <div className="flex flex-col items-center py-xs gap-1">
              <Skeleton className="w-3 h-3 rounded-full" />
              <Skeleton className="flex-1 w-px" />
              <Skeleton className="w-5 h-5 rounded-full" />
              <Skeleton className="flex-1 w-px" />
              <Skeleton className="w-3 h-3 rounded-full" />
            </div>
            <div className="flex-1 space-y-lg">
              <div className="space-y-xs">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-36" />
              </div>
              <div className="flex gap-md flex-wrap py-sm">
                <Skeleton className="h-7 w-16 rounded-lg" />
                <Skeleton className="h-7 w-20 rounded-lg" />
                <Skeleton className="h-7 w-28 rounded-lg" />
              </div>
              <div className="space-y-xs">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-3 w-36" />
              </div>
            </div>
          </div>
        </section>

        {/* Cabin classes */}
        <section className="space-y-sm">
          <Skeleton className="h-3 w-28" />
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md flex items-center justify-between"
            >
              <div className="space-y-xs">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-36" />
              </div>
              <div className="space-y-xs text-right flex flex-col items-end">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </section>

        {/* Amenities */}
        <section className="space-y-sm">
          <Skeleton className="h-3 w-24" />
          <div className="grid grid-cols-2 gap-sm">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-xl" />
            ))}
          </div>
        </section>

        {/* Baggage policy */}
        <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-md shadow-sm space-y-sm">
          <Skeleton className="h-4 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </section>

        {/* CTA */}
        <Skeleton className="h-14 rounded-xl" />
      </main>
    </div>
  );
}
