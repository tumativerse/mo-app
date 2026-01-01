"use client";

import { Save, Loader2, Ruler, Scale, Sun, Moon } from "lucide-react";
import { SingleSelectDropdown } from "@/components/ui/single-select-dropdown";
import { ColorPicker } from "@/components/ui/color-picker";

interface PreferencesTabProps {
  profile: any;
  preferences: any;
  onProfileChange: (field: string, value: any) => void;
  onPreferencesChange: (field: string, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function PreferencesTab({
  profile,
  preferences,
  onProfileChange,
  onPreferencesChange,
  onSave,
  onCancel,
  isSaving = false,
}: PreferencesTabProps) {
  const unitOptions = [
    {
      value: "metric",
      label: "Metric",
      icon: Ruler,
      description: "Kilograms (kg) & Centimeters (cm)"
    },
    {
      value: "imperial",
      label: "Imperial",
      icon: Scale,
      description: "Pounds (lbs) & Inches (in)"
    },
  ];

  return (
    <div className="space-y-6 pb-4">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
          App Preferences
        </h2>
        <p className="text-sm text-muted-foreground mb-4 sm:mb-6">
          Customize your app experience and workout settings
        </p>
      </div>

      {/* Units */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Measurement Units
        </label>
        <SingleSelectDropdown
          value={profile?.units || "imperial"}
          options={unitOptions}
          onChange={(value) => onProfileChange("units", value)}
          placeholder="Select measurement units"
          width="100%"
        />
        <p className="text-xs text-muted-foreground mt-2">
          This affects weight displays, body measurements, and exercise weights throughout the app
        </p>
      </div>

      {/* Warmup Settings */}
      <div className="space-y-4 pt-6 border-t border-border">
        <h3 className="text-sm font-medium text-foreground uppercase tracking-wide">
          Warmup Settings
        </h3>

        {/* Warmup Duration */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Warmup Duration
          </label>
          <SingleSelectDropdown
            value={preferences?.warmupDuration || "10"}
            options={[
              { value: "5", label: "5 minutes", description: "Quick warmup" },
              { value: "10", label: "10 minutes", description: "Recommended" },
              { value: "15", label: "15 minutes", description: "Extended warmup" },
              { value: "20", label: "20 minutes", description: "Full mobility session" },
            ]}
            onChange={(value) => onPreferencesChange("warmupDuration", value)}
            placeholder="Select duration"
            width="100%"
            showIcons={false}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Default duration for pre-workout warmup routines
          </p>
        </div>

        {/* Skip General Warmup */}
        <div className="flex items-start gap-3 p-4 bg-muted/50 border border-border rounded-lg transition-colors">
          <input
            type="checkbox"
            id="skipGeneralWarmup"
            checked={preferences?.skipGeneralWarmup || false}
            onChange={(e) => onPreferencesChange("skipGeneralWarmup", e.target.checked)}
            className="mt-1 w-4 h-4 bg-secondary border-border rounded text-black focus:ring-2 focus:ring-primary focus:ring-offset-0 focus:ring-offset-background transition-colors"
          />
          <div className="flex-1">
            <label htmlFor="skipGeneralWarmup" className="text-sm font-medium text-foreground cursor-pointer">
              Skip general warmup
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              Only show movement-specific warmup sets (no cardio/dynamic stretching)
            </p>
          </div>
        </div>

        {/* Include Mobility Work */}
        <div className="flex items-start gap-3 p-4 bg-muted/50 border border-border rounded-lg transition-colors">
          <input
            type="checkbox"
            id="includeMobilityWork"
            checked={preferences?.includeMobilityWork || false}
            onChange={(e) => onPreferencesChange("includeMobilityWork", e.target.checked)}
            className="mt-1 w-4 h-4 bg-secondary border-border rounded text-black focus:ring-2 focus:ring-primary focus:ring-offset-0 focus:ring-offset-background transition-colors"
          />
          <div className="flex-1">
            <label htmlFor="includeMobilityWork" className="text-sm font-medium text-foreground cursor-pointer">
              Include mobility work
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              Add mobility exercises to warmup routines (recommended for injury prevention)
            </p>
          </div>
        </div>
      </div>

      {/* Display Preferences */}
      <div className="space-y-4 pt-6 border-t border-border">
        <h3 className="text-sm font-medium text-foreground uppercase tracking-wide">
          Display
        </h3>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between py-2">
          <div>
            <label className="text-sm font-medium text-foreground">App Theme</label>
            <p className="text-xs text-muted-foreground mt-1">Toggle between light and dark mode</p>
          </div>
          <button
            type="button"
            onClick={() => onPreferencesChange("theme", preferences?.theme === "dark" ? "light" : "dark")}
            className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background ${
              preferences?.theme === "dark" ? "bg-primary" : "bg-muted"
            }`}
          >
            <span className="sr-only">Toggle theme</span>
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform flex items-center justify-center ${
                preferences?.theme === "dark" ? "translate-x-7" : "translate-x-1"
              }`}
            >
              {preferences?.theme === "dark" ? (
                <Moon className="h-3 w-3 text-gray-800" />
              ) : (
                <Sun className="h-3 w-3 text-gray-800" />
              )}
            </span>
          </button>
        </div>

        {/* Accent Color Picker */}
        <ColorPicker
          value={preferences?.accentColor || "#10b981"}
          onChange={(color) => onPreferencesChange("accentColor", color)}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-border">
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="w-full sm:w-auto px-6 py-3 text-base border border-border text-foreground rounded-lg hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="w-full sm:w-auto px-6 py-3 text-base bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center touch-manipulation"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </div>
  );
}
