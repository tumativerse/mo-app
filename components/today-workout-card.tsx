import Link from 'next/link';
import {
  Dumbbell,
  Clock,
  Flame,
  Play,
  Bed,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export interface TodayWorkoutData {
  hasProgram: boolean;
  isRestDay?: boolean;
  program?: {
    name: string;
    week: number;
  };
  today?: {
    name: string;
  };
  workout?: {
    status: string;
  };
  stats?: {
    totalExercises: number;
    totalSets: number;
    estimatedMinutes: number;
  };
}

interface TodayWorkoutDisplayProps {
  data: TodayWorkoutData;
}

// Server-rendered display component (receives data from server)
export function TodayWorkoutDisplay({ data }: TodayWorkoutDisplayProps) {
  // No program enrolled
  if (!data?.hasProgram) {
    return (
      <Card className="relative overflow-hidden">
        <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Dumbbell className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Start Your Journey</h3>
              <p className="text-sm text-muted-foreground">
                Enroll in the PPL program to begin
              </p>
            </div>
            <Link href="/workouts">
              <Button size="sm" className="mo-gradient border-0">
                <Play className="mr-1 h-4 w-4" />
                Start
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Rest day
  if (data.isRestDay) {
    return (
      <Card className="relative overflow-hidden">
        <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-accent/20 blur-3xl" />
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <Bed className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">Rest Day</h3>
              <p className="text-sm text-muted-foreground">
                {data.program?.name} • Week {data.program?.week}
              </p>
            </div>
            <span className="text-sm text-muted-foreground">
              Recovery time
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Workout day
  const workoutInProgress = data.workout?.status === 'in_progress';

  return (
    <Card className="relative overflow-hidden">
      <div className="absolute right-0 top-0 h-32 w-32 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/20 blur-3xl" />
      <CardContent className="py-6">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Dumbbell className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{data.today?.name}</h3>
            <p className="text-sm text-muted-foreground">
              {data.program?.name} • Week {data.program?.week}
            </p>
          </div>
          <Link href="/workouts">
            <Button size="sm" className="mo-gradient border-0">
              {workoutInProgress ? (
                <>
                  Resume
                  <ArrowRight className="ml-1 h-4 w-4" />
                </>
              ) : (
                <>
                  <Play className="mr-1 h-4 w-4" />
                  Start
                </>
              )}
            </Button>
          </Link>
        </div>

        {/* Quick stats */}
        {data.stats && (
          <div className="mt-4 flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Dumbbell className="h-4 w-4" />
              <span>{data.stats.totalExercises} exercises</span>
            </div>
            <div className="flex items-center gap-1">
              <Flame className="h-4 w-4" />
              <span>{data.stats.totalSets} sets</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>~{data.stats.estimatedMinutes} min</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
