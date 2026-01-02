'use client';

import { Check } from 'lucide-react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

const PRESET_COLORS = [
  { name: 'Vibrant Teal', value: '#0BA08B' },
  { name: 'Electric Blue', value: '#4A90E2' },
  { name: 'Purple Power', value: '#8B5CF6' },
  { name: 'Lime Energy', value: '#A8E63D' },
  { name: 'Energetic Coral', value: '#FF6B6B' },
  { name: 'Sunset Orange', value: '#FF8C42' },
  { name: 'Magenta', value: '#E94B9C' },
  { name: 'Cyan Clarity', value: '#36E8F3' },
];

export function ColorPicker({ value, onChange, className = '' }: ColorPickerProps) {
  const handlePresetClick = (color: string) => {
    onChange(color);
  };

  return (
    <div className={`${className}`}>
      {/* Accent Color Selection */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 py-2">
        <label className="text-sm font-medium text-foreground flex-shrink-0">Accent Color</label>

        {/* Color Grid */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset.value}
              type="button"
              onClick={() => handlePresetClick(preset.value)}
              className="relative group flex-shrink-0 touch-manipulation p-1"
              title={preset.name}
            >
              <div
                className={`w-7 h-7 rounded-md transition-all ${
                  value === preset.value
                    ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background scale-110'
                    : 'hover:scale-105 active:scale-105'
                }`}
                style={{ backgroundColor: preset.value }}
              />
              {value === preset.value && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-white drop-shadow-lg" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
