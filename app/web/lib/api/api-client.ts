import { AppError, NetworkError, ApiError, ValidationError } from "../errors/AppError";
import { Flight } from "../types/flight";

interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor(baseUrl: string, defaultHeaders: HeadersInit = {}) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...defaultHeaders,
    };
  }

  async request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path}`;
    const config: RequestInit = {
      headers: { ...this.defaultHeaders, ...options.headers },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        const errorData = await response.text();
        throw new ApiError(`API request failed: ${response.statusText}`, response.status, {
          errorData,
        });
      }

      const data = await response.json();

      return {
        data,
        status: response.status,
        headers: response.headers,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new NetworkError("Network connection failed", 0);
      }
      throw new AppError("Unexpected error during API request", "UNKNOWN_ERROR", {
        originalError: error,
      });
    }
  }

  async get<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await this.request<T>(path, { ...init, method: "GET" });
    return response.data;
  }

  async post<T, U = unknown>(path: string, body: U, init?: RequestInit): Promise<T> {
    const response = await this.request<T>(path, {
      ...init,
      method: "POST",
      body: JSON.stringify(body),
    });
    return response.data;
  }
}

// Specific API client for flights
export const flightsApiClient = new ApiClient("/api");

// Enhanced flight fetching with proper error handling
export async function fetchFlightsWithValidation(
  origin: string,
  destination: string,
  departure: string,
  passengers: number,
): Promise<Flight[]> {
  if (!origin || !destination || !departure) {
    throw new ValidationError("Missing required flight search parameters", "search");
  }

  try {
    const params = new URLSearchParams({
      origin,
      destination,
      departure,
      passengers: passengers.toString(),
    });

    const response = await flightsApiClient.get<{ flights: unknown[] }>(`/flights?${params}`);

    // Local flight validation
    function isValidFlight(value: unknown): value is Flight {
      if (typeof value !== "object" || value === null) return false;
      const f = value as Record<string, unknown>;
      return (
        typeof f.id === "number" &&
        typeof f.flightNumber === "string" &&
        typeof f.origin === "string" &&
        typeof f.destination === "string" &&
        typeof f.departureTime === "string" &&
        typeof f.arrivalTime === "string" &&
        typeof f.basePriceMinor === "number" &&
        typeof f.currency === "string" &&
        typeof f.availableSeats === "number" &&
        typeof f.status === "string" &&
        typeof f.durationMinutes === "number"
      );
    }

    return response.flights.filter(isValidFlight);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to fetch flights", "FLIGHT_FETCH_ERROR", { error });
  }
}
