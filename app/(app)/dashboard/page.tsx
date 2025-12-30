"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Scale,
  Dumbbell,
  TrendingUp,
  Flame,
  Play,
  Bed,
  Moon,
  Activity,
  ChevronRight,
  AlertTriangle,
  Battery,
  Zap,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RecoveryCheckin } from "@/components/recovery-checkin";
import { pageTransition, staggerContainer, staggerItem, cardHover } from "@/lib/animations";

interface DashboardData {
  workoutsThisWeek: number;
  weekAvgWeight: number | null;
  currentWeight: number | null;
  streak: number;
  hasProgram: boolean;
  program: {
    name: string;
    week: number;
    day: number;
  } | null;
  todayWorkout: {
    name: string;
    type: string | null;
    isRestDay: boolean;
  } | null;
}

interface RecoveryData {
  log: {
    sleepHours: string | null;
    energyLevel: number | null;
    overallSoreness: number | null;
  } | null;
}

interface TrainingStatus {
  fatigue: {
    score: number;
    level: string;
    color: string;
    message: string;
    action: string;
  };
  deload: {
    status: string;
    type?: string;
    daysRemaining?: number;
    reason?: string;
  };
  canTrain: boolean;
  shouldReduce: boolean;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
      <Skeleton className="h-40 w-full rounded-xl" />
    </div>
  );
}

