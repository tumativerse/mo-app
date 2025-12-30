"use client";

import { useRef, useEffect, useState } from "react";

interface InlineScrollPickerProps {
  value: number | string;
  options: Array<{ value: number | string; label: string }>;
  onChange: (value: number | string) => void;
  className?: string;
  width?: string;
}

export function InlineScrollPicker({
  value,
  options,
  onChange,
  className = "",
  width = "auto",
}: InlineScrollPickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const ITEM_HEIGHT = 36;

  useEffect(() => {
    if (scrollRef.current && !isScrolling) {
      const index = options.findIndex((opt) => opt.value === value);
      if (index !== -1) {
        scrollRef.current.scrollTop = index * ITEM_HEIGHT;
      }
    }
  }, [value, isScrolling, options]);

  const handleScroll = () => {
    if (!scrollRef.current) return;

    setIsScrolling(true);
    const scrollTop = scrollRef.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const selectedOption = options[Math.max(0, Math.min(index, options.length - 1))];

    if (selectedOption && selectedOption.value !== value) {
      onChange(selectedOption.value);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current && isScrolling) {
        const index = options.findIndex((opt) => opt.value === value);
        if (index !== -1) {
          scrollRef.current.scrollTo({
            top: index * ITEM_HEIGHT,
            behavior: 'smooth'
          });
        }
        setIsScrolling(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [value, isScrolling, options]);

  const currentLabel = options.find((opt) => opt.value === value)?.label || "";

  return (
    <div className={`relative inline-block ${className}`} style={{ width }}>
      {/* Visible value display */}
      <div className="relative">
        <div className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-center cursor-pointer hover:border-zinc-600 transition-colors">
          <span className="text-sm font-medium">{currentLabel}</span>
        </div>

        {/* Hidden scrollable picker overlay */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="absolute inset-0 overflow-y-scroll opacity-0 cursor-ns-resize scrollbar-hide"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {/* Top padding */}
          <div style={{ height: `${ITEM_HEIGHT}px` }} />

          {/* Options */}
          {options.map((option) => (
            <div
              key={option.value}
              style={{ height: `${ITEM_HEIGHT}px` }}
              className="flex items-center justify-center"
            >
              {option.label}
            </div>
          ))}

          {/* Bottom padding */}
          <div style={{ height: `${ITEM_HEIGHT}px` }} />
        </div>
      </div>

      {/* Hide scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
