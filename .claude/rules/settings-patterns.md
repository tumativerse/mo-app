# Settings Page Patterns

## Core Philosophy

Settings pages should be:

- **Scannable**: Easy to find what you need
- **Non-intimidating**: Clear, simple language
- **Forgiving**: Easy to undo changes
- **Fast**: Inline editing, save per-section (not whole page)

---

## Page Layout Pattern

### Single-Page with Sections (Recommended)

```tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { pageTransition, staggerContainer, staggerItem } from '@/lib/animations';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function SettingsPage() {
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
        <SettingsSection title="Profile" description="Personal information">
          <ProfileSettings />
        </SettingsSection>

        <SettingsSection title="Preferences" description="Training and equipment">
          <PreferencesSettings />
        </SettingsSection>

        <SettingsSection title="Lifestyle" description="Activity and recovery">
          <LifestyleSettings />
        </SettingsSection>

        <SettingsSection title="App Settings" description="Units and display">
          <AppSettings />
        </SettingsSection>
      </motion.div>
    </motion.div>
  );
}
```

---

## Settings Section Pattern

### Editable Section with Read/Edit Modes

```tsx
interface SettingsSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <motion.div variants={staggerItem}>
      <Card className="border-2 border-border bg-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-semibold">{title}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </motion.div>
  );
}
```

### Section with Edit Button

```tsx
function EditableSection({ title, description, onSave }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState(initialData);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      toast.success('Settings saved successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialData); // Reset to original
    setIsEditing(false);
  };

  return (
    <Card className="border-2 border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="shrink-0"
            >
              Edit
            </Button>
          ) : (
            <div className="flex gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={handleCancel} disabled={isSaving}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving} className="min-w-[80px]">
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
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <EditMode data={formData} onChange={setFormData} />
        ) : (
          <ReadMode data={formData} />
        )}
      </CardContent>
    </Card>
  );
}
```

---

## Read-Only Display Pattern

### Key-Value Pairs (Read Mode)

```tsx
function ReadMode({ data }: { data: ProfileData }) {
  return (
    <div className="space-y-3 sm:space-y-4">
      <DataRow label="Full Name" value={data.fullName} />
      <DataRow label="Date of Birth" value={formatDate(data.dateOfBirth)} />
      <DataRow label="Height" value={`${data.heightCm} cm`} />
      <DataRow label="Weight" value={`${data.currentWeight} kg`} />
      <DataRow label="Gender" value={capitalizeFirst(data.gender)} />
    </div>
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
```

### Grid Layout for Read Mode

```tsx
// For many fields - use grid
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  <div>
    <p className="text-xs sm:text-sm text-muted-foreground">Full Name</p>
    <p className="text-sm sm:text-base font-medium text-foreground mt-1">{data.fullName}</p>
  </div>
  <div>
    <p className="text-xs sm:text-sm text-muted-foreground">Height</p>
    <p className="text-sm sm:text-base font-medium text-foreground mt-1">{data.heightCm} cm</p>
  </div>
  {/* More fields... */}
</div>
```

---

## Edit Mode Patterns

### Form Layout

```tsx
function EditMode({ data, onChange }: EditModeProps) {
  const handleChange = (field: string, value: string | number) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Single column on mobile, two columns on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Full Name"
          value={data.fullName}
          onChange={(v) => handleChange('fullName', v)}
          required
        />
        <FormField
          label="Date of Birth"
          type="date"
          value={data.dateOfBirth}
          onChange={(v) => handleChange('dateOfBirth', v)}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          label="Height (cm)"
          type="number"
          value={data.heightCm}
          onChange={(v) => handleChange('heightCm', v)}
          required
        />
        <FormField
          label="Weight (kg)"
          type="number"
          value={data.currentWeight}
          onChange={(v) => handleChange('currentWeight', v)}
          required
        />
      </div>

      <FormField
        label="Gender"
        type="select"
        value={data.gender}
        onChange={(v) => handleChange('gender', v)}
        options={[
          { label: 'Male', value: 'male' },
          { label: 'Female', value: 'female' },
          { label: 'Other', value: 'other' },
        ]}
        required
      />
    </div>
  );
}
```

---

## Loading States

### Skeleton Loader for Sections

```tsx
import { Skeleton } from '@/components/ui/skeleton';

function SettingsSectionSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48 mt-2" />
      </CardHeader>
      <CardContent className="space-y-3">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-2/3" />
      </CardContent>
    </Card>
  );
}

// Usage
{
  isLoading ? (
    <>
      <SettingsSectionSkeleton />
      <SettingsSectionSkeleton />
    </>
  ) : (
    <SettingsSections />
  );
}
```

### Loading Button State

```tsx
<Button disabled={isSaving} className="min-w-[100px]">
  {isSaving ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Saving...
    </>
  ) : (
    'Save Changes'
  )}
</Button>
```

---

## Success/Error Feedback

### Toast Notifications

```tsx
import { toast } from 'sonner';

// Success
toast.success('Settings saved successfully!');

// Error
toast.error('Failed to save settings. Please try again.');

// Loading (auto-dismiss on completion)
const toastId = toast.loading('Saving settings...');
// Later...
toast.success('Settings saved!', { id: toastId });
```

### Inline Success Indicator

