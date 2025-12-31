"use client";

import { useState, useEffect } from "react";
import { NumberPicker } from "@/components/ui/number-picker";
import { DatePicker } from "@/components/ui/date-picker";
import { OptionSelector } from "@/components/ui/option-selector";

interface ProfileTabProps {
  profile: any;
  onChange: (field: string, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function ProfileTab({ profile, onChange, onSave, onCancel, isSaving = false }: ProfileTabProps) {
  // Default to imperial (ft_in) to match app default, will sync with profile.units in useEffect
  const [heightUnit, setHeightUnit] = useState<"cm" | "ft_in">(
    profile?.units === "metric" ? "cm" : "ft_in"
  );
  const [displayHeight, setDisplayHeight] = useState<string>("");
  const [displayHeightFeet, setDisplayHeightFeet] = useState<string>("");
  const [displayHeightInches, setDisplayHeightInches] = useState<string>("");
  const [displayCurrentWeight, setDisplayCurrentWeight] = useState<string>("");
  const [displayGoalWeight, setDisplayGoalWeight] = useState<string>("");

  // Initialize height and weight displays based on profile units
  useEffect(() => {
    // Always sync heightUnit with profile.units (even if no height value yet)
    // Default to imperial if units not set
    const units = profile?.units || "imperial";
    setHeightUnit(units === "imperial" ? "ft_in" : "cm");

    // Initialize height displays if height value exists
    if (profile?.heightCm) {
      if (units === "imperial") {
        const totalInches = Math.round(profile.heightCm / 2.54);
        const feet = Math.floor(totalInches / 12);
        const inches = totalInches % 12;
        setDisplayHeightFeet(String(feet));
        setDisplayHeightInches(String(inches));
        setDisplayHeight(String(totalInches));
      } else {
        setDisplayHeight(String(profile.heightCm));
      }
    }

    // Initialize weight displays (weights are stored in kg, convert to lbs if imperial)
    if (profile?.currentWeight !== null && profile?.currentWeight !== undefined) {
      if (units === "imperial") {
        const lbs = Math.round(profile.currentWeight * 2.20462);
        setDisplayCurrentWeight(String(lbs));
      } else {
        setDisplayCurrentWeight(String(Math.round(profile.currentWeight)));
      }
    } else {
      setDisplayCurrentWeight("");
    }

    if (profile?.goalWeight !== null && profile?.goalWeight !== undefined) {
      if (units === "imperial") {
        const lbs = Math.round(profile.goalWeight * 2.20462);
        setDisplayGoalWeight(String(lbs));
      } else {
        setDisplayGoalWeight(String(Math.round(profile.goalWeight)));
      }
    } else {
      setDisplayGoalWeight("");
    }
  }, [profile, profile?.units, profile?.heightCm, profile?.currentWeight, profile?.goalWeight]);

  // Handle height change with unit conversion
  const handleHeightChange = (value: string) => {
    setDisplayHeight(value);
    const numValue = parseFloat(value);

    if (!isNaN(numValue)) {
      // Always store in cm
      onChange("heightCm", Math.round(numValue));
    }
  };

  // Handle feet/inches separately
  const handleFeetChange = (value: string) => {
    setDisplayHeightFeet(value);
    const feet = parseInt(value) || 0;
    const inches = parseInt(displayHeightInches) || 0;
    const totalInches = (feet * 12) + inches;
    const heightInCm = Math.round(totalInches * 2.54);
    onChange("heightCm", heightInCm);
  };

  const handleInchesChange = (value: string) => {
    setDisplayHeightInches(value);
    const feet = parseInt(displayHeightFeet) || 0;
    const inches = parseInt(value) || 0;
    const totalInches = (feet * 12) + inches;
    const heightInCm = Math.round(totalInches * 2.54);
    onChange("heightCm", heightInCm);
  };

  const toggleHeightUnit = () => {
    const newUnit = heightUnit === "cm" ? "ft_in" : "cm";
    setHeightUnit(newUnit);

    // Update global units preference
    onChange("units", newUnit === "ft_in" ? "imperial" : "metric");

    if (displayHeight || profile?.heightCm) {
      const currentCm = profile?.heightCm || 0;
      if (newUnit === "ft_in") {
        const totalInches = Math.round(currentCm / 2.54);
        const feet = Math.floor(totalInches / 12);
        const inches = totalInches % 12;
        setDisplayHeightFeet(String(feet));
        setDisplayHeightInches(String(inches));
      } else {
        setDisplayHeight(String(currentCm));
      }
    }
  };

  // Handle weight changes (always store in kg)
  const handleWeightChange = (value: string, field: "currentWeight" | "goalWeight") => {
    const numValue = parseInt(value);

    if (field === "currentWeight") {
      setDisplayCurrentWeight(value);
    } else {
      setDisplayGoalWeight(value);
    }

    if (!isNaN(numValue) && numValue > 0) {
      // Convert to kg if imperial, otherwise use as-is (rounded to whole numbers)
      const weightInKg = profile?.units === "imperial"
        ? Math.round(numValue / 2.20462)
        : numValue;
      onChange(field, weightInKg);
    } else if (value === "") {
      onChange(field, null);
    }
  };

  return (
    <div className="space-y-6 pb-4">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold text-zinc-100 mb-2">
          Personal Information
        </h2>
        <p className="text-sm text-zinc-400 mb-4 sm:mb-6">
          🔒 All personal data is encrypted and stored securely
        </p>
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-zinc-300 uppercase tracking-wide">
          Basic Info
        </h3>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Full Name <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={profile?.fullName || ""}
            onChange={(e) => onChange("fullName", e.target.value)}
            placeholder="Enter your full name"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-base placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={profile?.email || ""}
            disabled
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-500 text-base cursor-not-allowed"
          />
          <p className="text-xs text-zinc-500 mt-1">
            Email is managed through your account settings
          </p>
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Date of Birth <span className="text-red-400">*</span>
          </label>
          <DatePicker
            value={profile?.dateOfBirth || ""}
            onChange={(value) => onChange("dateOfBirth", value)}
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Gender <span className="text-red-400">*</span>
          </label>
          <OptionSelector
            value={profile?.gender || "male"}
            options={[
              { value: "male", label: "Male" },
              { value: "female", label: "Female" },
              { value: "non_binary", label: "Non-binary" },
              { value: "prefer_not_to_say", label: "Prefer not to say" },
            ]}
            onChange={(value) => onChange("gender", value)}
          />
        </div>
      </div>

      {/* Body Metrics */}
      <div className="space-y-4 pt-6 border-t border-zinc-800">
        <h3 className="text-sm font-medium text-zinc-300 uppercase tracking-wide">
          Body Metrics
        </h3>

        {/* Height */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Height <span className="text-red-400">*</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2 sm:px-3 py-2">
              {heightUnit === "ft_in" ? (
                <div className="flex gap-2 sm:gap-4">
                  <div className="flex-1">
                    <p className="text-xs text-zinc-500 text-center mb-1">Feet</p>
                    <NumberPicker
                      value={parseInt(displayHeightFeet) || 6}
                      onChange={(val) => handleFeetChange(String(val))}
                      min={3}
                      max={8}
                      step={1}
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-zinc-500 text-center mb-1">Inches</p>
                    <NumberPicker
                      value={parseInt(displayHeightInches) || 0}
                      onChange={(val) => handleInchesChange(String(val))}
                      min={0}
                      max={11}
                      step={1}
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-xs text-zinc-500 text-center mb-1">Centimeters</p>
                  <NumberPicker
                    value={parseInt(displayHeight) || 183}
                    onChange={(val) => handleHeightChange(String(val))}
                    min={100}
                    max={250}
                    step={1}
                  />
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={toggleHeightUnit}
              className="px-4 py-3 text-base bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 hover:bg-zinc-700 active:bg-zinc-600 transition-colors min-w-[80px] shrink-0 touch-manipulation"
            >
              {heightUnit === "ft_in" ? "ft/in" : "cm"}
            </button>
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            💡 Unit preference applies throughout the app (workouts, weight tracking, etc.)
          </p>
        </div>

        {/* Current Weight */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Current Weight
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2 sm:px-3 py-2">
              <p className="text-xs text-zinc-500 text-center mb-1">
                {profile?.units === "imperial" ? "Pounds" : "Kilograms"}
              </p>
              <NumberPicker
                value={Math.round(parseFloat(displayCurrentWeight)) || (profile?.units === "imperial" ? 210 : 95)}
                onChange={(val) => handleWeightChange(String(val), "currentWeight")}
                min={profile?.units === "imperial" ? 50 : 20}
                max={profile?.units === "imperial" ? 500 : 230}
                step={1}
              />
            </div>
            <button
              type="button"
              onClick={() => onChange("units", profile?.units === "imperial" ? "metric" : "imperial")}
              className="px-4 py-3 text-base bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 hover:bg-zinc-700 active:bg-zinc-600 transition-colors min-w-[80px] shrink-0 touch-manipulation"
            >
              {profile?.units === "imperial" ? "lbs" : "kg"}
            </button>
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            💡 Unit preference applies throughout the app (workouts, weight tracking, etc.)
          </p>
        </div>

        {/* Goal Weight */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Goal Weight <span className="text-zinc-500">(Optional)</span>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-2 sm:px-3 py-2">
              <p className="text-xs text-zinc-500 text-center mb-1">
                {profile?.units === "imperial" ? "Pounds" : "Kilograms"}
              </p>
              <NumberPicker
                value={Math.round(parseFloat(displayGoalWeight)) || (profile?.units === "imperial" ? 185 : 84)}
                onChange={(val) => handleWeightChange(String(val), "goalWeight")}
                min={profile?.units === "imperial" ? 50 : 20}
                max={profile?.units === "imperial" ? 500 : 230}
                step={1}
              />
            </div>
            <button
              type="button"
              onClick={() => onChange("units", profile?.units === "imperial" ? "metric" : "imperial")}
              className="px-4 py-3 text-base bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 hover:bg-zinc-700 active:bg-zinc-600 transition-colors min-w-[80px] shrink-0 touch-manipulation"
            >
              {profile?.units === "imperial" ? "lbs" : "kg"}
            </button>
          </div>
        </div>
      </div>

      {/* Health & Safety */}
      <div className="space-y-4 pt-6 border-t border-zinc-800">
        <div>
          <h3 className="text-sm font-medium text-zinc-300 uppercase tracking-wide">
            Health & Safety Information
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            This information helps us provide safer recommendations
          </p>
        </div>

        {/* Injury History */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Injury History <span className="text-zinc-500">(Optional)</span>
          </label>
          <textarea
            value={profile?.injuryHistory || ""}
            onChange={(e) => onChange("injuryHistory", e.target.value)}
            placeholder="e.g., Lower back pain, knee issues, shoulder injury..."
            rows={3}
            maxLength={1000}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-base placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>

        {/* Chronic Conditions */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Chronic Conditions <span className="text-zinc-500">(Optional)</span>
          </label>
          <textarea
            value={profile?.chronicConditions || ""}
            onChange={(e) => onChange("chronicConditions", e.target.value)}
            placeholder="e.g., Asthma, diabetes, hypertension..."
            rows={3}
            maxLength={1000}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-base placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>

        {/* Medications */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Medications <span className="text-zinc-500">(Optional)</span>
          </label>
          <textarea
            value={profile?.medications || ""}
            onChange={(e) => onChange("medications", e.target.value)}
            placeholder="e.g., Beta blockers, blood thinners, supplements..."
            rows={3}
            maxLength={1000}
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-base placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-zinc-800">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="w-full sm:w-auto px-6 py-3 text-base bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="w-full sm:w-auto px-6 py-3 text-base bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 touch-manipulation"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </button>
      </div>
    </div>
  );
}
