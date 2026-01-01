"use client";

import { useState, useEffect, useMemo } from "react";
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
import { ProfileSetupToast } from "@/components/profile-setup-toast";
import { AppLockScreen } from "@/components/app-lock-screen";
import { pageTransition, staggerContainer, staggerItem, cardHover } from "@/lib/animations";
import { checkProfileCompletion } from "@/lib/utils/profile-completion";

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

// Get fatigue status colors
function getFatigueColors(color: string) {
  const colorMap: Record<string, { border: string; bg: string; text: string; badgeBg: string; badgeBorder: string }> = {
    green: {
      border: 'var(--status-success-border)',
      bg: 'var(--status-success-bg)',
      text: 'var(--status-success)',
      badgeBg: 'var(--status-success-bg)',
      badgeBorder: 'var(--status-success-border)'
    },
    yellow: {
      border: 'var(--status-warning-border)',
      bg: 'var(--status-warning-bg)',
      text: 'var(--status-warning)',
      badgeBg: 'var(--status-warning-bg)',
      badgeBorder: 'var(--status-warning-border)'
    },
    orange: {
      border: 'var(--status-moderate-border)',
      bg: 'var(--status-moderate-bg)',
      text: 'var(--status-moderate)',
      badgeBg: 'var(--status-moderate-bg)',
      badgeBorder: 'var(--status-moderate-border)'
    },
    red: {
      border: 'var(--status-danger-border)',
      bg: 'var(--status-danger-bg)',
      text: 'var(--status-danger)',
      badgeBg: 'var(--status-danger-bg)',
      badgeBorder: 'var(--status-danger-border)'
    }
  };

  return colorMap[color] || colorMap.green;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [recovery, setRecovery] = useState<RecoveryData | null>(null);
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus | null>(null);
  const [showRecoveryForm, setShowRecoveryForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Profile completion state
  const [profile, setProfile] = useState<any>(null);
  const [preferences, setPreferences] = useState<any>(null);

  useEffect(() => {
    fetchDashboard();
    fetchTodayRecovery();
    fetchTrainingStatus();
    fetchProfileData();
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

  async function fetchProfileData() {
    try {
      const [profileRes, preferencesRes] = await Promise.all([
        fetch("/api/user/profile"),
        fetch("/api/preferences"),
      ]);

      if (profileRes.ok && preferencesRes.ok) {
        const [profileData, preferencesData] = await Promise.all([
          profileRes.json(),
          preferencesRes.json(),
        ]);
        setProfile(profileData.profile);
        setPreferences(preferencesData.preferences);
      }
    } catch {
      // Silently fail - will show lock screen if data is missing
    }
  }

  function handleRecoveryComplete() {
    setShowRecoveryForm(false);
    fetchTodayRecovery();
  }

  // Calculate profile completion status
  const completionStatus = useMemo(() => {
    if (!profile || !preferences) return null;
    return checkProfileCompletion(profile, preferences);
  }, [profile, preferences]);

  if (isLoading || !completionStatus) {
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

  // Show lock screen if mandatory fields are not complete
  if (!completionStatus.isMandatoryComplete) {
    return (
      <AppLockScreen
        progress={completionStatus.overallProgress}
        missingFields={completionStatus.missingMandatoryFields}
        mandatoryCount={completionStatus.mandatoryFieldsTotal}
        totalFields={completionStatus.overallFieldsTotal}
      />
    );
  }

  const hasRecoveryToday = recovery?.log !== null;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="space-y-4 sm:space-y-6 pb-8"
    >
      {/* Header */}
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">Track your progress</p>
      </motion.div>

      {/* Profile Setup Toast - Show when unlocked but optional fields incomplete */}
      {completionStatus.overallProgress < 100 && (
        <ProfileSetupToast
          progress={completionStatus.overallProgress}
          missingCount={completionStatus.missingOptionalFields.length}
          isDismissible={true}
        />
      )}

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
                    ? "transition-all duration-300"
                    : `border-primary/30 ${getWorkoutTypeColor(data.todayWorkout?.type || null)} transition-all duration-300`
                }`}
                  style={data.todayWorkout?.isRestDay ? {
                    borderColor: 'var(--status-rest-border)',
                    background: 'var(--status-rest-bg)'
                  } : undefined}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                        <motion.div
                          className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                            data.todayWorkout?.isRestDay
                              ? ""
                              : "bg-primary/20"
                          }`}
                          style={data.todayWorkout?.isRestDay ? {
                            backgroundColor: 'var(--status-rest-bg)'
                          } : undefined}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                          {data.todayWorkout?.isRestDay ? (
                            <Bed className="h-6 w-6 sm:h-7 sm:w-7" style={{ color: 'var(--status-rest)' }} />
                          ) : (
                            <Dumbbell className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
                          )}
                        </motion.div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs sm:text-sm text-muted-foreground mb-1">Today's Workout</p>
                          <p className="font-bold text-lg sm:text-xl mb-1 truncate">
                            {data.todayWorkout?.isRestDay
                              ? "Rest Day"
                              : data.todayWorkout?.name || "Workout"}
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-xs sm:text-sm text-muted-foreground truncate">
                              {data.program?.name}
                            </p>
                            <Badge variant="outline" className="text-xs shrink-0">
                              Week {data.program?.week}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {!data.todayWorkout?.isRestDay && (
                        <motion.div
                          className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg shrink-0"
                          whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                          whileTap={{ scale: 0.95 }}
                          style={{ minHeight: '44px' }}
                        >
                          <Play className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" />
                          <span className="text-sm sm:text-base">Start</span>
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
            <Card style={{
              borderColor: 'var(--status-warning-border)',
              background: 'var(--status-warning-bg)'
            }}>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0" style={{
                    backgroundColor: 'var(--status-warning-bg)'
                  }}>
                    <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: 'var(--status-warning)' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-base sm:text-lg mb-1">Setup Required</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
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
            <Card className="border-2" style={{
              borderColor: getFatigueColors(trainingStatus.fatigue.color).border,
              background: getFatigueColors(trainingStatus.fatigue.color).bg
            }}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <motion.div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: getFatigueColors(trainingStatus.fatigue.color).bg }}
                      whileHover={{ scale: 1.1 }}
                    >
                      {trainingStatus.fatigue.score <= 4 ? (
                        <Zap
                          className="h-5 w-5 sm:h-6 sm:w-6"
                          style={{ color: getFatigueColors(trainingStatus.fatigue.color).text }}
                        />
                      ) : trainingStatus.fatigue.score <= 6 ? (
                        <Battery className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: getFatigueColors(trainingStatus.fatigue.color).text }} />
                      ) : (
                        <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: getFatigueColors(trainingStatus.fatigue.color).text }} />
                      )}
                    </motion.div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold text-sm sm:text-base">
                          Fatigue: {trainingStatus.fatigue.score}/10
                        </span>
                        <Badge
                          variant="outline"
                          className="text-xs"
                          style={{
                            backgroundColor: getFatigueColors(trainingStatus.fatigue.color).badgeBg,
                            color: getFatigueColors(trainingStatus.fatigue.color).text,
                            borderColor: getFatigueColors(trainingStatus.fatigue.color).badgeBorder
                          }}
                        >
                          {trainingStatus.fatigue.level}
                        </Badge>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        {trainingStatus.fatigue.message}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/progress"
                    className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0"
                  >
                    Details →
                  </Link>
                </div>

                {/* Deload banner */}
                {trainingStatus.deload.status === "active" && (
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
                    <p className="text-xs sm:text-sm" style={{ color: 'var(--status-moderate)' }}>
                      🏋️ Deload active: {trainingStatus.deload.daysRemaining} days remaining
                    </p>
                  </div>
                )}
                {trainingStatus.deload.status === "recommended" && (
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
                    <p className="text-xs sm:text-sm" style={{ color: 'var(--status-warning)' }}>
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
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                        <Moon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
                      </div>
                      <div className="text-left min-w-0">
                        <p className="font-semibold text-sm sm:text-base">Log Recovery</p>
                        <p className="text-xs sm:text-sm text-muted-foreground">How are you feeling today?</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-purple-400 shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </motion.button>
          ) : (
            <Card>
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                  <Moon className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                  <span className="font-semibold text-sm sm:text-base">Today's Recovery</span>
                </div>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <motion.div
                    className="bg-secondary rounded-xl p-2 sm:p-3 text-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <p className="text-lg sm:text-xl font-bold">
                      {recovery?.log?.sleepHours || "--"}
                    </p>
                    <p className="text-xs text-muted-foreground">hrs sleep</p>
                  </motion.div>
                  <motion.div
                    className="bg-secondary rounded-xl p-2 sm:p-3 text-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <p className="text-lg sm:text-xl font-bold">
                      {recovery?.log?.energyLevel || "--"}/5
                    </p>
                    <p className="text-xs text-muted-foreground">energy</p>
                  </motion.div>
                  <motion.div
                    className="bg-secondary rounded-xl p-2 sm:p-3 text-center"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <p className="text-lg sm:text-xl font-bold">
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
        <motion.div variants={staggerItem} className="grid grid-cols-2 gap-3 sm:gap-4">
          <Link href="/weight">
            <motion.div
              variants={cardHover}
              whileHover="hover"
              whileTap="tap"
            >
              <Card className="h-full transition-all" style={{ borderColor: 'var(--status-info-border)' }}>
                <CardContent className="flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-6 text-center">
                  <motion.div
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: 'var(--status-info-bg)' }}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Scale className="h-6 w-6 sm:h-8 sm:w-8" style={{ color: 'var(--status-info)' }} />
                  </motion.div>
                  <div>
                    <p className="font-semibold text-sm sm:text-base mb-1">Log Weight</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
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
              <Card className="h-full transition-all" style={{ borderColor: 'var(--status-moderate-border)' }}>
                <CardContent className="flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-6 text-center">
                  <motion.div
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: 'var(--status-moderate-bg)' }}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Activity className="h-6 w-6 sm:h-8 sm:w-8" style={{ color: 'var(--status-moderate)' }} />
                  </motion.div>
                  <div>
                    <p className="font-semibold text-sm sm:text-base mb-1">Progress</p>
                    <p className="text-xs sm:text-sm text-muted-foreground">View trends</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </Link>
        </motion.div>

        {/* Progress Overview */}
        <motion.div variants={staggerItem}>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-4 sm:mb-5">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                <h2 className="font-semibold text-base sm:text-lg">This Week</h2>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:gap-6">
                <motion.div
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                    {data?.workoutsThisWeek || 0}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">Workouts</p>
                </motion.div>
                <motion.div
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <p className="text-2xl sm:text-3xl font-bold">
                    {data?.weekAvgWeight || "--"}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">Avg Weight</p>
                </motion.div>
                <motion.div
                  className="text-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <Flame className="h-5 w-5 sm:h-6 sm:w-6" style={{ color: 'var(--status-moderate)' }} />
                    <p className="text-2xl sm:text-3xl font-bold">{data?.streak || 0}</p>
                  </div>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">Day Streak</p>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Setup Instructions */}
        {!data?.hasProgram && (
          <motion.div variants={staggerItem}>
            <Card style={{
              borderColor: 'var(--status-warning-border)',
              background: 'var(--status-warning-bg)'
            }}>
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base" style={{ color: 'var(--status-warning)' }}>
                  <Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />
                  Setup Instructions
                </h3>
                <ul className="text-xs sm:text-sm text-muted-foreground space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="font-bold shrink-0" style={{ color: 'var(--status-warning)' }}>1.</span>
                    <span>
                      Run <code className="bg-secondary px-2 py-0.5 rounded text-xs">npm run db:seed</code> to create the PPL template
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold shrink-0" style={{ color: 'var(--status-warning)' }}>2.</span>
                    <span>Refresh this page</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold shrink-0" style={{ color: 'var(--status-warning)' }}>3.</span>
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
