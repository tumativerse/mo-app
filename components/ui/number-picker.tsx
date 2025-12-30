"use client";

import { CustomDropdown } from "./custom-dropdown";

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
  // Generate options based on min, max, and step
  const options: Array<{ value: number; label: string }> = [];

  for (let i = min; i <= max; i += step) {
    const displayValue = step < 1 ? i.toFixed(1) : String(i);
    options.push({
      value: i,
      label: unit ? `${displayValue} ${unit}` : displayValue,
    });
  }

  return (
    <CustomDropdown
      value={value}
      options={options}
      onChange={(val) => onChange(Number(val))}
      className={className}
      width="100%"
    />
  );
}
