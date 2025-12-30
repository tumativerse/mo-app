"use client";

import { ChevronUp, ChevronDown } from "lucide-react";

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

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        className="p-2 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
      >
        <ChevronDown className="h-5 w-5 text-zinc-300" />
      </button>

      <div className="flex-1 flex items-center justify-center gap-1">
        <input
          type="number"
          value={step < 1 ? value.toFixed(1) : value}
          onChange={handleInputChange}
          min={min}
          max={max}
          step={step}
          className="w-20 text-center text-lg font-semibold bg-transparent text-green-400 focus:outline-none"
        />
        {unit && <span className="text-sm text-zinc-500">{unit}</span>}
      </div>

      <button
        type="button"
        onClick={increment}
        disabled={value >= max}
        className="p-2 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
      >
        <ChevronUp className="h-5 w-5 text-zinc-300" />
      </button>
    </div>
  );
}
