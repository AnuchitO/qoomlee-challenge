const CABIN_LABELS: Record<string, string> = {
  economy: "Economy",
  business: "Business",
  first: "First Class",
};

interface SummaryParams {
  origin: string;
  destination: string;
  departure: string; // YYYY-MM-DD
  passengers: string;
  cabin: string;
}

export function formatSearchSummary(params: SummaryParams): string {
  const n = parseInt(params.passengers, 10);
  const passengerLabel = `${n} ${n === 1 ? "Adult" : "Adults"}`;
  const cabinLabel = CABIN_LABELS[params.cabin] ?? params.cabin;

  // Parse YYYY-MM-DD as UTC to avoid timezone-shifted day
  const [year, month, day] = params.departure.split("-").map(Number) as [number, number, number];
  const date = new Date(Date.UTC(year, month - 1, day));
  const dateLabel = date
    .toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    })
    .replace(",", "");

  return `${params.origin} → ${params.destination} · ${dateLabel} · ${passengerLabel} · ${cabinLabel}`;
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m}m`;
}
