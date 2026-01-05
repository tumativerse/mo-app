# Form Patterns

## Core Principles

Forms in Mo should be:

- **Clear**: Labels always visible, no placeholder-only inputs
- **Forgiving**: Real-time validation only where helpful
- **Accessible**: Proper labels, ARIA attributes, keyboard navigation
- **Mobile-optimized**: 16px+ inputs (prevents iOS zoom), 44px+ touch targets
- **Responsive**: Stack on mobile, multi-column on desktop

---

## Basic Form Field Pattern

### Standard Input Field

```tsx
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface FormFieldProps {
  label: string;
  id: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'date';
  required?: boolean;
  error?: string;
  helperText?: string;
  placeholder?: string;
  disabled?: boolean;
}

export function FormField({
  label,
  id,
  value,
  onChange,
  type = 'text',
  required = false,
  error,
  helperText,
  placeholder,
  disabled = false,
}: FormFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm sm:text-base">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
        className="text-base" // Prevents iOS zoom
      />
      {error && (
        <p id={`${id}-error`} className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={`${id}-helper`} className="text-xs sm:text-sm text-muted-foreground">
          {helperText}
        </p>
      )}
    </div>
  );
}
```

---

## Form Layouts

### Single Column (Mobile-First)

```tsx
<form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
  <FormField label="Email" id="email" value={email} onChange={setEmail} required />
  <FormField
    label="Password"
    id="password"
    type="password"
    value={password}
    onChange={setPassword}
    required
  />
  <Button type="submit" className="w-full min-h-[44px]">
    Submit
  </Button>
</form>
```

### Two-Column Grid (Desktop)

```tsx
<form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
  {/* Single column on mobile, two columns on desktop */}
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <FormField
      label="First Name"
      id="firstName"
      value={firstName}
      onChange={setFirstName}
      required
    />
    <FormField label="Last Name" id="lastName" value={lastName} onChange={setLastName} required />
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <FormField
      label="Height (cm)"
      id="height"
      type="number"
      value={height}
      onChange={setHeight}
      required
    />
    <FormField
      label="Weight (kg)"
      id="weight"
      type="number"
      value={weight}
      onChange={setWeight}
      required
    />
  </div>

  {/* Full width field */}
  <FormField label="Email" id="email" type="email" value={email} onChange={setEmail} required />

  <Button type="submit" className="w-full sm:w-auto min-h-[44px]">
    Save Changes
  </Button>
</form>
```

---

## Specialized Input Types

### Select Dropdown

```tsx
import { SingleSelectDropdown } from '@/components/ui/single-select-dropdown';

interface SelectFieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  required?: boolean;
  error?: string;
}

export function SelectField({
  label,
  id,
  value,
  onChange,
  options,
  required,
  error,
}: SelectFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <SingleSelectDropdown
        options={options}
        value={value}
        onChange={onChange}
        placeholder={`Select ${label.toLowerCase()}`}
        aria-invalid={!!error}
      />
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
}
```

### Multi-Select

```tsx
import { MultiSelectDropdown } from '@/components/ui/multi-select-dropdown';

export function MultiSelectField({ label, id, values, onChange, options, required, error }: Props) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <MultiSelectDropdown
        options={options}
        selectedValues={values}
        onChange={onChange}
        placeholder={`Select ${label.toLowerCase()}`}
      />
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
}
```

### Date Picker

```tsx
import { DatePicker } from '@/components/ui/date-picker';

export function DateField({ label, id, value, onChange, required, error }: Props) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <DatePicker
        date={value ? new Date(value) : undefined}
        onDateChange={(date) => onChange(date?.toISOString().split('T')[0] || '')}
        placeholder="Select date"
      />
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
}
```

### Number Picker

```tsx
import { NumberPicker } from '@/components/ui/number-picker';

export function NumberField({
  label,
  id,
  value,
  onChange,
  min,
  max,
  step,
  required,
  error,
}: Props) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <NumberPicker value={value} onChange={onChange} min={min} max={max} step={step} />
      {error && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
}
```

---

## Validation Patterns

### Client-Side Validation

```tsx
import { z } from 'zod';

// Define schema
const profileSchema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  heightCm: z
    .number()
    .min(100, 'Height must be at least 100cm')
    .max(250, 'Height must be less than 250cm'),
  currentWeight: z
    .number()
    .min(30, 'Weight must be at least 30kg')
    .max(300, 'Weight must be less than 300kg'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

// In component
const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});

const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();

  // Validate
  const result = profileSchema.safeParse(formData);

  if (!result.success) {
    // Extract errors
    const fieldErrors: Partial<Record<keyof ProfileFormData, string>> = {};
    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as keyof ProfileFormData;
      fieldErrors[field] = issue.message;
    });
    setErrors(fieldErrors);
    return;
  }

  // Clear errors and submit
  setErrors({});
  handleSave(formData);
};

// In JSX
<FormField
  label="Full Name"
  id="fullName"
  value={formData.fullName}
  onChange={(v) => setFormData({ ...formData, fullName: v })}
  error={errors.fullName}
  required
/>;
```

