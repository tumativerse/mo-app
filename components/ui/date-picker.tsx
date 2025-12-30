"use client";

import { InlineScrollPicker } from "./inline-scroll-picker";

interface DatePickerProps {
  value: string; // YYYY-MM-DD format
  onChange: (value: string) => void;
  className?: string;
}

export function DatePicker({ value, onChange, className = "" }: DatePickerProps) {
  // Parse the date string
  const parseDate = (dateStr: string) => {
    if (!dateStr) {
      // Default to July 15, 2000
      return {
        year: 2000,
        month: 7,
        day: 15,
      };
    }
    const [year, month, day] = dateStr.split("-").map(Number);
    return { year, month, day };
  };

  const { year, month, day } = parseDate(value);

  const handleYearChange = (newYear: number | string) => {
    const yearNum = typeof newYear === 'string' ? parseInt(newYear) : newYear;
    const newDate = `${yearNum}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange(newDate);
  };

  const handleMonthChange = (newMonth: number | string) => {
    const monthNum = typeof newMonth === 'string' ? parseInt(newMonth) : newMonth;
    const newDate = `${year}-${String(monthNum).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    onChange(newDate);
  };

  const handleDayChange = (newDay: number | string) => {
    const dayNum = typeof newDay === 'string' ? parseInt(newDay) : newDay;
    const newDate = `${year}-${String(month).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    onChange(newDate);
  };

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const currentYear = new Date().getFullYear();

  // Generate options
  const monthOptions = monthNames.map((name, index) => ({
    value: index + 1,
    label: name,
  }));

  const dayOptions = Array.from({ length: getDaysInMonth(year, month) }, (_, i) => ({
    value: i + 1,
    label: String(i + 1),
  }));

  const yearOptions = Array.from({ length: 100 }, (_, i) => ({
    value: currentYear - 13 - i,
    label: String(currentYear - 13 - i),
  }));

  return (
    <div className={`flex gap-2 items-center ${className}`}>
      <div className="flex-[2] min-w-0">
        <InlineScrollPicker
          value={month}
          options={monthOptions}
          onChange={handleMonthChange}
          width="100%"
        />
      </div>
      <div className="flex-1 min-w-0">
        <InlineScrollPicker
          value={day}
          options={dayOptions}
          onChange={handleDayChange}
          width="100%"
        />
      </div>
      <div className="flex-1 min-w-0">
        <InlineScrollPicker
          value={year}
          options={yearOptions}
          onChange={handleYearChange}
          width="100%"
        />
      </div>
    </div>
  );
}
