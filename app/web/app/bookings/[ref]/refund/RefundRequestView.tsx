import Link from "next/link";

interface RefundRequestViewProps {
  ref: string;
  reasons: string[];
  reason: string;
  setReason: (reason: string) => void;
  details: string;
  handleDetailsChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  confirming: boolean;
  handleSubmit: (e: React.FormEvent) => void;
}

export function RefundRequestView({
  ref,
  reasons,
  reason,
  setReason,
  details,
  handleDetailsChange,
  confirming,
  handleSubmit,
}: RefundRequestViewProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-surface-bright border-b border-outline-variant shadow-sm sticky top-0 z-50 flex items-center px-container-margin-mobile h-16">
        <Link
          href={`/bookings/${ref}`}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-container-low active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-on-surface">arrow_back</span>
        </Link>
        <h1 className="text-headline-md text-on-surface ml-md">Request Refund</h1>
      </header>

      <main className="max-w-[480px] mx-auto w-full px-container-margin-mobile py-lg pb-32 space-y-lg">
        {/* Warning */}
        <div className="bg-error-container border border-error/30 rounded-xl p-md flex gap-md items-start shadow-sm">
          <span
            className="material-symbols-outlined text-error shrink-0 mt-0.5"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            warning
          </span>
          <div>
            <p className="text-label-md text-error font-bold">Cancellation is irreversible</p>
            <p className="text-label-sm text-on-error-container mt-xs">
              Once confirmed, this booking will be cancelled. Please review the refund policy below.
            </p>
          </div>
        </div>

        {/* Booking summary */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
          <p className="text-label-sm text-on-surface-variant mb-sm uppercase tracking-wider">
            Booking
          </p>
          <h2 className="text-headline-md text-on-surface">BKK → SYD</h2>
          <p className="text-body-md text-on-surface-variant">Mon, 20 May 2024 · QQ101</p>
          <p className="text-label-sm text-on-surface-variant mt-xs">{ref}</p>
        </section>

        {/* Refund policy */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm space-y-sm">
          <h2 className="text-label-md text-on-surface-variant uppercase tracking-wider">
            Cancellation Policy
          </h2>
          {[
            {
              icon: "schedule",
              color: "text-green-600",
              text: "> 24 hours before: 80% refund (฿7,232)",
            },
            { icon: "cancel", color: "text-orange-500", text: "< 24 hours: No refund" },
            { icon: "flight_off", color: "text-error", text: "No-show: No refund" },
          ].map(({ icon, color, text }) => (
            <div key={text} className="flex items-center gap-sm">
              <span className={`material-symbols-outlined text-[20px] ${color}`}>{icon}</span>
              <p className="text-label-md text-on-surface">{text}</p>
            </div>
          ))}
          <div className="border-t border-dashed border-outline-variant/60 my-sm" />
          <div className="flex items-center justify-between">
            <span className="text-label-md text-on-surface-variant">Your refund amount:</span>
            <span className="text-headline-md text-green-600">฿7,232</span>
          </div>
        </section>

        {/* Reason for cancellation */}
        <form onSubmit={handleSubmit} className="space-y-lg">
          <section className="space-y-sm">
            <h2 className="text-label-md text-on-surface-variant">Reason for cancellation</h2>
            <div className="space-y-sm">
              {reasons.map((r) => (
                <label
                  key={r}
                  className={`flex items-center justify-between p-md rounded-xl border cursor-pointer transition-colors ${
                    reason === r
                      ? "bg-primary-fixed/10 border-2 border-primary"
                      : "bg-surface border border-outline-variant hover:bg-surface-container-low"
                  }`}
                >
                  <span className="text-label-md text-on-surface">{r}</span>
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                    className="w-5 h-5 text-primary border-outline-variant focus:ring-primary"
                  />
                </label>
              ))}
            </div>
          </section>

          {reason && (
            <section className="space-y-sm">
              <label className="text-label-md text-on-surface-variant">
                Additional details (optional)
              </label>
              <textarea
                value={details}
                onChange={handleDetailsChange}
                rows={3}
                placeholder="Tell us more about your situation..."
                className="w-full p-md rounded-xl border border-outline-variant bg-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none text-body-md resize-none transition-all"
              />
            </section>
          )}

          <button
            type="submit"
            disabled={!reason || confirming}
            className="w-full h-14 bg-error text-on-error text-label-md rounded-xl shadow-sm hover:opacity-90 active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-sm"
          >
            {confirming ? (
              <>
                <span className="material-symbols-outlined text-[20px] animate-spin">refresh</span>
                Processing...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[20px]">cancel</span>
                Cancel Booking & Request Refund
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
}
