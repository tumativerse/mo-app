'use client';

export const dynamic = 'force-dynamic';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ChevronLeft, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Onboarding Step 5: Preferences (Final Step)
 *
 * Collects final preferences and submits all onboarding data:
 * - Theme preference (light/dark)
 * - Submits all collected data to API
 */
export default function OnboardingStep5Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      // Gather all data from localStorage
      const step1Data = JSON.parse(localStorage.getItem('onboarding_step1') || '{}');
      const step2Data = JSON.parse(localStorage.getItem('onboarding_step2') || '{}');
      const step3Data = JSON.parse(localStorage.getItem('onboarding_step3') || '{}');
      const step4Data = JSON.parse(localStorage.getItem('onboarding_step4') || '{}');

      // Combine all data
      const onboardingData = {
        // Step 1: Profile
        fullName: step1Data.fullName,
        preferredName: step1Data.preferredName,
        dateOfBirth: step1Data.dateOfBirth,
        gender: step1Data.gender,
        heightCm: step1Data.heightCm,
        weightKg: step1Data.weightKg,
        unitSystem: step1Data.unitSystem,

        // Step 2: Training
        fitnessGoals: step2Data.fitnessGoals,
        experienceLevel: step2Data.experienceLevel,
        trainingTimes: step2Data.trainingTimes,
        restDaysPerWeek: step2Data.restDaysPerWeek,

        // Step 3: Equipment
        equipmentLevel: step3Data.equipmentLevel,
        availableEquipment: step3Data.availableEquipment,

        // Step 4: Lifestyle
        activityLevel: step4Data.activityLevel,
        sleepHours: step4Data.sleepHours,
        stressLevel: step4Data.stressLevel,

        // Step 5: Preferences
        theme,
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
      toast.error(error instanceof Error ? error.message : 'Failed to complete onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/onboarding/step-4');
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Final Preferences</CardTitle>
          <CardDescription>
            Almost done! Choose your theme preference
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Theme Preference */}
          <div className="space-y-2">
            <Label>Theme Preference *</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`
                  px-4 py-3 rounded-lg border-2 transition-all
                  ${
                    theme === 'light'
                      ? 'border-primary bg-primary/10 text-foreground font-medium'
                      : 'border-border bg-background text-foreground hover:border-primary/50 active:border-primary/50'
                  }
                `}
              >
                ☀️ Light
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`
                  px-4 py-3 rounded-lg border-2 transition-all
                  ${
                    theme === 'dark'
                      ? 'border-primary bg-primary/10 text-foreground font-medium'
                      : 'border-border bg-background text-foreground hover:border-primary/50 active:border-primary/50'
                  }
                `}
              >
                🌙 Dark
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              You can change this later in settings
            </p>
          </div>

          {/* Summary Info */}
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <h3 className="text-sm font-medium text-foreground mb-2">What happens next?</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Mo will create your personalized workout program</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Your training will adapt based on your progress and feedback</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <span>Track your workouts, PRs, and overall progress</span>
              </li>
            </ul>
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={handleBack}
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              Back
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Setting up...' : 'Complete Setup'}
              <CheckCircle2 className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
}
