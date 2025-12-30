"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Dumbbell,
  Moon,
  Battery,
  Target,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FatigueChart } from "@/components/fatigue-chart";
import { VolumeChart } from "@/components/volume-chart";
import { pageTransition, staggerContainer, staggerItem } from "@/lib/animations";
import { animateNumber } from "@/lib/animations";

interface ProgressionData {
  fatigueScore: number;
  fatigueStatus: {
    level: string;
    message: string;
    action: string;
  };
  sessionCount: number;
  avgSessionRpe: number;
  recovery: {
    avgSleep: number;
    avgEnergy: number;
    avgSoreness: number;
  };
  fatigueHistory?: Array<{
    date: string;
    score: number;
    level: 'fresh' | 'manageable' | 'accumulating' | 'high';
  }>;
  volumeByWeek?: Array<{
    week: string;
    volume: number;
    baseline: number;
  }>;
  readyToProgress: Array<{
    exerciseId: string;
    exerciseName: string;
    latestWeight: number;
    latestReps: number;
    latestRpe: number;
    recommendation: string;
  }>;
  plateaued: Array<{
    exerciseId: string;
    exerciseName: string;
    latestWeight: number;
    latestReps: number;
    recommendation: string;
  }>;
  recommendations: string[];
}

export default function ProgressPage() {
  const [data, setData] = useState<ProgressionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [days, setDays] = useState(14);

  // Animated values
  const [animatedFatigue, setAnimatedFatigue] = useState(0);
  const [animatedSessions, setAnimatedSessions] = useState(0);
  const [animatedRpe, setAnimatedRpe] = useState(0);
  const [animatedSleep, setAnimatedSleep] = useState(0);
  const [animatedEnergy, setAnimatedEnergy] = useState(0);
  const [animatedSoreness, setAnimatedSoreness] = useState(0);

  useEffect(() => {
    fetchProgression();
  }, [days]);

  useEffect(() => {
    if (data) {
      animateNumber(animatedFatigue, data.fatigueScore, 0.8, setAnimatedFatigue);
      animateNumber(animatedSessions, data.sessionCount, 0.8, setAnimatedSessions);
      animateNumber(animatedRpe, data.avgSessionRpe, 0.8, setAnimatedRpe);
      animateNumber(animatedSleep, data.recovery.avgSleep, 0.8, setAnimatedSleep);
      animateNumber(animatedEnergy, data.recovery.avgEnergy, 0.8, setAnimatedEnergy);
      animateNumber(animatedSoreness, data.recovery.avgSoreness, 0.8, setAnimatedSoreness);
    }
  }, [data]);

  async function fetchProgression() {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/progression?days=${days}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const progressionData = await res.json();
      setData(progressionData);
    } catch (error) {
      toast.error("Failed to load progression data");
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
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-7 sm:h-8 w-32 mb-2" />
            <Skeleton className="h-4 sm:h-5 w-48" />
          </div>
          <Skeleton className="h-9 sm:h-10 w-24" />
        </div>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardContent className="p-4 sm:p-5">
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>
    );
  }

  if (!data) {
    return (
      <motion.div
        className="space-y-4 sm:space-y-6 pb-8"
        variants={pageTransition}
        initial="initial"
        animate="animate"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">Progress</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Track your training progress
          </p>
        </div>
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <Activity className="h-16 w-16 sm:h-20 sm:w-20 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-lg sm:text-xl font-semibold mb-2">No Data Yet</h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Complete some workouts to see your progress analysis.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  const fatigueColor =
    data.fatigueStatus.level === "normal"
      ? "green"
      : data.fatigueStatus.level === "monitor"
      ? "yellow"
      : "red";

  return (
    <motion.div
      className="space-y-4 sm:space-y-6 pb-8"
      variants={pageTransition}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">Progress</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Training analysis & recommendations
          </p>
        </div>

        {/* Time range selector - Touch-friendly */}
        <motion.select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="px-3 sm:px-4 py-2.5 sm:py-2 bg-muted border border-border rounded-xl text-sm sm:text-base font-medium focus:outline-none focus:ring-2 focus:ring-ring transition-all"
          style={{ minHeight: "44px" }}
          whileTap={{ scale: 0.98 }}
        >
          <option value={7}>7 days</option>
          <option value={14}>14 days</option>
          <option value={30}>30 days</option>
        </motion.select>
      </div>

      {/* Fatigue Score */}
      <motion.div variants={staggerItem}>
        <Card className={`${
          fatigueColor === "green" ? "border-green-500/30" :
          fatigueColor === "yellow" ? "border-yellow-500/30" :
          "border-red-500/30"
        }`}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start gap-3 sm:gap-4">
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 ${
                fatigueColor === "green" ? "bg-green-500/10" :
                fatigueColor === "yellow" ? "bg-yellow-500/10" :
                "bg-red-500/10"
              }`}>
                <span className={`text-2xl sm:text-3xl font-bold ${
                  fatigueColor === "green" ? "text-green-400" :
                  fatigueColor === "yellow" ? "text-yellow-400" :
                  "text-red-400"
                }`}>
                  {Math.round(animatedFatigue)}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <h3 className="font-semibold text-base sm:text-lg">Fatigue Score</h3>
                  <Badge
                    variant="outline"
                    className={`text-xs shrink-0 ${
                      fatigueColor === "green" ? "bg-green-500/10 text-green-400 border-green-500/30" :
                      fatigueColor === "yellow" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/30" :
                      "bg-red-500/10 text-red-400 border-red-500/30"
                    }`}
                  >
                    {data.fatigueStatus.level}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                  {data.fatigueStatus.message}
                </p>
                <p className="text-xs sm:text-sm font-medium">
                  {data.fatigueStatus.action}
                </p>
              </div>
            </div>

            {/* Fatigue gauge */}
            <div className="mt-4">
              <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                <span>Fresh</span>
                <span>Fatigued</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className={`h-full ${
                    fatigueColor === "green" ? "bg-green-500" :
                    fatigueColor === "yellow" ? "bg-yellow-500" :
                    "bg-red-500"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(data.fatigueScore / 10) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        className="grid grid-cols-2 gap-3 sm:gap-4"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <motion.div variants={staggerItem}>
          <Card className="h-full">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-2">
                <Dumbbell className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 shrink-0" />
                <span className="text-xs sm:text-sm text-muted-foreground">Sessions</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold mb-1">
                {Math.round(animatedSessions)}
              </p>
              <p className="text-xs text-muted-foreground">in {days} days</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="h-full">
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400 shrink-0" />
                <span className="text-xs sm:text-sm text-muted-foreground">Avg RPE</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold mb-1">
                {animatedRpe.toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">per session</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Recovery Averages */}
      <motion.div variants={staggerItem}>
        <Card>
          <CardContent className="p-4 sm:p-5">
            <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">
              Recovery Averages
            </h3>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 sm:gap-1.5 mb-1.5 sm:mb-2">
                  <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400 shrink-0" />
                  <span className="text-lg sm:text-xl font-bold">
                    {animatedSleep.toFixed(1)}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">hrs sleep</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 sm:gap-1.5 mb-1.5 sm:mb-2">
                  <Battery className="h-4 w-4 sm:h-5 sm:w-5 text-green-400 shrink-0" />
                  <span className="text-lg sm:text-xl font-bold">
                    {animatedEnergy.toFixed(1)}/5
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">energy</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 sm:gap-1.5 mb-1.5 sm:mb-2">
                  <Activity className="h-4 w-4 sm:h-5 sm:w-5 text-orange-400 shrink-0" />
                  <span className="text-lg sm:text-xl font-bold">
                    {animatedSoreness.toFixed(1)}/5
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">soreness</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Fatigue Trend */}
      {data.fatigueHistory && data.fatigueHistory.length > 0 && (
        <motion.div variants={staggerItem}>
          <Card>
            <CardContent className="p-4 sm:p-5">
              <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">
                Fatigue Trend
              </h3>
              <FatigueChart data={data.fatigueHistory} />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Weekly Volume */}
      {data.volumeByWeek && data.volumeByWeek.length > 0 && (
        <motion.div variants={staggerItem}>
          <Card>
            <CardContent className="p-4 sm:p-5">
              <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4">
                Weekly Volume
              </h3>
              <VolumeChart data={data.volumeByWeek} />
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Ready to Progress */}
      {data.readyToProgress.length > 0 && (
        <motion.div variants={staggerItem}>
          <Card>
            <div className="p-4 sm:p-5 border-b border-border flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400 shrink-0" />
              <h3 className="font-semibold text-base sm:text-lg">Ready to Progress</h3>
            </div>
            <div className="divide-y divide-border">
              {data.readyToProgress.map((exercise, index) => (
                <motion.div
                  key={exercise.exerciseId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 sm:p-5"
                >
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm sm:text-base mb-1 truncate">
                        {exercise.exerciseName}
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {exercise.latestWeight} lbs × {exercise.latestReps} @ RPE {exercise.latestRpe}
                      </p>
                    </div>
                    <CheckCircle className="h-5 w-5 text-green-400 shrink-0" />
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-green-400 font-medium">
                    💪 Add 2.5-5 lbs next session
                  </p>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Plateaued Exercises */}
      {data.plateaued.length > 0 && (
        <motion.div variants={staggerItem}>
          <Card>
            <div className="p-4 sm:p-5 border-b border-border flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-yellow-400 shrink-0" />
              <h3 className="font-semibold text-base sm:text-lg">Plateaued</h3>
            </div>
            <div className="divide-y divide-border">
              {data.plateaued.map((exercise, index) => (
                <motion.div
                  key={exercise.exerciseId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-4 sm:p-5"
                >
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm sm:text-base mb-1 truncate">
                        {exercise.exerciseName}
                      </h4>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Stuck at {exercise.latestWeight} lbs × {exercise.latestReps}
                      </p>
                    </div>
                    <AlertTriangle className="h-5 w-5 text-yellow-400 shrink-0" />
                  </div>
                  <div className="mt-3 space-y-1.5 text-xs sm:text-sm text-muted-foreground">
                    <p className="font-medium">Consider:</p>
                    <ul className="space-y-1 text-muted-foreground/80">
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span>Try a different rep range</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span>Switch to a variation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <ChevronRight className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span>Take a deload week</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <motion.div variants={staggerItem}>
          <Card>
            <CardContent className="p-4 sm:p-5">
              <h3 className="font-semibold text-base sm:text-lg mb-3">
                Recommendations
              </h3>
              <div className="space-y-2">
                {data.recommendations.map((rec, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-start gap-2 text-xs sm:text-sm"
                  >
                    <ChevronRight className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <span>{rec}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Empty state for exercises */}
      {data.readyToProgress.length === 0 && data.plateaued.length === 0 && (
        <motion.div variants={staggerItem}>
          <Card>
            <CardContent className="p-6 sm:p-8 text-center">
              <Activity className="h-12 w-12 sm:h-16 sm:w-16 mx-auto mb-3 text-muted-foreground/50" />
              <h3 className="font-semibold text-base sm:text-lg mb-1">Keep Training</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Complete more workouts to get personalized progression recommendations.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
