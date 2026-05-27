import TopAppBar from "./components/TopAppBar";
import SearchForm from "./components/SearchForm";
import PopularDestinations from "./components/PopularDestinations";
import TravelTip from "./components/TravelTip";
import BottomNav from "./components/BottomNav";

export default function Home() {
  return (
    <>
      <TopAppBar />
      <main className="pb-24">
        {/* Hero Banner */}
        <section className="hero-gradient px-container-margin-mobile pt-xl pb-xxl relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent opacity-40" />
          <div className="relative z-10">
            <h1 className="text-headline-lg-mobile text-white mb-xs">
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

        <SearchForm />
        <PopularDestinations />
        <TravelTip />
      </main>
      <BottomNav />
    </>
  );
}
