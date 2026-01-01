'use client';

import { useState } from 'react';

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
  const [units, setUnits] = useState<'metric' | 'imperial'>('metric');
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    heightCm: '',
    heightFt: '',
    heightIn: '',
    weightKg: '',
    weightLbs: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields are filled
    if (!formData.fullName || !formData.dateOfBirth || !formData.gender) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate height based on units
    if (units === 'metric' && !formData.heightCm) {
      toast.error('Please enter your height');
      return;
    }
    if (units === 'imperial' && (!formData.heightFt || !formData.heightIn)) {
      toast.error('Please enter your height');
      return;
    }

    // Validate weight based on units
    if (units === 'metric' && !formData.weightKg) {
      toast.error('Please enter your weight');
      return;
    }
    if (units === 'imperial' && !formData.weightLbs) {
      toast.error('Please enter your weight');
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
        heightCm = ((feet * 12) + inches) * 2.54; // 1 inch = 2.54 cm

        weightKg = parseFloat(formData.weightLbs) * 0.453592; // 1 lb = 0.453592 kg
      }

      const dataToSave = {
        fullName: formData.fullName,
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
          {/* Units Toggle */}
          <div className="space-y-2">
            <Label>Measurement Units</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={units === 'metric' ? 'primary' : 'outline'}
                size="md"
                onClick={() => setUnits('metric')}
                className="flex-1"
              >
                Metric (kg, cm)
              </Button>
              <Button
                type="button"
                variant={units === 'imperial' ? 'primary' : 'outline'}
                size="md"
                onClick={() => setUnits('imperial')}
                className="flex-1"
              >
                Imperial (lbs, ft/in)
              </Button>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
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

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth">Date of Birth</Label>
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
            <Label htmlFor="gender">Gender</Label>
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
              Helps us provide more accurate calorie and nutrition recommendations
            </p>
          </div>

          {/* Height - Conditional based on units */}
          <div className="space-y-2">
            <Label htmlFor="height">Height</Label>
            {units === 'metric' ? (
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
              />
            ) : (
              <div className="flex gap-2">
                <div className="flex-1">
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
                  />
                  <p className="text-xs text-muted-foreground mt-1">Feet</p>
                </div>
                <div className="flex-1">
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
                  />
                  <p className="text-xs text-muted-foreground mt-1">Inches</p>
                </div>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Used for calculating BMI and other health metrics
            </p>
          </div>

          {/* Weight - Conditional based on units */}
          <div className="space-y-2">
            <Label htmlFor="weight">Current Weight</Label>
            {units === 'metric' ? (
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
              />
            ) : (
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
              />
            )}
            <p className="text-xs text-muted-foreground">
              We'll track your progress over time
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Continue'}
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
