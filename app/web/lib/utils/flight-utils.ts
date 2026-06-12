import { Flight } from "../types/flight";
import { formatTime, calculateDuration, formatDuration } from "./date-utils";
import { formatPrice } from "./price-utils";

/**
 * Utility functions for handling flight-related operations
 */

/**
 * Formats a flight's departure time
 * @param flight - Flight object
 * @returns Formatted departure time string
 */
export function formatFlightDepartureTime(flight: Flight): string {
  return formatTime(flight.departureTime);
}

/**
 * Formats a flight's arrival time
 * @param flight - Flight object
 * @returns Formatted arrival time string
 */
export function formatFlightArrivalTime(flight: Flight): string {
  return formatTime(flight.arrivalTime);
}

/**
 * Calculates and formats the duration of a flight
 * @param flight - Flight object
 * @returns Formatted duration string
 */
export function formatFlightDuration(flight: Flight): string {
  return formatDuration(flight.durationMinutes);
}

/**
 * Calculates the duration between departure and arrival times
 * @param flight - Flight object
 * @returns Duration in HH:MM format
 */
export function calculateFlightDuration(flight: Flight): string {
  return calculateDuration(flight.departureTime, flight.arrivalTime);
}

/**
 * Formats the price of a flight
 * @param flight - Flight object
 * @returns Formatted price string
 */
export function formatFlightPrice(flight: Flight): string {
  return formatPrice(flight.basePriceMinor, flight.currency);
}

/**
 * Checks if a flight has available seats
 * @param flight - Flight object
 * @param requiredSeats - Number of seats required (default: 1)
 * @returns True if enough seats are available, false otherwise
 */
export function hasAvailableSeats(flight: Flight, requiredSeats: number = 1): boolean {
  return flight.availableSeats >= requiredSeats;
}

/**
 * Checks if a flight is scheduled (not delayed or cancelled)
 * @param flight - Flight object
 * @returns True if flight is scheduled, false otherwise
 */
export function isFlightScheduled(flight: Flight): boolean {
  return flight.status === "SCHEDULED";
}

/**
 * Checks if a flight is delayed
 * @param flight - Flight object
 * @returns True if flight is delayed, false otherwise
 */
export function isFlightDelayed(flight: Flight): boolean {
  return flight.status === "DELAYED";
}

/**
 * Checks if a flight is cancelled
 * @param flight - Flight object
 * @returns True if flight is cancelled, false otherwise
 */
export function isFlightCancelled(flight: Flight): boolean {
  return flight.status === "CANCELLED";
}

/**
 * Gets a user-friendly status message for a flight
 * @param flight - Flight object
 * @returns Status message string
 */
export function getFlightStatusMessage(flight: Flight): string {
  switch (flight.status) {
    case "SCHEDULED":
      return "On time";
    case "DELAYED":
      return "Delayed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return "Unknown status";
  }
}

/**
 * Determines if a flight is in the past
 * @param flight - Flight object
 * @returns True if flight has already departed, false otherwise
 */
export function isFlightInPast(flight: Flight): boolean {
  const departureTime = new Date(flight.departureTime);
  const now = new Date();
  return departureTime < now;
}

/**
 * Filters flights based on availability
 * @param flights - Array of flight objects
 * @param requiredSeats - Number of seats required (default: 1)
 * @returns Array of flights with sufficient available seats
 */
export function filterFlightsByAvailability(
  flights: Flight[],
  requiredSeats: number = 1,
): Flight[] {
  return flights.filter((flight) => hasAvailableSeats(flight, requiredSeats));
}

/**
 * Filters flights by status
 * @param flights - Array of flight objects
 * @param status - Desired status
 * @returns Array of flights with the specified status
 */
export function filterFlightsByStatus(
  flights: Flight[],
  status: "SCHEDULED" | "DELAYED" | "CANCELLED",
): Flight[] {
  return flights.filter((flight) => flight.status === status);
}

/**
 * Sorts flights by price (ascending)
 * @param flights - Array of flight objects
 * @returns Sorted array of flights
 */
export function sortFlightsByPrice(flights: Flight[]): Flight[] {
  return [...flights].sort((a, b) => compareFlightsByPrice(a, b));
}

/**
 * Sorts flights by departure time (earliest first)
 * @param flights - Array of flight objects
 * @returns Sorted array of flights
 */
export function sortFlightsByDepartureTime(flights: Flight[]): Flight[] {
  return [...flights].sort((a, b) => compareFlightsByDepartureTime(a, b));
}

/**
 * Sorts flights by duration (shortest first)
 * @param flights - Array of flight objects
 * @returns Sorted array of flights
 */
export function sortFlightsByDuration(flights: Flight[]): Flight[] {
  return [...flights].sort((a, b) => compareFlightsByDuration(a, b));
}

/**
 * Compares two flights by price
 * @param flightA - First flight
 * @param flightB - Second flight
 * @returns Comparison result (-1, 0, or 1)
 */
export function compareFlightsByPrice(flightA: Flight, flightB: Flight): number {
  if (flightA.basePriceMinor < flightB.basePriceMinor) return -1;
  if (flightA.basePriceMinor > flightB.basePriceMinor) return 1;
  return 0;
}

/**
 * Compares two flights by departure time
 * @param flightA - First flight
 * @param flightB - Second flight
 * @returns Comparison result (-1, 0, or 1)
 */
export function compareFlightsByDepartureTime(flightA: Flight, flightB: Flight): number {
  const timeA = new Date(flightA.departureTime).getTime();
  const timeB = new Date(flightB.departureTime).getTime();

  if (timeA < timeB) return -1;
  if (timeA > timeB) return 1;
  return 0;
}

/**
 * Compares two flights by duration
 * @param flightA - First flight
 * @param flightB - Second flight
 * @returns Comparison result (-1, 0, or 1)
 */
export function compareFlightsByDuration(flightA: Flight, flightB: Flight): number {
  if (flightA.durationMinutes < flightB.durationMinutes) return -1;
  if (flightA.durationMinutes > flightB.durationMinutes) return 1;
  return 0;
}

/**
 * Groups flights by departure hour
 * @param flights - Array of flight objects
 * @returns Object mapping hour to array of flights
 */
export function groupFlightsByDepartureHour(flights: Flight[]): Record<number, Flight[]> {
  const grouped: Record<number, Flight[]> = {};

  flights.forEach((flight) => {
    const hour = new Date(flight.departureTime).getHours();
    if (!grouped[hour]) {
      grouped[hour] = [];
    }
    grouped[hour].push(flight);
  });

  return grouped;
}

/**
 * Finds the cheapest flight in an array
 * @param flights - Array of flight objects
 * @returns Cheapest flight or null if array is empty
 */
export function findCheapestFlight(flights: Flight[]): Flight | null {
  if (flights.length === 0) return null;

  return flights.reduce((cheapest, current) =>
    current.basePriceMinor < cheapest.basePriceMinor ? current : cheapest,
  );
}

/**
 * Finds the fastest flight in an array
 * @param flights - Array of flight objects
 * @returns Fastest flight or null if array is empty
 */
export function findFastestFlight(flights: Flight[]): Flight | null {
  if (flights.length === 0) return null;

  return flights.reduce((fastest, current) =>
    current.durationMinutes < fastest.durationMinutes ? current : fastest,
  );
}
