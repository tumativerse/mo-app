"use client";

import { useState, useEffect } from "react";
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
import { pageTransition, staggerContainer, staggerItem } from "@/lib/animations";
import { useTheme } from "@/lib/contexts/theme-context";

interface SettingsData {
  profile: any;
  preferences: any;
}

export default function SettingsPage() {
  const { setTheme, setAccentColor } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<SettingsData | null>(null);
  const [activeTab, setActiveTab] = useState<string>("profile");
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

        // Sync theme context with user preferences
        if (preferencesData.preferences?.theme) {
          setTheme(preferencesData.preferences.theme);
        }
        if (preferencesData.preferences?.accentColor) {
          setAccentColor(preferencesData.preferences.accentColor);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [setTheme, setAccentColor]);

  // Handle profile field changes
  const handleProfileChange = (field: string, value: any) => {
    setProfile((prev: any) => ({ ...prev, [field]: value }));
  };

  // Handle preferences field changes
  const handlePreferencesChange = (field: string, value: any) => {
    setPreferences((prev: any) => ({ ...prev, [field]: value }));

    // Apply theme changes immediately for live preview
    if (field === "theme") {
      setTheme(value);
    } else if (field === "accentColor") {
      setAccentColor(value);
    }
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Manage your profile, training preferences, and app settings
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Tab Navigation - Mobile optimized, sticky on scroll */}
        <div className="sticky top-0 z-10 bg-background pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 pt-2">
          <TabsList className="w-full h-auto grid grid-cols-5 gap-2 p-1.5 bg-muted/50 rounded-xl">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex flex-col items-center justify-center gap-1 px-1 py-3 text-xs sm:text-sm data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg transition-all"
                  style={{ minHeight: "60px" }}
                >
                  <Icon className="h-5 w-5 sm:h-5 sm:w-5 shrink-0" />
                  <span className="text-[10px] sm:text-xs leading-tight text-center">{tab.label}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Tab Content */}
        <Card>
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
                  onSave={handleSave}
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
                  onSave={handleSave}
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
                  onSave={handleSave}
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
                  onSave={handleSave}
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
                  onSave={handleSave}
                  onCancel={() => window.history.back()}
                  isSaving={saving}
                />
              </motion.div>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </motion.div>
  );
}
