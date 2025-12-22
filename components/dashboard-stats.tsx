import { Dumbbell, Calendar, Flame, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface DashboardStats {
  currentStreak: number;
  thisWeek: {
    completed: number;
    target: number;
  };
  totalWorkouts: number;
  totalPRs: number;
}

interface DashboardStatsDisplayProps {
  stats: DashboardStats;
}

// Server-rendered display component (receives data from server)
export function DashboardStatsDisplay({ stats }: DashboardStatsDisplayProps) {
  const currentStreak = stats.currentStreak || 0;
  const thisWeekCompleted = stats.thisWeek?.completed || 0;
  const thisWeekTarget = stats.thisWeek?.target || 4;
  const totalWorkouts = stats.totalWorkouts || 0;
  const totalPRs = stats.totalPRs || 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Current Streak
          </CardTitle>
          <Flame className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {currentStreak} {currentStreak === 1 ? 'day' : 'days'}
          </div>
          <p className="text-xs text-muted-foreground">
            {currentStreak === 0 ? 'Start your streak!' : 'Keep it going!'}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            This Week
          </CardTitle>
          <Calendar className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {thisWeekCompleted} / {thisWeekTarget}
          </div>
          <p className="text-xs text-muted-foreground">workouts completed</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Workouts
          </CardTitle>
          <Dumbbell className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalWorkouts}</div>
          <p className="text-xs text-muted-foreground">all time</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Personal Records
          </CardTitle>
          <Trophy className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalPRs}</div>
          <p className="text-xs text-muted-foreground">PRs set</p>
        </CardContent>
      </Card>
    </div>
  );
}
