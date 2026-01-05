'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerItem } from '@/lib/animations';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SingleSelectDropdown } from '@/components/ui/single-select-dropdown';
import { MultiSelectDropdown } from '@/components/ui/multi-select-dropdown';
import { toast } from 'sonner';
import { Loader2, Check } from 'lucide-react';

interface PreferencesData {
  experienceLevel: 'beginner' | 'intermediate' | 'advanced';
  fitnessGoals: string[];
  preferredTrainingTimes: string[];
  restDaysPreference: number[];
  equipmentLevel: 'home' | 'gym' | 'full_gym';
  availableEquipment: string[];
}

interface PreferencesSettingsProps {
  initialData: PreferencesData;
  onUpdate: (data: PreferencesData) => void;
}

const EXPERIENCE_OPTIONS = [
  { label: 'Beginner', value: 'beginner' },
  { label: 'Intermediate', value: 'intermediate' },
  { label: 'Advanced', value: 'advanced' },
];

const FITNESS_GOAL_OPTIONS = [
  { label: 'Get Stronger', value: 'get_stronger' },
  { label: 'Build Muscle', value: 'build_muscle' },
  { label: 'Lose Weight', value: 'lose_weight' },
  { label: 'Improve Endurance', value: 'improve_endurance' },
  { label: 'Stay Active', value: 'stay_active' },
];

const TRAINING_TIME_OPTIONS = [
  { label: 'Early Morning (5-8 AM)', value: 'early_morning' },
  { label: 'Morning (8-12 PM)', value: 'morning' },
  { label: 'Afternoon (12-5 PM)', value: 'afternoon' },
  { label: 'Evening (5-9 PM)', value: 'evening' },
  { label: 'Night (9 PM+)', value: 'night' },
];

const REST_DAY_OPTIONS = [
  { label: 'Monday', value: '1' },
  { label: 'Tuesday', value: '2' },
  { label: 'Wednesday', value: '3' },
  { label: 'Thursday', value: '4' },
  { label: 'Friday', value: '5' },
  { label: 'Saturday', value: '6' },
  { label: 'Sunday', value: '0' },
];

const EQUIPMENT_LEVEL_OPTIONS = [
  { label: 'Home Gym (Basic)', value: 'home' },
  { label: 'Commercial Gym', value: 'gym' },
  { label: 'Fully Equipped Gym', value: 'full_gym' },
];

const EQUIPMENT_OPTIONS = [
  { label: 'Barbell', value: 'barbell' },
  { label: 'Dumbbells', value: 'dumbbells' },
  { label: 'Kettlebells', value: 'kettlebells' },
  { label: 'Resistance Bands', value: 'resistance_bands' },
  { label: 'Pull-up Bar', value: 'pull_up_bar' },
  { label: 'Bench', value: 'bench' },
  { label: 'Squat Rack', value: 'squat_rack' },
  { label: 'Cable Machine', value: 'cable_machine' },
];

