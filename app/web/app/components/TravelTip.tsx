export default function TravelTip() {
  return (
    <section className="mt-xl px-container-margin-mobile">
      <div className="bg-tertiary-fixed text-on-tertiary-fixed rounded-xl p-lg flex items-center gap-md border border-tertiary/10">
        <div className="bg-tertiary-container text-on-tertiary-container w-12 h-12 rounded-full flex items-center justify-center shrink-0">
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            lightbulb
          </span>
        </div>
        <div>
          <h3 className="text-label-md text-on-tertiary-fixed-variant">
            Travel Tip
          </h3>
          <p className="text-label-sm">
            Book at least 3 weeks in advance for the best rates to Southeast
            Asia.
          </p>
        </div>
      </div>
    </section>
  );
}
