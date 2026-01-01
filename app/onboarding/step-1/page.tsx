'use client';

import { useState } from 'react';

export const dynamic = 'force-dynamic';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    heightCm: '',
    currentWeight: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields are filled
    if (!formData.fullName || !formData.dateOfBirth || !formData.gender || !formData.heightCm || !formData.currentWeight) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // Save to localStorage for now (will save to DB at the end)
      localStorage.setItem('onboarding_step1', JSON.stringify(formData));
      
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
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              required
              size="md"
              max={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-muted-foreground">
              We use this to calculate age-appropriate training recommendations
            </p>
          </div>

          {/* Gender */}
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              required
              className="flex h-11 w-full rounded-lg border border-border bg-background px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 min-h-[44px]"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="non_binary">Non-binary</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Helps us provide more accurate calorie and nutrition recommendations
            </p>
          </div>

          {/* Height */}
          <div className="space-y-2">
            <Label htmlFor="heightCm">Height (cm)</Label>
            <Input
              id="heightCm"
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
            <p className="text-xs text-muted-foreground">
              Used for calculating BMI and other health metrics
            </p>
          </div>

          {/* Current Weight */}
          <div className="space-y-2">
            <Label htmlFor="currentWeight">Current Weight (kg)</Label>
            <Input
              id="currentWeight"
              type="number"
              placeholder="70"
              value={formData.currentWeight}
              onChange={(e) => setFormData({ ...formData, currentWeight: e.target.value })}
              required
              size="md"
              min="30"
              max="300"
              step="0.1"
            />
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
