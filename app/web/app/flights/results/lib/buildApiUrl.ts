interface SearchParams {
  origin: string;
  destination: string;
  departure: string;
  passengers: string;
}

export function buildApiUrl(params: SearchParams): string {
  const base = process.env.NEXT_PUBLIC_QOOMLEE_API_URL ?? "http://localhost:8082";

  const query = new URLSearchParams({
    origin: params.origin,
    destination: params.destination,
    date: params.departure,
    passengers: params.passengers,
  });

  return `${base}/api/flights/search?${query.toString()}`;
}
