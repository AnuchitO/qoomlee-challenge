const STEPS = ["Flights", "Seats", "Extras", "Payment"] as const;

export default function ProgressStepper() {
  return (
    <div className="flex items-start">
      {STEPS.map((label, idx) => {
        const completed = idx < 3;
        const active = idx === 3;
        return (
          <div key={label} className="flex items-start flex-1 last:flex-none">
            <div className="flex flex-col items-center min-w-0">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-label-md font-semibold shrink-0 ${
                  completed
                    ? "bg-primary text-on-primary"
                    : active
                      ? "border-2 border-primary text-primary bg-transparent"
                      : "bg-outline-variant text-on-surface-variant"
                }`}
              >
                {completed ? (
                  <span
                    className="material-symbols-outlined text-[16px]"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    check
                  </span>
                ) : (
                  idx + 1
                )}
              </div>
              <span
                className={`text-label-sm mt-1 text-center ${
                  active ? "text-primary font-semibold" : "text-on-surface-variant"
                }`}
              >
                {label}
              </span>
            </div>

            {idx < STEPS.length - 1 && (
              <div
                className={`flex-1 h-px mt-4 mx-1 ${idx < 2 ? "bg-primary" : "bg-outline-variant"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
