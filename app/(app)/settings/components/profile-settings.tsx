'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerItem } from '@/lib/animations';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SingleSelectDropdown } from '@/components/ui/single-select-dropdown';
import { toast } from 'sonner';
import { Loader2, Check, AlertCircle } from 'lucide-react';

interface ProfileData {
  fullName: string;
  dateOfBirth: string;
  heightCm: number;
  currentWeight: number;
  gender: 'male' | 'female' | 'other';
}

interface ProfileSettingsProps {
  initialData: ProfileData;
  onUpdate: (data: ProfileData) => void;
}

const GENDER_OPTIONS = [
  { label: 'Male', value: 'male' },
  { label: 'Female', value: 'female' },
  { label: 'Other', value: 'other' },
];

export function ProfileSettings({ initialData, onUpdate }: ProfileSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileData, string>>>({});

  const validateData = (): boolean => {
    const newErrors: Partial<Record<keyof ProfileData, string>> = {};

    if (!data.fullName || data.fullName.trim().length === 0) {
      newErrors.fullName = 'Name is required';
    }

    if (!data.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (data.heightCm < 100 || data.heightCm > 250) {
      newErrors.heightCm = 'Height must be between 100-250 cm';
    }

    if (data.currentWeight < 30 || data.currentWeight > 300) {
      newErrors.currentWeight = 'Weight must be between 30-300 kg';
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
      const response = await fetch('/api/user/profile', {
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
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 3000);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
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
              <h3 className="text-lg sm:text-xl font-semibold">Profile Information</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Your personal details</p>
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
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="fullName">
                    Full Name
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    value={data.fullName}
                    onChange={(e) => setData({ ...data, fullName: e.target.value })}
                    className="text-base"
                    aria-invalid={!!errors.fullName}
                  />
                  {errors.fullName && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.fullName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">
                    Date of Birth
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={data.dateOfBirth}
                    onChange={(e) => setData({ ...data, dateOfBirth: e.target.value })}
                    className="text-base"
                    aria-invalid={!!errors.dateOfBirth}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.dateOfBirth}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">
                      Height (cm)
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input
                      id="height"
                      type="number"
                      value={data.heightCm}
                      onChange={(e) => setData({ ...data, heightCm: Number(e.target.value) })}
                      className="text-base"
                      aria-invalid={!!errors.heightCm}
                    />
                    {errors.heightCm && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.heightCm}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">
                      Weight (kg)
                      <span className="text-destructive ml-1">*</span>
                    </Label>
                    <Input
                      id="weight"
                      type="number"
                      value={data.currentWeight}
                      onChange={(e) => setData({ ...data, currentWeight: Number(e.target.value) })}
                      className="text-base"
                      aria-invalid={!!errors.currentWeight}
                    />
                    {errors.currentWeight && (
                      <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {errors.currentWeight}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">
                    Gender
                    <span className="text-destructive ml-1">*</span>
                  </Label>
                  <SingleSelectDropdown
                    options={GENDER_OPTIONS}
                    value={data.gender}
                    onChange={(value) => setData({ ...data, gender: value as typeof data.gender })}
                    placeholder="Select gender"
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
                <DataRow label="Full Name" value={data.fullName} />
                <DataRow
                  label="Date of Birth"
                  value={new Date(data.dateOfBirth).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                />
                <DataRow label="Height" value={`${data.heightCm} cm`} />
                <DataRow label="Weight" value={`${data.currentWeight} kg`} />
                <DataRow
                  label="Gender"
                  value={data.gender.charAt(0).toUpperCase() + data.gender.slice(1)}
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