### Real-Time Validation (Use Sparingly)

```tsx
// Only validate on blur, not on every keystroke
const handleBlur = (field: keyof ProfileFormData) => {
  const result = profileSchema.shape[field].safeParse(formData[field]);
  if (!result.success) {
    setErrors({ ...errors, [field]: result.error.issues[0].message });
  } else {
    setErrors({ ...errors, [field]: undefined });
  }
};

<Input
  value={formData.email}
  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
  onBlur={() => handleBlur('email')}
  aria-invalid={!!errors.email}
/>;
```

---

## Form State Management

### Loading State

```tsx
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    await saveData(formData);
    toast.success('Data saved successfully!');
  } catch (error) {
    toast.error('Failed to save data');
  } finally {
    setIsSubmitting(false);
  }
};

// In JSX
<Button type="submit" disabled={isSubmitting} className="min-h-[44px]">
  {isSubmitting ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Saving...
    </>
  ) : (
    'Save Changes'
  )}
</Button>;
```

### Dirty State Tracking

```tsx
const [initialData, setInitialData] = useState(data);
const [formData, setFormData] = useState(data);

const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

// Warn before leaving with unsaved changes
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [isDirty]);

// Show dirty indicator
{
  isDirty && <p className="text-sm text-muted-foreground">You have unsaved changes</p>;
}
```

---

## Submit Button Patterns

### Primary Submit Button

```tsx
<Button
  type="submit"
  disabled={isSubmitting || !isDirty}
  className="w-full sm:w-auto min-h-[44px] min-w-[120px]"
>
  {isSubmitting ? (
    <>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Saving...
    </>
  ) : (
    'Save Changes'
  )}
</Button>
```

### Submit with Cancel

```tsx
<div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
  <Button
    type="button"
    variant="outline"
    onClick={handleCancel}
    disabled={isSubmitting}
    className="order-2 sm:order-1 min-h-[44px]"
  >
    Cancel
  </Button>
  <Button
    type="submit"
    disabled={isSubmitting || !isDirty}
    className="order-1 sm:order-2 min-h-[44px] min-w-[120px]"
  >
    {isSubmitting ? (
      <>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Saving...
      </>
    ) : (
      'Save Changes'
    )}
  </Button>
</div>
```

### Sticky Footer Buttons (Mobile)

```tsx
// For long forms - stick buttons to bottom on mobile
<div className="fixed bottom-0 left-0 right-0 sm:relative bg-background border-t sm:border-0 p-4 sm:p-0 z-10">
  <div className="container mx-auto max-w-3xl flex gap-3">
    <Button
      type="button"
      variant="outline"
      onClick={handleCancel}
      disabled={isSubmitting}
      className="flex-1 sm:flex-none min-h-[44px]"
    >
      Cancel
    </Button>
    <Button type="submit" disabled={isSubmitting} className="flex-1 sm:flex-none min-h-[44px]">
      {isSubmitting ? 'Saving...' : 'Save'}
    </Button>
  </div>
</div>
```

---

## Error Handling

### Field-Level Errors

```tsx
// Show error below field
<FormField
  label="Email"
  id="email"
  value={email}
  onChange={setEmail}
  error={errors.email}
  required
/>
```

### Form-Level Errors

```tsx
// Show error at top of form
{
  formError && (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 bg-destructive/10 border border-destructive rounded-lg"
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-destructive">Error</p>
          <p className="text-sm text-destructive/90 mt-1">{formError}</p>
        </div>
      </div>
    </motion.div>
  );
}
```

### API Error Handling

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  setFormError(null);

  try {
    const response = await fetch('/api/profile', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const error = await response.json();

      // Handle field-level errors from API
      if (error.details) {
        setErrors(error.details);
      } else {
        setFormError(error.error || 'Failed to save changes');
      }
      return;
    }

    toast.success('Changes saved successfully!');
    setInitialData(formData); // Update initial state
  } catch (error) {
    setFormError('Network error. Please check your connection.');
  } finally {
    setIsSubmitting(false);
  }
};
```

---

## Success Feedback

### Toast Notification

```tsx
import { toast } from 'sonner';

toast.success('Profile updated successfully!');
```

### Inline Success Message

```tsx
{
  justSaved && (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center gap-2 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30 p-3 rounded-lg"
    >
      <Check className="h-5 w-5" />
      <span className="text-sm font-medium">Changes saved successfully</span>
    </motion.div>
  );
}
```

---

## Accessibility

### Required Fields

```tsx
// Always mark required fields visually
<Label>
  Full Name
  <span className="text-destructive ml-1" aria-label="required">
    *
  </span>
