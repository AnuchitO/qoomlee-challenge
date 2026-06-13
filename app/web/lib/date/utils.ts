/**
 * Utility functions for handling dates and times in the flight application
 */

import { logger } from "@/lib/logger/logger";

/**
 * Formats an ISO date string to a readable format
 * @param isoDateString - Date string in ISO format
 * @returns Formatted date string (e.g., "Mon, Oct 24, 2026")
 */
export function formatDate(isoDateString: string): string {
  try {
    const date = new Date(isoDateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (error) {
    logger.error("Error formatting date", { error });
    return isoDateString; // Return original if formatting fails
  }
}

/**
 * Formats an ISO time string to a readable format
 * @param isoTimeString - Time string in ISO format
 * @returns Formatted time string (e.g., "8:00 AM")
 */
export function formatTime(isoTimeString: string): string {
  try {
    const date = new Date(isoTimeString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch (error) {
    logger.error("Error formatting time", { error });
    return isoTimeString; // Return original if formatting fails
  }
}

/**
 * Calculates the duration between two ISO date strings
 * @param startTime - Start time in ISO format
 * @param endTime - End time in ISO format
 * @returns Duration in HH:MM format
 */
export function calculateDuration(startTime: string, endTime: string): string {
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffMs = end.getTime() - start.getTime();

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  } catch (error) {
    logger.error("Error calculating duration", { error });
    return "00:00"; // Return default if calculation fails
  }
}

/**
 * Converts minutes to a human-readable duration format
 * @param minutes - Duration in minutes
 * @returns Human-readable duration string (e.g., "3h 20m")
 */
export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours > 0 && remainingMinutes > 0) {
    return `${hours}h ${remainingMinutes}m`;
  } else if (hours > 0) {
    return `${hours}h`;
  } else {
    return `${remainingMinutes}m`;
  }
}

/**
 * Checks if a date is in the past
 * @param dateString - Date string to check
 * @returns True if the date is in the past, false otherwise
 */
export function isPastDate(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    const now = new Date();
    return date < now;
  } catch (error) {
    logger.error("Error checking if date is past", { error });
    return false; // Return false if check fails
  }
}

/**
 * Adds days to a date
 * @param date - Base date
 * @param days - Number of days to add
 * @returns New date with days added
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Gets the difference in days between two dates
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Number of days between the dates
 */
export function getDaysDifference(startDate: Date, endDate: Date): number {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}
