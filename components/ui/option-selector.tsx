"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface Option {
  value: string;
  label: string;
}

interface OptionSelectorProps {
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  className?: string;
}

export function OptionSelector({
  value,
  options,
  onChange,
  className = "",
}: OptionSelectorProps) {
  const currentIndex = options.findIndex((opt) => opt.value === value);
  const currentOption = options[currentIndex] || options[0];

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
    onChange(options[newIndex].value);
  };

  const handleNext = () => {
    const newIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
    onChange(options[newIndex].value);
  };

  return (
    <div className={`flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 ${className}`}>
      <button
        type="button"
        onClick={handlePrevious}
        className="p-2 bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-500 rounded-lg transition-colors touch-manipulation"
      >
        <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-300" />
      </button>

      <div className="flex-1 text-center">
        <p className="text-sm sm:text-base font-medium text-green-400">
          {currentOption.label}
        </p>
      </div>

      <button
        type="button"
        onClick={handleNext}
        className="p-2 bg-zinc-700 hover:bg-zinc-600 active:bg-zinc-500 rounded-lg transition-colors touch-manipulation"
      >
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-zinc-300" />
      </button>
    </div>
  );
}