export function PreferencesSettings({ initialData, onUpdate }: PreferencesSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [data, setData] = useState(initialData);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save');
      }

      const updated = await response.json();
      onUpdate(updated);
      toast.success('Preferences updated successfully!');
      setIsEditing(false);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 3000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update preferences');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setData(initialData);
    setIsEditing(false);
  };

  return (
    <motion.div variants={staggerItem}>
      <Card className="border-2 border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-semibold">Training Preferences</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Your training experience and goals
              </p>
            </div>
            <div className="flex items-center gap-3 self-start sm:self-center">
              {justSaved && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 text-green-600 dark:text-green-400"
                >
                  <Check className="h-4 w-4" />
                  <span className="text-sm">Saved</span>
                </motion.div>
              )}
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="shrink-0 min-h-[44px]"
                >
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="min-h-[44px]"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="min-w-[80px] min-h-[44px]"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save'
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {isEditing ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4 sm:space-y-6"
              >
                <div className="space-y-2">
                  <Label>Experience Level</Label>
                  <SingleSelectDropdown
                    options={EXPERIENCE_OPTIONS}
                    value={data.experienceLevel}
                    onChange={(value) =>
                      setData({ ...data, experienceLevel: value as typeof data.experienceLevel })
                    }
                    placeholder="Select experience level"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Fitness Goals</Label>
                  <MultiSelectDropdown
                    options={FITNESS_GOAL_OPTIONS}
                    selectedValues={data.fitnessGoals}
                    onChange={(values) => setData({ ...data, fitnessGoals: values })}
                    placeholder="Select your goals"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Preferred Training Times</Label>
                  <MultiSelectDropdown
                    options={TRAINING_TIME_OPTIONS}
                    selectedValues={data.preferredTrainingTimes}
                    onChange={(values) => setData({ ...data, preferredTrainingTimes: values })}
                    placeholder="Select preferred times"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Rest Days</Label>
                  <MultiSelectDropdown
                    options={REST_DAY_OPTIONS}
                    selectedValues={data.restDaysPreference.map(String)}
                    onChange={(values) =>
                      setData({ ...data, restDaysPreference: values.map(Number) })
                    }
                    placeholder="Select rest days"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Equipment Access</Label>
                  <SingleSelectDropdown
                    options={EQUIPMENT_LEVEL_OPTIONS}
                    value={data.equipmentLevel}
                    onChange={(value) =>
                      setData({ ...data, equipmentLevel: value as typeof data.equipmentLevel })
                    }
                    placeholder="Select equipment level"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Available Equipment</Label>
                  <MultiSelectDropdown
                    options={EQUIPMENT_OPTIONS}
                    selectedValues={data.availableEquipment}
                    onChange={(values) => setData({ ...data, availableEquipment: values })}
                    placeholder="Select available equipment"
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="read"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-3"
              >
                <DataRow
                  label="Experience Level"
                  value={
                    EXPERIENCE_OPTIONS.find((opt) => opt.value === data.experienceLevel)?.label ||
                    data.experienceLevel
                  }
                />
                <DataRow
                  label="Fitness Goals"
                  value={
                    data.fitnessGoals.length > 0
                      ? data.fitnessGoals
                          .map(
                            (goal) =>
                              FITNESS_GOAL_OPTIONS.find((opt) => opt.value === goal)?.label || goal
                          )
                          .join(', ')
                      : 'None selected'
                  }
                />
                <DataRow
                  label="Training Times"
                  value={
                    data.preferredTrainingTimes.length > 0
                      ? data.preferredTrainingTimes
                          .map(
                            (time) =>
                              TRAINING_TIME_OPTIONS.find((opt) => opt.value === time)?.label || time
                          )
                          .join(', ')
                      : 'None selected'
                  }
                />
                <DataRow
                  label="Rest Days"
                  value={
                    data.restDaysPreference.length > 0
                      ? data.restDaysPreference
                          .map(
                            (day) =>
                              REST_DAY_OPTIONS.find((opt) => opt.value === String(day))?.label ||
                              String(day)
                          )
                          .join(', ')
                      : 'None selected'
                  }
                />
                <DataRow
                  label="Equipment Level"
                  value={
                    EQUIPMENT_LEVEL_OPTIONS.find((opt) => opt.value === data.equipmentLevel)
                      ?.label || data.equipmentLevel
                  }
                />
                <DataRow
                  label="Available Equipment"
                  value={
                    data.availableEquipment.length > 0
                      ? data.availableEquipment
                          .map(
                            (eq) => EQUIPMENT_OPTIONS.find((opt) => opt.value === eq)?.label || eq
                          )
                          .join(', ')
                      : 'None selected'
                  }
                />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2 border-b border-border last:border-0">
      <dt className="text-sm font-medium text-muted-foreground sm:w-48 shrink-0">{label}</dt>
      <dd className="text-sm sm:text-base text-foreground">{value}</dd>
    </div>
  );
}
