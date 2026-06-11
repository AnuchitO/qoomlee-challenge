"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";

// ── helpers ───────────────────────────────────────────────────────────────────

const todayISO = () => new Date().toISOString().split("T")[0];

const parseISO = (iso: string): [number, number, number] => {
  const [y, m, d] = iso.split("-").map(Number);
  return [y, m - 1, d];
};

const toISO = (y: number, m: number, d: number) =>
  `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

const shiftMonth = (y: number, m: number, n: number): [number, number] => {
  const dt = new Date(y, m + n);
  return [dt.getFullYear(), dt.getMonth()];
};

const monthLabel = (y: number, m: number) =>
  new Date(y, m).toLocaleDateString("en-US", { month: "long", year: "numeric" });

const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
const firstDayOffset = (y: number, m: number) => (new Date(y, m, 1).getDay() + 6) % 7; // Mon=0

const addDays = (iso: string, n: number): string => {
  const [y, m, d] = parseISO(iso);
  const dt = new Date(y, m, d + n);
  return toISO(dt.getFullYear(), dt.getMonth(), dt.getDate());
};

// ── MonthGrid ─────────────────────────────────────────────────────────────────

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SUN_IDX = 6;
const SAT_IDX = 5;

interface MonthGridProps {
  year: number;
  month: number;
  today: string;
  start: string | null;
  end: string | null;
  hover: string | null;
  step: "departure" | "return";
  focusedIso: string | null;
  onDay: (iso: string) => void;
  onHover: (iso: string | null) => void;
}

function MonthGrid({
  year,
  month,
  today,
  start,
  end,
  hover,
  step,
  focusedIso,
  onDay,
  onHover,
}: MonthGridProps) {
  const count = daysInMonth(year, month);
  const offset = firstDayOffset(year, month);
  const cells: (number | null)[] = [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: count }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  const rangeEnd = step === "return" ? (hover ?? end) : end;

  return (
    <div className="select-none min-w-[308px]">
      <p className="text-title-sm font-bold text-center text-primary mb-4">
        {monthLabel(year, month)}
      </p>
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d, i) => (
          <div
            key={d}
            className={`text-center text-label-xs py-1 font-medium ${
              i === SUN_IDX
                ? "text-error/70"
                : i === SAT_IDX
                  ? "text-on-surface-variant/70"
                  : "text-on-surface-variant"
            }`}
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e${idx}`} className="h-10" />;

          const iso = toISO(year, month, day);
          const isPast = iso < today;
          const blockedReturn = step === "return" && start != null && iso < start;
          const disabled = isPast || blockedReturn;
          const col = idx % 7; // 0=Mon … 6=Sun
          const isSunday = col === SUN_IDX;
          const isSaturday = col === SAT_IDX;
          const isRowStart = col === 0;
          const isRowEnd = col === SUN_IDX;

          const isStart = iso === start;
          const isEnd = iso === end;
          const isHoverEnd = step === "return" && iso === hover && !disabled;
          const isSelected = isStart || isEnd;
          const isToday = iso === today;
          const isFocused = iso === focusedIso;

          const sameDay = start === rangeEnd;
          const inBand =
            !sameDay && start != null && rangeEnd != null && iso > start && iso < rangeEnd;
          const isBandStart = !sameDay && isStart && rangeEnd != null;
          const isBandEnd = !sameDay && (isEnd || isHoverEnd) && start != null && iso !== start;

          // Band tint colour
          const bandCls = "bg-primary/15";

          return (
            <div key={iso} className="relative h-10 flex items-center justify-center">
              {/* continuous band — round at row boundaries */}
              {inBand && (
                <div
                  className={[
                    `absolute inset-0 ${bandCls}`,
                    isRowStart ? "rounded-l-full" : "",
                    isRowEnd ? "rounded-r-full" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                />
              )}
              {/* half-band for range start (right half) */}
              {isBandStart && <div className={`absolute inset-y-0 left-1/2 right-0 ${bandCls}`} />}
              {/* half-band for range end (left half) */}
              {isBandEnd && <div className={`absolute inset-y-0 left-0 right-1/2 ${bandCls}`} />}

              <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && onDay(iso)}
                onMouseEnter={() => !disabled && onHover(iso)}
                onMouseLeave={() => onHover(null)}
                className={[
                  "relative z-10 w-10 h-10 rounded-full flex flex-col items-center justify-center transition-colors leading-none",
                  // disabled: faded
                  disabled ? "opacity-30 cursor-default" : "cursor-pointer",
                  // selected circle
                  isSelected ? "bg-primary text-on-primary font-semibold text-body-sm" : "",
                  // today ring
                  isToday && !isSelected
                    ? "ring-1 ring-primary text-primary font-medium text-body-sm"
                    : "",
                  // keyboard focus ring
                  isFocused && !isSelected ? "ring-2 ring-primary/60 ring-offset-1" : "",
                  // hover
                  !isSelected && !disabled ? "hover:bg-primary/20" : "",
                  // day text colour
                  !isSelected && !disabled && !isToday
                    ? isSunday
                      ? "text-error/80 text-body-sm"
                      : isSaturday
                        ? "text-on-surface-variant text-body-sm"
                        : "text-on-surface text-body-sm"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span>{day}</span>
                {isToday && (
                  <span
                    className={`text-[7px] leading-none font-semibold mt-0.5 ${isSelected ? "text-on-primary/80" : "text-primary"}`}
                  >
                    Today
                  </span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── DateRangePicker ───────────────────────────────────────────────────────────

export interface Props {
  departureDate: string | null;
  returnDate: string | null;
  isReturnEnabled: boolean;
  departureError?: string;
  returnError?: string;
  onDepartureChange: (d: string | null) => void;
  onReturnChange: (d: string | null) => void;
  onAddReturn?: () => void;
  boxMinHeight?: number;
}

const PLUS_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="shrink-0">
    <path
      d="M12 4.25C12.4142 4.25 12.75 4.58579 12.75 5V11.25H19C19.4142 11.25 19.75 11.5858 19.75 12C19.75 12.4142 19.4142 12.75 19 12.75H12.75V19C12.75 19.4142 12.4142 19.75 12 19.75C11.5858 19.75 11.25 19.4142 11.25 19V12.75H5C4.58579 12.75 4.25 12.4142 4.25 12C4.25 11.5858 4.58579 11.25 5 11.25H11.25V5C11.25 4.58579 11.5858 4.25 12 4.25Z"
      fill="currentColor"
      className="text-primary"
    />
  </svg>
);

export default function DateRangePicker({
  departureDate,
  returnDate,
  isReturnEnabled,
  departureError,
  returnError,
  onDepartureChange,
  onReturnChange,
  onAddReturn,
  boxMinHeight,
}: Props) {
  const today = todayISO();
  const now = new Date();

  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"departure" | "return">("departure");
  const [hover, setHover] = useState<string | null>(null);
  const [viewY, setViewY] = useState(now.getFullYear());
  const [viewM, setViewM] = useState(now.getMonth());
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [desktopPos, setDesktopPos] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [focusedIso, setFocusedIso] = useState<string | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // SSR-safe portal mounting — setState in empty-dep effect is intentional here
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Close on outside click or scroll (desktop only)
  useEffect(() => {
    if (!open || isMobile) return;
    const close = (e: MouseEvent) => {
      const inTrigger = wrapRef.current?.contains(e.target as Node);
      const inPanel = panelRef.current?.contains(e.target as Node);
      if (!inTrigger && !inPanel) {
        setOpen(false);
        setHover(null);
      }
    };
    const onScroll = () => {
      setOpen(false);
      setHover(null);
    };
    document.addEventListener("mousedown", close);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("mousedown", close);
      window.removeEventListener("scroll", onScroll);
    };
  }, [open, isMobile]);

  // Auto-advance view when keyboard focus moves outside visible months
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    if (!focusedIso || !open) return;
    const [fy, fm] = parseISO(focusedIso);
    const focused = new Date(fy, fm);
    const [ny, nm] = shiftMonth(viewY, viewM, 1);
    if (focused < new Date(viewY, viewM)) {
      const [py, pm] = shiftMonth(viewY, viewM, -1);
      if (new Date(py, pm) >= new Date(now.getFullYear(), now.getMonth())) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setViewY(py);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setViewM(pm);
      }
    } else if (focused > new Date(ny, nm)) {
      const [ay, am] = shiftMonth(viewY, viewM, 1);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setViewY(ay);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setViewM(am);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedIso]);

  // Focus panel when it opens (desktop)
  useEffect(() => {
    if (open && !isMobile) {
      requestAnimationFrame(() => panelRef.current?.focus());
    }
  }, [open, isMobile]);

  // ── position helper ─────────────────────────────────────────────────────────

  const computePos = useCallback(() => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const panelW = 760;
    const margin = 12;
    const rawLeft = rect.left + window.scrollX;
    const clampedLeft = Math.max(
      margin,
      Math.min(rawLeft, window.innerWidth - panelW - margin + window.scrollX),
    );
    setDesktopPos({ top: rect.bottom + window.scrollY + 8, left: clampedLeft });
  }, []);

  // ── open calendar ───────────────────────────────────────────────────────────

  const openCalendar = (targetStep: "departure" | "return") => {
    const ref = targetStep === "departure" ? departureDate : (departureDate ?? null);
    if (ref) {
      const [y, m] = parseISO(ref);
      setViewY(y);
      setViewM(m);
    } else {
      setViewY(now.getFullYear());
      setViewM(now.getMonth());
    }
    computePos();
    setFocusedIso(
      targetStep === "departure"
        ? (departureDate ?? today)
        : (returnDate ?? departureDate ?? today),
    );
    setStep(targetStep);
    setOpen(true);
  };

  // ── day selection ───────────────────────────────────────────────────────────

  const handleDay = (iso: string) => {
    if (step === "departure") {
      onDepartureChange(iso);
      if (returnDate && iso >= returnDate) onReturnChange(null);
      if (isReturnEnabled) {
        setStep("return");
        setFocusedIso(returnDate ?? iso);
      } else {
        setOpen(false);
        setFocusedIso(null);
      }
    } else {
      onReturnChange(iso);
      setOpen(false);
      setHover(null);
      setFocusedIso(null);
    }
  };

  // ── keyboard navigation ─────────────────────────────────────────────────────

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) return;
    const cur = focusedIso ?? today;
    switch (e.key) {
      case "ArrowLeft":
        e.preventDefault();
        setFocusedIso(addDays(cur, -1));
        break;
      case "ArrowRight":
        e.preventDefault();
        setFocusedIso(addDays(cur, 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIso(addDays(cur, -7));
        break;
      case "ArrowDown":
        e.preventDefault();
        setFocusedIso(addDays(cur, 7));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (focusedIso && focusedIso >= today) handleDay(focusedIso);
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        setHover(null);
        setFocusedIso(null);
        break;
    }
  };

  const [ny, nm] = shiftMonth(viewY, viewM, 1);

  const prevDisabled = (() => {
    const [py, pm] = shiftMonth(viewY, viewM, -1);
    return new Date(py, pm) < new Date(now.getFullYear(), now.getMonth());
  })();

  const boxStyle = boxMinHeight ? { minHeight: boxMinHeight } : undefined;

  const formatTrigger = (iso: string | null) => {
    if (!iso) return <span className="text-on-surface-variant text-body-sm">Select date</span>;
    const [y, m, d] = parseISO(iso);
    const dt = new Date(y, m, d);
    const dow = dt.toLocaleDateString("en-US", { weekday: "short" });
    const mon = dt.toLocaleDateString("en-US", { month: "short" });
    return (
      <span className="text-body-md text-on-surface font-medium truncate">
        {dow}, {d} {mon} {y}
      </span>
    );
  };

  const fieldClass = (error: boolean, active: boolean) =>
    [
      "flex items-center gap-sm border rounded-xl px-md cursor-pointer bg-surface-bright transition-colors min-h-[56px]",
      active
        ? "border-primary ring-1 ring-primary/20"
        : error
          ? "border-error"
          : "border-outline-variant",
    ].join(" ");

  // ── nav button ──────────────────────────────────────────────────────────────

  const navBtn = (label: string, disabled: boolean, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="p-1.5 rounded-full hover:bg-surface-container-high disabled:opacity-25 transition-colors shrink-0"
    >
      <span className="material-symbols-outlined text-[20px] text-on-surface-variant">
        {label === "Previous month" ? "chevron_left" : "chevron_right"}
      </span>
    </button>
  );

  // ── calendar panel ──────────────────────────────────────────────────────────

  const monthsBlock = (
    <div className="flex items-start gap-1">
      {navBtn("Previous month", prevDisabled, () => {
        if (prevDisabled) return;
        const [y, m] = shiftMonth(viewY, viewM, -1);
        setViewY(y);
        setViewM(m);
      })}
      <div className="flex-1 md:flex md:gap-4">
        <div className="flex-1">
          <MonthGrid
            year={viewY}
            month={viewM}
            today={today}
            start={departureDate}
            end={returnDate}
            hover={hover}
            step={step}
            focusedIso={focusedIso}
            onDay={handleDay}
            onHover={setHover}
          />
        </div>
        <div className="hidden md:block w-px bg-outline-variant self-stretch" />
        <div className="flex-1 mt-6 md:mt-0">
          <MonthGrid
            year={ny}
            month={nm}
            today={today}
            start={departureDate}
            end={returnDate}
            hover={hover}
            step={step}
            focusedIso={focusedIso}
            onDay={handleDay}
            onHover={setHover}
          />
        </div>
      </div>
      {navBtn("Next month", false, () => {
        const [y, m] = shiftMonth(viewY, viewM, 1);
        setViewY(y);
        setViewM(m);
      })}
    </div>
  );

  const panel = (
    <div
      className="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant p-4
                 animate-[calendar-in_150ms_ease-out]"
    >
      {isMobile && (
        <p className="text-label-sm text-on-surface-variant text-center mb-3">
          {step === "departure" ? "Select departure date" : "Select return date"}
        </p>
      )}
      {monthsBlock}
      {isMobile && (
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setHover(null);
            setFocusedIso(null);
          }}
          className="mt-4 w-full py-3 bg-primary text-on-primary rounded-xl text-label-md font-semibold"
        >
          Done
        </button>
      )}
    </div>
  );

  return (
    <div ref={wrapRef} className="grid grid-cols-2 gap-md">
      {/* departure trigger */}
      <div className="space-y-sm">
        <label className="block text-label-sm text-on-surface-variant px-1">Departure date</label>
        <div
          role="button"
          tabIndex={0}
          onClick={() => openCalendar("departure")}
          onKeyDown={(e) => e.key === "Enter" && openCalendar("departure")}
          style={boxStyle}
          className={fieldClass(!!departureError, open && step === "departure")}
          data-testid="departure-trigger"
        >
          <span className="material-symbols-outlined text-outline text-[20px] shrink-0">
            calendar_today
          </span>
          {formatTrigger(departureDate)}
        </div>
        {departureError && <p className="text-label-sm text-error px-1">{departureError}</p>}
      </div>

      {/* return trigger / add return */}
      <div className="space-y-sm">
        <label className="block text-label-sm text-on-surface-variant px-1">Return Date</label>
        {isReturnEnabled ? (
          <>
            <div
              style={boxStyle}
              className={`${fieldClass(!!returnError, open && step === "return")} pr-1`}
              data-testid="return-trigger"
            >
              <div
                role="button"
                tabIndex={0}
                onClick={() => openCalendar("return")}
                onKeyDown={(e) => e.key === "Enter" && openCalendar("return")}
                className="flex items-center gap-sm flex-1 min-w-0"
              >
                <span className="material-symbols-outlined text-[20px] shrink-0 text-outline">
                  calendar_today
                </span>
                {formatTrigger(returnDate)}
              </div>
              {returnDate && (
                <button
                  type="button"
                  aria-label="Clear return date"
                  onClick={(e) => {
                    e.stopPropagation();
                    onReturnChange(null);
                  }}
                  className="shrink-0 ml-1 p-1 rounded-full hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                    close
                  </span>
                </button>
              )}
            </div>
            {returnError && <p className="text-label-sm text-error px-1">{returnError}</p>}
          </>
        ) : (
          <button
            type="button"
            onClick={() => {
              computePos(); // fix: compute position before portal opens
              onAddReturn?.();
              setStep("return");
              setFocusedIso(departureDate ?? today);
              setOpen(true);
              if (departureDate) {
                const [y, m] = parseISO(departureDate);
                setViewY(y);
                setViewM(m);
              }
            }}
            style={boxStyle}
            className="flex items-center gap-sm border border-dashed border-outline-variant rounded-xl px-md w-full bg-surface-bright hover:bg-surface-container-high active:scale-95 transition-all cursor-pointer min-h-[56px]"
          >
            {PLUS_ICON}
            <span className="text-body-md text-primary truncate">Add return</span>
          </button>
        )}
      </div>

      {/* desktop portal */}
      {open &&
        !isMobile &&
        mounted &&
        createPortal(
          <div
            ref={panelRef}
            tabIndex={-1}
            onKeyDown={handleKeyDown}
            style={{
              position: "absolute",
              top: desktopPos.top,
              left: desktopPos.left,
              zIndex: 9999,
              outline: "none",
            }}
          >
            {panel}
          </div>,
          document.body,
        )}

      {/* mobile bottom-sheet portal */}
      {open &&
        isMobile &&
        mounted &&
        createPortal(
          <div className="fixed inset-0 z-50 flex flex-col justify-end">
            <div
              className="absolute inset-0 bg-black/40"
              onClick={() => {
                setOpen(false);
                setHover(null);
                setFocusedIso(null);
              }}
            />
            <div
              className="relative max-h-[90vh] overflow-y-auto rounded-t-3xl animate-[slide-up_250ms_ease-out]"
              onKeyDown={handleKeyDown}
            >
              {panel}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
