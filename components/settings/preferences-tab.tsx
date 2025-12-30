"use client";

interface PreferencesTabProps {
  profile: any;
  preferences: any;
  onProfileChange: (field: string, value: any) => void;
  onPreferencesChange: (field: string, value: any) => void;
}

export function PreferencesTab({
  profile,
  preferences,
  onProfileChange,
  onPreferencesChange,
}: PreferencesTabProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100 mb-2">
          App Preferences
        </h2>
        <p className="text-sm text-zinc-400 mb-6">
          Customize your app experience and workout settings
        </p>
      </div>

      {/* Units */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-3">
          Measurement Units
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              value: "metric",
              label: "Metric",
              icon: "📏",
              desc: "Kilograms (kg) & Centimeters (cm)"
            },
            {
              value: "imperial",
              label: "Imperial",
              icon: "📐",
              desc: "Pounds (lbs) & Inches (in)"
            },
          ].map((unit) => (
            <button
              key={unit.value}
              type="button"
              onClick={() => onProfileChange("units", unit.value)}
              className={`
                p-4 rounded-lg border-2 transition-all text-left
                ${
                  profile?.units === unit.value
                    ? "border-green-500 bg-green-500/10"
                    : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div className="text-3xl">{unit.icon}</div>
                <div className="flex-1">
                  <div className={`text-sm font-medium mb-1 ${profile?.units === unit.value ? "text-green-400" : "text-zinc-300"}`}>
                    {unit.label}
                  </div>
                  <div className="text-xs text-zinc-500">{unit.desc}</div>
                </div>
              </div>
            </button>
          ))}
        </div>
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
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500"
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
    </div>
  );
}
