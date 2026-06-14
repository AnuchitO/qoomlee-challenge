import TopAppBar from "../components/TopAppBar";
import BottomNav from "../components/BottomNav";
import { BookingsListSkeleton } from "./_skeleton/BookingsListSkeleton";

export default function BookingsLoading() {
  return (
    <>
      <TopAppBar />
      <main className="pb-28 md:pb-8 max-w-2xl mx-auto px-container-margin-mobile md:px-container-margin-desktop py-lg">
        <BookingsListSkeleton />
      </main>
      <BottomNav />
    </>
  );
}
