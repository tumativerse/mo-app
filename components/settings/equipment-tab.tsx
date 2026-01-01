"use client";

import { Save, Loader2, Building2, Home, User, Dumbbell, Weight, Circle, Link2, MoveUp, Box, BedDouble, Cable, Footprints, RotateCw, Wrench, Cog } from "lucide-react";
import { SingleSelectDropdown } from "@/components/ui/single-select-dropdown";
import { MultiSelectDropdown } from "@/components/ui/multi-select-dropdown";

interface EquipmentTabProps {
  preferences: any;
  onChange: (field: string, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function EquipmentTab({ preferences, onChange, onSave, onCancel, isSaving = false }: EquipmentTabProps) {
  const equipmentLevelOptions = [
    { value: "full_gym", label: "Full Gym Access", icon: Building2, description: "Commercial gym or fully equipped home gym" },
    { value: "home_gym", label: "Home Gym", icon: Home, description: "Basic equipment at home" },
    { value: "bodyweight", label: "Bodyweight Only", icon: User, description: "Minimal or no equipment" },
  ];

  const equipmentItems = [
    { value: "barbell", label: "Barbell" },
    { value: "dumbbells", label: "Dumbbells" },
    { value: "kettlebells", label: "Kettlebells" },
    { value: "resistance_bands", label: "Resistance Bands" },
    { value: "pull_up_bar", label: "Pull-up Bar" },
    { value: "squat_rack", label: "Squat Rack" },
    { value: "bench", label: "Bench" },
    { value: "cable_machine", label: "Cable Machine" },
    { value: "leg_press", label: "Leg Press" },
    { value: "leg_curl_extension", label: "Leg Curl/Extension" },
    { value: "smith_machine", label: "Smith Machine" },
    { value: "other_machines", label: "Other Machines" },
  ];

  return (
    <div className="space-y-6 pb-4">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
          Equipment Setup
        </h2>
        <p className="text-sm text-muted-foreground mb-4 sm:mb-6">
          Tell us what equipment you have access to
        </p>
      </div>

      {/* Equipment Level */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Equipment Level <span className="text-destructive">*</span>
        </label>
        <SingleSelectDropdown
          value={preferences?.defaultEquipmentLevel || ""}
          options={equipmentLevelOptions}
          onChange={(value) => onChange("defaultEquipmentLevel", value)}
          placeholder="Select your equipment level"
          width="100%"
        />
      </div>

      {/* Available Equipment */}
      {preferences?.defaultEquipmentLevel !== "bodyweight" && (
        <div className="pt-6 border-t border-border">
          <label className="block text-sm font-medium text-foreground mb-2">
            Available Equipment
          </label>
          <p className="text-xs text-muted-foreground mb-3">
            Select all equipment you have access to (helps us suggest better exercises)
          </p>
          <MultiSelectDropdown
            value={preferences?.availableEquipment || []}
            options={equipmentItems}
            onChange={(value) => onChange("availableEquipment", value)}
            placeholder="Select available equipment"
          />
        </div>
      )}

      {preferences?.defaultEquipmentLevel === "bodyweight" && (
        <div className="p-4 bg-muted/50 border border-border rounded-lg flex items-start gap-3 transition-colors">
          <User className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            You selected Bodyweight Only. We'll suggest bodyweight and minimal equipment exercises for your workouts.
          </p>
        </div>
      )}

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
