import { Skeleton } from "../../../components/skeletons/Skeleton";
import TopAppBar from "../../../components/TopAppBar";
import BottomNav from "../../../components/BottomNav";

export function BookingDetailSkeleton() {
  return (
    <>
      <TopAppBar />
      <main className="pb-24 max-w-6xl mx-auto px-container-margin-mobile md:px-container-margin-desktop py-lg space-y-lg">
        {/* Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-md">
          <div className="space-y-xs">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-8 w-48" />
          </div>
        </section>

        {/* Booking selector */}
        <section className="bg-surface-container-low border border-outline-variant rounded-xl p-md flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-md">
            <Skeleton className="w-10 h-10 rounded-lg" />
            <div className="space-y-xs">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-9 w-24 rounded-lg" />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* Trip details */}
          <div className="lg:col-span-2 space-y-md">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              <Skeleton className="h-12" />
              <div className="p-md space-y-md">
                <div className="flex items-center justify-between">
                  <div className="space-y-xs">
                    <Skeleton className="h-7 w-12" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                  <div className="space-y-xs text-right flex flex-col items-end">
                    <Skeleton className="h-7 w-12" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="border-t border-outline-variant pt-md grid grid-cols-2 gap-md">
                  <div className="space-y-sm">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                  <div className="space-y-sm">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-10" />
            </div>
          </div>

          {/* Management options */}
          <div className="space-y-md">
            <Skeleton className="h-3 w-32 ml-xs" />
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-sm">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </main>
      <BottomNav />
    </>
  );
}
