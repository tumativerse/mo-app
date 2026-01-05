'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerItem } from '@/lib/animations';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { SingleSelectDropdown } from '@/components/ui/single-select-dropdown';
import { toast } from 'sonner';
import { Loader2, Check, AlertCircle } from 'lucide-react';

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

interface LifestyleSettingsProps {
  initialData: LifestyleData;
  onUpdate: (data: LifestyleData) => void;
}

const ACTIVITY_LEVEL_OPTIONS = [
  { label: 'Sedentary (Little or no exercise)', value: 'sedentary' },
  { label: 'Lightly Active (1-3 days/week)', value: 'lightly_active' },
  { label: 'Moderately Active (3-5 days/week)', value: 'moderately_active' },
  { label: 'Very Active (6-7 days/week)', value: 'very_active' },
  { label: 'Extremely Active (Physical job + training)', value: 'extremely_active' },
];

const STRESS_LEVEL_OPTIONS = [
  { label: 'Low', value: 'low' },
  { label: 'Moderate', value: 'moderate' },
  { label: 'High', value: 'high' },
];

export function LifestyleSettings({ initialData, onUpdate }: LifestyleSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof LifestyleData, string>>>({});

  const validateData = (): boolean => {
    const newErrors: Partial<Record<keyof LifestyleData, string>> = {};

    if (data.sleepHours < 3 || data.sleepHours > 12) {
      newErrors.sleepHours = 'Sleep hours must be between 3-12';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateData()) {
      toast.error('Please fix the errors before saving');
      return;
    }

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
      onUpdate({
        activityLevel: updated.activityLevel || data.activityLevel,
        sleepHours: updated.sleepHours || data.sleepHours,
        stressLevel: updated.stressLevel || data.stressLevel,
      });
      toast.success('Lifestyle settings updated successfully!');
      setIsEditing(false);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 3000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update lifestyle settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setData(initialData);
    setErrors({});
    setIsEditing(false);
  };

  return (
    <motion.div variants={staggerItem}>
      <Card className="border-2 border-border">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-semibold">Lifestyle Factors</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Activity, sleep, and stress levels
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
                  <Label>Activity Level</Label>
                  <SingleSelectDropdown
                    options={ACTIVITY_LEVEL_OPTIONS}
                    value={data.activityLevel}
                    onChange={(value) =>
                      setData({ ...data, activityLevel: value as typeof data.activityLevel })
                    }
                    placeholder="Select activity level"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sleepHours">
                    Sleep Hours per Night
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    id="sleepHours"
                    type="number"
                    step="0.5"
                    min="3"
                    max="12"
                    value={data.sleepHours}
                    onChange={(e) => setData({ ...data, sleepHours: Number(e.target.value) })}
                    className="text-base"
                    aria-invalid={!!errors.sleepHours}
                  />
                  {errors.sleepHours && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.sleepHours}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Stress Level</Label>
                  <SingleSelectDropdown
                    options={STRESS_LEVEL_OPTIONS}
                    value={data.stressLevel}
                    onChange={(value) =>
                      setData({ ...data, stressLevel: value as typeof data.stressLevel })
                    }
                    placeholder="Select stress level"
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
                  label="Activity Level"
                  value={
                    ACTIVITY_LEVEL_OPTIONS.find((opt) => opt.value === data.activityLevel)?.label ||
                    data.activityLevel
                  }
                />
                <DataRow label="Sleep Hours" value={`${data.sleepHours} hours/night`} />
                <DataRow
                  label="Stress Level"
                  value={
                    STRESS_LEVEL_OPTIONS.find((opt) => opt.value === data.stressLevel)?.label ||
                    data.stressLevel
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
      <dt className="text-sm font-medium text-muted-foreground sm:w-40 shrink-0">{label}</dt>
      <dd className="text-sm sm:text-base text-foreground">{value}</dd>
    </div>
  );
}
