'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { CustomDropdown } from '@/components/ui/custom-dropdown';
import { CheckCircle2, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Onboarding Step 4: Lifestyle (Final Step)
 *
 * Collects lifestyle and recovery information:
 * - Activity level (daily activity outside of training)
 * - Average sleep hours per night
 * - Stress level
 *
 * Then submits all onboarding data to the API.
 */
export default function OnboardingStep4Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    activityLevel: '',
    sleepHours: '',
    stressLevel: '',
  });

  // Load saved data from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('onboarding_step4');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setFormData({
          activityLevel: data.activityLevel || '',
          sleepHours: data.sleepHours ? data.sleepHours.toString() : '',
          stressLevel: data.stressLevel || '',
        });
      } catch (error) {
        console.error('Failed to load saved data:', error);
      }
    }
  }, []);

  // Auto-save to localStorage when form data changes
  useEffect(() => {
    if (formData.activityLevel || formData.sleepHours || formData.stressLevel) {
      localStorage.setItem('onboarding_step4', JSON.stringify(formData));
    }
  }, [formData]);

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
      // Gather all data from localStorage
      const step1Data = JSON.parse(localStorage.getItem('onboarding_step1') || '{}');
      const step2Data = JSON.parse(localStorage.getItem('onboarding_step2') || '{}');
      const step3Data = JSON.parse(localStorage.getItem('onboarding_step3') || '{}');

      // Combine all data
      const onboardingData = {
        // Step 1: Profile
        fullName: step1Data.fullName,
        preferredName: step1Data.preferredName || undefined, // Convert empty string to undefined
        dateOfBirth: step1Data.dateOfBirth,
        gender: step1Data.gender,
        heightCm: step1Data.heightCm,
        weightKg: step1Data.currentWeight, // Saved as 'currentWeight' in Step 1
        unitSystem: step1Data.units, // Saved as 'units' in Step 1

        // Step 2: Training
        fitnessGoals: step2Data.fitnessGoals,
        experienceLevel: step2Data.experienceLevel,
        trainingTimes: step2Data.trainingTimes || [],
        restDaysPerWeek: step2Data.restDaysPerWeek || undefined,

        // Step 3: Equipment
        equipmentLevel: step3Data.equipmentLevel,
        availableEquipment: step3Data.availableEquipment,

        // Step 4: Lifestyle (Final Step)
        activityLevel: formData.activityLevel,
        sleepHours: parseFloat(formData.sleepHours),
        stressLevel: formData.stressLevel,
      };

      // Submit to API
      const response = await fetch('/api/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(onboardingData),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error('Onboarding API error:', error);
        throw new Error(error.error || 'Failed to save onboarding data');
      }

      // Clear localStorage
      localStorage.removeItem('onboarding_step1');
      localStorage.removeItem('onboarding_step2');
      localStorage.removeItem('onboarding_step3');
      localStorage.removeItem('onboarding_step4');

      toast.success('Welcome to Mo! Your profile is all set up.');

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error(
        error instanceof Error ? error.message : 'Failed to complete onboarding. Please try again.'
      );
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

          {/* Summary Info */}
          <div className="rounded-lg border border-border bg-muted/30 p-3 sm:p-4">
            <h3 className="text-sm font-medium text-foreground mb-1 sm:mb-2">What happens next?</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex items-start gap-1 sm:gap-2">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <span>Mo will create your personalized workout program</span>
              </li>
              <li className="flex items-start gap-1 sm:gap-2">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <span>Your training will adapt based on your progress and feedback</span>
              </li>
              <li className="flex items-start gap-1 sm:gap-2">
                <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <span>Track your workouts, PRs, and overall progress</span>
              </li>
            </ul>
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
              <span>{loading ? 'Setting up...' : 'Complete Setup'}</span>
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
