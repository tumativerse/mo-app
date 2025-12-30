"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dumbbell,
  Calendar,
  Clock,
  ChevronDown,
  Flame,
  TrendingUp,
  Weight,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { pageTransition, staggerContainer, staggerItem } from "@/lib/animations";
import { animateNumber } from "@/lib/animations";

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

  // Animated stats
  const [animatedWorkouts, setAnimatedWorkouts] = useState(0);
  const [animatedSets, setAnimatedSets] = useState(0);
  const [animatedDuration, setAnimatedDuration] = useState(0);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    if (stats) {
      animateNumber(animatedWorkouts, stats.totalWorkouts, 0.8, setAnimatedWorkouts);
      animateNumber(animatedSets, stats.totalSets, 0.8, setAnimatedSets);
      animateNumber(animatedDuration, stats.avgDuration, 0.8, setAnimatedDuration);
    }
  }, [stats]);

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

  if (isLoading) {
    return (
      <motion.div
        className="space-y-4 sm:space-y-6 pb-8"
        variants={pageTransition}
        initial="initial"
        animate="animate"
      >
        <div>
          <Skeleton className="h-7 sm:h-8 w-32 mb-2" />
          <Skeleton className="h-4 sm:h-5 w-48" />
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 sm:p-5 text-center">
                <Skeleton className="h-6 sm:h-8 w-12 mx-auto mb-2" />
                <Skeleton className="h-4 w-16 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Workout list skeleton */}
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 sm:p-5">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-4 sm:space-y-6 pb-8"
      variants={pageTransition}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">History</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Your workout log from the last 30 days
        </p>
      </div>

      {/* Stats Summary */}
      {stats && stats.totalWorkouts > 0 && (
        <motion.div
          className="grid grid-cols-3 gap-3 sm:gap-4"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={staggerItem}>
            <Card className="h-full">
              <CardContent className="p-4 sm:p-5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <Flame className="h-4 w-4 sm:h-5 sm:w-5 text-orange-500 shrink-0" />
                  <p className="text-2xl sm:text-3xl font-bold">
                    {animatedWorkouts}
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Workouts
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="h-full">
              <CardContent className="p-4 sm:p-5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 shrink-0" />
                  <p className="text-2xl sm:text-3xl font-bold">
                    {animatedSets}
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Total Sets
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card className="h-full">
              <CardContent className="p-4 sm:p-5 text-center">
                <div className="flex items-center justify-center gap-1.5 mb-2">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 shrink-0" />
                  <p className="text-2xl sm:text-3xl font-bold">
                    {animatedDuration || "--"}
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Avg Min
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Workout List */}
      {workouts.length === 0 ? (
        <motion.div variants={staggerItem}>
          <Card>
            <CardContent className="p-8 sm:p-12 text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              >
                <Dumbbell className="h-16 w-16 sm:h-20 sm:w-20 mx-auto mb-4 text-muted-foreground/50" />
                <h2 className="text-lg sm:text-xl font-semibold mb-2">
                  No Workouts Yet
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Complete your first workout to see it here.
                </p>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          className="space-y-3"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {workouts.map((workout) => (
            <motion.div key={workout.id} variants={staggerItem}>
              <WorkoutCard
                workout={workout}
                isExpanded={expandedWorkout === workout.id}
                onToggle={() =>
                  setExpandedWorkout(
                    expandedWorkout === workout.id ? null : workout.id
                  )
                }
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
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

  // Get workout type color
  const getTypeColor = (type: string | null) => {
    if (!type) return "bg-muted";
    if (type.toLowerCase().includes("push")) return "bg-green-500/10 text-green-400 border-green-500/20";
    if (type.toLowerCase().includes("pull")) return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    if (type.toLowerCase().includes("leg")) return "bg-red-500/10 text-red-400 border-red-500/20";
    return "bg-muted";
  };

  const typeColor = getTypeColor(workout.type);

  return (
    <Card>
      {/* Header - Touch-friendly button */}
      <motion.button
        onClick={onToggle}
        className="w-full p-4 sm:p-5 flex items-center gap-3 sm:gap-4 text-left"
        style={{ minHeight: "44px" }}
        whileTap={{ scale: 0.98 }}
      >
        <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl ${typeColor} flex items-center justify-center shrink-0`}>
          <Dumbbell className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-base sm:text-lg truncate">
              {workout.name}
            </h3>
            {workout.type && (
              <Badge
                variant="outline"
                className={`${typeColor} text-xs shrink-0`}
              >
                {workout.type}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3 shrink-0" />
              {formattedDate}
            </span>
            {workout.duration && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 shrink-0" />
                {workout.duration} min
              </span>
            )}
            <span className="text-xs">
              {workout.totalExercises} {workout.totalExercises === 1 ? 'exercise' : 'exercises'}
            </span>
          </div>
        </div>

        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="shrink-0"
        >
          <ChevronDown className="h-5 w-5 text-muted-foreground" />
        </motion.div>
      </motion.button>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-4 sm:pb-5 space-y-2">
              {workout.exercises.map((exercise, index) => (
                <motion.div
                  key={index}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between py-3 px-3 sm:px-4 bg-muted/50 rounded-xl border border-border"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm sm:text-base truncate">
                      {exercise.name}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {exercise.sets} {exercise.sets === 1 ? 'set' : 'sets'}
                    </p>
                  </div>
                  {exercise.topSet && exercise.topSet.weight && (
                    <div className="text-right shrink-0 ml-3">
                      <div className="flex items-center gap-1.5 justify-end">
                        <Weight className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="font-semibold text-sm sm:text-base">
                          {exercise.topSet.weight} lbs
                        </p>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        × {exercise.topSet.reps} reps
                      </p>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
