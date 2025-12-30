"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface CustomDropdownProps {
  value: number | string;
  options: Array<{ value: number | string; label: string }>;
  onChange: (value: number | string) => void;
  className?: string;
  width?: string;
  placeholder?: string;
}

export function CustomDropdown({
  value,
  options,
  onChange,
  className = "",
  width = "auto",
  placeholder = "Select...",
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const selectedButtonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

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

  // Auto-scroll to selected option when dropdown opens
  useEffect(() => {
    if (isOpen && menuRef.current && selectedButtonRef.current) {
      const menu = menuRef.current;
      const selectedButton = selectedButtonRef.current;
      const menuHeight = menu.clientHeight;
      const buttonTop = selectedButton.offsetTop;
      const buttonHeight = selectedButton.clientHeight;

      // Center the selected item in the viewport
      menu.scrollTop = buttonTop - (menuHeight / 2) + (buttonHeight / 2);
    }
  }, [isOpen]);

  const handleSelect = (selectedValue: number | string) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`} style={{ width }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-sm font-medium text-center cursor-pointer hover:border-zinc-600 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/20 transition-colors flex items-center justify-between gap-2"
      >
        <span className="flex-1">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`h-4 w-4 text-zinc-500 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div ref={menuRef} className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
          {options.map((option) => (
            <button
              key={String(option.value)}
              ref={option.value === value ? selectedButtonRef : null}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full px-3 py-2 text-sm text-left transition-colors ${
                option.value === value
                  ? "bg-green-600 text-white font-medium"
                  : "text-zinc-100 hover:bg-zinc-800"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
