"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface MultiSelectDropdownOption {
  value: string;
  label: string;
  description?: string;
}

interface MultiSelectDropdownProps {
  value: string[];
  options: MultiSelectDropdownOption[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  maxHeight?: string;
  showCount?: boolean;
}

export function MultiSelectDropdown({
  value = [],
  options,
  onChange,
  placeholder = "Select options",
  className = "",
  maxHeight = "max-h-60",
  showCount = true,
}: MultiSelectDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const firstSelectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside as any);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside as any);
    };
  }, [isOpen]);

  // Auto-scroll to first selected item when dropdown opens
  useEffect(() => {
    if (isOpen && menuRef.current && firstSelectedRef.current) {
      const menu = menuRef.current;
      const selectedButton = firstSelectedRef.current;
      const menuHeight = menu.clientHeight;
      const buttonTop = selectedButton.offsetTop;
      const buttonHeight = selectedButton.clientHeight;

      // Center the first selected item in the viewport
      menu.scrollTop = buttonTop - (menuHeight / 2) + (buttonHeight / 2);
    }
  }, [isOpen]);

  const toggleOption = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const getDisplayText = () => {
    if (value.length === 0) return placeholder;
    if (!showCount) {
      const selectedLabels = options
        .filter((opt) => value.includes(opt.value))
        .map((opt) => opt.label)
        .join(", ");
      return selectedLabels || placeholder;
    }
    if (value.length === options.length) return "All selected";
    return `${value.length} selected`;
  };

  // Find index of first selected item for ref
  const firstSelectedIndex = options.findIndex((opt) => value.includes(opt.value));

  return (
    <div ref={dropdownRef} className={`relative inline-block w-full ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-3 text-base bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 font-medium text-center cursor-pointer hover:border-zinc-600 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-colors flex items-center justify-between gap-2 touch-manipulation"
      >
        <span className="flex-1 text-left">{getDisplayText()}</span>
        <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className={`absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl ${maxHeight} overflow-y-auto custom-dropdown-menu`}
        >
          {options.map((option, index) => {
            const isSelected = value.includes(option.value);
            const isFirstSelected = index === firstSelectedIndex;

            return (
              <button
                key={option.value}
                ref={isFirstSelected ? firstSelectedRef : null}
                type="button"
                onClick={() => toggleOption(option.value)}
                className="w-full px-3 py-3 text-base text-left transition-colors flex items-start gap-3 hover:bg-zinc-800 touch-manipulation"
              >
                {/* Checkbox */}
                <div
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                    isSelected
                      ? "bg-green-600 border-green-600"
                      : "border-zinc-600 bg-zinc-800"
                  }`}
                >
                  {isSelected && <Check className="h-3 w-3 text-white" />}
                </div>

                {/* Label and Description */}
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium ${isSelected ? "text-green-400" : "text-zinc-100"}`}>
                    {option.label}
                  </div>
                  {option.description && (
                    <div className="text-xs text-zinc-500 mt-0.5">
                      {option.description}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      <style jsx>{`
        .custom-dropdown-menu {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }
        .custom-dropdown-menu::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>
    </div>
  );
}
