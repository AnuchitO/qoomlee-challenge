"use client";

import { useState, useEffect, useRef } from "react";
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

const displayDate = (iso: string) => {
  const [y, m, d] = parseISO(iso);
  return new Date(y, m, d).toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
const firstDayOffset = (y: number, m: number) => (new Date(y, m, 1).getDay() + 6) % 7; // Mon=0

// ── MonthGrid ─────────────────────────────────────────────────────────────────

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const SUN_IDX = 6; // Sunday is the last column (Mon-start grid)

interface MonthGridProps {
  year: number;
  month: number;
  today: string;
  start: string | null;
  end: string | null;
  hover: string | null;
  step: "departure" | "return";
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
    <div className="select-none min-w-[294px]">
      <p className="text-title-sm font-bold text-center text-primary mb-4">
        {monthLabel(year, month)}
      </p>
      <div className="grid grid-cols-7 gap-x-1 mb-2">
        {DAYS.map((d, i) => (
          <div
            key={d}
            className={`text-center text-label-xs py-1 font-medium ${i === SUN_IDX ? "text-error/70" : "text-on-surface-variant"}`}
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-x-1 gap-y-1">
        {cells.map((day, idx) => {
          if (!day) return <div key={`e${idx}`} className="h-10" />;

          const iso = toISO(year, month, day);
          const isPast = iso < today;
          const blockedReturn = step === "return" && start != null && iso < start;
          const disabled = isPast || blockedReturn;
          const isSunday = idx % 7 === SUN_IDX;

          const isStart = iso === start;
          const isEnd = iso === end;
          const isHoverEnd = step === "return" && iso === hover && !disabled;
          const isSelected = isStart || isEnd;

          const sameDay = start === rangeEnd;
          const inBand =
            !sameDay && start != null && rangeEnd != null && iso > start && iso < rangeEnd;
          const isBandStart = !sameDay && isStart && rangeEnd != null;
          const isBandEnd = !sameDay && (isEnd || isHoverEnd) && start != null && iso !== start;

          return (
            <div key={iso} className="relative h-10 flex items-center justify-center">
              {inBand && <div className="absolute inset-0 bg-primary/10" />}
              {isBandStart && <div className="absolute inset-y-0 left-1/2 right-0 bg-primary/10" />}
              {isBandEnd && <div className="absolute inset-y-0 left-0 right-1/2 bg-primary/10" />}
              <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && onDay(iso)}
                onMouseEnter={() => !disabled && onHover(iso)}
                onMouseLeave={() => onHover(null)}
                className={[
                  "relative z-10 w-10 h-10 rounded-full flex items-center justify-center text-body-sm transition-colors",
                  disabled ? "text-outline-variant cursor-default" : "cursor-pointer",
                  isSelected ? "bg-primary text-on-primary font-semibold" : "",
                  iso === today && !isSelected
                    ? "ring-1 ring-primary text-primary font-medium"
                    : "",
                  !isSelected && !disabled ? "hover:bg-primary/20" : "",
                  !isSelected && !disabled && iso !== today
                    ? isSunday
                      ? "text-error/80"
                      : "text-on-surface"
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {day}
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
  const wrapRef = useRef<HTMLDivElement>(null);

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
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
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

  const openCalendar = (targetStep: "departure" | "return") => {
    const ref = targetStep === "departure" ? departureDate : departureDate;
    if (ref) {
      const [y, m] = parseISO(ref);
      setViewY(y);
      setViewM(m);
    } else {
      setViewY(now.getFullYear());
      setViewM(now.getMonth());
    }
    // Compute clamped desktop position before opening
    if (wrapRef.current) {
      const rect = wrapRef.current.getBoundingClientRect();
      const panelW = 740; // matches rendered width of dual-month panel
      const gap = 8;
      const margin = 12;
      const rawLeft = rect.left + window.scrollX;
      const clampedLeft = Math.max(
        margin,
        Math.min(rawLeft, window.innerWidth - panelW - margin + window.scrollX),
      );
      setDesktopPos({ top: rect.bottom + window.scrollY + gap, left: clampedLeft });
    }
    setStep(targetStep);
    setOpen(true);
  };

  const handleDay = (iso: string) => {
    if (step === "departure") {
      onDepartureChange(iso);
      if (returnDate && iso >= returnDate) onReturnChange(null);
      if (isReturnEnabled) {
        setStep("return");
      } else {
        setOpen(false);
      }
    } else {
      onReturnChange(iso);
      setOpen(false);
      setHover(null);
    }
  };

  const [ny, nm] = shiftMonth(viewY, viewM, 1);

  const prevDisabled = (() => {
    const [py, pm] = shiftMonth(viewY, viewM, -1);
    return new Date(py, pm) < new Date(now.getFullYear(), now.getMonth());
  })();

  const boxStyle = boxMinHeight ? { minHeight: boxMinHeight } : undefined;
  const showReturn = isReturnEnabled || (open && step === "return");

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

  // ── calendar panel ────────────────────────────────────────────────────────

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

  const panel = (
    <div className="bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant p-4">
      {/* mobile step hint */}
      {isMobile && (
        <p className="text-label-sm text-on-surface-variant text-center mb-3">
          {step === "departure" ? "Select departure date" : "Select return date"}
        </p>
      )}

      {/* months with nav arrows flanking */}
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

      {/* mobile done */}
      {isMobile && (
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setHover(null);
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
              onAddReturn?.();
              setStep("return");
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

      {/* desktop portal — positioned with getBoundingClientRect so it never overflows */}
      {open &&
        !isMobile &&
        mounted &&
        createPortal(
          <div
            style={{
              position: "absolute",
              top: desktopPos.top,
              left: desktopPos.left,
              zIndex: 9999,
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
              }}
            />
            <div className="relative max-h-[90vh] overflow-y-auto rounded-t-3xl">{panel}</div>
          </div>,
          document.body,
        )}
    </div>
  );
}
