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
        className="w-full px-3 py-2 bg-secondary border border-border rounded-lg text-foreground text-sm font-medium text-center cursor-pointer hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors flex items-center justify-between gap-2"
      >
        <span className="flex-1">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-xl max-h-60 overflow-y-auto custom-dropdown-menu"
        >
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <button
                key={String(option.value)}
                ref={isSelected ? selectedButtonRef : null}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full px-3 py-2 text-sm text-left transition-colors ${
                  isSelected
                    ? "bg-primary/10 text-foreground font-medium"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                {option.label}
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
