import { AppError, NetworkError, ApiError, ValidationError } from "../errors/AppError";
import { Flight } from "../types/flight";
import { isValidFlight, safeParseArray } from "../types/safe-types";

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
export async function fetchFlightsSafe(
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

    return safeParseArray(response.flights, isValidFlight);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError("Failed to fetch flights", "FLIGHT_FETCH_ERROR", { error });
  }
}
