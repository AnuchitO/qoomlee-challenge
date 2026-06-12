import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  SEAT_ROWS_BUSINESS,
  SEAT_ROWS_ECONOMY,
  SEAT_COLUMNS,
  mockTakenSeats,
} from "@/lib/checkin/mockSeats";

export const ROWS_BUSINESS = SEAT_ROWS_BUSINESS;
export const ROWS_ECONOMY = SEAT_ROWS_ECONOMY;
export const COLS = SEAT_COLUMNS;

export const TAKEN = new Set(mockTakenSeats);

export type SeatStatus = "available" | "selected" | "taken" | "aisle";

export function getSeatStatus(row: number, col: string, selected: string): SeatStatus {
  if (!col) return "aisle";
  const id = `${row}${col}`;
  if (id === selected) return "selected";
  if (TAKEN.has(id)) return "taken";
  return "available";
}

export const SEAT_STATUS_STYLE: Record<SeatStatus, string> = {
  available:
    "bg-surface-container-low border-2 border-outline-variant hover:border-primary hover:bg-primary-container/30 cursor-pointer active:scale-95",
  selected: "bg-primary-container border-2 border-primary cursor-pointer",
  taken:
    "bg-surface-container-highest border-2 border-outline-variant cursor-not-allowed opacity-60",
  aisle: "invisible pointer-events-none",
};

export function useSeatSelection() {
  const { ref } = useParams<{ ref: string }>();
  const router = useRouter();
  const [selected, setSelected] = useState("14A");

  function select(row: number, col: string) {
    const id = `${row}${col}`;
    if (TAKEN.has(id)) return;
    setSelected(id);
  }

  function goToCheckIn() {
    router.push(`/checkin/${ref}`);
  }

  return { ref, selected, select, goToCheckIn };
}
