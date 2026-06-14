import { Skeleton } from "../../../components/skeletons/Skeleton";
import BottomNav from "../../../components/BottomNav";

export function BoardingPassSkeleton() {
  return (
    <div className="min-h-screen bg-surface-bright flex flex-col">
      <header className="bg-surface-bright border-b border-outline-variant shadow-sm sticky top-0 z-50 flex justify-between items-center w-full px-container-margin-mobile py-md h-16">
        <div className="flex items-center gap-md">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="w-10 h-10 rounded-full" />
      </header>

      <main className="max-w-[375px] mx-auto px-container-margin-mobile py-lg pb-28 w-full">
        <div className="relative bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant overflow-hidden">
          {/* Pass header */}
          <Skeleton className="h-16 rounded-none" />

          {/* Route */}
          <div className="p-md space-y-sm">
            <div className="flex items-center justify-between">
              <div className="space-y-xs">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-12 flex-1 mx-md" />
              <div className="space-y-xs text-right flex flex-col items-end">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-4 w-12" />
              </div>
            </div>
            <Skeleton className="h-3 w-48" />
          </div>

          {/* Tear-off */}
          <div className="h-px bg-outline-variant/30" />

          {/* Passenger & boarding stats */}
          <div className="p-md space-y-lg">
            <div className="grid grid-cols-2 gap-y-md gap-x-md">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-lg" />
              ))}
            </div>

            {/* QR code */}
            <div className="flex flex-col items-center gap-md">
              <Skeleton className="w-44 h-44 rounded-xl" />
              <Skeleton className="h-3 w-56" />
            </div>
          </div>

          {/* Notice */}
          <div className="p-md border-t border-outline-variant space-y-xs">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-xl space-y-md">
          <Skeleton className="h-14 rounded-xl" />
          <div className="grid grid-cols-2 gap-md">
            <Skeleton className="h-12 rounded-xl" />
            <Skeleton className="h-12 rounded-xl" />
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
