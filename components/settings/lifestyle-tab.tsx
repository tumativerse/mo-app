"use client";

interface LifestyleTabProps {
  preferences: any;
  onChange: (field: string, value: any) => void;
}

export function LifestyleTab({ preferences, onChange }: LifestyleTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100 mb-2">
          Lifestyle Information
        </h2>
        <p className="text-sm text-zinc-400 mb-6">
          Your daily activity and schedule help us optimize recovery
        </p>
      </div>

      {/* Activity Level */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-3">
          Activity Level <span className="text-zinc-500">(Optional)</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { value: "sedentary", label: "Sedentary", icon: "🪑", desc: "Desk job, minimal daily movement" },
            { value: "lightly_active", label: "Lightly Active", icon: "🚶", desc: "Light walking, some standing" },
            { value: "moderately_active", label: "Moderately Active", icon: "🏃", desc: "On feet frequently, regular movement" },
            { value: "very_active", label: "Very Active", icon: "🏋️", desc: "Physical labor or high daily activity" },
          ].map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => onChange("activityLevel", level.value)}
              className={`
                p-4 rounded-lg border-2 transition-all text-left
                ${
                  preferences?.activityLevel === level.value
                    ? "border-green-500 bg-green-500/10"
                    : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{level.icon}</div>
                <div className="flex-1">
                  <div className={`text-sm font-medium mb-1 ${preferences?.activityLevel === level.value ? "text-green-400" : "text-zinc-300"}`}>
                    {level.label}
                  </div>
                  <div className="text-xs text-zinc-500">{level.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Occupation Type */}
      <div className="pt-6 border-t border-zinc-800">
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          Occupation Type <span className="text-zinc-500">(Optional)</span>
        </label>
        <select
          value={preferences?.occupationType || ""}
          onChange={(e) => onChange("occupationType", e.target.value || null)}
          className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500"
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
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500"
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
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {preferences?.typicalBedtime && preferences?.typicalWakeTime && (
          <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
            <p className="text-sm text-zinc-400">
              💤 Sleep window: {preferences.typicalBedtime} - {preferences.typicalWakeTime}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
