'use client';

import { useState, useEffect } from 'react';
import { X, Check, ChevronRight, Timer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface WarmupPhase {
  id: string;
  name: string;
  phaseType: 'general' | 'dynamic' | 'movement_prep';
  durationSeconds: number | null;
  exercises: Array<{
    id: string;
    exerciseName: string;
    sets: number;
    reps: number | null;
    durationSeconds: number | null;
    notes: string | null;
  }>;
}

interface WarmupFlowProps {
  sessionId: string;
  warmup: {
    id: string;
    name: string;
    durationMinutes: number;
    phases: WarmupPhase[];
  };
  onComplete: () => void;
  onSkip: () => void;
}

export function WarmupFlow({ sessionId, warmup, onComplete, onSkip }: WarmupFlowProps) {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);

  const currentPhase = warmup.phases[currentPhaseIndex];
  const totalPhases = warmup.phases.length;
  const isLastPhase = currentPhaseIndex === totalPhases - 1;

  // Start warmup when component mounts
  useEffect(() => {
    async function start() {
      try {
        await fetch('/api/warmup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            action: 'start',
            templateId: warmup.id,
          }),
        });
        setHasStarted(true);
      } catch (error) {
        console.error('Failed to start warmup:', error);
        toast.error('Failed to start warmup');
      }
    }
    start();
  }, [sessionId, warmup.id]);

  const toggleExercise = (exerciseId: string) => {
    setCompletedExercises(prev => {
      const next = new Set(prev);
      if (next.has(exerciseId)) {
        next.delete(exerciseId);
      } else {
        next.add(exerciseId);
      }
      return next;
    });
  };

  const allExercisesComplete = currentPhase.exercises.every(ex =>
    completedExercises.has(ex.id)
  );

  const handleNext = async () => {
    if (!allExercisesComplete) {
      toast.error('Complete all exercises before moving on');
      return;
    }

    setIsSubmitting(true);
    try {
      // Update progress
      await fetch('/api/warmup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          action: 'progress',
          phasesCompleted: currentPhaseIndex + 1,
        }),
      });

      if (isLastPhase) {
        // Complete warmup
        await fetch('/api/warmup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            action: 'complete',
          }),
        });
        toast.success('Warmup complete!');
        onComplete();
      } else {
        // Move to next phase
        setCurrentPhaseIndex(prev => prev + 1);
        setCompletedExercises(new Set());
      }
    } catch (error) {
      console.error('Failed to update warmup:', error);
      toast.error('Failed to update progress');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (!confirm('Skip warmup? This is not recommended.')) {
      return;
    }

    setIsSubmitting(true);
    try {
      await fetch('/api/warmup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          action: 'skip',
        }),
      });
      toast.success('Warmup skipped');
      onSkip();
    } catch (error) {
      console.error('Failed to skip warmup:', error);
      toast.error('Failed to skip warmup');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!hasStarted) {
    return (
      <div className="fixed inset-0 bg-zinc-950 z-50 flex items-center justify-center">
        <div className="text-zinc-400">Starting warmup...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-zinc-950 z-50 overflow-y-auto">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-zinc-100">{warmup.name}</h1>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              disabled={isSubmitting}
              className="text-zinc-400 hover:text-zinc-200"
            >
              Skip
            </Button>
          </div>

          {/* Progress dots */}
          <div className="flex items-center gap-2 mb-2">
            {warmup.phases.map((phase, idx) => (
              <div
                key={phase.id}
                className={`h-2 flex-1 rounded-full ${
                  idx < currentPhaseIndex
                    ? 'bg-green-600'
                    : idx === currentPhaseIndex
                    ? 'bg-blue-500'
                    : 'bg-zinc-800'
                }`}
              />
            ))}
          </div>

          <div className="text-sm text-zinc-400">
            Phase {currentPhaseIndex + 1} of {totalPhases}
          </div>
        </div>

        {/* Current Phase */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {currentPhase.name}
              <span className="text-sm font-normal text-zinc-400 capitalize">
                ({currentPhase.phaseType.replace('_', ' ')})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentPhase.exercises.map((exercise) => {
              const isComplete = completedExercises.has(exercise.id);

              return (
                <button
                  key={exercise.id}
                  onClick={() => toggleExercise(exercise.id)}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    isComplete
                      ? 'bg-green-950/30 border-green-800'
                      : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-medium text-zinc-100 mb-1">
                        {exercise.exerciseName}
                      </div>
                      <div className="text-sm text-zinc-400">
                        {exercise.sets} set{exercise.sets !== 1 ? 's' : ''}
                        {exercise.reps && ` × ${exercise.reps} reps`}
                        {exercise.durationSeconds && (
                          <span className="flex items-center gap-1 mt-1">
                            <Timer className="h-3 w-3" />
                            {exercise.durationSeconds}s each
                          </span>
                        )}
                      </div>
                      {exercise.notes && (
                        <div className="text-xs text-zinc-500 mt-1">
                          {exercise.notes}
                        </div>
                      )}
                    </div>
                    <div
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                        isComplete
                          ? 'bg-green-600 border-green-600'
                          : 'border-zinc-600'
                      }`}
                    >
                      {isComplete && <Check className="h-4 w-4 text-white" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Next/Complete Button */}
        <Button
          onClick={handleNext}
          disabled={!allExercisesComplete || isSubmitting}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-zinc-800 disabled:text-zinc-500"
        >
          {isSubmitting ? (
            'Saving...'
          ) : isLastPhase ? (
            <>
              Complete Warmup
              <Check className="ml-2 h-4 w-4" />
            </>
          ) : (
            <>
              Next Phase
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        {!allExercisesComplete && (
          <p className="text-center text-sm text-zinc-500 mt-3">
            Complete all exercises to continue
          </p>
        )}
      </div>
    </div>
  );
}
