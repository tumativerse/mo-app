"use client";

import { Save, Loader2 } from "lucide-react";

interface EquipmentTabProps {
  preferences: any;
  onChange: (field: string, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function EquipmentTab({ preferences, onChange, onSave, onCancel, isSaving = false }: EquipmentTabProps) {
  const toggleEquipment = (equipment: string) => {
    const current = preferences?.availableEquipment || [];
    const updated = current.includes(equipment)
      ? current.filter((e: string) => e !== equipment)
      : [...current, equipment];
    onChange("availableEquipment", updated);
  };

  const equipmentList = [
    { value: "barbell", label: "Barbell", icon: "🏋️" },
    { value: "dumbbells", label: "Dumbbells", icon: "💪" },
    { value: "kettlebells", label: "Kettlebells", icon: "⚫" },
    { value: "resistance_bands", label: "Resistance Bands", icon: "🔗" },
    { value: "pull_up_bar", label: "Pull-up Bar", icon: "⬆️" },
    { value: "squat_rack", label: "Squat Rack", icon: "🏗️" },
    { value: "bench", label: "Bench", icon: "🛏️" },
    { value: "cable_machine", label: "Cable Machine", icon: "🔌" },
    { value: "leg_press", label: "Leg Press", icon: "🦵" },
    { value: "leg_curl_extension", label: "Leg Curl/Extension", icon: "🔄" },
    { value: "smith_machine", label: "Smith Machine", icon: "🔩" },
    { value: "other_machines", label: "Other Machines", icon: "⚙️" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100 mb-2">
          Equipment Setup
        </h2>
        <p className="text-sm text-zinc-400 mb-6">
          Tell us what equipment you have access to
        </p>
      </div>

      {/* Equipment Level */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-3">
          Equipment Level <span className="text-red-400">*</span>
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            { value: "full_gym", label: "Full Gym Access", icon: "🏢", desc: "Commercial gym or fully equipped home gym" },
            { value: "home_gym", label: "Home Gym", icon: "🏠", desc: "Basic equipment at home" },
            { value: "bodyweight", label: "Bodyweight Only", icon: "🧘", desc: "Minimal or no equipment" },
          ].map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => onChange("defaultEquipmentLevel", level.value)}
              className={`
                p-4 rounded-lg border-2 transition-all text-left
                ${
                  preferences?.defaultEquipmentLevel === level.value
                    ? "border-green-500 bg-green-500/10"
                    : "border-zinc-700 bg-zinc-800 hover:border-zinc-600"
                }
              `}
            >
              <div className="text-3xl mb-2">{level.icon}</div>
              <div className={`text-sm font-medium mb-1 ${preferences?.defaultEquipmentLevel === level.value ? "text-green-400" : "text-zinc-300"}`}>
                {level.label}
              </div>
              <div className="text-xs text-zinc-500">{level.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Available Equipment */}
      {preferences?.defaultEquipmentLevel !== "bodyweight" && (
        <div className="pt-6 border-t border-zinc-800">
          <label className="block text-sm font-medium text-zinc-300 mb-3">
            Available Equipment
          </label>
          <p className="text-xs text-zinc-500 mb-4">
            Select all equipment you have access to (helps us suggest better exercises)
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {equipmentList.map((equipment) => (
              <button
                key={equipment.value}
                type="button"
                onClick={() => toggleEquipment(equipment.value)}
                className={`
                  p-3 rounded-lg border transition-all text-left
                  ${
                    preferences?.availableEquipment?.includes(equipment.value)
                      ? "border-green-500 bg-green-500/10 text-green-400"
                      : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600"
                  }
                `}
              >
                <div className="text-2xl mb-1">{equipment.icon}</div>
                <div className="text-xs font-medium">{equipment.label}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {preferences?.defaultEquipmentLevel === "bodyweight" && (
        <div className="p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg">
          <p className="text-sm text-zinc-400">
            💡 You selected Bodyweight Only. We'll suggest bodyweight and minimal equipment exercises for your workouts.
          </p>
        </div>
      )}

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
