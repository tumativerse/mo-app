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
    <div className={`space-y-4 ${className}`}>
      {/* Preset Colors Grid */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3">
          Preset Colors
        </label>
        <div className="grid grid-cols-4 gap-3">
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => handlePresetClick(preset.value)}
              className="relative flex flex-col items-center gap-2 p-3 bg-muted/50 border border-border rounded-lg hover:bg-secondary transition-colors group"
            >
              <div
                className="w-12 h-12 rounded-lg border-2 border-border group-hover:border-primary transition-colors"
                style={{ backgroundColor: preset.value }}
              />
              <span className="text-xs text-muted-foreground">{preset.name}</span>
              {value === preset.value && (
                <div className="absolute top-2 right-2">
                  <Check className="h-4 w-4 text-primary" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Hex Input */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Custom Color
        </label>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-lg border-2 border-border flex-shrink-0"
            style={{ backgroundColor: isValidHex ? customColor : "#374151" }}
          />
          <div className="flex-1">
            <input
              type="text"
              value={customColor}
              onChange={(e) => handleCustomColorChange(e.target.value)}
              placeholder="#10b981"
              className={`w-full px-4 py-3 text-base bg-secondary border rounded-lg text-foreground focus:outline-none focus:ring-2 transition-colors ${
                isValidHex
                  ? "border-border focus:ring-primary"
                  : "border-destructive focus:ring-destructive"
              }`}
            />
            {!isValidHex && (
              <p className="text-xs text-destructive mt-1">
                Invalid hex color format (e.g., #10b981)
              </p>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Enter a 6-digit hex color code including the # symbol
        </p>
      </div>

      {/* Preview */}
      <div className="p-4 bg-muted/50 border border-border rounded-lg transition-colors">
        <p className="text-sm font-medium text-foreground mb-3">Preview</p>
        <div className="flex items-center gap-3">
          <div
            className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors"
            style={{ backgroundColor: isValidHex ? customColor : "#10b981" }}
          >
            Primary Button
          </div>
          <div
            className="px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors"
            style={{
              borderColor: isValidHex ? customColor : "#10b981",
              color: isValidHex ? customColor : "#10b981",
            }}
          >
            Outline Button
          </div>
        </div>
      </div>
    </div>
  );
}
