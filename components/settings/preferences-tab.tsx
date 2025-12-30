"use client";

import { Save, Loader2, Ruler, Scale } from "lucide-react";
import { SingleSelectDropdown } from "@/components/ui/single-select-dropdown";

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
        <h2 className="text-lg sm:text-xl font-semibold text-zinc-100 mb-2">
          App Preferences
        </h2>
        <p className="text-sm text-zinc-400 mb-4 sm:mb-6">
          Customize your app experience and workout settings
        </p>
      </div>

      {/* Units */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Measurement Units
        </label>
        <SingleSelectDropdown
          value={profile?.units || "imperial"}
          options={unitOptions}
          onChange={(value) => onProfileChange("units", value)}
          placeholder="Select measurement units"
          width="100%"
        />
        <p className="text-xs text-zinc-500 mt-2">
          This affects weight displays, body measurements, and exercise weights throughout the app
        </p>
      </div>

      {/* Warmup Settings */}
      <div className="space-y-4 pt-6 border-t border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-300 uppercase tracking-wide">
          Warmup Settings
        </h3>

        {/* Warmup Duration */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Warmup Duration
          </label>
          <select
            value={preferences?.warmupDuration || "10"}
            onChange={(e) => onPreferencesChange("warmupDuration", e.target.value)}
            className="w-full px-4 py-3 text-base bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="5">5 minutes</option>
            <option value="10">10 minutes</option>
            <option value="15">15 minutes</option>
            <option value="20">20 minutes</option>
          </select>
          <p className="text-xs text-zinc-500 mt-1">
            Default duration for pre-workout warmup routines
          </p>
        </div>

        {/* Skip General Warmup */}
        <div className="flex items-start gap-3 p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
          <input
            type="checkbox"
            id="skipGeneralWarmup"
            checked={preferences?.skipGeneralWarmup || false}
            onChange={(e) => onPreferencesChange("skipGeneralWarmup", e.target.checked)}
            className="mt-1 w-4 h-4 bg-zinc-800 border-zinc-600 rounded text-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-0 focus:ring-offset-zinc-900"
          />
          <div className="flex-1">
            <label htmlFor="skipGeneralWarmup" className="text-sm font-medium text-zinc-300 cursor-pointer">
              Skip general warmup
            </label>
            <p className="text-xs text-zinc-500 mt-1">
              Only show movement-specific warmup sets (no cardio/dynamic stretching)
            </p>
          </div>
        </div>

        {/* Include Mobility Work */}
        <div className="flex items-start gap-3 p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
          <input
            type="checkbox"
            id="includeMobilityWork"
            checked={preferences?.includeMobilityWork || false}
            onChange={(e) => onPreferencesChange("includeMobilityWork", e.target.checked)}
            className="mt-1 w-4 h-4 bg-zinc-800 border-zinc-600 rounded text-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-0 focus:ring-offset-zinc-900"
          />
          <div className="flex-1">
            <label htmlFor="includeMobilityWork" className="text-sm font-medium text-zinc-300 cursor-pointer">
              Include mobility work
            </label>
            <p className="text-xs text-zinc-500 mt-1">
              Add mobility exercises to warmup routines (recommended for injury prevention)
            </p>
          </div>
        </div>
      </div>

      {/* Display Preferences */}
      <div className="space-y-4 pt-6 border-t border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-300 uppercase tracking-wide">
          Display
        </h3>

        <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-300">Theme</p>
              <p className="text-xs text-zinc-500 mt-1">Dark mode (default)</p>
            </div>
            <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-400">
              Coming soon
            </div>
          </div>
        </div>

        <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-zinc-300">Notifications</p>
              <p className="text-xs text-zinc-500 mt-1">Rest timer alerts, PR celebrations, streak reminders</p>
            </div>
            <div className="px-3 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-400">
              Coming soon
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-zinc-800">
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="w-full sm:w-auto px-6 py-3 text-base border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="w-full sm:w-auto px-6 py-3 text-base bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center touch-manipulation"
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