// Get workout type color
function getWorkoutTypeColor(type: string | null): string {
  if (!type) return "bg-gradient-to-br from-primary/20 to-primary/5";

  const typeMap: Record<string, string> = {
    push: "bg-gradient-to-br from-[var(--fitness-push)]/20 to-[var(--fitness-push)]/5",
    pull: "bg-gradient-to-br from-[var(--fitness-pull)]/20 to-[var(--fitness-pull)]/5",
    legs: "bg-gradient-to-br from-[var(--fitness-legs)]/20 to-[var(--fitness-legs)]/5",
  };

  return typeMap[type.toLowerCase()] || "bg-gradient-to-br from-primary/20 to-primary/5";
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [recovery, setRecovery] = useState<RecoveryData | null>(null);
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus | null>(null);
  const [showRecoveryForm, setShowRecoveryForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
    fetchTodayRecovery();
    fetchTrainingStatus();
  }, []);

  async function fetchDashboard() {
    try {
      const res = await fetch("/api/dashboard");
      if (!res.ok) throw new Error("Failed to fetch");
      const dashboardData = await res.json();
      setData(dashboardData);
    } catch (error) {
      toast.error("Failed to load dashboard");
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchTodayRecovery() {
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(`/api/recovery?date=${today}`);
      if (res.ok) {
        const recoveryData = await res.json();
        setRecovery(recoveryData);
      }
    } catch {
      // Silently fail - recovery is optional
    }
  }

  async function fetchTrainingStatus() {
    try {
      const res = await fetch("/api/training/status");
      if (res.ok) {
        const statusData = await res.json();
        setTrainingStatus(statusData);
      }
    } catch {
      // Silently fail - training status is optional
    }
  }

  function handleRecoveryComplete() {
    setShowRecoveryForm(false);
    fetchTodayRecovery();
  }

  if (isLoading) {
    return (
      <motion.div
        initial="initial"
        animate="animate"
        variants={pageTransition}
        className="space-y-6"
      >
        <DashboardSkeleton />
      </motion.div>
    );
  }

  const hasRecoveryToday = recovery?.log !== null;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="space-y-6 pb-8"
    >
      {/* Header */}
      <motion.div variants={staggerItem}>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Track your progress</p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-4"
      >
        {/* Today's Workout Card */}
        {data?.hasProgram ? (
          <motion.div variants={staggerItem}>
            <Link href="/workout">
              <motion.div
                variants={cardHover}
                whileHover="hover"
                whileTap="tap"
                className="block"
              >
                <Card className={`border-2 ${
                  data.todayWorkout?.isRestDay
                    ? "border-blue-500/30 bg-gradient-to-br from-blue-950/30 to-blue-900/5"
                    : `border-primary/30 ${getWorkoutTypeColor(data.todayWorkout?.type || null)}`
                } transition-all duration-300`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <motion.div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                            data.todayWorkout?.isRestDay
                              ? "bg-blue-500/20"
                              : "bg-primary/20"
                          }`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          {data.todayWorkout?.isRestDay ? (
                            <Bed className="h-7 w-7 text-blue-400" />
                          ) : (
                            <Dumbbell className="h-7 w-7 text-primary" />
                          )}
                        </motion.div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Today's Workout</p>
                          <p className="font-bold text-xl mb-1">
                            {data.todayWorkout?.isRestDay
                              ? "Rest Day"
                              : data.todayWorkout?.name || "Workout"}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground">
                              {data.program?.name}
                            </p>
                            <Badge variant="outline" className="text-xs">
                              Week {data.program?.week}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {!data.todayWorkout?.isRestDay && (
                        <motion.div
                          className="flex items-center gap-2 px-5 py-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg"
                          whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Play className="h-5 w-5" fill="currentColor" />
                          <span>Start</span>
                        </motion.div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          </motion.div>
        ) : (
          <motion.div variants={staggerItem}>
            <Card className="border-yellow-500/50 bg-gradient-to-br from-yellow-950/30 to-yellow-900/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg mb-1">Setup Required</p>
                    <p className="text-sm text-muted-foreground">
                      Run database seed to create the PPL program template
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Fatigue Indicator */}
        {trainingStatus && data?.hasProgram && (
          <motion.div variants={staggerItem}>
            <Card className={`border-2 ${
              trainingStatus.fatigue.color === "green"
                ? "border-green-500/30 bg-gradient-to-br from-green-950/20 to-green-900/5"
                : trainingStatus.fatigue.color === "yellow"
                ? "border-yellow-500/30 bg-gradient-to-br from-yellow-950/20 to-yellow-900/5"
                : trainingStatus.fatigue.color === "orange"
                ? "border-orange-500/30 bg-gradient-to-br from-orange-950/20 to-orange-900/5"
                : "border-red-500/30 bg-gradient-to-br from-red-950/20 to-red-900/5"
            }`}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <motion.div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        trainingStatus.fatigue.color === "green"
                          ? "bg-green-500/20"
                          : trainingStatus.fatigue.color === "yellow"
                          ? "bg-yellow-500/20"
                          : trainingStatus.fatigue.color === "orange"
                          ? "bg-orange-500/20"
                          : "bg-red-500/20"
                      }`}
                      whileHover={{ scale: 1.1 }}
                    >
                      {trainingStatus.fatigue.score <= 4 ? (
                        <Zap
                          className={`h-6 w-6 ${
                            trainingStatus.fatigue.color === "green"
                              ? "text-green-400"
                              : "text-yellow-400"
                          }`}
                        />
                      ) : trainingStatus.fatigue.score <= 6 ? (
                        <Battery className="h-6 w-6 text-orange-400" />
                      ) : (
                        <AlertTriangle className="h-6 w-6 text-red-400" />
                      )}
                    </motion.div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">
                          Fatigue: {trainingStatus.fatigue.score}/10
                        </span>
                        <Badge
                          variant="outline"
                          className={
                            trainingStatus.fatigue.color === "green"
                              ? "bg-green-600/20 text-green-400 border-green-500/50"
                              : trainingStatus.fatigue.color === "yellow"
                              ? "bg-yellow-600/20 text-yellow-400 border-yellow-500/50"
                              : trainingStatus.fatigue.color === "orange"
                              ? "bg-orange-600/20 text-orange-400 border-orange-500/50"
                              : "bg-red-600/20 text-red-400 border-red-500/50"
                          }
                        >
                          {trainingStatus.fatigue.level}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {trainingStatus.fatigue.message}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/progress"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Details →
                  </Link>
                </div>

                {/* Deload banner */}
                {trainingStatus.deload.status === "active" && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-orange-400">
                      🏋️ Deload active: {trainingStatus.deload.daysRemaining} days remaining
                    </p>
                  </div>
                )}
                {trainingStatus.deload.status === "recommended" && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-yellow-400">
                      ⚠️ Deload recommended: {trainingStatus.deload.reason}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recovery Check-in */}
        <motion.div variants={staggerItem}>
          {showRecoveryForm ? (
            <RecoveryCheckin
              compact
              onComplete={handleRecoveryComplete}
              onClose={() => setShowRecoveryForm(false)}
            />
          ) : !hasRecoveryToday ? (
            <motion.button
              onClick={() => setShowRecoveryForm(true)}
              className="w-full"
              variants={cardHover}
              whileHover="hover"
              whileTap="tap"
            >
              <Card className="border-2 border-purple-500/30 bg-gradient-to-br from-purple-950/30 to-purple-900/5 hover:border-purple-500/50 transition-all">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                        <Moon className="h-6 w-6 text-purple-400" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">Log Recovery</p>
                        <p className="text-sm text-muted-foreground">How are you feeling today?</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </motion.button>
          ) : (
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Moon className="h-5 w-5 text-purple-400" />
                  <span className="font-semibold">Today's Recovery</span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <motion.div
                    className="bg-secondary rounded-xl p-3 text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <p className="text-xl font-bold">
                      {recovery?.log?.sleepHours || "--"}
                    </p>
                    <p className="text-xs text-muted-foreground">hrs sleep</p>
                  </motion.div>
                  <motion.div
                    className="bg-secondary rounded-xl p-3 text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <p className="text-xl font-bold">
                      {recovery?.log?.energyLevel || "--"}/5
                    </p>
                    <p className="text-xs text-muted-foreground">energy</p>
                  </motion.div>
                  <motion.div
                    className="bg-secondary rounded-xl p-3 text-center"
                    whileHover={{ scale: 1.05 }}
                  >
                    <p className="text-xl font-bold">
                      {recovery?.log?.overallSoreness || "--"}/5
                    </p>
                    <p className="text-xs text-muted-foreground">soreness</p>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={staggerItem} className="grid grid-cols-2 gap-4">
          <Link href="/weight">
            <motion.div
              variants={cardHover}
              whileHover="hover"
              whileTap="tap"
            >
              <Card className="h-full hover:border-blue-500/50 transition-all">
                <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                  <motion.div
                    className="w-16 h-16 rounded-2xl bg-blue-500/20 flex items-center justify-center"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Scale className="h-8 w-8 text-blue-400" />
                  </motion.div>
                  <div>
                    <p className="font-semibold mb-1">Log Weight</p>
                    <p className="text-sm text-muted-foreground">
                      {data?.currentWeight ? `${data.currentWeight} lbs` : "Track daily"}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </Link>

          <Link href="/progress">
            <motion.div
              variants={cardHover}
              whileHover="hover"
              whileTap="tap"
            >
              <Card className="h-full hover:border-orange-500/50 transition-all">
                <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
                  <motion.div
                    className="w-16 h-16 rounded-2xl bg-orange-500/20 flex items-center justify-center"
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Activity className="h-8 w-8 text-orange-400" />
                  </motion.div>
                  <div>
                    <p className="font-semibold mb-1">Progress</p>
                    <p className="text-sm text-muted-foreground">View trends</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </Link>
        </motion.div>

        {/* Progress Overview */}
        <motion.div variants={staggerItem}>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-5">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="font-semibold text-lg">This Week</h2>
              </div>
              <div className="grid grid-cols-3 gap-6">
                <motion.div
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <p className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {data?.workoutsThisWeek || 0}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Workouts</p>
                </motion.div>
                <motion.div
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <p className="text-3xl font-bold">
                    {data?.weekAvgWeight || "--"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Avg Weight</p>
                </motion.div>
                <motion.div
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Flame className="h-6 w-6 text-orange-500" />
                    <p className="text-3xl font-bold">{data?.streak || 0}</p>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Day Streak</p>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Setup Instructions */}
        {!data?.hasProgram && (
          <motion.div variants={staggerItem}>
            <Card className="border-yellow-500/50 bg-gradient-to-br from-yellow-950/30 to-yellow-900/5">
              <CardContent className="p-6">
                <h3 className="font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Setup Instructions
                </h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold">1.</span>
                    <span>
                      Run <code className="bg-secondary px-2 py-0.5 rounded text-xs">npm run db:seed</code> to create the PPL template
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold">2.</span>
                    <span>Refresh this page</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 font-bold">3.</span>
                    <span>Start your first workout!</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
