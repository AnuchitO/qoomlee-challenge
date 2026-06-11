"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AIRPORTS, Airport, findAirport } from "../data/airports";

interface Props {
  value: string;
  onChange: (code: string) => void;
  icon: string;
  placeholder: string;
  error?: string;
  excludeCode?: string;
  /** Strip border/bg so the component sits inside a parent card (mobile stacked card) */
  borderless?: boolean;
}

export default function AirportSelect({
  value,
  onChange,
  icon,
  placeholder,
  error,
  excludeCode,
  borderless = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [query, setQuery] = useState("");

  const containerRef = useRef<HTMLDivElement>(null);
  // Separate ref for the portal sheet so the outside-click handler can exclude it
  const sheetRef = useRef<HTMLDivElement>(null);
  const desktopSearchRef = useRef<HTMLInputElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  const selected = value ? findAirport(value) : undefined;

  const filtered = AIRPORTS.filter((a) => {
    if (a.code === excludeCode) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      a.code.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q)
    );
  });

  // Close desktop dropdown on outside click.
  // Must also allow clicks inside the portal sheet (sheetRef) since it lives
  // outside containerRef in the DOM.
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideTrigger = containerRef.current?.contains(target) ?? false;
      const insideSheet = sheetRef.current?.contains(target) ?? false;
      if (!insideTrigger && !insideSheet) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Focus search inputs and trigger bottom sheet slide-up when opening.
  // The cleanup runs when `open` flips back to false, resetting the
  // search query and sheet visibility for the next time it opens.
  useEffect(() => {
    if (!open) return;
    const dt = setTimeout(() => desktopSearchRef.current?.focus(), 30);
    requestAnimationFrame(() => setSheetVisible(true));
    const mt = setTimeout(() => mobileSearchRef.current?.focus(), 350);
    return () => {
      clearTimeout(dt);
      clearTimeout(mt);
      setQuery("");
      setSheetVisible(false);
    };
  }, [open]);

  const closeSheet = () => {
    setSheetVisible(false);
    setTimeout(() => {
      setOpen(false);
      setQuery("");
    }, 280);
  };

  const handleSelect = (airport: Airport) => {
    onChange(airport.code);
    setSheetVisible(false);
    setOpen(false);
    setQuery("");
  };

  // Airport list rows — rendered as plain JSX (not as a component) to avoid
  // React unmounting/remounting on every render due to inline component identity
  const airportRows =
    filtered.length === 0 ? (
      <p className="px-4 py-4 text-body-md text-on-surface-variant">No airports found</p>
    ) : (
      filtered.map((airport) => (
        <button
          key={airport.code}
          type="button"
          onClick={() => handleSelect(airport)}
          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-surface-container-high transition-colors text-left ${
            airport.code === value ? "bg-primary-container/40" : ""
          }`}
        >
          <span className="material-symbols-outlined text-on-surface-variant shrink-0 text-[20px]">
            flight
          </span>
          <span className="min-w-0 flex flex-col">
            <span className="flex items-baseline gap-2 flex-wrap">
              <span className="font-semibold text-body-md text-on-surface">{airport.name}</span>
              <span className="text-body-sm text-on-surface-variant">{airport.code}</span>
            </span>
            <span className="text-label-sm text-on-surface-variant">
              {airport.city}, {airport.country}
            </span>
          </span>
        </button>
      ))
    );

  const triggerBoxed = `border rounded-xl px-md min-h-[70px] bg-surface-bright hover:border-outline ${
    open ? "border-primary ring-1 ring-primary" : error ? "border-error" : "border-outline-variant"
  }`;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* ── Trigger ── */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center gap-sm text-left transition-colors cursor-pointer ${borderless ? "py-1" : triggerBoxed}`}
      >
        <span className="material-symbols-outlined text-primary shrink-0 text-[20px]">{icon}</span>
        {selected ? (
          <span className="min-w-0 flex-1 py-1 flex flex-col">
            <span className="font-semibold text-body-md text-on-surface truncate leading-snug">
              {selected.city} ({selected.code})
            </span>
            <span className="text-label-sm text-on-surface-variant truncate leading-snug mt-0.5">
              {selected.name}
            </span>
          </span>
        ) : (
          <span className="text-body-md text-outline flex-1">{placeholder}</span>
        )}
      </button>

      {/* ── Desktop dropdown ── */}
      {open && (
        <div className="hidden md:flex flex-col absolute z-50 top-full mt-1 left-0 w-full min-w-[260px] max-h-72 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant overflow-hidden">
          <div className="p-2 border-b border-outline-variant shrink-0">
            <input
              ref={desktopSearchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search airports or cities…"
              className="w-full bg-surface-bright border border-outline-variant rounded-lg px-3 py-2 text-body-md focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {!query && (
              <p className="px-4 pt-3 pb-1 text-label-sm text-on-surface-variant font-medium">
                Popular Cities or Airports
              </p>
            )}
            {airportRows}
          </div>
        </div>
      )}

      {/* ── Mobile bottom sheet via portal ── */}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div className="md:hidden fixed inset-0 z-[200] flex flex-col justify-end">
            {/* Backdrop */}
            <div
              className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${sheetVisible ? "opacity-100" : "opacity-0"}`}
              onClick={closeSheet}
            />
            {/* Sheet — ref lets the outside-click handler know clicks here are intentional */}
            <div
              ref={sheetRef}
              className={`relative bg-surface-container-lowest rounded-t-2xl flex flex-col max-h-[78vh] transition-transform duration-300 ease-out ${
                sheetVisible ? "translate-y-0" : "translate-y-full"
              }`}
            >
              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-2 shrink-0">
                <div className="w-10 h-1 rounded-full bg-outline-variant" />
              </div>
              {/* Header + search */}
              <div className="px-4 pb-3 border-b border-outline-variant shrink-0">
                <p className="text-title-sm font-semibold text-on-surface mb-3">
                  {icon === "flight_takeoff" ? "Flying from" : "Flying to"}
                </p>
                <input
                  ref={mobileSearchRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search airports or cities…"
                  className="w-full bg-surface-bright border border-outline-variant rounded-xl px-4 py-3 text-body-md focus:ring-1 focus:ring-primary focus:border-primary focus:outline-none"
                />
              </div>
              {/* Airport list */}
              <div className="overflow-y-auto flex-1">
                {!query && (
                  <p className="px-4 pt-3 pb-1 text-label-sm text-on-surface-variant font-medium">
                    Popular Cities or Airports
                  </p>
                )}
                {airportRows}
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
