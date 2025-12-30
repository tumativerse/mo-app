"use client";

import { NumberPicker } from "./number-picker";

interface DatePickerProps {
  value: string; // YYYY-MM-DD format
  onChange: (value: string) => void;
  className?: string;
}

export function DatePicker({ value, onChange, className = "" }: DatePickerProps) {
  // Parse the date string
  const parseDate = (dateStr: string) => {
    if (!dateStr) {
      const today = new Date();
      return {
        year: today.getFullYear() - 25,
        month: today.getMonth() + 1,
        day: today.getDate(),
      };
    }
    const [year, month, day] = dateStr.split("-").map(Number);
    return { year, month, day };
  };

  const { year, month, day } = parseDate(value);

  const handleYearChange = (newYear: number) => {
    const newDate = `${newYear}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange(newDate);
  };

  const handleMonthChange = (newMonth: number) => {
    const newDate = `${year}-${String(newMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange(newDate);
  };

  const handleDayChange = (newDay: number) => {
    const newDate = `${year}-${String(month).padStart(2, "0")}-${String(newDay).padStart(2, "0")}`;
    onChange(newDate);
  };

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];

  const currentYear = new Date().getFullYear();

  return (
    <div className={`flex gap-2 ${className}`}>
      <div className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2 sm:px-3 py-2">
        <p className="text-xs text-zinc-500 text-center mb-1">Month</p>
        <div className="flex items-center gap-1 justify-center">
          <NumberPicker
            value={month}
            onChange={handleMonthChange}
            min={1}
            max={12}
            step={1}
          />
          <span className="text-xs text-zinc-500 min-w-[28px]">{monthNames[month - 1]}</span>
        </div>
      </div>

      <div className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2 sm:px-3 py-2">
        <p className="text-xs text-zinc-500 text-center mb-1">Day</p>
        <NumberPicker
          value={day}
          onChange={handleDayChange}
          min={1}
          max={getDaysInMonth(year, month)}
          step={1}
        />
      </div>

      <div className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2 sm:px-3 py-2">
        <p className="text-xs text-zinc-500 text-center mb-1">Year</p>
        <NumberPicker
          value={year}
          onChange={handleYearChange}
          min={currentYear - 100}
          max={currentYear - 13}
          step={1}
        />
      </div>
    </div>
  );
}
