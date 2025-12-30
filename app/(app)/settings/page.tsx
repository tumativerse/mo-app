"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ProfileLoadingAnimation } from "@/components/profile-loading-animation";
import { ProfileTab } from "@/components/settings/profile-tab";
import { TrainingTab } from "@/components/settings/training-tab";
import { EquipmentTab } from "@/components/settings/equipment-tab";
import { LifestyleTab } from "@/components/settings/lifestyle-tab";
import { PreferencesTab } from "@/components/settings/preferences-tab";

interface SettingsData {
  profile: any;
  preferences: any;
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<SettingsData | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "training" | "equipment" | "lifestyle" | "preferences">("profile");
  const [error, setError] = useState<string | null>(null);

  // Local state for form changes (not yet saved)
  const [profile, setProfile] = useState<any>(null);
  const [preferences, setPreferences] = useState<any>(null);

  // Fetch profile and preferences data
  useEffect(() => {
    async function fetchData() {
      try {
        const [profileRes, preferencesRes] = await Promise.all([
          fetch("/api/user/profile"),
          fetch("/api/preferences"),
        ]);

        if (!profileRes.ok || !preferencesRes.ok) {
          throw new Error("Failed to fetch settings data");
        }

        const [profileData, preferencesData] = await Promise.all([
          profileRes.json(),
          preferencesRes.json(),
        ]);

        setData({
          profile: profileData.profile,
          preferences: preferencesData.preferences,
        });
        // Initialize local state for editing
        setProfile(profileData.profile);
        setPreferences(preferencesData.preferences);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Handle profile field changes
  const handleProfileChange = (field: string, value: any) => {
    setProfile((prev: any) => ({ ...prev, [field]: value }));
  };

  // Handle preferences field changes
  const handlePreferencesChange = (field: string, value: any) => {
    setPreferences((prev: any) => ({ ...prev, [field]: value }));
  };

  // Validate required fields
  const validateForm = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Profile required fields
    if (!profile?.fullName?.trim()) {
      errors.push("Full name is required");
    }
    if (!profile?.dateOfBirth) {
      errors.push("Date of birth is required");
    }
    if (!profile?.gender) {
      errors.push("Gender is required");
    }
    if (!profile?.heightCm) {
      errors.push("Height is required");
    }

    // Training required fields
    if (!preferences?.fitnessGoal) {
      errors.push("Fitness goal is required");
    }
    if (!preferences?.experienceLevel) {
      errors.push("Experience level is required");
    }
    if (!preferences?.trainingFrequency || preferences.trainingFrequency < 1) {
      errors.push("Training frequency is required");
    }
    if (!preferences?.sessionDuration || preferences.sessionDuration < 15) {
      errors.push("Session duration is required");
    }

    // Equipment required fields
    if (!preferences?.defaultEquipmentLevel) {
      errors.push("Equipment level is required");
    }

    return { valid: errors.length === 0, errors };
  };

  // Save changes
  const handleSave = async () => {
    const validation = validateForm();
    if (!validation.valid) {
      toast.error("Please fill in all required fields");
      validation.errors.forEach((error) => toast.error(error));
      return;
    }

    setSaving(true);
    try {
      // Save profile and preferences in parallel
      const [profileRes, preferencesRes] = await Promise.all([
        fetch("/api/user/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profile),
        }),
        fetch("/api/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(preferences),
        }),
      ]);

      if (!profileRes.ok || !preferencesRes.ok) {
        throw new Error("Failed to save settings");
      }

      toast.success("Settings saved successfully!");

      // Update the original data state to reflect saved changes
      setData({ profile, preferences });
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <ProfileLoadingAnimation gender={data?.profile?.gender} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-zinc-950 p-4 flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400">Failed to load settings</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "profile" as const, label: "Profile", icon: "👤" },
    { id: "training" as const, label: "Training", icon: "💪" },
    { id: "equipment" as const, label: "Equipment", icon: "🏋️" },
    { id: "lifestyle" as const, label: "Lifestyle", icon: "🌱" },
    { id: "preferences" as const, label: "Preferences", icon: "⚙️" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-zinc-100">Settings</h1>
          <p className="text-zinc-400">
            Manage your profile, training preferences, and app settings
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-zinc-800">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors
                  border-b-2 -mb-px
                  ${
                    activeTab === tab.id
                      ? "border-green-500 text-green-500"
                      : "border-transparent text-zinc-400 hover:text-zinc-100 hover:border-zinc-700"
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
          {activeTab === "profile" && (
            <ProfileTab profile={profile} onChange={handleProfileChange} />
          )}

          {activeTab === "training" && (
            <TrainingTab preferences={preferences} onChange={handlePreferencesChange} />
          )}

          {activeTab === "equipment" && (
            <EquipmentTab preferences={preferences} onChange={handlePreferencesChange} />
          )}

          {activeTab === "lifestyle" && (
            <LifestyleTab preferences={preferences} onChange={handlePreferencesChange} />
          )}

          {activeTab === "preferences" && (
            <PreferencesTab
              profile={profile}
              preferences={preferences}
              onProfileChange={handleProfileChange}
              onPreferencesChange={handlePreferencesChange}
            />
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end gap-3">
          <button
            onClick={() => window.history.back()}
            disabled={saving}
            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {saving ? (
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
    </div>
  );
}
