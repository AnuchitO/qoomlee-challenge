import { Skeleton } from "../../../components/skeletons/Skeleton";
import BottomNav from "../../../components/BottomNav";
import { FlightListSkeleton } from "./FlightListSkeleton";

export function ResultsPageSkeleton() {
  return (
    <>
      <header className="sticky top-0 z-50 bg-surface-container-low border-b border-outline-variant shadow-sm h-16 flex justify-between items-center w-full px-container-margin-mobile">
        <div className="flex items-center gap-md">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="h-8 w-40 rounded-full" />
        </div>
        <Skeleton className="h-4 w-10" />
      </header>
      <main className="max-w-screen-md mx-auto px-container-margin-mobile pt-md pb-28">
        <FlightListSkeleton />
      </main>
      <BottomNav />
    </>
  );
}
