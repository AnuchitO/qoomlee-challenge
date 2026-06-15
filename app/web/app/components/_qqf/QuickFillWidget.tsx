"use client";

import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";

export interface QuickFillOption {
  id: string;
  label: string;
  onSelect: () => void;
}

interface QuickFillWidgetProps {
  title: string;
  options: QuickFillOption[];
  /** Tailwind classes for the icon's resting position, before it's dragged. */
  anchorClassName?: string;
}

const PANEL_WIDTH = 256;
const PANEL_GAP = 8;

interface DragState {
  pointerId: number;
  startX: number;
  startY: number;
  originLeft: number;
  originTop: number;
  moved: boolean;
}

export default function QuickFillWidget({
  title,
  options,
  anchorClassName = "bottom-24 right-4 md:bottom-4",
}: QuickFillWidgetProps) {
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});
  const [dragPosition, setDragPosition] = useState<{ left: number; top: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dragState = useRef<DragState | null>(null);

  // Recompute panel placement so it stays on-screen relative to the (possibly dragged) icon.
  useLayoutEffect(() => {
    if (!open || !buttonRef.current) return;

    const updatePlacement = () => {
      const rect = buttonRef.current!.getBoundingClientRect();
      const spaceAbove = rect.top;
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceRight = window.innerWidth - rect.left;

      const style: CSSProperties = { width: PANEL_WIDTH };

      if (spaceAbove >= spaceBelow) {
        style.bottom = rect.height + PANEL_GAP;
      } else {
        style.top = rect.height + PANEL_GAP;
      }

      if (spaceRight >= PANEL_WIDTH) {
        style.left = 0;
      } else {
        style.right = 0;
      }

      setPanelStyle(style);
    };

    updatePlacement();
    window.addEventListener("resize", updatePlacement);
    return () => window.removeEventListener("resize", updatePlacement);
  }, [open, dragPosition]);

  // Close on click/tap or keyboard focus outside the widget.
  useLayoutEffect(() => {
    if (!open) return;

    const isOutside = (target: EventTarget | null) =>
      containerRef.current && target instanceof Node && !containerRef.current.contains(target);

    const handlePointerDown = (e: PointerEvent) => {
      if (isOutside(e.target)) setOpen(false);
    };
    const handleFocusIn = (e: FocusEvent) => {
      if (isOutside(e.target)) setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("focusin", handleFocusIn);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("focusin", handleFocusIn);
    };
  }, [open]);

  const handlePointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const rect = containerRef.current!.getBoundingClientRect();
    dragState.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originLeft: rect.left,
      originTop: rect.top,
      moved: false,
    };
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragState.current;
    if (!drag) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < 6) return;

    if (!drag.moved) {
      drag.moved = true;
      e.currentTarget.setPointerCapture(drag.pointerId);
    }

    const rect = containerRef.current!.getBoundingClientRect();
    const maxLeft = Math.max(window.innerWidth - rect.width, 0);
    const maxTop = Math.max(window.innerHeight - rect.height, 0);

    setDragPosition({
      left: Math.min(Math.max(drag.originLeft + dx, 0), maxLeft),
      top: Math.min(Math.max(drag.originTop + dy, 0), maxTop),
    });
  };

  const handlePointerUp = () => {
    dragState.current = null;
  };

  const handleToggle = () => {
    if (dragState.current?.moved) return;
    setOpen((o) => !o);
  };

  const containerStyle: CSSProperties = dragPosition
    ? { left: dragPosition.left, top: dragPosition.top }
    : {};
  const positionClassName = dragPosition ? "" : anchorClassName;

  return (
    <div
      ref={containerRef}
      style={containerStyle}
      className={`fixed z-50 font-mono text-xs ${positionClassName}`}
    >
      {open && (
        <div
          style={panelStyle}
          className="absolute rounded-lg border-2 border-dashed border-amber-500 bg-amber-50 p-3 shadow-lg"
        >
          <p className="mb-2 font-bold text-amber-900">{title}</p>
          <ul className="space-y-1">
            {options.map((option) => (
              <li key={option.id}>
                <button
                  type="button"
                  onClick={option.onSelect}
                  className="w-full rounded border border-amber-400 bg-white px-2 py-1 text-left text-amber-900 hover:bg-amber-100"
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        aria-label="Toggle QA Quick-fill"
        className="relative flex h-10 w-10 touch-none cursor-grab items-center justify-center rounded-full border-2 border-dashed border-amber-500 bg-amber-100 text-amber-900 shadow-lg hover:bg-amber-200 active:cursor-grabbing"
      >
        <span className="material-symbols-outlined text-[20px]">science</span>
      </button>
    </div>
  );
}
