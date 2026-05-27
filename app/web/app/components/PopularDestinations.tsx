const destinations = [
  {
    name: "Bangkok",
    price: "From $299",
    badge: "Trending",
    large: true,
    src: "/destinations/bangkok.jpg",
  },
  {
    name: "Sydney",
    price: "From $450",
    large: false,
    src: "/destinations/sydney.jpg",
  },
  {
    name: "Singapore",
    price: "From $199",
    large: false,
    src: "/destinations/singapore.jpg",
  },
];

export default function PopularDestinations() {
  return (
    <section className="mt-xxl px-container-margin-mobile">
      <div className="flex justify-between items-center mb-md">
        <h2 className="text-headline-md text-on-surface">
          Popular Destinations
        </h2>
        <button className="text-primary text-label-md">See All</button>
      </div>

      <div className="grid grid-cols-2 gap-md">
        {destinations.map((dest) => (
          <div
            key={dest.name}
            className={`relative ${dest.large ? "col-span-2 h-48" : "h-40"} rounded-xl overflow-hidden shadow-sm border border-outline-variant group`}
          >
            <img
              alt={dest.name}
              src={dest.src}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-md">
              <span className={`text-white ${dest.large ? "text-headline-md" : "text-label-md"}`}>
                {dest.name}
              </span>
              <span className="text-white/80 text-label-sm">{dest.price}</span>
            </div>
            {dest.badge && (
              <div className="absolute top-md right-md bg-white/20 backdrop-blur-md rounded-full px-3 py-1 border border-white/30">
                <span className="text-white text-label-md">{dest.badge}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
