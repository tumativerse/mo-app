'use client';

export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CustomDropdown } from '@/components/ui/custom-dropdown';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Onboarding Step 4: Lifestyle
 *
 * Collects lifestyle and recovery information:
 * - Activity level (daily activity outside of training)
 * - Average sleep hours per night
 * - Stress level
 */
export default function OnboardingStep4Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    activityLevel: '',
    sleepHours: '',
    stressLevel: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.activityLevel) {
      toast.error('Please select your activity level');
      return;
    }

    if (!formData.sleepHours) {
      toast.error('Please select your average sleep hours');
      return;
    }

    if (!formData.stressLevel) {
      toast.error('Please select your stress level');
      return;
    }

    setLoading(true);
    try {
      const dataToSave = {
        activityLevel: formData.activityLevel,
        sleepHours: parseFloat(formData.sleepHours),
        stressLevel: formData.stressLevel,
      };

      // Save to localStorage for now (will save to DB at the end)
      localStorage.setItem('onboarding_step4', JSON.stringify(dataToSave));

      // Navigate to next step
      router.push('/onboarding/step-5');
    } catch (error) {
      console.error('Error saving step 4:', error);
      toast.error('Failed to save lifestyle preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/onboarding/step-3');
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Your Lifestyle & Recovery</CardTitle>
          <CardDescription>
            Help us understand your daily activity and recovery patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Activity Level */}
          <div className="space-y-2">
            <Label htmlFor="activityLevel">Daily Activity Level *</Label>
            <CustomDropdown
              value={formData.activityLevel}
              options={[
                { value: 'sedentary', label: 'Sedentary - Desk job, minimal activity' },
                {
                  value: 'lightly_active',
                  label: 'Lightly Active - Light walking/standing throughout day',
                },
                {
                  value: 'moderately_active',
                  label: 'Moderately Active - Active job or regular daily movement',
                },
                {
                  value: 'very_active',
                  label: 'Very Active - Physical job or high daily movement',
                },
                {
                  value: 'extremely_active',
                  label: 'Extremely Active - Very physical job or athlete',
                },
              ]}
              onChange={(value) => setFormData({ ...formData, activityLevel: String(value) })}
              placeholder="Select your activity level"
              width="100%"
            />
            <p className="text-xs text-muted-foreground">Activity outside of your workouts</p>
          </div>

          {/* Sleep Hours */}
          <div className="space-y-2">
            <Label htmlFor="sleepHours">Average Sleep Per Night *</Label>
            <CustomDropdown
              value={formData.sleepHours}
              options={[
                { value: '4', label: 'Less than 5 hours' },
                { value: '5.5', label: '5-6 hours' },
                { value: '6.5', label: '6-7 hours' },
                { value: '7.5', label: '7-8 hours' },
                { value: '8.5', label: '8-9 hours' },
                { value: '9.5', label: '9+ hours' },
              ]}
              onChange={(value) => setFormData({ ...formData, sleepHours: String(value) })}
              placeholder="Select your average sleep"
              width="100%"
            />
            <p className="text-xs text-muted-foreground">
              Sleep is crucial for recovery and muscle growth
            </p>
          </div>

          {/* Stress Level */}
          <div className="space-y-2">
            <Label htmlFor="stressLevel">Current Stress Level *</Label>
            <CustomDropdown
              value={formData.stressLevel}
              options={[
                { value: 'low', label: 'Low - Minimal stress, good work-life balance' },
                { value: 'moderate', label: 'Moderate - Some stress, manageable' },
                { value: 'high', label: 'High - Significant stress, challenging to manage' },
              ]}
              onChange={(value) => setFormData({ ...formData, stressLevel: String(value) })}
              placeholder="Select your stress level"
              width="100%"
            />
            <p className="text-xs text-muted-foreground">
              High stress can impact recovery and training intensity
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-2 sm:pt-4">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={handleBack}
              className="flex items-center gap-1 sm:gap-2"
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span>Back</span>
            </Button>
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