```tsx
import { Check } from 'lucide-react';

{
  justSaved && (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-2 text-green-600 dark:text-green-400"
    >
      <Check className="h-4 w-4" />
      <span className="text-sm">Saved</span>
    </motion.div>
  );
}
```

---

## Mobile Optimization

### Stack Layout

```tsx
// Mobile: Full width sections stacked
// Desktop: Two columns for compact display

<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
  <SettingsSection title="Profile" />
  <SettingsSection title="Preferences" />
</div>
```

### Touch-Friendly Buttons

```tsx
// All buttons in settings should be easy to tap
<Button
  className="min-h-[44px] w-full sm:w-auto" // Full width on mobile
>
  Save Changes
</Button>
```

### Responsive Section Headers

```tsx
<CardHeader className="pb-3">
  {/* Stack on mobile, side-by-side on desktop */}
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
    <div className="flex-1">
      <h3 className="text-base sm:text-lg font-semibold">Section Title</h3>
      <p className="text-xs sm:text-sm text-muted-foreground">Description</p>
    </div>
    <Button size="sm" className="self-start sm:self-center shrink-0">
      Edit
    </Button>
  </div>
</CardHeader>
```

---

## Collapsible Sections (Optional)

For very long settings pages, use accordions:

```tsx
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

<Accordion type="multiple" defaultValue={['profile', 'preferences']}>
  <AccordionItem value="profile">
    <AccordionTrigger className="text-lg font-semibold">Profile Information</AccordionTrigger>
    <AccordionContent>
      <ProfileSettings />
    </AccordionContent>
  </AccordionItem>

  <AccordionItem value="preferences">
    <AccordionTrigger className="text-lg font-semibold">Training Preferences</AccordionTrigger>
    <AccordionContent>
      <PreferencesSettings />
    </AccordionContent>
  </AccordionItem>
</Accordion>;
```

---

## Animations

### Section Entrance

```tsx
// Each section should stagger in
<motion.div
  variants={staggerContainer}
  initial="initial"
  animate="animate"
  className="space-y-4 sm:space-y-6"
>
  {sections.map((section) => (
    <motion.div key={section.id} variants={staggerItem}>
      <SettingsSection {...section} />
    </motion.div>
  ))}
</motion.div>
```

### Edit Mode Transition

```tsx
import { AnimatePresence } from 'framer-motion';

<AnimatePresence mode="wait">
  {isEditing ? (
    <motion.div
      key="edit"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <EditMode />
    </motion.div>
  ) : (
    <motion.div
      key="read"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <ReadMode />
    </motion.div>
  )}
</AnimatePresence>;
```

---

## Best Practices

### ✅ DO:

- Save per-section (not whole page at once)
- Show clear loading states during save
- Provide immediate feedback (toast + inline indicator)
- Use semantic field names and labels
- Make Cancel button reset to original values
- Disable form during save to prevent double submission
- Use 44px minimum touch targets on all buttons
- Use text-base (16px) on all inputs to prevent iOS zoom

### ❌ DON'T:

- Don't auto-save without user action (can be confusing)
- Don't navigate away without saving changes (warn user)
- Don't use tiny edit icons (hard to tap on mobile)
- Don't hide important settings in nested menus
- Don't use complex validation on every keystroke (wait for blur or submit)

---

## Example: Complete Settings Section

```tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { staggerItem } from '@/lib/animations';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Check } from 'lucide-react';

interface ProfileData {
  fullName: string;
  heightCm: number;
  currentWeight: number;
}

export function ProfileSettings({ initialData }: { initialData: ProfileData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [data, setData] = useState(initialData);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to save');

      toast.success('Profile updated successfully!');
      setIsEditing(false);
      setJustSaved(true);
      setTimeout(() => setJustSaved(false), 3000);
    } catch (error) {
      toast.error('Failed to update profile');
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
              <h3 className="text-lg sm:text-xl font-semibold">Profile Information</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Your personal details</p>
            </div>
            <div className="flex items-center gap-3 self-start sm:self-center">
              {justSaved && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 text-green-600"
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
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={data.fullName}
                    onChange={(e) => setData({ ...data, fullName: e.target.value })}
                    className="text-base"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={data.heightCm}
                      onChange={(e) => setData({ ...data, heightCm: Number(e.target.value) })}
                      className="text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={data.currentWeight}
                      onChange={(e) => setData({ ...data, currentWeight: Number(e.target.value) })}
                      className="text-base"
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="read"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-3"
              >
                <DataRow label="Full Name" value={data.fullName} />
                <DataRow label="Height" value={`${data.heightCm} cm`} />
                <DataRow label="Weight" value={`${data.currentWeight} kg`} />
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
```

---

## Checklist for Settings Page

Before shipping any settings page:

- [ ] All sections use Card components with consistent styling
- [ ] Edit/Cancel/Save buttons are clearly visible (44px min height)
- [ ] Loading states shown during save operations
- [ ] Success feedback via toast notification
- [ ] Error handling with user-friendly messages
- [ ] Cancel button resets to original values
- [ ] Form disabled during save (prevents double submission)
- [ ] All inputs use text-base (16px) to prevent iOS zoom
- [ ] Responsive layout (single column mobile, multi-column desktop)
- [ ] Animations on mode transitions (read ↔ edit)
- [ ] Sections stagger in on page load
- [ ] Touch targets ≥ 44px on all interactive elements
