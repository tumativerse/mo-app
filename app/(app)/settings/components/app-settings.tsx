'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerItem } from '@/lib/animations';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { SingleSelectDropdown } from '@/components/ui/single-select-dropdown';
import { toast } from 'sonner';
import { Check } from 'lucide-react';

interface AppSettingsData {
  units: 'metric' | 'imperial';
  theme: 'light' | 'dark' | 'system';
  accentColor: string;
}

interface AppSettingsProps {
  initialData: AppSettingsData;
  onUpdate: (data: AppSettingsData) => void;
}

const UNITS_OPTIONS = [
  { label: 'Metric (kg, cm)', value: 'metric' },
  { label: 'Imperial (lbs, inches)', value: 'imperial' },
];

const THEME_OPTIONS = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' },
];

const ACCENT_COLOR_OPTIONS = [
  { label: 'Blue', value: '#3b82f6' },
  { label: 'Green', value: '#10b981' },
  { label: 'Purple', value: '#8b5cf6' },
  { label: 'Orange', value: '#f97316' },
  { label: 'Pink', value: '#ec4899' },
];

export function AppSettings({ initialData, onUpdate }: AppSettingsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [data, setData] = useState(initialData);

  const handleSave = () => {
    setIsSaving(true);
    try {
      // Save to localStorage (client-side only)
      localStorage.setItem('units', data.units);
      localStorage.setItem('theme', data.theme);
      localStorage.setItem('accentColor', data.accentColor);

      onUpdate(data);
      toast.success('App settings updated successfully!');
      setIsEditing(false);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 3000);
    } catch (error) {
      toast.error('Failed to update app settings');
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
              <h3 className="text-lg sm:text-xl font-semibold">App Settings</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Units, theme, and display preferences
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
                    {isSaving ? 'Saving...' : 'Save'}
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
                  <Label>Units</Label>
                  <SingleSelectDropdown
                    options={UNITS_OPTIONS}
                    value={data.units}
                    onChange={(value) => setData({ ...data, units: value as typeof data.units })}
                    placeholder="Select units"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Theme</Label>
                  <SingleSelectDropdown
                    options={THEME_OPTIONS}
                    value={data.theme}
                    onChange={(value) => setData({ ...data, theme: value as typeof data.theme })}
                    placeholder="Select theme"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <SingleSelectDropdown
                    options={ACCENT_COLOR_OPTIONS}
                    value={data.accentColor}
                    onChange={(value) => setData({ ...data, accentColor: value })}
                    placeholder="Select accent color"
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <div
                      className="w-8 h-8 rounded-md border-2 border-border"
                      style={{ backgroundColor: data.accentColor }}
                    />
                    <span className="text-sm text-muted-foreground">Preview</span>
                  </div>
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
                  label="Units"
                  value={UNITS_OPTIONS.find((opt) => opt.value === data.units)?.label || data.units}
                />
                <DataRow
                  label="Theme"
                  value={THEME_OPTIONS.find((opt) => opt.value === data.theme)?.label || data.theme}
                />
                <DataRow
                  label="Accent Color"
                  value={
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-md border-2 border-border"
                        style={{ backgroundColor: data.accentColor }}
                      />
                      <span>
                        {ACCENT_COLOR_OPTIONS.find((opt) => opt.value === data.accentColor)
                          ?.label || data.accentColor}
                      </span>
                    </div>
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

function DataRow({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2 border-b border-border last:border-0">
      <dt className="text-sm font-medium text-muted-foreground sm:w-40 shrink-0">{label}</dt>
      <dd className="text-sm sm:text-base text-foreground">{value}</dd>
    </div>
  );
}
