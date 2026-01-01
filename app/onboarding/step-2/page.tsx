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
 * Onboarding Step 2: Training
 *
 * Collects training preferences and goals:
 * - Fitness goals (what they want to achieve)
 * - Experience level (beginner, intermediate, advanced)
 * - Preferred training times
 * - Rest days per week
 */
export default function OnboardingStep2Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fitnessGoals: [] as string[],
    experienceLevel: '',
    trainingTimes: [] as string[],
    restDaysPerWeek: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (formData.fitnessGoals.length === 0) {
      toast.error('Please select at least one fitness goal');
      return;
    }

    if (!formData.experienceLevel) {
      toast.error('Please select your experience level');
      return;
    }

    if (formData.trainingTimes.length === 0) {
      toast.error('Please select at least one preferred training time');
      return;
    }

    if (!formData.restDaysPerWeek) {
      toast.error('Please select number of rest days per week');
      return;
    }

    setLoading(true);
    try {
      const dataToSave = {
        fitnessGoals: formData.fitnessGoals,
        experienceLevel: formData.experienceLevel,
        trainingTimes: formData.trainingTimes,
        restDaysPerWeek: parseInt(formData.restDaysPerWeek),
      };

      // Save to localStorage for now (will save to DB at the end)
      localStorage.setItem('onboarding_step2', JSON.stringify(dataToSave));

      // Navigate to next step
      router.push('/onboarding/step-3');
    } catch (error) {
      console.error('Error saving step 2:', error);
      toast.error('Failed to save training preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/onboarding/step-1');
  };

  const toggleGoal = (goal: string) => {
    setFormData((prev) => ({
      ...prev,
      fitnessGoals: prev.fitnessGoals.includes(goal)
        ? prev.fitnessGoals.filter((g) => g !== goal)
        : [...prev.fitnessGoals, goal],
    }));
  };

  const toggleTrainingTime = (time: string) => {
    setFormData((prev) => ({
      ...prev,
      trainingTimes: prev.trainingTimes.includes(time)
        ? prev.trainingTimes.filter((t) => t !== time)
        : [...prev.trainingTimes, time],
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Your Training Goals</CardTitle>
          <CardDescription>
            Help us design the perfect workout plan for you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Fitness Goals (Multi-select) */}
          <div className="space-y-2">
            <Label>What are your fitness goals? *</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
              {[
                { value: 'strength', label: 'Build Strength' },
                { value: 'muscle', label: 'Build Muscle' },
                { value: 'endurance', label: 'Improve Endurance' },
                { value: 'weight_loss', label: 'Lose Weight' },
                { value: 'general_fitness', label: 'General Fitness' },
                { value: 'athletic_performance', label: 'Athletic Performance' },
              ].map((goal) => (
                <button
                  key={goal.value}
                  type="button"
                  onClick={() => toggleGoal(goal.value)}
                  className={`
                    px-4 py-3 rounded-lg border-2 transition-all text-left
                    ${
                      formData.fitnessGoals.includes(goal.value)
                        ? 'border-primary bg-primary/10 text-foreground font-medium'
                        : 'border-border bg-background text-foreground hover:border-primary/50 active:border-primary/50'
                    }
                  `}
                >
                  {goal.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Select all that apply
            </p>
          </div>

          {/* Experience Level */}
          <div className="space-y-2">
            <Label htmlFor="experienceLevel">Experience Level *</Label>
            <CustomDropdown
              value={formData.experienceLevel}
              options={[
                { value: 'beginner', label: 'Beginner - New to working out' },
                { value: 'intermediate', label: 'Intermediate - 6+ months experience' },
                { value: 'advanced', label: 'Advanced - 2+ years experience' },
              ]}
              onChange={(value) => setFormData({ ...formData, experienceLevel: String(value) })}
              placeholder="Select your experience level"
              width="100%"
            />
            <p className="text-xs text-muted-foreground">
              Helps us adjust workout intensity
            </p>
          </div>

          {/* Preferred Training Times (Multi-select) */}
          <div className="space-y-2">
            <Label>When do you prefer to train? *</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
              {[
                { value: 'early_morning', label: 'Early Morning' },
                { value: 'morning', label: 'Morning' },
                { value: 'midday', label: 'Midday' },
                { value: 'afternoon', label: 'Afternoon' },
                { value: 'evening', label: 'Evening' },
                { value: 'night', label: 'Night' },
              ].map((time) => (
                <button
                  key={time.value}
                  type="button"
                  onClick={() => toggleTrainingTime(time.value)}
                  className={`
                    px-3 py-3 rounded-lg border-2 transition-all text-sm
                    ${
                      formData.trainingTimes.includes(time.value)
                        ? 'border-primary bg-primary/10 text-foreground font-medium'
                        : 'border-border bg-background text-foreground hover:border-primary/50 active:border-primary/50'
                    }
                  `}
                >
                  {time.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Select all times that work for you
            </p>
          </div>

          {/* Rest Days Per Week */}
          <div className="space-y-2">
            <Label htmlFor="restDaysPerWeek">Rest Days Per Week *</Label>
            <CustomDropdown
              value={formData.restDaysPerWeek}
              options={[
                { value: '1', label: '1 day - High frequency training' },
                { value: '2', label: '2 days - Balanced approach' },
                { value: '3', label: '3 days - Moderate frequency' },
                { value: '4', label: '4 days - Active recovery focus' },
              ]}
              onChange={(value) => setFormData({ ...formData, restDaysPerWeek: String(value) })}
              placeholder="Select rest days per week"
              width="100%"
            />
            <p className="text-xs text-muted-foreground">
              Rest is crucial for muscle recovery and growth
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
