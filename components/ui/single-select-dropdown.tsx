"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, type LucideIcon } from "lucide-react";

export interface SingleSelectDropdownOption {
  value: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
}

interface SingleSelectDropdownProps {
  value: string;
  options: SingleSelectDropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  width?: string;
  showIcons?: boolean;
}

export function SingleSelectDropdown({
  value,
  options,
  onChange,
  placeholder = "Select...",
  className = "",
  width = "auto",
  showIcons = true,
}: SingleSelectDropdownProps) {
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

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative inline-block ${className}`} style={{ width }}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-3 text-base bg-secondary border border-border rounded-lg text-foreground font-medium text-center cursor-pointer hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors flex items-center justify-between gap-2 touch-manipulation"
      >
        <span className="flex-1 text-left flex items-center gap-2">
          {selectedOption?.icon && showIcons && (
            <selectedOption.icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          )}
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform flex-shrink-0 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={menuRef}
          className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-xl max-h-60 overflow-y-auto custom-dropdown-menu"
        >
          {options.map((option) => {
            const Icon = option.icon;
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                ref={isSelected ? selectedButtonRef : null}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`w-full px-3 py-3 text-base text-left transition-colors flex items-start gap-3 touch-manipulation ${
                  isSelected
                    ? "bg-primary/10 text-foreground font-medium"
                    : "text-foreground hover:bg-secondary"
                }`}
              >
                {/* Icon */}
                {Icon && showIcons && (
                  <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 text-muted-foreground`} />
                )}

                {/* Label and Description */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">
                    {option.label}
                  </div>
                  {option.description && (
                    <div className="text-xs mt-0.5 text-muted-foreground">
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
