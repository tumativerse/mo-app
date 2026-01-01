"use client";

import { useState } from "react";
import { Check } from "lucide-react";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

const PRESET_COLORS = [
  { name: "Green", value: "#10b981" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Purple", value: "#a855f7" },
  { name: "Pink", value: "#ec4899" },
  { name: "Orange", value: "#f97316" },
  { name: "Red", value: "#ef4444" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Indigo", value: "#6366f1" },
];

export function ColorPicker({ value, onChange, className = "" }: ColorPickerProps) {
  const [customColor, setCustomColor] = useState(value);
  const [isValidHex, setIsValidHex] = useState(true);

  const handleCustomColorChange = (input: string) => {
    setCustomColor(input);

    // Validate hex color format
    const hexRegex = /^#[0-9A-Fa-f]{6}$/;
    const isValid = hexRegex.test(input);
    setIsValidHex(isValid);

    if (isValid) {
      onChange(input);
    }
  };

  const handlePresetClick = (color: string) => {
    setCustomColor(color);
    setIsValidHex(true);
    onChange(color);
  };

  return (
    <div className={`${className}`}>
      {/* Accent Color Selection */}
      <div className="flex items-center justify-between py-2">
        <div>
          <label className="text-sm font-medium text-foreground">Accent Color</label>
          <p className="text-xs text-muted-foreground mt-1">Choose your preferred accent color</p>
        </div>
      </div>

      {/* Color Grid */}
      <div className="grid grid-cols-8 gap-2 mt-3">
        {PRESET_COLORS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => handlePresetClick(preset.value)}
            className="relative group"
            title={preset.name}
          >
            <div
              className={`w-10 h-10 rounded-lg transition-all ${
                value === preset.value
                  ? "ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110"
                  : "hover:scale-105"
              }`}
              style={{ backgroundColor: preset.value }}
            />
            {value === preset.value && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Check className="h-4 w-4 text-white drop-shadow-lg" />
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
