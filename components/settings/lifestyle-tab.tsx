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
        <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
          Lifestyle Information
        </h2>
        <p className="text-sm text-muted-foreground mb-4 sm:mb-6">
          Your daily activity and schedule help us optimize recovery
        </p>
      </div>

      {/* Activity Level */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Activity Level <span className="text-muted-foreground">(Optional)</span>
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
      <div className="pt-6 border-t border-border">
        <label className="block text-sm font-medium text-foreground mb-2">
          Occupation Type <span className="text-muted-foreground">(Optional)</span>
        </label>
        <SingleSelectDropdown
          value={preferences?.occupationType || ""}
          options={[
            { value: "", label: "Select occupation type", description: "Choose your work type" },
            { value: "desk_job", label: "Desk Job / Office Work", description: "Sedentary work" },
            { value: "standing_job", label: "Standing Job", description: "Retail, teaching, etc." },
            { value: "physical_labor", label: "Physical Labor", description: "Construction, warehouse" },
            { value: "mixed", label: "Mixed", description: "Varies day to day" },
            { value: "student", label: "Student", description: "Academic focus" },
            { value: "retired", label: "Retired", description: "No current employment" },
            { value: "other", label: "Other", description: "Different type" },
          ]}
          onChange={(value) => onChange("occupationType", value || null)}
          placeholder="Select occupation type"
          width="100%"
          showIcons={false}
        />
      </div>

      {/* Sleep Schedule */}
      <div className="space-y-4 pt-6 border-t border-border">
        <h3 className="text-sm font-medium text-foreground uppercase tracking-wide">
          Sleep Schedule
        </h3>
        <p className="text-xs text-muted-foreground">
          Helps us optimize recovery recommendations and workout timing
        </p>

        {/* Typical Bedtime */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Typical Bedtime <span className="text-muted-foreground">(Optional)</span>
          </label>
          <input
            type="time"
            value={preferences?.typicalBedtime || ""}
            onChange={(e) => onChange("typicalBedtime", e.target.value || null)}
            className="w-full px-4 py-3 text-base bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          />
        </div>

        {/* Typical Wake Time */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Typical Wake Time <span className="text-muted-foreground">(Optional)</span>
          </label>
          <input
            type="time"
            value={preferences?.typicalWakeTime || ""}
            onChange={(e) => onChange("typicalWakeTime", e.target.value || null)}
            className="w-full px-4 py-3 text-base bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-colors"
          />
        </div>

        {preferences?.typicalBedtime && preferences?.typicalWakeTime && (
          <div className="p-4 bg-muted/50 border border-border rounded-lg flex items-start gap-3 transition-colors">
            <Moon className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Sleep window: {preferences.typicalBedtime} - {preferences.typicalWakeTime}
            </p>
          </div>
        )}
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
          className="w-full sm:w-auto px-6 py-3 text-base rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center touch-manipulation"
          style={{
            backgroundColor: 'var(--user-accent-color, #0BA08B)',
            color: 'white'
          }}
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
