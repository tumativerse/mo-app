'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { pageTransition, staggerContainer, staggerItem } from '@/lib/animations';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { ProfileSettings } from './components/profile-settings';
import { PreferencesSettings } from './components/preferences-settings';
import { LifestyleSettings } from './components/lifestyle-settings';
import { AppSettings } from './components/app-settings';

/**
 * Settings Page
 *
 * Single-page layout with sections for:
 * - Profile (name, DOB, height, weight, gender)
 * - Preferences (experience, training times, equipment)
 * - Lifestyle (activity level, sleep, stress)
 * - App Settings (units, theme, notifications)
 *
 * Each section has read/edit modes with inline editing.
 */

export const dynamic = 'force-dynamic';

interface UserProfile {
  fullName: string;
  dateOfBirth: string;
  heightCm: number;
  currentWeight: number;
  gender: 'male' | 'female' | 'other';
}

interface UserPreferences {
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  fitnessGoals: string[];
  preferredTrainingTimes: string[];
  restDaysPreference: number[];
  equipmentLevel: 'home' | 'gym' | 'full_gym';
  availableEquipment: string[];
}

interface LifestyleData {
  activityLevel:
    | 'sedentary'
    | 'lightly_active'
    | 'moderately_active'
    | 'very_active'
    | 'extremely_active';
  sleepHours: number;
  stressLevel: 'low' | 'moderate' | 'high';
}

interface AppSettingsData {
  units: 'metric' | 'imperial';
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [lifestyle, setLifestyle] = useState<LifestyleData | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettingsData>({
    units: 'metric',
    theme: 'system',
    accentColor: '#3b82f6',
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        setIsLoading(true);

        // Fetch profile
        const profileRes = await fetch('/api/user/profile');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData);
        }

        // Fetch preferences
        const prefsRes = await fetch('/api/preferences');
        if (prefsRes.ok) {
          const prefsData = await prefsRes.json();
          setPreferences(prefsData);

          // Extract lifestyle data from preferences
          if (prefsData) {
            setLifestyle({
              activityLevel: prefsData.activityLevel || 'moderately_active',
              sleepHours: prefsData.sleepHours || 7,
              stressLevel: prefsData.stressLevel || 'moderate',
            });
          }
        }

        // App settings from localStorage (client-side only)
        const savedUnits = localStorage.getItem('units');
        const savedTheme = localStorage.getItem('theme');
        const savedAccent = localStorage.getItem('accentColor');

        setAppSettings({
          units: (savedUnits as 'metric' | 'imperial') || 'metric',
          theme: (savedTheme as 'light' | 'dark' | 'system') || 'system',
          accentColor: savedAccent || '#3b82f6',
        });
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSettings();
  }, []);

  if (isLoading) {
    return <SettingsPageSkeleton />;
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="container mx-auto px-4 sm:px-6 max-w-3xl space-y-4 sm:space-y-6 pb-8"
    >
      {/* Header */}
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Manage your profile and preferences
        </p>
      </motion.div>

      {/* Sections */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-4 sm:space-y-6"
      >
        {profile && (
          <ProfileSettings
            initialData={profile}
            onUpdate={(updatedProfile) => setProfile(updatedProfile)}
          />
        )}

        {preferences && (
          <PreferencesSettings
            initialData={preferences}
            onUpdate={(updatedPrefs) => setPreferences(updatedPrefs)}
          />
        )}

        {lifestyle && (
          <LifestyleSettings
            initialData={lifestyle}
            onUpdate={(updatedLifestyle) => setLifestyle(updatedLifestyle)}
          />
        )}

        <AppSettings
          initialData={appSettings}
          onUpdate={(updatedSettings) => setAppSettings(updatedSettings)}
        />
      </motion.div>
    </motion.div>
  );
}

function SettingsPageSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-3xl space-y-4 sm:space-y-6 pb-8">
      {/* Header skeleton */}
      <div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Section skeletons */}
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56 mt-2" />
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
