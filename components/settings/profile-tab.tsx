"use client";

import { useState, useEffect } from "react";

interface ProfileTabProps {
  profile: any;
  onChange: (field: string, value: any) => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
}

export function ProfileTab({ profile, onChange, onSave, onCancel, isSaving = false }: ProfileTabProps) {
  const [heightUnit, setHeightUnit] = useState<"cm" | "inches" | "ft_in">("cm");
  const [displayHeight, setDisplayHeight] = useState<string>("");
  const [displayHeightFeet, setDisplayHeightFeet] = useState<string>("");
  const [displayHeightInches, setDisplayHeightInches] = useState<string>("");
  const [displayCurrentWeight, setDisplayCurrentWeight] = useState<string>("");
  const [displayGoalWeight, setDisplayGoalWeight] = useState<string>("");

  // Initialize height and weight displays based on profile units
  useEffect(() => {
    if (profile?.heightCm) {
      if (profile.units === "imperial") {
        setHeightUnit("ft_in");
        const totalInches = Math.round(profile.heightCm / 2.54);
        const feet = Math.floor(totalInches / 12);
        const inches = totalInches % 12;
        setDisplayHeightFeet(String(feet));
        setDisplayHeightInches(String(inches));
        setDisplayHeight(String(totalInches));
      } else {
        setHeightUnit("cm");
        setDisplayHeight(String(profile.heightCm));
      }
    }

    // Initialize weight displays (weights are stored in kg, convert to lbs if imperial)
    if (profile?.currentWeight !== null && profile?.currentWeight !== undefined) {
      if (profile.units === "imperial") {
        const lbs = (profile.currentWeight * 2.20462).toFixed(1);
        setDisplayCurrentWeight(lbs);
      } else {
        setDisplayCurrentWeight(profile.currentWeight.toFixed(1));
      }
    } else {
      setDisplayCurrentWeight("");
    }

    if (profile?.goalWeight !== null && profile?.goalWeight !== undefined) {
      if (profile.units === "imperial") {
        const lbs = (profile.goalWeight * 2.20462).toFixed(1);
        setDisplayGoalWeight(lbs);
      } else {
        setDisplayGoalWeight(profile.goalWeight.toFixed(1));
      }
    } else {
      setDisplayGoalWeight("");
    }
  }, [profile, profile?.units, profile?.heightCm, profile?.currentWeight, profile?.goalWeight]);

  // Handle height change with unit conversion
  const handleHeightChange = (value: string, unit: "cm" | "inches") => {
    setDisplayHeight(value);
    const numValue = parseFloat(value);

    if (!isNaN(numValue)) {
      // Always store in cm
      const heightInCm = unit === "inches" ? Math.round(numValue * 2.54) : numValue;
      onChange("heightCm", heightInCm);
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
    const unitCycle: Array<"cm" | "inches" | "ft_in"> = ["cm", "ft_in", "inches"];
    const currentIndex = unitCycle.indexOf(heightUnit);
    const newUnit = unitCycle[(currentIndex + 1) % unitCycle.length];
    setHeightUnit(newUnit);

    if (displayHeight || profile?.heightCm) {
      const currentCm = profile?.heightCm || 0;
      if (newUnit === "inches") {
        const inches = Math.round(currentCm / 2.54);
        setDisplayHeight(String(inches));
      } else if (newUnit === "ft_in") {
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
    const numValue = parseFloat(value);

    if (field === "currentWeight") {
      setDisplayCurrentWeight(value);
    } else {
      setDisplayGoalWeight(value);
    }

    if (!isNaN(numValue) && numValue > 0) {
      // Convert to kg if imperial, otherwise use as-is
      const weightInKg = profile?.units === "imperial"
        ? parseFloat((numValue / 2.20462).toFixed(1))
        : numValue;
      onChange(field, weightInKg);
    } else if (value === "") {
      onChange(field, null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100 mb-2">
          Personal Information
        </h2>
        <p className="text-sm text-zinc-400 mb-6">
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
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500"
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
            className="w-full px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-500 cursor-not-allowed"
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
          <input
            type="date"
            value={profile?.dateOfBirth || ""}
            onChange={(e) => onChange("dateOfBirth", e.target.value)}
            className="w-full max-w-xs px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">
            Gender <span className="text-red-400">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { value: "male", label: "Male", icon: "♂️" },
              { value: "female", label: "Female", icon: "♀️" },
              { value: "non_binary", label: "Non-binary", icon: "⚧️" },
              { value: "prefer_not_to_say", label: "Prefer not to say", icon: "—" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange("gender", option.value)}
                className={`
                  p-3 rounded-lg border-2 transition-all text-center
                  ${
                    profile?.gender === option.value
                      ? "border-green-500 bg-green-500/10 text-green-400"
                      : "border-zinc-700 bg-zinc-800 text-zinc-300 hover:border-zinc-600"
                  }
                `}
              >
                <div className="text-2xl mb-1">{option.icon}</div>
                <div className="text-xs font-medium">{option.label}</div>
              </button>
            ))}
          </div>
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
          <div className="flex gap-2">
            {heightUnit === "ft_in" ? (
              <>
                <div className="flex-1 flex gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={displayHeightFeet}
                      onChange={(e) => handleFeetChange(e.target.value)}
                      placeholder="5"
                      min="3"
                      max="8"
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                    <p className="text-xs text-zinc-500 mt-1 text-center">ft</p>
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      value={displayHeightInches}
                      onChange={(e) => handleInchesChange(e.target.value)}
                      placeholder="8"
                      min="0"
                      max="11"
                      className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                    <p className="text-xs text-zinc-500 mt-1 text-center">in</p>
                  </div>
                </div>
              </>
            ) : (
              <input
                type="number"
                value={displayHeight}
                onChange={(e) => handleHeightChange(e.target.value, heightUnit === "cm" ? "cm" : "inches")}
                placeholder={heightUnit === "cm" ? "170" : "67"}
                min={heightUnit === "cm" ? "50" : "20"}
                max={heightUnit === "cm" ? "300" : "118"}
                className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            )}
            <button
              type="button"
              onClick={toggleHeightUnit}
              className="px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-300 hover:bg-zinc-700 transition-colors min-w-[90px] shrink-0"
            >
              {heightUnit === "ft_in" ? "ft/in" : heightUnit}
            </button>
          </div>
        </div>

        {/* Current Weight */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Current Weight
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={displayCurrentWeight}
              onChange={(e) => handleWeightChange(e.target.value, "currentWeight")}
              placeholder={profile?.units === "imperial" ? "150" : "70"}
              min="20"
              max="500"
              step="0.1"
              className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 min-w-[80px] flex items-center justify-center">
              {profile?.units === "imperial" ? "lbs" : "kg"}
            </div>
          </div>
        </div>

        {/* Goal Weight */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Goal Weight <span className="text-zinc-500">(Optional)</span>
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={displayGoalWeight}
              onChange={(e) => handleWeightChange(e.target.value, "goalWeight")}
              placeholder={profile?.units === "imperial" ? "165" : "75"}
              min="20"
              max="500"
              step="0.1"
              className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <div className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-400 min-w-[80px] flex items-center justify-center">
              {profile?.units === "imperial" ? "lbs" : "kg"}
            </div>
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
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
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
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
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
            className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-zinc-800">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="w-full sm:w-auto px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={isSaving}
          className="w-full sm:w-auto px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
