"use client";

export const dynamic = 'force-dynamic';

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { User, Dumbbell, Wrench, Leaf, Settings as SettingsIcon, Save, X, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProfileTab } from "@/components/settings/profile-tab";
import { TrainingTab } from "@/components/settings/training-tab";
import { EquipmentTab } from "@/components/settings/equipment-tab";
import { LifestyleTab } from "@/components/settings/lifestyle-tab";
import { PreferencesTab } from "@/components/settings/preferences-tab";
import { ProfileCompletionBanner } from "@/components/settings/profile-completion-banner";
import { pageTransition, staggerContainer, staggerItem } from "@/lib/animations";
import { useTheme } from "@/lib/contexts/theme-context";
import { checkProfileCompletion } from "@/lib/utils/profile-completion";

interface UserProfile {
  fullName?: string;
  dateOfBirth?: string;
  gender?: string;
  heightCm?: number;
  currentWeight?: number;
  goalWeight?: number;
  units?: string;
}

interface UserPreferences {
  fitnessGoal?: string;
  experienceLevel?: string;
  trainingFrequency?: number;
  sessionDuration?: number;
  defaultEquipmentLevel?: string;
  theme?: string;
  accentColor?: string;
  [key: string]: unknown;
}

interface SettingsData {
  profile: UserProfile;
  preferences: UserPreferences;
}

