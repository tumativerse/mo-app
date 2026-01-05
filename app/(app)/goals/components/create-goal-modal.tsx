'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SingleSelectDropdown } from '@/components/ui/single-select-dropdown';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateGoalModal({ isOpen, onClose, onSuccess }: CreateGoalModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [goalType, setGoalType] = useState<string>('fat_loss');
  const [startingWeight, setStartingWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const goalTypeOptions = [
    { label: 'Fat Loss', value: 'fat_loss' },
    { label: 'Muscle Building', value: 'muscle_building' },
    { label: 'Body Recomposition', value: 'recomp' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/journey/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalType,
          startingWeight: parseFloat(startingWeight),
          targetWeight: parseFloat(targetWeight),
          targetDate: new Date(targetDate).toISOString(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create goal');
      }

      onSuccess();
    } catch (error) {
      console.error('Error creating goal:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Create Your Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goalType">Goal Type</Label>
            <SingleSelectDropdown
              options={goalTypeOptions}
              value={goalType}
              onChange={setGoalType}
              placeholder="Select goal type"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startingWeight">
                Starting Weight (kg)
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="startingWeight"
                type="number"
                step="0.1"
                required
                value={startingWeight}
                onChange={(e) => setStartingWeight(e.target.value)}
                placeholder="80.5"
                className="text-base"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetWeight">
                Target Weight (kg)
                <span className="text-destructive ml-1">*</span>
              </Label>
              <Input
                id="targetWeight"
                type="number"
                step="0.1"
                required
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
                placeholder="75.0"
                className="text-base"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDate">
              Target Date
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="targetDate"
              type="date"
              required
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="text-base"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 min-h-[44px]"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 min-h-[44px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Goal'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
