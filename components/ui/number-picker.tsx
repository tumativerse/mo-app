"use client";

import { useRef, useEffect, useState } from "react";

interface NumberPickerProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  className?: string;
}

export function NumberPicker({
  value,
  onChange,
  min,
  max,
  step = 1,
  unit = "",
  className = "",
}: NumberPickerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);

  const numbers: number[] = [];
  for (let i = min; i <= max; i += step) {
    numbers.push(i);
  }

  const ITEM_HEIGHT = 40;

  useEffect(() => {
    if (scrollRef.current && !isScrolling) {
      const index = numbers.indexOf(value);
      if (index !== -1) {
        scrollRef.current.scrollTop = index * ITEM_HEIGHT;
      }
    }
  }, [value, isScrolling]);

  const handleScroll = () => {
    if (!scrollRef.current) return;

    setIsScrolling(true);
    const scrollTop = scrollRef.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const newValue = numbers[Math.max(0, Math.min(index, numbers.length - 1))];

    if (newValue !== value) {
      onChange(newValue);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (scrollRef.current && isScrolling) {
        const index = numbers.indexOf(value);
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
  }, [value, isScrolling]);

  return (
    <div className={`relative ${className}`}>
      {/* Top fade overlay */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-zinc-900 to-transparent pointer-events-none z-10" />

      {/* Selection indicator */}
      <div className="absolute top-1/2 left-0 right-0 h-10 -mt-5 border-y-2 border-green-500/30 bg-green-500/5 pointer-events-none z-10" />

      {/* Scrollable container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="h-40 overflow-y-scroll scrollbar-hide snap-y snap-mandatory"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {/* Top padding */}
        <div style={{ height: `${ITEM_HEIGHT * 2}px` }} />

        {/* Numbers */}
        {numbers.map((num) => (
          <div
            key={num}
            className={`
              flex items-center justify-center transition-all snap-center
              ${num === value
                ? 'text-green-400 font-semibold text-lg'
                : 'text-zinc-500 text-sm'
              }
            `}
            style={{ height: `${ITEM_HEIGHT}px` }}
            onClick={() => {
              onChange(num);
              if (scrollRef.current) {
                const index = numbers.indexOf(num);
                scrollRef.current.scrollTo({
                  top: index * ITEM_HEIGHT,
                  behavior: 'smooth'
                });
              }
            }}
          >
            {step < 1 ? num.toFixed(1) : num}{unit && ` ${unit}`}
          </div>
        ))}

        {/* Bottom padding */}
        <div style={{ height: `${ITEM_HEIGHT * 2}px` }} />
      </div>

      {/* Bottom fade overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-zinc-900 to-transparent pointer-events-none z-10" />

      {/* Hide scrollbar */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
