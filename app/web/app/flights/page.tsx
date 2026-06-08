import type { Metadata } from "next";
import TopAppBar from "../components/TopAppBar";
import PopularDestinations from "../components/PopularDestinations";
import TravelTip from "../components/TravelTip";
import BottomNav from "../components/BottomNav";
import SearchForm from "./components/SearchForm";

export const metadata: Metadata = {
  title: "Qoomlee — Flight Search",
  description: "Search and book flights from Bangkok and beyond",
};

export default function FlightsPage() {
  return (
    <>
      <TopAppBar />
      <main className="pb-24 md:pb-8">
        {/* Hero Banner */}
        <section className="hero-gradient pt-xl pb-xxl relative overflow-hidden">
          <div className="px-container-margin-mobile md:px-container-margin-desktop max-w-6xl mx-auto relative z-10">
            <h1 className="text-headline-lg-mobile md:text-headline-lg text-white mb-xs">
              Flight Search
            </h1>
            <p className="text-body-md text-white/90">
              Find your perfect flight
            </p>
          </div>
          <div className="absolute -right-10 -bottom-4 opacity-20 rotate-12">
            <span className="material-symbols-outlined text-[120px] text-white">
              flight_takeoff
            </span>
          </div>
        </section>

        <div className="md:max-w-6xl md:mx-auto">
          <SearchForm />
          <PopularDestinations />
          <TravelTip />
        </div>
      </main>
      <BottomNav />
    </>
  );
}
