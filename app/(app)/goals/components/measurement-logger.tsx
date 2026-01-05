'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface MeasurementLoggerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  goalId: string;
}

export function MeasurementLogger({ isOpen, onClose, onSuccess, goalId }: MeasurementLoggerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/journey/measurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weight: parseFloat(weight),
          date: new Date(date).toISOString(),
          notes: notes || undefined,
          goalId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to log measurement');
      }

      onSuccess();
      setWeight('');
      setNotes('');
    } catch (error) {
      console.error('Error logging measurement:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to log measurement');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Log Weight Measurement</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="weight">
              Weight (kg)
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              required
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="75.5"
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">
              Date
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="text-base"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Morning weight, after workout, etc."
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
                  Logging...
                </>
              ) : (
                'Log Measurement'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
