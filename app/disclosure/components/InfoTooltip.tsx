"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface InfoTooltipProps {
  text: string;
}

/**
 * A small ⓘ icon that shows a plain-English tooltip on hover (desktop)
 * or tap (mobile). Positions itself to stay within the viewport on all
 * screen sizes, including narrow mobile screens.
 */
export default function InfoTooltip({ text }: InfoTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [above, setAbove]     = useState(false);
  const btnRef  = useRef<HTMLButtonElement>(null);
  const tipRef  = useRef<HTMLDivElement>(null);

  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const [tipWidth, setTipWidth] = useState(256);
  const [arrowOffset, setArrowOffset] = useState(128); // px position of arrow inside box

  // Close when clicking / tapping outside
  useEffect(() => {
    if (!visible) return;
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        tipRef.current && !tipRef.current.contains(e.target as Node)
      ) {
        setVisible(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [visible]);

  function updatePosition() {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();

    const MARGIN = 12;
    const TIP_W = Math.min(256, window.innerWidth - MARGIN * 2);

    // Icon horizontal center in page coordinates
    const iconCenterX = rect.left + rect.width / 2 + window.scrollX;

    // Ideal left edge: center tooltip on icon
    const idealLeft = iconCenterX - TIP_W / 2;
    const minLeft   = MARGIN + window.scrollX;
    const maxLeft   = window.innerWidth - TIP_W - MARGIN + window.scrollX;
    const safeLeft  = Math.max(minLeft, Math.min(idealLeft, maxLeft));

    // Arrow should still point at the icon
    const arrowX = Math.max(12, Math.min(iconCenterX - safeLeft, TIP_W - 12));

    const isAbove = rect.bottom + 180 > window.innerHeight;
    setAbove(isAbove);
    setCoords({
      top: rect.top + window.scrollY + (isAbove ? -8 : rect.height + 8),
      left: safeLeft,
    });
    setTipWidth(TIP_W);
    setArrowOffset(arrowX);
  }

  useEffect(() => {
    if (visible) {
      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, { passive: true });
      return () => {
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition);
      };
    }
  }, [visible]);

  function handleToggle() {
    if (!visible) updatePosition();
    setVisible((v) => !v);
  }

  return (
    <span className="relative inline-flex items-center ml-1.5">
      <button
        ref={btnRef}
        type="button"
        onClick={handleToggle}
        onMouseEnter={() => { updatePosition(); setVisible(true); }}
        onMouseLeave={() => setVisible(false)}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[#2463EB] border border-[#2463EB]/30 bg-blue-50 hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2463EB]/30"
        aria-label="More information"
      >
        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {visible && createPortal(
        <div
          ref={tipRef}
          style={{
            position: "absolute",
            top: coords.top,
            left: coords.left,
            width: tipWidth,
            transform: above ? "translateY(-100%)" : undefined,
          }}
          className="z-[9999] bg-gray-900 text-white text-xs rounded-lg px-3 py-2.5 shadow-xl leading-relaxed pointer-events-auto"
          role="tooltip"
        >
          {/* Arrow — aligned with the icon, not the box center */}
          <span
            style={{ left: arrowOffset }}
            className={`absolute -translate-x-1/2 border-4 border-transparent ${
              above
                ? "top-full border-t-gray-900"
                : "bottom-full border-b-gray-900"
            }`}
          />
          {text}
        </div>,
        document.body
      )}
    </span>
  );
}