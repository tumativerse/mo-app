"use client";

import { Save, Loader2, Armchair, PersonStanding, Footprints, Flame, Moon } from "lucide-react";
import { SingleSelectDropdown } from "@/components/ui/single-select-dropdown";

interface LifestyleTabProps {
  preferences: any;
  onChange: (field: string, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function LifestyleTab({ preferences, onChange, onSave, onCancel, isSaving = false }: LifestyleTabProps) {
  const activityLevelOptions = [
    { value: "sedentary", label: "Sedentary", icon: Armchair, description: "Desk job, minimal daily movement" },
    { value: "lightly_active", label: "Lightly Active", icon: PersonStanding, description: "Light walking, some standing" },
    { value: "moderately_active", label: "Moderately Active", icon: Footprints, description: "On feet frequently, regular movement" },
    { value: "very_active", label: "Very Active", icon: Flame, description: "Physical labor or high daily activity" },
  ];

  return (
    <div className="space-y-6 pb-4">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-zinc-100 mb-2">
          Lifestyle Information
        </h2>
        <p className="text-sm text-zinc-400 mb-4 sm:mb-6">
          Your daily activity and schedule help us optimize recovery
        </p>
      </div>

      {/* Activity Level */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Activity Level <span className="text-zinc-500">(Optional)</span>
        </label>
        <SingleSelectDropdown
          value={preferences?.activityLevel || ""}
          options={activityLevelOptions}
          onChange={(value) => onChange("activityLevel", value)}
          placeholder="Select your activity level"
          width="100%"
        />
      </div>

      {/* Occupation Type */}
      <div className="pt-6 border-t border-zinc-800">
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Occupation Type <span className="text-zinc-500">(Optional)</span>
        </label>
        <select
          value={preferences?.occupationType || ""}
          onChange={(e) => onChange("occupationType", e.target.value || null)}
          className="w-full px-4 py-3 text-base bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">Select occupation type</option>
          <option value="desk_job">Desk Job / Office Work</option>
          <option value="standing_job">Standing Job (Retail, Teaching, etc.)</option>
          <option value="physical_labor">Physical Labor (Construction, Warehouse, etc.)</option>
          <option value="mixed">Mixed (Varies day to day)</option>
          <option value="student">Student</option>
          <option value="retired">Retired</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Sleep Schedule */}
      <div className="space-y-4 pt-6 border-t border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-300 uppercase tracking-wide">
          Sleep Schedule
        </h3>
        <p className="text-xs text-zinc-500">
          Helps us optimize recovery recommendations and workout timing
        </p>

        {/* Typical Bedtime */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Typical Bedtime <span className="text-zinc-500">(Optional)</span>
          </label>
          <input
            type="time"
            value={preferences?.typicalBedtime || ""}
            onChange={(e) => onChange("typicalBedtime", e.target.value || null)}
            className="w-full px-4 py-3 text-base bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Typical Wake Time */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Typical Wake Time <span className="text-zinc-500">(Optional)</span>
          </label>
          <input
            type="time"
            value={preferences?.typicalWakeTime || ""}
            onChange={(e) => onChange("typicalWakeTime", e.target.value || null)}
            className="w-full px-4 py-3 text-base bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {preferences?.typicalBedtime && preferences?.typicalWakeTime && (
          <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg flex items-start gap-3">
            <Moon className="h-5 w-5 text-zinc-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-zinc-400">
              Sleep window: {preferences.typicalBedtime} - {preferences.typicalWakeTime}
            </p>
          </div>
        )}
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
