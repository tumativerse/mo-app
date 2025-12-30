"use client";

import { ChevronUp, ChevronDown } from "lucide-react";
import { useRef } from "react";

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
  const inputRef = useRef<HTMLInputElement>(null);

  const increment = () => {
    const newValue = Math.min(value + step, max);
    onChange(newValue);
  };

  const decrement = () => {
    const newValue = Math.max(value - step, min);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      increment();
    } else {
      decrement();
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLInputElement>) => {
    const startY = e.touches[0].clientY;
    let lastY = startY;

    const handleTouchMove = (moveEvent: TouchEvent) => {
      const currentY = moveEvent.touches[0].clientY;
      const diff = lastY - currentY;

      if (Math.abs(diff) > 10) {
        if (diff > 0) {
          increment();
        } else {
          decrement();
        }
        lastY = currentY;
      }
    };

    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };

    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        className="p-2 bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors touch-manipulation"
      >
        <ChevronDown className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-300" />
      </button>

      <div className="flex-1 flex items-center justify-center gap-1">
        <input
          ref={inputRef}
          type="number"
          value={step < 1 ? value.toFixed(1) : value}
          onChange={handleInputChange}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          min={min}
          max={max}
          step={step}
          className="w-16 sm:w-20 text-center text-base sm:text-lg font-semibold bg-transparent text-green-400 focus:outline-none number-input-no-spinner"
        />
        {unit && <span className="text-xs sm:text-sm text-zinc-500">{unit}</span>}
      </div>

      <button
        type="button"
        onClick={increment}
        disabled={value >= max}
        className="p-2 bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors touch-manipulation"
      >
        <ChevronUp className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-300" />
      </button>

      <style jsx>{`
        .number-input-no-spinner::-webkit-outer-spin-button,
        .number-input-no-spinner::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .number-input-no-spinner {
          -moz-appearance: textfield;
        }
      `}</style>
    </div>
  );
}
