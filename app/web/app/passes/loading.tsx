import TopAppBar from "../components/TopAppBar";
import BottomNav from "../components/BottomNav";
import { PassesListSkeleton } from "./_skeleton/PassesListSkeleton";

export default function PassesLoading() {
  return (
    <>
      <TopAppBar />
      <main className="pb-28 md:pb-8 max-w-2xl mx-auto px-container-margin-mobile md:px-container-margin-desktop py-lg">
        <PassesListSkeleton />
      </main>
      <BottomNav />
    </>
  );
}
