"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface InfoTooltipProps {
  text: string;
}

/**
 * A small ⓘ icon that shows a plain-English tooltip on hover (desktop)
 * or tap (mobile). Positions itself to stay within the viewport.
 */
export default function InfoTooltip({ text }: InfoTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [above, setAbove]     = useState(false);
  const btnRef  = useRef<HTMLButtonElement>(null);
  const tipRef  = useRef<HTMLDivElement>(null);

  const [coords, setCoords] = useState({ top: 0, left: 0 });

  // Close when clicking outside
  useEffect(() => {
    if (!visible) return;
    function handleClick(e: MouseEvent) {
      if (
        btnRef.current && !btnRef.current.contains(e.target as Node) &&
        tipRef.current && !tipRef.current.contains(e.target as Node)
      ) {
        setVisible(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [visible]);

  function updatePosition() {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    const isAbove = rect.bottom + 160 > window.innerHeight;
    setAbove(isAbove);
    setCoords({
      top: rect.top + window.scrollY + (isAbove ? -8 : rect.height + 8),
      left: rect.left + window.scrollX + rect.width / 2,
    });
  }

  useEffect(() => {
    if (visible) {
      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, { passive: true });
      return () => {
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition);
      }
    }
  }, [visible]);

  function handleToggle(e: React.MouseEvent) {
    if (!visible) updatePosition();
    setVisible((v) => !v);
  }

  return (
    <span className="relative inline-flex items-center ml-1.5">
      <button
        ref={btnRef}
        type="button"
        onClick={handleToggle}
        onMouseEnter={() => {
          if (btnRef.current) {
            const rect = btnRef.current.getBoundingClientRect();
            setAbove(rect.bottom + 160 > window.innerHeight);
          }
          setVisible(true);
        }}
        onMouseLeave={() => setVisible(false)}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[#2463EB] border border-[#2463EB]/30 bg-blue-50 hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#2463EB]/30"
        aria-label="More information"
      >
        <svg
          className="w-2.5 h-2.5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
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
          style={{ top: coords.top, left: coords.left }}
          className={`absolute z-[9999] w-64 bg-gray-900 text-white text-xs rounded-lg px-3 py-2.5 shadow-xl leading-relaxed pointer-events-none -translate-x-1/2 ${
            above ? "-translate-y-full" : ""
          }`}
          role="tooltip"
        >
          {/* Arrow */}
          <span
            className={`absolute left-1/2 -translate-x-1/2 border-4 border-transparent ${
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