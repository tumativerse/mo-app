"use client";

import { Save, Loader2 } from "lucide-react";

interface TrainingTabProps {
  preferences: any;
  onChange: (field: string, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function TrainingTab({ preferences, onChange, onSave, onCancel, isSaving = false }: TrainingTabProps) {
  const toggleTrainingTime = (time: string) => {
    const current = preferences?.preferredTrainingTimes || [];
    const updated = current.includes(time)
      ? current.filter((t: string) => t !== time)
      : [...current, time];
    onChange("preferredTrainingTimes", updated);
  };

  const toggleRestDay = (day: string) => {
    const current = preferences?.restDaysPreference || [];
    const updated = current.includes(day)
      ? current.filter((d: string) => d !== day)
      : [...current, day];
    onChange("restDaysPreference", updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100 mb-2">
          Training Profile
        </h2>
        <p className="text-sm text-zinc-400 mb-6">
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
          <label className="block text-sm font-medium text-zinc-300 mb-3">
            Fitness Goal <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: "strength", label: "Strength", icon: "💪", desc: "Max strength" },
              { value: "hypertrophy", label: "Muscle Building", icon: "🦾", desc: "Size & definition" },
              { value: "endurance", label: "Endurance", icon: "🏃", desc: "Stamina & conditioning" },
              { value: "general", label: "General Fitness", icon: "⚡", desc: "Overall health" },
            ].map((goal) => (
              <button
                key={goal.value}
                type="button"
                onClick={() => onChange("fitnessGoal", goal.value)}
                className={`
                  p-4 rounded-lg border-2 transition-all
                  ${
                    preferences?.fitnessGoal === goal.value
                      ? "border-green-500 bg-green-500/10"
                      : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                  }
                `}
              >
                <div className="text-3xl mb-2">{goal.icon}</div>
                <div className={`text-sm font-medium ${preferences?.fitnessGoal === goal.value ? "text-green-400" : "text-zinc-300"}`}>
                  {goal.label}
                </div>
                <div className="text-xs text-zinc-500 mt-1">{goal.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Experience Level */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">
            Experience Level <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { value: "beginner", label: "Beginner", desc: "< 1 year consistent training" },
              { value: "intermediate", label: "Intermediate", desc: "1-3 years" },
              { value: "advanced", label: "Advanced", desc: "3+ years" },
            ].map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => onChange("experienceLevel", level.value)}
                className={`
                  p-4 rounded-lg border-2 transition-all text-left
                  ${
                    preferences?.experienceLevel === level.value
                      ? "border-green-500 bg-green-500/10"
                      : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                  }
                `}
              >
                <div className={`text-sm font-medium mb-1 ${preferences?.experienceLevel === level.value ? "text-green-400" : "text-zinc-300"}`}>
                  {level.label}
                </div>
                <div className="text-xs text-zinc-500">{level.desc}</div>
              </button>
            ))}
          </div>
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
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500"
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
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
          <p className="text-xs text-zinc-500 mt-1">
            Average length of your training sessions
          </p>
        </div>

        {/* Preferred Training Times */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">
            Preferred Training Times <span className="text-zinc-500">(Optional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "morning", label: "Morning", time: "5am-10am" },
              { value: "midday", label: "Midday", time: "10am-2pm" },
              { value: "afternoon", label: "Afternoon", time: "2pm-6pm" },
              { value: "evening", label: "Evening", time: "6pm-10pm" },
              { value: "late_night", label: "Late Night", time: "10pm+" },
            ].map((time) => (
              <button
                key={time.value}
                type="button"
                onClick={() => toggleTrainingTime(time.value)}
                className={`
                  px-4 py-2 rounded-lg border transition-all
                  ${
                    preferences?.preferredTrainingTimes?.includes(time.value)
                      ? "border-green-500 bg-green-500/10 text-green-400"
                      : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600"
                  }
                `}
              >
                <div className="text-sm font-medium">{time.label}</div>
                <div className="text-xs opacity-75">{time.time}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Rest Days Preference */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">
            Rest Days Preference <span className="text-zinc-500">(Optional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { value: "sunday", label: "Sun" },
              { value: "monday", label: "Mon" },
              { value: "tuesday", label: "Tue" },
              { value: "wednesday", label: "Wed" },
              { value: "thursday", label: "Thu" },
              { value: "friday", label: "Fri" },
              { value: "saturday", label: "Sat" },
            ].map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleRestDay(day.value)}
                className={`
                  px-4 py-2 rounded-lg border transition-all min-w-[60px]
                  ${
                    preferences?.restDaysPreference?.includes(day.value)
                      ? "border-green-500 bg-green-500/10 text-green-400"
                      : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600"
                  }
                `}
              >
                {day.label}
              </button>
            ))}
          </div>
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
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500"
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
          className="px-6 py-2.5 border border-zinc-700 text-zinc-300 rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
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
