"use client";

import { useState, useEffect } from "react";
import {
  Dumbbell,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Flame,
} from "lucide-react";
import { toast } from "sonner";
import { ProfileLoadingAnimation } from "@/components/profile-loading-animation";
import { useMinimumLoadingTime } from "@/hooks/use-minimum-loading-time";

interface ExerciseSummary {
  name: string;
  sets: number;
  topSet: {
    weight: string | null;
    reps: number | null;
  } | null;
}

interface WorkoutHistory {
  id: string;
  name: string;
  type: string | null;
  date: string;
  duration: number | null;
  totalSets: number;
  totalExercises: number;
  exercises: ExerciseSummary[];
}

interface HistoryStats {
  totalWorkouts: number;
  totalSets: number;
  avgDuration: number;
  days: number;
}

export default function HistoryPage() {
  const [workouts, setWorkouts] = useState<WorkoutHistory[]>([]);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null);
  const isMinTimeElapsed = useMinimumLoadingTime(3000);

  useEffect(() => {
    fetchHistory();
  }, []);

  async function fetchHistory() {
    try {
      const res = await fetch("/api/history?days=30");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setWorkouts(data.workouts);
      setStats(data.stats);
    } catch (error) {
      toast.error("Failed to load history");
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading || !isMinTimeElapsed) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center -mt-6">
        <ProfileLoadingAnimation loadingContext="history" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">History</h1>
        <p className="text-zinc-300">Your workout log</p>
      </div>

      {/* Stats Summary */}
      {stats && stats.totalWorkouts > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <p className="text-2xl font-bold">{stats.totalWorkouts}</p>
            </div>
            <p className="text-sm text-zinc-300">Workouts</p>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 text-center">
            <p className="text-2xl font-bold">{stats.totalSets}</p>
            <p className="text-sm text-zinc-300">Total Sets</p>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-blue-400" />
              <p className="text-2xl font-bold">{stats.avgDuration || "--"}</p>
            </div>
            <p className="text-sm text-zinc-300">Avg Min</p>
          </div>
        </div>
      )}

      {/* Workout List */}
      {workouts.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
          <Dumbbell className="h-16 w-16 mx-auto mb-4 text-zinc-500" />
          <h2 className="text-xl font-semibold text-zinc-100 mb-2">No Workouts Yet</h2>
          <p className="text-zinc-300">
            Complete your first workout to see it here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {workouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              isExpanded={expandedWorkout === workout.id}
              onToggle={() =>
                setExpandedWorkout(
                  expandedWorkout === workout.id ? null : workout.id
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface WorkoutCardProps {
  workout: WorkoutHistory;
  isExpanded: boolean;
  onToggle: () => void;
}

function WorkoutCard({ workout, isExpanded, onToggle }: WorkoutCardProps) {
  const date = new Date(workout.date);
  const formattedDate = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800">
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center gap-3 text-left"
      >
        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
          <Dumbbell className="h-5 w-5 text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-zinc-100 truncate">{workout.name}</h3>
          <div className="flex items-center gap-3 text-sm text-zinc-300">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formattedDate}
            </span>
            {workout.duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {workout.duration} min
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-300">
            {workout.totalExercises} exercises
          </span>
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-zinc-300" />
          ) : (
            <ChevronDown className="h-5 w-5 text-zinc-300" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-2">
          {workout.exercises.map((exercise, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 px-3 bg-zinc-800 rounded-lg"
            >
              <div>
                <p className="font-medium text-zinc-100">{exercise.name}</p>
                <p className="text-sm text-zinc-300">{exercise.sets} sets</p>
              </div>
              {exercise.topSet && exercise.topSet.weight && (
                <div className="text-right">
                  <p className="font-medium text-zinc-100">
                    {exercise.topSet.weight} lbs
                  </p>
                  <p className="text-sm text-zinc-300">
                    × {exercise.topSet.reps} reps
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
