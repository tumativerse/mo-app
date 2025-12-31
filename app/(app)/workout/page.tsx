"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useProfileGuard } from "@/lib/hooks/use-profile-guard";
import {
  Dumbbell,
  Play,
  CheckCircle,
  Bed,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Timer,
  X,
  Trophy,
  Flame,
  Target,
  List,
  RefreshCw,
  Info,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { WarmupFlow } from "@/components/warmup-flow";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { pageTransition, staggerContainer, staggerItem } from "@/lib/animations";
import { celebrateWorkoutComplete, celebrateSetComplete, vibrateDevice, celebratePersonalRecord, celebrateSessionMilestone } from "@/lib/celebrations";
import { playSetComplete, playWorkoutComplete, playPersonalRecord } from "@/lib/sounds";

// Types for PPL API responses
interface SlotExercise {
  id: string;
  name: string;
  slug: string;
  primaryMuscles: string[];
  equipment: string[];
  difficulty: string;
  description: string | null;
  instructions: string[];
  tips: string[];
  previous: {
    weight: string | null;
    reps: number | null;
    rpe: string | null;
  } | null;
  score: number;
}

interface TemplateSlot {
  id: string;
  slotOrder: number;
  slotType: string;
  movementPattern: string;
  targetMuscles: string[];
  sets: number;
  repRangeMin: number;
  repRangeMax: number;
  rpeTarget: string | null;
  restSeconds: number;
  notes: string | null;
  isOptional: boolean;
  suggestedExercise: SlotExercise | null;
  alternatives: SlotExercise[];
}

interface TemplateDay {
  id: string;
  dayNumber: number;
  name: string;
  dayType: string;
  targetMuscles: string[];
  estimatedDuration: number;
  notes: string | null;
}

interface SessionExercise {
  id: string;
  exerciseId: string;
  slotId: string;
  exerciseOrder: number;
  exercise: {
    id: string;
    name: string;
    primaryMuscles: string[];
    equipment: string[];
  };
}

interface SessionSet {
  id: string;
  sessionExerciseId: string;
  setNumber: number;
  weight: string | null;
  weightUnit: string;
  reps: number | null;
  rpe: string | null;
  isWarmup: boolean;
  completedAt: string | null;
}

interface ExistingSession {
  id: string;
  status: string;
  startedAt: string | null;
  exercises: SessionExercise[];
  sets: SessionSet[];
}

interface PPLTodayData {
  rotation: {
    dayNumber: number;
    totalDays: number;
    sessionsCompleted: number;
    daysSinceLastWorkout?: number;
    message?: string | null;
  };
  templateDay: TemplateDay;
  slots: TemplateSlot[];
  equipmentLevel: "full_gym" | "home_gym" | "bodyweight";
  warmup: {
    id: string;
    name: string;
    durationMinutes: number;
    phases: Array<{
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
    }>;
  } | null;
  existingSession: ExistingSession | null;
  // Phase 5: Fatigue & Auto-regulation
  fatigue?: {
    score: number;
    level: string;
    color: string;
    message: string;
    action: string;
    recommendations?: string[];
  };
  deload?: {
    isActive: boolean;
    type?: string;
    daysRemaining?: number;
    reason?: string;
    recommended?: boolean;
    suggestedDuration?: number;
  };
  modifiers?: {
    volume: number;
    intensity: number;
  };
}

interface WorkoutSummary {
  duration: number;
  totalSets: number;
  totalVolume: number;
  avgRpe: number;
  exercises: Array<{
    name: string;
    sets: number;
    topWeight: number;
    topReps: number;
  }>;
}

// Map slot to selected exercise (for swaps)
interface SlotSelection {
  [slotId: string]: SlotExercise;
}

export default function WorkoutPage() {
  const router = useRouter();

  // Route guard - redirect to dashboard if mandatory profile fields incomplete
  const { isChecking: profileChecking, isUnlocked } = useProfileGuard();

  // Data state
  const [data, setData] = useState<PPLTodayData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Session state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>([]);
  const [loggedSets, setLoggedSets] = useState<Record<string, SessionSet[]>>({});

  // UI state
  const [viewMode, setViewMode] = useState<"overview" | "focused">("overview");
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [slotSelections, setSlotSelections] = useState<SlotSelection>({});
  const [showSwapModal, setShowSwapModal] = useState<string | null>(null);
  const [showWarmup, setShowWarmup] = useState(false);
  const [showWarmupFlow, setShowWarmupFlow] = useState(false);

  // Timer state
  const [workoutStartTime, setWorkoutStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [restTimer, setRestTimer] = useState<number | null>(null);
  const [restDuration, setRestDuration] = useState(0);

  // Summary state
  const [showSummary, setShowSummary] = useState(false);
  const [summary, setSummary] = useState<WorkoutSummary | null>(null);
  const [workoutNotes, setWorkoutNotes] = useState("");

  // Fetch today's workout data
  useEffect(() => {
    fetchTodayWorkout();
  }, []);

  // Elapsed time timer
  useEffect(() => {
    if (!workoutStartTime) return;
    const interval = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - workoutStartTime.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [workoutStartTime]);

  // Rest timer countdown
  useEffect(() => {
    if (restTimer === null || restTimer <= 0) return;
    const interval = setInterval(() => {
      setRestTimer((prev) => {
        if (prev === null || prev <= 1) return null;
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [restTimer]);

  async function fetchTodayWorkout() {
    try {
      setIsLoading(true);
      const res = await fetch("/api/ppl/today");
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to fetch workout");
      }
      const todayData: PPLTodayData = await res.json();
      setData(todayData);

      // Initialize slot selections with suggested exercises
      const selections: SlotSelection = {};
      for (const slot of todayData.slots) {
        if (slot.suggestedExercise) {
          selections[slot.id] = slot.suggestedExercise;
        }
      }
      setSlotSelections(selections);

      // If there's an existing session, restore state
      if (todayData.existingSession) {
        setSessionId(todayData.existingSession.id);
        setSessionExercises(todayData.existingSession.exercises);
        if (todayData.existingSession.startedAt) {
          setWorkoutStartTime(new Date(todayData.existingSession.startedAt));
        }
        // Organize sets by session exercise ID
        const setsByExercise: Record<string, SessionSet[]> = {};
        for (const set of todayData.existingSession.sets || []) {
          if (!setsByExercise[set.sessionExerciseId]) {
            setsByExercise[set.sessionExerciseId] = [];
          }
          setsByExercise[set.sessionExerciseId].push(set);
        }
        setLoggedSets(setsByExercise);
        setViewMode("focused");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workout");
      toast.error("Failed to load workout");
    } finally {
      setIsLoading(false);
    }
  }

  async function startWorkout() {
    if (!data?.templateDay?.id) return;

    try {
      // Build exercises from slot selections
      const exercises = data.slots
        .filter(slot => slotSelections[slot.id])
        .map((slot) => ({
          slotId: slot.id,
          exerciseId: slotSelections[slot.id].id,
          targetSets: slot.sets,
          targetRepMin: slot.repRangeMin,
          targetRepMax: slot.repRangeMax,
          targetRpe: slot.rpeTarget ? parseFloat(slot.rpeTarget) : undefined,
        }));

      const res = await fetch("/api/ppl/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateDayId: data.templateDay.id,
          equipmentLevel: data.equipmentLevel || "full_gym",
          exercises,
        }),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.details ? JSON.stringify(responseData.details) : "Failed to start workout");
      }

      const { session } = responseData;
      setSessionId(session.id);
      setSessionExercises(session.exercises || []);
      setWorkoutStartTime(new Date());

      // Show warmup flow if warmup exists
      if (data.warmup) {
        setShowWarmupFlow(true);
      } else {
        setViewMode("focused");
        setCurrentExerciseIndex(0);
      }

      toast.success("Workout started!");
    } catch (err) {
      toast.error("Failed to start workout");
    }
  }

  async function completeWorkout() {
    if (!sessionId) return;

    try {
      const res = await fetch("/api/ppl/session", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          notes: workoutNotes || undefined,
        }),
      });

      if (!res.ok) throw new Error("Failed to complete workout");

      const result = await res.json();
      // Map API response to WorkoutSummary format
      const workoutSummary: WorkoutSummary = {
        duration: (result.metrics?.durationMinutes || 0) * 60,
        totalSets: result.metrics?.totalSets || 0,
        totalVolume: result.metrics?.totalVolume || 0,
        avgRpe: result.metrics?.avgRpe || 0,
        exercises: [], // API doesn't return exercise breakdown yet
      };
      setSummary(workoutSummary);
      setShowSummary(true);
      setWorkoutStartTime(null);
      setRestTimer(null);

      // Celebrate workout completion!
      celebrateWorkoutComplete();
      vibrateDevice([100, 50, 100, 50, 200]);
      playWorkoutComplete();
    } catch (err) {
      toast.error("Failed to complete workout");
    }
  }

  async function logSet(
    sessionExerciseId: string,
    setNumber: number,
    weight: number,
    reps: number,
    rpe: number | null,
    restSeconds: number
  ) {
    try {
      const res = await fetch("/api/ppl/session/sets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionExerciseId,
          setNumber,
          weight,
          weightUnit: "lbs",
          reps,
          rpe,
        }),
      });

      if (!res.ok) throw new Error("Failed to log set");

      const { set } = await res.json();

      // Celebrate set completion!
      celebrateSetComplete();
      vibrateDevice(30);
      playSetComplete();

      setLoggedSets((prev) => {
        const exerciseSets = prev[sessionExerciseId] || [];
        const existingIndex = exerciseSets.findIndex(s => s.setNumber === setNumber);
        if (existingIndex >= 0) {
          exerciseSets[existingIndex] = set;
        } else {
          exerciseSets.push(set);
        }
        return { ...prev, [sessionExerciseId]: [...exerciseSets] };
      });

      // Start rest timer
      setRestDuration(restSeconds);
      setRestTimer(restSeconds);

      toast.success(`Set ${setNumber} logged!`);
    } catch (err) {
      toast.error("Failed to log set");
    }
  }

  function swapExercise(slotId: string, exercise: SlotExercise) {
    setSlotSelections(prev => ({ ...prev, [slotId]: exercise }));
    setShowSwapModal(null);
    toast.success(`Swapped to ${exercise.name}`);
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  function dismissSummary() {
    setShowSummary(false);
    setSummary(null);
    setWorkoutNotes("");
    router.push("/dashboard");
  }

  // Get working slots (non-optional or selected)
  const workingSlots = data?.slots.filter(slot =>
    !slot.isOptional || slotSelections[slot.id]
  ) || [];

  // Calculate completion
  const getExerciseCompletion = (sessionExerciseId: string, targetSets: number) => {
    const sets = loggedSets[sessionExerciseId] || [];
    return sets.filter(s => s.completedAt).length >= targetSets;
  };

  const completedCount = sessionExercises.filter((se, idx) => {
    const slot = workingSlots[idx];
    return slot && getExerciseCompletion(se.id, slot.sets);
  }).length;

  const allComplete = sessionExercises.length > 0 && completedCount === sessionExercises.length;

  // Loading state (including profile guard check)
  if (isLoading || profileChecking) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center -mt-6">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Today's Workout</h1>
          <p className="text-zinc-300">Get started with your training</p>
        </div>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
          <Dumbbell className="h-16 w-16 mx-auto mb-4 text-zinc-500" />
          <h2 className="text-xl font-semibold mb-2">{error || "No workout available"}</h2>
          <p className="text-zinc-300 mb-6">
            {error?.includes("No active program")
              ? "Enroll in a training program to start logging workouts."
              : "Something went wrong loading your workout."}
          </p>
          <a
            href="/programs"
            className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Browse Programs
          </a>
        </div>
      </div>
    );
  }

  // Rest day (if template day type indicates)
  // For now, PPL doesn't have rest days in the 6-day rotation

  return (
    <motion.div
      className="space-y-4 sm:space-y-6 pb-24"
      variants={pageTransition}
      initial="initial"
      animate="animate"
    >
      {/* Warmup Flow */}
      {showWarmupFlow && sessionId && data.warmup && (
        <WarmupFlow
          sessionId={sessionId}
          warmup={data.warmup}
          onComplete={() => {
            setShowWarmupFlow(false);
            setViewMode("focused");
            setCurrentExerciseIndex(0);
          }}
          onSkip={() => {
            setShowWarmupFlow(false);
            setViewMode("focused");
            setCurrentExerciseIndex(0);
          }}
        />
      )}

      {/* Rest Timer Overlay */}
      {restTimer !== null && (
        <div className="fixed inset-x-0 top-16 z-40 mx-4">
          <div className="bg-blue-600 rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Timer className="h-6 w-6" />
                <div>
                  <p className="text-sm opacity-90">Rest Timer</p>
                  <p className="text-2xl font-mono font-bold">{formatTime(restTimer)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-blue-400/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white transition-all duration-1000"
                    style={{ width: `${(restTimer / restDuration) * 100}%` }}
                  />
                </div>
                <button
                  onClick={() => setRestTimer(null)}
                  className="p-1 hover:bg-blue-500 rounded"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode: Overview (before/between) */}
      {viewMode === "overview" && (
        <OverviewMode
          data={data}
          workingSlots={workingSlots}
          slotSelections={slotSelections}
          sessionId={sessionId}
          onStartWorkout={startWorkout}
          onShowSwapModal={setShowSwapModal}
          onToggleWarmup={() => setShowWarmup(!showWarmup)}
          showWarmup={showWarmup}
        />
      )}

      {/* Mode: Focused (during workout) */}
      {viewMode === "focused" && sessionId && (
        <FocusedMode
          data={data}
          workingSlots={workingSlots}
          slotSelections={slotSelections}
          sessionExercises={sessionExercises}
          loggedSets={loggedSets}
          currentIndex={currentExerciseIndex}
          elapsedTime={elapsedTime}
          completedCount={completedCount}
          allComplete={allComplete}
          onSetIndex={setCurrentExerciseIndex}
          onViewAll={() => setViewMode("overview")}
          onLogSet={logSet}
          onComplete={completeWorkout}
          onShowSwapModal={setShowSwapModal}
          formatTime={formatTime}
          workoutNotes={workoutNotes}
          setWorkoutNotes={setWorkoutNotes}
        />
      )}

      {/* Swap Modal */}
      {showSwapModal && (
        <SwapModal
          slotId={showSwapModal}
          slot={data.slots.find(s => s.id === showSwapModal)!}
          currentSelection={slotSelections[showSwapModal]}
          onSwap={swapExercise}
          onClose={() => setShowSwapModal(null)}
        />
      )}

      {/* Summary Modal */}
      {showSummary && summary && (
        <SummaryModal
          summary={summary}
          dayName={data.templateDay.name}
          onDismiss={dismissSummary}
        />
      )}
    </motion.div>
  );
}

// ============================================
// Overview Mode Component
// ============================================
interface OverviewModeProps {
  data: PPLTodayData;
  workingSlots: TemplateSlot[];
  slotSelections: SlotSelection;
  sessionId: string | null;
  onStartWorkout: () => void;
  onShowSwapModal: (slotId: string) => void;
  onToggleWarmup: () => void;
  showWarmup: boolean;
}

function OverviewMode({
  data,
  workingSlots,
  slotSelections,
  sessionId,
  onStartWorkout,
  onShowSwapModal,
  onToggleWarmup,
  showWarmup,
}: OverviewModeProps) {
  return (
    <>
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-1">{data.templateDay.name}</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Day {data.rotation.dayNumber} of {data.rotation.totalDays} • ~{data.templateDay.estimatedDuration} min
        </p>
      </div>

      {/* Fatigue/Deload Banner - Phase 5 */}
      {data.fatigue && data.fatigue.score >= 6 && (
        <div
          className={`rounded-xl border p-4 ${
            data.fatigue.color === "orange"
              ? "bg-orange-950/30 border-orange-900/50"
              : "bg-red-950/30 border-red-900/50"
          }`}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle
              className={`h-5 w-5 mt-0.5 ${
                data.fatigue.color === "orange" ? "text-orange-400" : "text-red-400"
              }`}
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-zinc-100">
                  Fatigue: {data.fatigue.score}/10
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    data.fatigue.color === "orange"
                      ? "bg-orange-600/20 text-orange-400"
                      : "bg-red-600/20 text-red-400"
                  }`}
                >
                  {data.fatigue.level}
                </span>
              </div>
              <p className="text-sm text-zinc-400">{data.fatigue.action}</p>
            </div>
          </div>
        </div>
      )}

      {/* Deload Active Banner */}
      {data.deload?.isActive && (
        <div className="rounded-xl border p-4 bg-blue-950/30 border-blue-900/50">
          <div className="flex items-center gap-3">
            <Zap className="h-5 w-5 text-blue-400" />
            <div>
              <span className="font-medium text-zinc-100">
                Deload Week Active
              </span>
              <p className="text-sm text-zinc-400">
                {data.deload.daysRemaining} days remaining •{" "}
                {Math.round((data.modifiers?.volume || 1) * 100)}% volume
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Rotation Message */}
      {data.rotation.message && (
        <div className="rounded-xl border p-3 bg-zinc-900 border-zinc-800">
          <p className="text-sm text-zinc-400">{data.rotation.message}</p>
        </div>
      )}

      {/* Target Muscles */}
      <div className="flex flex-wrap gap-2">
        {data.templateDay.targetMuscles.map((muscle) => (
          <span
            key={muscle}
            className="px-3 py-1 bg-zinc-800 rounded-full text-sm text-zinc-300"
          >
            {muscle.replace(/_/g, " ")}
          </span>
        ))}
      </div>

      {/* Warmup Section */}
      {data.warmup && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800">
          <button
            onClick={onToggleWarmup}
            className="w-full p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center">
                <Flame className="h-5 w-5 text-orange-400" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-zinc-100">Warmup</h3>
                <p className="text-sm text-zinc-400">
                  {data.warmup.phases.length} phases • {data.warmup.phases.reduce((sum, p) => sum + p.exercises.length, 0)} exercises
                </p>
              </div>
            </div>
            {showWarmup ? (
              <ChevronUp className="h-5 w-5 text-zinc-400" />
            ) : (
              <ChevronDown className="h-5 w-5 text-zinc-400" />
            )}
          </button>

          {showWarmup && (
            <div className="px-4 pb-4 space-y-3">
              {data.warmup.phases.map((phase) => (
                <div key={phase.id} className="bg-zinc-800/50 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-zinc-300 mb-2">{phase.name}</h4>
                  <div className="space-y-1">
                    {phase.exercises.map((ex, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-zinc-400">{ex.exerciseName}</span>
                        <span className="text-zinc-500">
                          {ex.durationSeconds
                            ? `${ex.durationSeconds}s`
                            : `${ex.sets}×${ex.reps}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Start Button */}
      {!sessionId && (
        <button
          onClick={onStartWorkout}
          className="w-full py-4 bg-green-600 hover:bg-green-700 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2"
        >
          <Play className="h-5 w-5" />
          Start Workout
        </button>
      )}

      {/* Exercise List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-100">Exercises</h2>
        {workingSlots.map((slot, index) => {
          const exercise = slotSelections[slot.id];
          return (
            <div
              key={slot.id}
              className="bg-zinc-900 rounded-xl border border-zinc-800 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      slot.slotType === "primary" ? "bg-green-600/20 text-green-400" :
                      slot.slotType === "secondary" ? "bg-blue-600/20 text-blue-400" :
                      "bg-zinc-700 text-zinc-300"
                    }`}>
                      {slot.slotType}
                    </span>
                    <span className="text-xs text-zinc-500">
                      {slot.movementPattern.replace(/_/g, " ")}
                    </span>
                  </div>

                  {exercise ? (
                    <>
                      <h3 className="font-semibold text-zinc-100">{exercise.name}</h3>
                      <p className="text-sm text-zinc-400">
                        {slot.sets} sets × {slot.repRangeMin}-{slot.repRangeMax} reps
                        {slot.rpeTarget && ` @ RPE ${slot.rpeTarget}`}
                      </p>
                      {exercise.previous && (
                        <p className="text-xs text-zinc-500 mt-1">
                          Last: {exercise.previous.weight} lbs × {exercise.previous.reps}
                          {exercise.previous.rpe && ` @ ${exercise.previous.rpe}`}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-zinc-400 italic">No exercise selected</p>
                  )}
                </div>

                <button
                  onClick={() => onShowSwapModal(slot.id)}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                  title="Swap exercise"
                >
                  <RefreshCw className="h-4 w-4 text-zinc-400" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ============================================
// Focused Mode Component
// ============================================
interface FocusedModeProps {
  data: PPLTodayData;
  workingSlots: TemplateSlot[];
  slotSelections: SlotSelection;
  sessionExercises: SessionExercise[];
  loggedSets: Record<string, SessionSet[]>;
  currentIndex: number;
  elapsedTime: number;
  completedCount: number;
  allComplete: boolean;
  onSetIndex: (index: number) => void;
  onViewAll: () => void;
  onLogSet: (sessionExerciseId: string, setNumber: number, weight: number, reps: number, rpe: number | null, restSeconds: number) => void;
  onComplete: () => void;
  onShowSwapModal: (slotId: string) => void;
  formatTime: (seconds: number) => string;
  workoutNotes: string;
  setWorkoutNotes: (notes: string) => void;
}

function FocusedMode({
  data,
  workingSlots,
  slotSelections,
  sessionExercises,
  loggedSets,
  currentIndex,
  elapsedTime,
  completedCount,
  allComplete,
  onSetIndex,
  onViewAll,
  onLogSet,
  onComplete,
  onShowSwapModal,
  formatTime,
  workoutNotes,
  setWorkoutNotes,
}: FocusedModeProps) {
  const currentSessionExercise = sessionExercises[currentIndex];
  const currentSlot = workingSlots[currentIndex];
  const currentExercise = currentSlot ? slotSelections[currentSlot.id] : null;
  const currentSets = currentSessionExercise ? (loggedSets[currentSessionExercise.id] || []) : [];

  const totalExercises = sessionExercises.length;

  if (!currentSessionExercise || !currentSlot || !currentExercise) {
    return (
      <div className="text-center py-8">
        <p className="text-zinc-400">No exercise data available</p>
      </div>
    );
  }

  return (
    <>
      {/* Header with progress dots and timer */}
      <div className="flex items-center justify-between">
        <button
          onClick={onViewAll}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-800 rounded-lg hover:bg-zinc-700 transition-colors"
        >
          <List className="h-4 w-4" />
          <span className="text-sm">View All</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800 rounded-lg">
          <Clock className="h-4 w-4 text-blue-400" />
          <span className="font-mono text-zinc-100">{formatTime(elapsedTime)}</span>
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2">
        {sessionExercises.map((se, idx) => {
          const slot = workingSlots[idx];
          const isComplete = slot && (loggedSets[se.id] || []).filter(s => s.completedAt).length >= slot.sets;
          return (
            <button
              key={se.id}
              onClick={() => onSetIndex(idx)}
              className={`w-3 h-3 rounded-full transition-colors ${
                idx === currentIndex
                  ? "bg-blue-500"
                  : isComplete
                  ? "bg-green-500"
                  : "bg-zinc-700"
              }`}
            />
          );
        })}
      </div>

      {/* Exercise Card - Full focus */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
        {/* Exercise header */}
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs px-2 py-0.5 rounded ${
              currentSlot.slotType === "primary" ? "bg-green-600/20 text-green-400" :
              currentSlot.slotType === "secondary" ? "bg-blue-600/20 text-blue-400" :
              "bg-zinc-700 text-zinc-300"
            }`}>
              {currentSlot.slotType} • {currentSlot.movementPattern.replace(/_/g, " ")}
            </span>
            <button
              onClick={() => onShowSwapModal(currentSlot.id)}
              className="p-1 hover:bg-zinc-800 rounded transition-colors"
            >
              <RefreshCw className="h-4 w-4 text-zinc-400" />
            </button>
          </div>

          <h2 className="text-2xl font-bold text-zinc-100">{currentExercise.name}</h2>

          <div className="flex flex-wrap gap-2 mt-2">
            {currentExercise.primaryMuscles.map((muscle) => (
              <span key={muscle} className="text-xs px-2 py-1 bg-zinc-800 rounded text-zinc-400">
                {muscle.replace(/_/g, " ")}
              </span>
            ))}
            {currentExercise.equipment.map((eq) => (
              <span key={eq} className="text-xs px-2 py-1 bg-blue-900/30 rounded text-blue-400">
                {eq}
              </span>
            ))}
          </div>
        </div>

        {/* Previous performance */}
        {currentExercise.previous && (
          <div className="px-4 py-3 bg-zinc-800/50 flex items-center gap-2">
            <span className="text-sm text-zinc-400">Last time:</span>
            <span className="font-medium text-zinc-200">
              {currentExercise.previous.weight} lbs × {currentExercise.previous.reps}
              {currentExercise.previous.rpe && ` @ RPE ${currentExercise.previous.rpe}`}
            </span>
          </div>
        )}

        {/* Set logging */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between text-sm text-zinc-400">
            <span>Target: {currentSlot.sets} sets × {currentSlot.repRangeMin}-{currentSlot.repRangeMax} reps</span>
            {currentSlot.rpeTarget && <span>RPE {currentSlot.rpeTarget}</span>}
          </div>

          {Array.from({ length: currentSlot.sets }).map((_, i) => (
            <SetInputRow
              key={i}
              setNumber={i + 1}
              sessionExerciseId={currentSessionExercise.id}
              existingSet={currentSets.find(s => s.setNumber === i + 1)}
              previous={currentExercise.previous}
              restSeconds={currentSlot.restSeconds}
              rpeTarget={currentSlot.rpeTarget}
              onLogSet={onLogSet}
            />
          ))}

          {/* Rest time hint */}
          <p className="text-xs text-zinc-500 text-center">
            Rest: {Math.floor(currentSlot.restSeconds / 60)}:{(currentSlot.restSeconds % 60).toString().padStart(2, "0")} between sets
          </p>
        </div>

        {/* Tips section (collapsible) */}
        {currentExercise.tips && currentExercise.tips.length > 0 && (
          <TipsSection tips={currentExercise.tips} />
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onSetIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
          Previous
        </button>

        <span className="text-zinc-400">
          {currentIndex + 1} / {totalExercises}
        </span>

        <button
          onClick={() => onSetIndex(Math.min(totalExercises - 1, currentIndex + 1))}
          disabled={currentIndex === totalExercises - 1}
          className="flex items-center gap-2 px-4 py-3 bg-zinc-800 rounded-xl hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Next
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Complete button */}
      {allComplete && (
        <div className="space-y-3">
          <textarea
            value={workoutNotes}
            onChange={(e) => setWorkoutNotes(e.target.value)}
            placeholder="Workout notes (optional)"
            className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            rows={2}
          />
          <button
            onClick={onComplete}
            className="w-full py-4 bg-green-600 hover:bg-green-700 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle className="h-5 w-5" />
            Complete Workout
          </button>
        </div>
      )}
    </>
  );
}

// ============================================
// Set Input Row Component
// ============================================
interface SetInputRowProps {
  setNumber: number;
  sessionExerciseId: string;
  existingSet?: SessionSet;
  previous: SlotExercise["previous"];
  restSeconds: number;
  rpeTarget: string | null;
  onLogSet: (sessionExerciseId: string, setNumber: number, weight: number, reps: number, rpe: number | null, restSeconds: number) => void;
}

function SetInputRow({
  setNumber,
  sessionExerciseId,
  existingSet,
  previous,
  restSeconds,
  rpeTarget,
  onLogSet,
}: SetInputRowProps) {
  const [weight, setWeight] = useState(existingSet?.weight || previous?.weight || "");
  const [reps, setReps] = useState(existingSet?.reps?.toString() || previous?.reps?.toString() || "");
  const [rpe, setRpe] = useState(existingSet?.rpe || rpeTarget || "");
  const [isLogging, setIsLogging] = useState(false);
  const isCompleted = !!existingSet?.completedAt;

  async function handleLog() {
    if (!weight || !reps) {
      toast.error("Enter weight and reps");
      return;
    }
    setIsLogging(true);
    await onLogSet(
      sessionExerciseId,
      setNumber,
      parseFloat(weight),
      parseInt(reps),
      rpe ? parseFloat(rpe) : null,
      restSeconds
    );
    setIsLogging(false);
  }

  return (
    <div className={`flex items-center gap-2 p-3 rounded-lg ${
      isCompleted ? "bg-green-900/20 border border-green-600/30" : "bg-zinc-800"
    }`}>
      <span className={`w-8 text-center font-medium ${
        isCompleted ? "text-green-400" : "text-zinc-400"
      }`}>
        {setNumber}
      </span>

      <input
        type="number"
        placeholder="lbs"
        value={weight}
        onChange={(e) => setWeight(e.target.value)}
        className="flex-1 px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-center text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        disabled={isLogging}
      />

      <span className="text-zinc-500">×</span>

      <input
        type="number"
        placeholder="reps"
        value={reps}
        onChange={(e) => setReps(e.target.value)}
        className="w-16 px-3 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-center text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        disabled={isLogging}
      />

      <span className="text-zinc-500">@</span>

      <input
        type="number"
        placeholder="RPE"
        value={rpe}
        onChange={(e) => setRpe(e.target.value)}
        className="w-14 px-2 py-2 bg-zinc-700 border border-zinc-600 rounded-lg text-center text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        disabled={isLogging}
        min="1"
        max="10"
        step="0.5"
      />

      <button
        onClick={handleLog}
        disabled={isLogging || (!weight && !reps)}
        className={`p-2 rounded-lg transition-colors ${
          isCompleted
            ? "bg-green-600 text-white"
            : "bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        }`}
      >
        {isLogging ? (
          <span className="w-5 h-5 block animate-pulse">...</span>
        ) : isCompleted ? (
          <CheckCircle className="h-5 w-5" />
        ) : (
          <Plus className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}

// ============================================
// Tips Section Component
// ============================================
function TipsSection({ tips }: { tips: string[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-t border-zinc-800">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-300"
      >
        <Info className="h-4 w-4" />
        Tips & Form Cues
        {isOpen ? <ChevronUp className="h-4 w-4 ml-auto" /> : <ChevronDown className="h-4 w-4 ml-auto" />}
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          <ul className="space-y-2">
            {tips.map((tip, idx) => (
              <li key={idx} className="text-sm text-zinc-400 flex gap-2">
                <span className="text-green-400">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ============================================
// Swap Modal Component
// ============================================
interface SwapModalProps {
  slotId: string;
  slot: TemplateSlot;
  currentSelection: SlotExercise | undefined;
  onSwap: (slotId: string, exercise: SlotExercise) => void;
  onClose: () => void;
}

function SwapModal({ slotId, slot, currentSelection, onSwap, onClose }: SwapModalProps) {
  const [alternatives, setAlternatives] = useState<SlotExercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAlternatives();
  }, [slot.movementPattern, currentSelection?.id]);

  async function fetchAlternatives() {
    try {
      const params = new URLSearchParams({
        pattern: slot.movementPattern,
        limit: "15",
      });
      if (currentSelection?.id) {
        params.set("exerciseId", currentSelection.id);
      }

      const res = await fetch(`/api/exercises/alternatives?${params}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setAlternatives(data.exercises || []);
    } catch (err) {
      toast.error("Failed to load alternatives");
    } finally {
      setIsLoading(false);
    }
  }

  // Combine current suggested + alternatives
  const allOptions = [
    ...(slot.suggestedExercise ? [slot.suggestedExercise] : []),
    ...alternatives.filter(a => a.id !== slot.suggestedExercise?.id),
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 rounded-t-2xl sm:rounded-2xl border border-zinc-800 w-full max-w-lg max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-zinc-100">Swap Exercise</h3>
            <p className="text-sm text-zinc-400">{slot.movementPattern.replace(/_/g, " ")}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-zinc-800 rounded-lg">
            <X className="h-5 w-5 text-zinc-400" />
          </button>
        </div>

        {/* Options list */}
        <div className="overflow-y-auto max-h-[60vh] p-4 space-y-2">
          {isLoading ? (
            <p className="text-center text-zinc-400 py-4">Loading alternatives...</p>
          ) : allOptions.length === 0 ? (
            <p className="text-center text-zinc-400 py-4">No alternatives found</p>
          ) : (
            allOptions.map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => onSwap(slotId, exercise)}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  currentSelection?.id === exercise.id
                    ? "bg-blue-600/20 border border-blue-600"
                    : "bg-zinc-800 hover:bg-zinc-700 border border-transparent"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-zinc-100">{exercise.name}</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {exercise.equipment.slice(0, 2).map((eq) => (
                        <span key={eq} className="text-xs px-2 py-0.5 bg-zinc-700 rounded text-zinc-400">
                          {eq}
                        </span>
                      ))}
                      {exercise.previous && (
                        <span className="text-xs px-2 py-0.5 bg-green-900/30 rounded text-green-400">
                          Previously used
                        </span>
                      )}
                    </div>
                  </div>
                  {currentSelection?.id === exercise.id && (
                    <CheckCircle className="h-5 w-5 text-blue-400" />
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================
// Summary Modal Component
// ============================================
interface SummaryModalProps {
  summary: WorkoutSummary;
  dayName: string;
  onDismiss: () => void;
}

function SummaryModal({ summary, dayName, onDismiss }: SummaryModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 p-6 text-center">
          <Trophy className="h-12 w-12 mx-auto mb-3 text-white" />
          <h2 className="text-2xl font-bold text-white">Workout Complete!</h2>
          <p className="text-green-100">{dayName}</p>
        </div>

        {/* Stats Grid */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Clock className="h-4 w-4 text-blue-400" />
                <span className="text-2xl font-bold text-zinc-100">
                  {Math.round(summary.duration / 60)}
                </span>
              </div>
              <p className="text-sm text-zinc-400">Minutes</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="h-4 w-4 text-orange-400" />
                <span className="text-2xl font-bold text-zinc-100">
                  {summary.totalSets}
                </span>
              </div>
              <p className="text-sm text-zinc-400">Sets</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Flame className="h-4 w-4 text-red-400" />
                <span className="text-2xl font-bold text-zinc-100">
                  {summary.totalVolume.toLocaleString()}
                </span>
              </div>
              <p className="text-sm text-zinc-400">lbs Volume</p>
            </div>
          </div>

          {summary.avgRpe > 0 && (
            <div className="text-center py-2 bg-zinc-800 rounded-lg">
              <span className="text-sm text-zinc-400">Average RPE: </span>
              <span className="font-bold text-zinc-100">{summary.avgRpe.toFixed(1)}</span>
            </div>
          )}

          {/* Exercise breakdown */}
          {summary.exercises && summary.exercises.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-3">
                Exercises Completed
              </h3>
              <div className="space-y-2">
                {summary.exercises.map((exercise, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-2 px-3 bg-zinc-800 rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span className="text-zinc-100">{exercise.name}</span>
                    </div>
                    <span className="text-sm text-zinc-400">
                      {exercise.sets} sets • {exercise.topWeight}×{exercise.topReps}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Done button */}
          <button
            onClick={onDismiss}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold text-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
