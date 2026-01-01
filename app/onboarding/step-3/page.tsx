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
 * Onboarding Step 3: Equipment
 *
 * Collects equipment access information:
 * - Equipment level (full gym, home gym, bodyweight)
 * - Available equipment items (if applicable)
 */
export default function OnboardingStep3Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    equipmentLevel: '',
    availableEquipment: [] as string[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.equipmentLevel) {
      toast.error('Please select your equipment level');
      return;
    }

    // If not bodyweight, must select at least one equipment item
    if (formData.equipmentLevel !== 'bodyweight' && formData.availableEquipment.length === 0) {
      toast.error('Please select at least one available equipment item');
      return;
    }

    setLoading(true);
    try {
      const dataToSave = {
        equipmentLevel: formData.equipmentLevel,
        availableEquipment: formData.availableEquipment,
      };

      // Save to localStorage for now (will save to DB at the end)
      localStorage.setItem('onboarding_step3', JSON.stringify(dataToSave));

      // Navigate to next step
      router.push('/onboarding/step-4');
    } catch (error) {
      console.error('Error saving step 3:', error);
      toast.error('Failed to save equipment preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/onboarding/step-2');
  };

  const toggleEquipment = (equipment: string) => {
    setFormData((prev) => ({
      ...prev,
      availableEquipment: prev.availableEquipment.includes(equipment)
        ? prev.availableEquipment.filter((e) => e !== equipment)
        : [...prev.availableEquipment, equipment],
    }));
  };

  const showEquipmentSelection = formData.equipmentLevel && formData.equipmentLevel !== 'bodyweight';

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Your Equipment Access</CardTitle>
          <CardDescription>
            Tell us what equipment you have available for training
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Equipment Level */}
          <div className="space-y-2">
            <Label htmlFor="equipmentLevel">Equipment Level *</Label>
            <CustomDropdown
              value={formData.equipmentLevel}
              options={[
                { value: 'full_gym', label: 'Full Gym - Access to a commercial gym' },
                { value: 'home_gym', label: 'Home Gym - Personal equipment at home' },
                { value: 'bodyweight', label: 'Bodyweight Only - Minimal to no equipment' },
              ]}
              onChange={(value) => setFormData({ ...formData, equipmentLevel: String(value), availableEquipment: [] })}
              placeholder="Select your equipment level"
              width="100%"
            />
            <p className="text-xs text-muted-foreground">
              This helps us recommend appropriate exercises
            </p>
          </div>

          {/* Available Equipment (Multi-select) - Only show if not bodyweight */}
          {showEquipmentSelection && (
            <div className="space-y-2">
              <Label>What equipment do you have access to? *</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  { value: 'barbell', label: 'Barbell' },
                  { value: 'dumbbells', label: 'Dumbbells' },
                  { value: 'kettlebells', label: 'Kettlebells' },
                  { value: 'resistance_bands', label: 'Resistance Bands' },
                  { value: 'pull_up_bar', label: 'Pull-up Bar' },
                  { value: 'squat_rack', label: 'Squat Rack' },
                  { value: 'bench', label: 'Bench' },
                  { value: 'cable_machine', label: 'Cable Machine' },
                  { value: 'leg_press', label: 'Leg Press' },
                  { value: 'leg_curl_extension', label: 'Leg Curl/Extension' },
                  { value: 'smith_machine', label: 'Smith Machine' },
                  { value: 'other_machines', label: 'Other Machines' },
                ].map((equipment) => (
                  <button
                    key={equipment.value}
                    type="button"
                    onClick={() => toggleEquipment(equipment.value)}
                    className={`
                      px-4 py-3 rounded-lg border-2 transition-all text-left
                      ${
                        formData.availableEquipment.includes(equipment.value)
                          ? 'border-primary bg-primary/10 text-foreground font-medium'
                          : 'border-border bg-background text-foreground hover:border-primary/50 active:border-primary/50'
                      }
                    `}
                  >
                    {equipment.label}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Select all that apply
              </p>
            </div>
          )}

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
