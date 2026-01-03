'use client';

import { useState, useEffect } from 'react';

export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { CustomDropdown } from '@/components/ui/custom-dropdown';
import { ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Onboarding Step 1: Profile
 *
 * Collects basic user profile information:
 * - Full name
 * - Date of birth
 * - Gender
 * - Height
 * - Current weight
 */
export default function OnboardingStep1Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [units, setUnits] = useState<'metric' | 'imperial'>('imperial');
  const [formData, setFormData] = useState({
    fullName: '',
    preferredName: '',
    dateOfBirth: '',
    gender: '',
    heightCm: '',
    heightFt: '',
    heightIn: '',
    weightKg: '',
    weightLbs: '',
  });

  // Load saved data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('onboarding_step1');
    if (saved) {
      try {
        const data = JSON.parse(saved);

        // Set units from saved data
        if (data.units) {
          setUnits(data.units);
        }

        // Convert metric back to imperial if needed
        let heightFt = '';
        let heightIn = '';
        let weightLbs = '';

        if (data.units === 'imperial' && data.heightCm) {
          const totalInches = data.heightCm / 2.54;
          heightFt = Math.floor(totalInches / 12).toString();
          heightIn = Math.round(totalInches % 12).toString();
        }

        if (data.units === 'imperial' && data.currentWeight) {
          weightLbs = (data.currentWeight / 0.453592).toFixed(1);
        }

        setFormData({
          fullName: data.fullName || '',
          preferredName: data.preferredName || '',
          dateOfBirth: data.dateOfBirth || '',
          gender: data.gender || '',
          heightCm: data.units === 'metric' ? data.heightCm?.toString() || '' : '',
          heightFt,
          heightIn,
          weightKg: data.units === 'metric' ? data.currentWeight?.toString() || '' : '',
          weightLbs,
        });
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields with specific error messages
    if (!formData.fullName) {
      toast.error('Please enter your full name');
      return;
    }

    if (!formData.dateOfBirth) {
      toast.error('Please select your date of birth');
      return;
    }

    if (!formData.gender) {
      toast.error('Please select your gender');
      return;
    }

    // Validate height based on units
    if (units === 'metric' && !formData.heightCm) {
      toast.error('Please enter your height in cm');
      return;
    }
    if (units === 'imperial' && (!formData.heightFt || !formData.heightIn)) {
      toast.error('Please enter your height (feet and inches)');
      return;
    }

    // Validate weight based on units
    if (units === 'metric' && !formData.weightKg) {
      toast.error('Please enter your weight in kg');
      return;
    }
    if (units === 'imperial' && !formData.weightLbs) {
      toast.error('Please enter your weight in lbs');
      return;
    }

    setLoading(true);
    try {
      // Convert to metric for storage (backend expects cm and kg)
      let heightCm: number;
      let weightKg: number;

      if (units === 'metric') {
        heightCm = parseFloat(formData.heightCm);
        weightKg = parseFloat(formData.weightKg);
      } else {
        // Convert imperial to metric
        const feet = parseFloat(formData.heightFt);
        const inches = parseFloat(formData.heightIn);
        heightCm = (feet * 12 + inches) * 2.54; // 1 inch = 2.54 cm

        weightKg = parseFloat(formData.weightLbs) * 0.453592; // 1 lb = 0.453592 kg
      }

      const dataToSave = {
        fullName: formData.fullName,
        preferredName: formData.preferredName,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        heightCm,
        currentWeight: weightKg,
        units,
      };

      // Save to localStorage for now (will save to DB at the end)
      localStorage.setItem('onboarding_step1', JSON.stringify(dataToSave));

      // Navigate to next step
      router.push('/onboarding/step-2');
    } catch (error) {
      console.error('Error saving step 1:', error);
      toast.error('Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Tell us about yourself</CardTitle>
          <CardDescription>
            This helps us create a personalized training plan for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name *</Label>
            <Input
              id="fullName"
              type="text"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
              size="md"
            />
          </div>

          {/* Preferred Name - Optional */}
          <div className="space-y-2">
            <Label htmlFor="preferredName">What should Mo call you?</Label>
            <Input
              id="preferredName"
              type="text"
              placeholder="e.g., Johnny"
              value={formData.preferredName}
              onChange={(e) => setFormData({ ...formData, preferredName: e.target.value })}
              size="md"
            />
            <p className="text-xs text-muted-foreground">
              We&apos;ll use this throughout the app (optional)
            </p>
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth *</Label>
            <DatePicker
              value={formData.dateOfBirth}
              onChange={(value) => setFormData({ ...formData, dateOfBirth: value })}
            />
            <p className="text-xs text-muted-foreground">
              We use this to calculate age-appropriate training recommendations
            </p>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender">Gender *</Label>
            <CustomDropdown
              value={formData.gender}
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'non_binary', label: 'Non-binary' },
                { value: 'prefer_not_to_say', label: 'Prefer not to say' },
              ]}
              onChange={(value) => setFormData({ ...formData, gender: String(value) })}
              placeholder="Select gender"
              width="100%"
            />
            <p className="text-xs text-muted-foreground">
              Helps us personalize your fitness experience
            </p>
          </div>

          {/* Units Toggle - Compact */}
          <div className="flex items-center justify-between py-1 sm:py-2 px-2 sm:px-3 bg-secondary/50 rounded-lg border border-border">
            <span className="text-sm text-muted-foreground">Units:</span>
            <div className="flex gap-1 sm:gap-2">
              <button
                type="button"
                onClick={() => setUnits('metric')}
                className={`px-2 sm:px-3 py-1 sm:py-2 text-xs font-medium rounded transition-colors ${
                  units === 'metric'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-transparent text-muted-foreground hover:text-foreground active:text-foreground focus:text-foreground'
                }`}
              >
                Metric
              </button>
              <button
                type="button"
                onClick={() => setUnits('imperial')}
                className={`px-2 sm:px-3 py-1 sm:py-2 text-xs font-medium rounded transition-colors ${
                  units === 'imperial'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-transparent text-muted-foreground hover:text-foreground active:text-foreground focus:text-foreground'
                }`}
              >
                Imperial
              </button>
            </div>
          </div>

          {/* Height - Conditional based on units */}
          <div className="space-y-2">
            <Label htmlFor="height">Height *</Label>
            {units === 'metric' ? (
              <div className="relative">
                <Input
                  id="height"
                  type="number"
                  placeholder="175"
                  value={formData.heightCm}
                  onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                  required
                  size="md"
                  min="100"
                  max="250"
                  step="0.1"
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                  cm
                </span>
              </div>
            ) : (
              <div className="flex gap-1 sm:gap-2">
                <div className="flex-1 relative">
                  <Input
                    id="heightFt"
                    type="number"
                    placeholder="5"
                    value={formData.heightFt}
                    onChange={(e) => setFormData({ ...formData, heightFt: e.target.value })}
                    required
                    size="md"
                    min="3"
                    max="8"
                    className="pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                    ft
                  </span>
                </div>
                <div className="flex-1 relative">
                  <Input
                    id="heightIn"
                    type="number"
                    placeholder="10"
                    value={formData.heightIn}
                    onChange={(e) => setFormData({ ...formData, heightIn: e.target.value })}
                    required
                    size="md"
                    min="0"
                    max="11"
                    className="pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                    in
                  </span>
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Used for calculating BMI and other health metrics
            </p>
          </div>

          {/* Weight - Conditional based on units */}
          <div className="space-y-2">
            <Label htmlFor="weight">Current Weight *</Label>
            {units === 'metric' ? (
              <div className="relative">
                <Input
                  id="weight"
                  type="number"
                  placeholder="70"
                  value={formData.weightKg}
                  onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                  required
                  size="md"
                  min="30"
                  max="300"
                  step="0.1"
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                  kg
                </span>
              </div>
            ) : (
              <div className="relative">
                <Input
                  id="weight"
                  type="number"
                  placeholder="154"
                  value={formData.weightLbs}
                  onChange={(e) => setFormData({ ...formData, weightLbs: e.target.value })}
                  required
                  size="md"
                  min="66"
                  max="660"
                  step="0.1"
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                  lbs
                </span>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              We&apos;ll track your progress over time
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-end items-center pt-2 sm:pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
              className="flex items-center gap-1 sm:gap-2"
            >
              <span>{loading ? 'Saving...' : 'Continue'}</span>
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
