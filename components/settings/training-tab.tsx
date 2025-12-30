"use client";

import { Save, Loader2, Dumbbell, Target, Activity, Zap, Sprout, Flame, Award, Sunrise, Sun, Sunset, Moon, MoonStar } from "lucide-react";
import { SingleSelectDropdown } from "@/components/ui/single-select-dropdown";
import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown";

interface TrainingTabProps {
  preferences: any;
  onChange: (field: string, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function TrainingTab({ preferences, onChange, onSave, onCancel, isSaving = false }: TrainingTabProps) {
  const fitnessGoalOptions = [
    { value: "strength", label: "Strength", icon: Dumbbell, description: "Max strength" },
    { value: "hypertrophy", label: "Muscle Building", icon: Target, description: "Size & definition" },
    { value: "endurance", label: "Endurance", icon: Activity, description: "Stamina & conditioning" },
    { value: "general", label: "General Fitness", icon: Zap, description: "Overall health" },
  ];

  const experienceLevelOptions = [
    { value: "beginner", label: "Beginner", icon: Sprout, description: "< 1 year consistent training" },
    { value: "intermediate", label: "Intermediate", icon: Flame, description: "1-3 years" },
    { value: "advanced", label: "Advanced", icon: Award, description: "3+ years" },
  ];

  const trainingTimeOptions = [
    { value: "morning", label: "Morning", description: "5am-10am" },
    { value: "midday", label: "Midday", description: "10am-2pm" },
    { value: "afternoon", label: "Afternoon", description: "2pm-6pm" },
    { value: "evening", label: "Evening", description: "6pm-10pm" },
    { value: "late_night", label: "Late Night", description: "10pm+" },
  ];

  const restDayOptions = [
    { value: "sunday", label: "Sunday" },
    { value: "monday", label: "Monday" },
    { value: "tuesday", label: "Tuesday" },
    { value: "wednesday", label: "Wednesday" },
    { value: "thursday", label: "Thursday" },
    { value: "friday", label: "Friday" },
    { value: "saturday", label: "Saturday" },
  ];

  return (
    <div className="space-y-6 pb-4">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-zinc-100 mb-2">
          Training Profile
        </h2>
        <p className="text-sm text-zinc-400 mb-4 sm:mb-6">
          Configure your training goals, experience, and schedule
        </p>
      </div>

      {/* Training Goals & Experience */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-300 uppercase tracking-wide">
          Goals & Experience
        </h3>

        {/* Fitness Goal */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Fitness Goal <span className="text-red-400">*</span>
          </label>
          <SingleSelectDropdown
            value={preferences?.fitnessGoal || ""}
            options={fitnessGoalOptions}
            onChange={(value) => onChange("fitnessGoal", value)}
            placeholder="Select your primary fitness goal"
            width="100%"
          />
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Experience Level <span className="text-red-400">*</span>
          </label>
          <SingleSelectDropdown
            value={preferences?.experienceLevel || ""}
            options={experienceLevelOptions}
            onChange={(value) => onChange("experienceLevel", value)}
            placeholder="Select your experience level"
            width="100%"
          />
        </div>
      </div>

      {/* Training Schedule */}
      <div className="space-y-4 pt-6 border-t border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-300 uppercase tracking-wide">
          Training Schedule
        </h3>

        {/* Training Frequency */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Training Frequency (days/week) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            value={preferences?.trainingFrequency || 6}
            onChange={(e) => onChange("trainingFrequency", parseInt(e.target.value))}
            min={1}
            max={7}
            className="w-full px-4 py-3 text-base bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <p className="text-xs text-zinc-500 mt-1">
            How many days per week do you plan to train?
          </p>
        </div>

        {/* Session Duration */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Session Duration (minutes) <span className="text-red-400">*</span>
          </label>
          <input
            type="number"
            value={preferences?.sessionDuration || 75}
            onChange={(e) => onChange("sessionDuration", parseInt(e.target.value))}
            min={15}
            max={180}
            step={5}
            className="w-full px-4 py-3 text-base bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <p className="text-xs text-zinc-500 mt-1">
            Average length of your training sessions
          </p>
        </div>

        {/* Preferred Training Times */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Preferred Training Times <span className="text-zinc-500">(Optional)</span>
          </label>
          <MultiSelectDropdown
            value={preferences?.preferredTrainingTimes || []}
            options={trainingTimeOptions}
            onChange={(value) => onChange("preferredTrainingTimes", value)}
            placeholder="Select your preferred training times"
          />
        </div>

        {/* Rest Days Preference */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Rest Days Preference <span className="text-zinc-500">(Optional)</span>
          </label>
          <MultiSelectDropdown
            value={preferences?.restDaysPreference || []}
            options={restDayOptions}
            onChange={(value) => onChange("restDaysPreference", value)}
            placeholder="Select your preferred rest days"
          />
        </div>
      </div>

      {/* Cardio Preference */}
      <div className="space-y-4 pt-6 border-t border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-300 uppercase tracking-wide">
          Cardio
        </h3>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Preferred Cardio Type <span className="text-zinc-500">(Optional)</span>
          </label>
          <select
            value={preferences?.preferredCardio || ""}
            onChange={(e) => onChange("preferredCardio", e.target.value || null)}
            className="w-full px-4 py-3 text-base bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">None / No preference</option>
            <option value="running">Running</option>
            <option value="cycling">Cycling</option>
            <option value="rowing">Rowing</option>
            <option value="swimming">Swimming</option>
            <option value="walking">Walking</option>
            <option value="elliptical">Elliptical</option>
            <option value="jump_rope">Jump Rope</option>
          </select>
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