export default function SettingsPage() {
  const { theme: currentTheme, accentColor: currentAccentColor, setTheme, setAccentColor } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<SettingsData | null>(null);
  const [activeTab, setActiveTab] = useState<string>("profile");
  const [error, setError] = useState<string | null>(null);

  // Local state for form changes (not yet saved)
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);

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

        // Apply UI-only defaults (not saved to DB until user explicitly saves)
        const profileWithDefaults = {
          ...(profileData.profile || {}),
          units: profileData.profile?.units || "imperial",
        };

        const preferencesWithDefaults = {
          ...(preferencesData.preferences || {}),
          // Training tab defaults
          trainingFrequency: preferencesData.preferences?.trainingFrequency || 6,
          sessionDuration: preferencesData.preferences?.sessionDuration || 75,
          // Preferences tab defaults
          warmupDuration: preferencesData.preferences?.warmupDuration || "10", // String to match schema
          // Theme values from ThemeProvider (which loads from DB and has proper defaults)
          theme: preferencesData.preferences?.theme || currentTheme,
          accentColor: preferencesData.preferences?.accentColor || currentAccentColor,
        };

        // Initialize local state for editing
        setProfile(profileWithDefaults);
        setPreferences(preferencesWithDefaults);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentTheme, currentAccentColor]);

  // Handle profile field changes
  const handleProfileChange = (field: string, value: string | number) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  // Handle preferences field changes
  const handlePreferencesChange = (field: string, value: string | number | string[]) => {
    setPreferences((prev) => ({ ...prev, [field]: value }));

    // Apply theme changes immediately for live preview
    if (field === "theme" && typeof value === "string" && (value === "light" || value === "dark")) {
      setTheme(value);
    } else if (field === "accentColor" && typeof value === "string") {
      setAccentColor(value);
    }
  };

  // Validate profile fields
  const validateProfile = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

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

    return { valid: errors.length === 0, errors };
  };

  // Validate preferences fields (training + equipment)
  const validatePreferences = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

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

  // Save profile only
  const handleProfileSave = async () => {
    const validation = validateProfile();
    if (!validation.valid) {
      validation.errors.forEach((error) => toast.error(error));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });

      if (!res.ok) {
        throw new Error("Failed to save profile");
      }

      toast.success("Profile saved successfully!");
      if (profile) {
        setData((prev) => prev ? { ...prev, profile } : null);
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // Save preferences with validation (for Training & Equipment tabs)
  const handlePreferencesSave = async () => {
    const validation = validatePreferences();
    if (!validation.valid) {
      validation.errors.forEach((error) => toast.error(error));
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (!res.ok) {
        throw new Error("Failed to save preferences");
      }

      toast.success("Preferences saved successfully!");
      if (preferences) {
        setData((prev) => prev ? { ...prev, preferences } : null);
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  // Save preferences without validation (for Lifestyle & Preferences tabs - no required fields)
  const handleOptionalPreferencesSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      if (!res.ok) {
        throw new Error("Failed to save preferences");
      }

      toast.success("Preferences saved successfully!");
      if (preferences) {
        setData((prev) => prev ? { ...prev, preferences } : null);
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  // Save both profile and preferences (for Preferences tab which has units in profile)
  const handleProfileAndPreferencesSave = async () => {
    setSaving(true);
    try {
      // Only send the fields that Preferences tab actually uses
      const profilePayload = {
        units: profile?.units,
      };

      const preferencesPayload = {
        warmupDuration: preferences?.warmupDuration,
        skipGeneralWarmup: preferences?.skipGeneralWarmup,
        includeMobilityWork: preferences?.includeMobilityWork,
        theme: preferences?.theme,
        accentColor: preferences?.accentColor,
      };

      const [profileRes, preferencesRes] = await Promise.all([
        fetch("/api/user/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(profilePayload),
        }),
        fetch("/api/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(preferencesPayload),
        }),
      ]);

      if (!profileRes.ok) {
        const profileError = await profileRes.json();
        console.error("Profile API error:", profileError);
        throw new Error("Failed to save profile");
      }

      if (!preferencesRes.ok) {
        const preferencesError = await preferencesRes.json();
        console.error("Preferences API error:", preferencesError);
        throw new Error("Failed to save preferences");
      }

      toast.success("Settings saved successfully!");
      if (profile && preferences) {
        setData({ profile, preferences });
      }
    } catch (err) {
      console.error("Save error:", err);
      toast.error(err instanceof Error ? err.message : "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // Calculate profile completion status (updates in real-time)
  // MUST be before early returns to comply with Rules of Hooks
  const completionStatus = useMemo(() => {
    if (!profile || !preferences) return null;
    return checkProfileCompletion(profile, preferences);
  }, [profile, preferences]);

  if (loading) {
    return (
      <motion.div
        className="space-y-4 sm:space-y-6 pb-8"
        variants={pageTransition}
        initial="initial"
        animate="animate"
      >
        <div>
          <Skeleton className="h-7 sm:h-8 w-32 mb-2" />
          <Skeleton className="h-4 sm:h-5 w-64" />
        </div>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <Skeleton className="h-10 w-full mb-6" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (error || !data) {
    return (
      <motion.div
        className="space-y-4 sm:space-y-6 pb-8"
        variants={pageTransition}
        initial="initial"
        animate="animate"
      >
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <p className="text-destructive mb-4">Failed to load settings</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "training", label: "Training", icon: Dumbbell },
    { id: "equipment", label: "Equipment", icon: Wrench },
    { id: "lifestyle", label: "Lifestyle", icon: Leaf },
    { id: "preferences", label: "Preferences", icon: SettingsIcon },
  ];

  return (
    <motion.div
      className="space-y-4 sm:space-y-6 pb-8"
      variants={pageTransition}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Manage your profile, training preferences, and app settings
        </p>
      </motion.div>

      {/* Profile Completion Banner */}
      {completionStatus && <ProfileCompletionBanner status={completionStatus} />}

      {/* Tabs */}
      <motion.div variants={staggerItem}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tab Navigation - Mobile optimized, sticky on scroll */}
          <div className="sticky top-0 z-10 bg-background pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 pt-2">
            <TabsList className="w-full h-auto grid grid-cols-5 gap-2 p-1.5 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex flex-col items-center justify-center gap-1 px-1 py-3 text-xs sm:text-sm rounded-lg transition-all"
                    style={{ minHeight: "60px" }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <Icon className="h-5 w-5 sm:h-5 sm:w-5 shrink-0" />
                    </motion.div>
                    <span className="text-[10px] sm:text-xs leading-tight text-center">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          {/* Tab Content */}
          <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent transition-all duration-300">
            <CardContent className="p-4 sm:p-6">
            <TabsContent value="profile" className="mt-0">
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                <ProfileTab
                  profile={profile}
                  onChange={handleProfileChange}
                  onSave={handleProfileSave}
                  onCancel={() => window.history.back()}
                  isSaving={saving}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="training" className="mt-0">
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                <TrainingTab
                  preferences={preferences}
                  onChange={handlePreferencesChange}
                  onSave={handlePreferencesSave}
                  onCancel={() => window.history.back()}
                  isSaving={saving}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="equipment" className="mt-0">
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                <EquipmentTab
                  preferences={preferences}
                  onChange={handlePreferencesChange}
                  onSave={handlePreferencesSave}
                  onCancel={() => window.history.back()}
                  isSaving={saving}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="lifestyle" className="mt-0">
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                <LifestyleTab
                  preferences={preferences}
                  onChange={handlePreferencesChange}
                  onSave={handleOptionalPreferencesSave}
                  onCancel={() => window.history.back()}
                  isSaving={saving}
                />
              </motion.div>
            </TabsContent>

            <TabsContent value="preferences" className="mt-0">
              <motion.div
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                <PreferencesTab
                  profile={profile}
                  preferences={preferences}
                  onProfileChange={handleProfileChange}
                  onPreferencesChange={handlePreferencesChange}
                  onSave={handleProfileAndPreferencesSave}
                  onCancel={() => window.history.back()}
                  isSaving={saving}
                />
              </motion.div>
            </TabsContent>
          </CardContent>
        </Card>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