</Label>
```

### Error Announcements

```tsx
// Use aria-live for dynamic error messages
<div role="alert" aria-live="polite">
  {formError && <p className="text-destructive">{formError}</p>}
</div>
```

### Keyboard Navigation

```tsx
// Ensure all form elements are keyboard accessible
<Button
  type="submit"
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSubmit(e);
    }
  }}
>
  Submit
</Button>
```

---

## Multi-Step Forms

### Step Indicator

```tsx
const steps = [
  { id: 1, name: 'Personal Info', completed: step > 1 },
  { id: 2, name: 'Preferences', completed: step > 2 },
  { id: 3, name: 'Goals', completed: step > 3 },
];

<div className="flex items-center justify-between mb-8">
  {steps.map((s, idx) => (
    <div key={s.id} className="flex items-center flex-1">
      <div className="flex flex-col items-center flex-1">
        <div
          className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center font-medium',
            step === s.id
              ? 'bg-primary text-primary-foreground'
              : s.completed
                ? 'bg-green-600 text-white'
                : 'bg-muted text-muted-foreground'
          )}
        >
          {s.completed ? <Check className="h-5 w-5" /> : s.id}
        </div>
        <p className="text-xs mt-2 text-center">{s.name}</p>
      </div>
      {idx < steps.length - 1 && (
        <div className={cn('h-0.5 flex-1', s.completed ? 'bg-green-600' : 'bg-muted')} />
      )}
    </div>
  ))}
</div>;
```

### Navigation Buttons

```tsx
<div className="flex justify-between mt-8">
  <Button
    type="button"
    variant="outline"
    onClick={() => setStep(step - 1)}
    disabled={step === 1}
    className="min-h-[44px]"
  >
    Previous
  </Button>
  <Button
    type="submit"
    onClick={step === totalSteps ? handleSubmit : () => setStep(step + 1)}
    className="min-h-[44px]"
  >
    {step === totalSteps ? 'Complete' : 'Next'}
  </Button>
</div>
```

---

## Complete Form Example

```tsx
'use client';

import { useState } from 'react';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { staggerItem } from '@/lib/animations';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, AlertCircle, Check } from 'lucide-react';

const profileSchema = z.object({
  fullName: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  heightCm: z.number().min(100, 'Height must be at least 100cm'),
  currentWeight: z.number().min(30, 'Weight must be at least 30kg'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileForm({ initialData }: { initialData: ProfileFormData }) {
  const [formData, setFormData] = useState(initialData);
  const [initialState] = useState(initialData);
  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialState);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate
    const result = profileSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ProfileFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ProfileFormData;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to save');
      }

      toast.success('Profile updated successfully!');
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Failed to save changes');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div variants={staggerItem}>
      <Card className="border-2 border-border">
        <CardHeader>
          <h3 className="text-lg sm:text-xl font-semibold">Edit Profile</h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Update your personal information
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {formError && (
              <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0" />
                  <p className="text-sm text-destructive">{formError}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full Name
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="fullName"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                aria-invalid={!!errors.fullName}
                className="text-base"
              />
              {errors.fullName && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.fullName}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                aria-invalid={!!errors.email}
                className="text-base"
              />
              {errors.email && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.email}
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
                  value={formData.heightCm}
                  onChange={(e) => setFormData({ ...formData, heightCm: Number(e.target.value) })}
                  aria-invalid={!!errors.heightCm}
                  className="text-base"
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
                  value={formData.currentWeight}
                  onChange={(e) =>
                    setFormData({ ...formData, currentWeight: Number(e.target.value) })
                  }
                  aria-invalid={!!errors.currentWeight}
                  className="text-base"
                />
                {errors.currentWeight && (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.currentWeight}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting || !isDirty}
                className="min-h-[44px] min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
              {isDirty && (
                <p className="text-sm text-muted-foreground flex items-center">
                  You have unsaved changes
                </p>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
```

---

## Best Practices Checklist

### ✅ DO:

- Always use `text-base` (16px) or larger on inputs (prevents iOS zoom)
- Mark required fields with visual indicator (asterisk)
- Provide clear, actionable error messages
- Validate on submit (not on every keystroke)
- Show loading state during submission
- Disable form during submission
- Use 44px minimum height on all buttons
- Provide success feedback (toast + inline)
- Use semantic HTML (`<form>`, `<label>`, proper input types)
- Stack inputs on mobile, use grid on desktop

### ❌ DON'T:

- Don't use placeholder as the only label
- Don't validate aggressively (wait for blur or submit)
- Don't hide validation errors (always visible)
- Don't use vague error messages ("Error occurred")
- Don't allow double submission (disable during save)
- Don't navigate away without warning if form is dirty
- Don't use tiny touch targets (<44px)
- Don't use inputs smaller than 16px (causes iOS zoom)
