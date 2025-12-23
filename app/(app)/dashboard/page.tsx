"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Scale,
  Dumbbell,
  TrendingUp,
  Flame,
  Play,
  Bed,
  ArrowRight,
  Moon,
  Activity,
  ChevronRight,
  AlertTriangle,
  Battery,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { RecoveryCheckin } from "@/components/recovery-checkin";

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
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-300">Loading...</div>
      </div>
    );
  }

  const hasRecoveryToday = recovery?.log !== null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Dashboard</h1>
        <p className="text-zinc-300">Track your progress</p>
      </div>

      {/* Today's Workout Card */}
      {data?.hasProgram ? (
        <Link
          href="/workout"
          className="block bg-gradient-to-br from-zinc-900 to-zinc-900/50 rounded-xl border border-zinc-800 hover:border-zinc-700 p-5 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  data.todayWorkout?.isRestDay
                    ? "bg-blue-500/10"
                    : "bg-green-500/10"
                }`}
              >
                {data.todayWorkout?.isRestDay ? (
                  <Bed className="h-6 w-6 text-blue-400" />
                ) : (
                  <Dumbbell className="h-6 w-6 text-green-400" />
                )}
              </div>
              <div>
                <p className="text-sm text-zinc-300">Today</p>
                <p className="font-semibold text-lg">
                  {data.todayWorkout?.isRestDay
                    ? "Rest Day"
                    : data.todayWorkout?.name || "Workout"}
                </p>
                <p className="text-sm text-zinc-300">
                  {data.program?.name} • Week {data.program?.week}
                </p>
              </div>
            </div>
            {!data.todayWorkout?.isRestDay && (
              <div className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-lg">
                <Play className="h-4 w-4" />
                <span className="font-medium">Start</span>
              </div>
            )}
          </div>
        </Link>
      ) : (
        <Link
          href="/programs"
          className="block bg-gradient-to-br from-blue-950/30 to-blue-900/10 rounded-xl border border-blue-900/50 p-5 transition-colors hover:border-blue-800"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                <Dumbbell className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="font-semibold text-lg text-zinc-100">Get Started</p>
                <p className="text-sm text-zinc-400">
                  Enroll in a training program to begin
                </p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-blue-400" />
          </div>
        </Link>
      )}

      {/* Fatigue Indicator - Phase 5 */}
      {trainingStatus && data?.hasProgram && (
        <div
          className={`rounded-xl border p-4 ${
            trainingStatus.fatigue.color === "green"
              ? "bg-green-950/20 border-green-900/50"
              : trainingStatus.fatigue.color === "yellow"
              ? "bg-yellow-950/20 border-yellow-900/50"
              : trainingStatus.fatigue.color === "orange"
              ? "bg-orange-950/20 border-orange-900/50"
              : "bg-red-950/20 border-red-900/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  trainingStatus.fatigue.color === "green"
                    ? "bg-green-500/20"
                    : trainingStatus.fatigue.color === "yellow"
                    ? "bg-yellow-500/20"
                    : trainingStatus.fatigue.color === "orange"
                    ? "bg-orange-500/20"
                    : "bg-red-500/20"
                }`}
              >
                {trainingStatus.fatigue.score <= 4 ? (
                  <Zap
                    className={`h-5 w-5 ${
                      trainingStatus.fatigue.color === "green"
                        ? "text-green-400"
                        : "text-yellow-400"
                    }`}
                  />
                ) : trainingStatus.fatigue.score <= 6 ? (
                  <Battery className="h-5 w-5 text-orange-400" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-zinc-100">
                    Fatigue: {trainingStatus.fatigue.score}/10
                  </span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      trainingStatus.fatigue.color === "green"
                        ? "bg-green-600/20 text-green-400"
                        : trainingStatus.fatigue.color === "yellow"
                        ? "bg-yellow-600/20 text-yellow-400"
                        : trainingStatus.fatigue.color === "orange"
                        ? "bg-orange-600/20 text-orange-400"
                        : "bg-red-600/20 text-red-400"
                    }`}
                  >
                    {trainingStatus.fatigue.level}
                  </span>
                </div>
                <p className="text-sm text-zinc-400">
                  {trainingStatus.fatigue.message}
                </p>
              </div>
            </div>
            <Link
              href="/progress"
              className="text-sm text-zinc-400 hover:text-zinc-200"
            >
              Details
            </Link>
          </div>

          {/* Deload banner */}
          {trainingStatus.deload.status === "active" && (
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <p className="text-sm text-orange-400">
                Deload active: {trainingStatus.deload.daysRemaining} days remaining
              </p>
            </div>
          )}
          {trainingStatus.deload.status === "recommended" && (
            <div className="mt-3 pt-3 border-t border-zinc-800">
              <p className="text-sm text-yellow-400">
                Deload recommended: {trainingStatus.deload.reason}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recovery Check-in */}
      {showRecoveryForm ? (
        <RecoveryCheckin
          compact
          onComplete={handleRecoveryComplete}
          onClose={() => setShowRecoveryForm(false)}
        />
      ) : !hasRecoveryToday ? (
        <button
          onClick={() => setShowRecoveryForm(true)}
          className="w-full bg-gradient-to-br from-purple-950/30 to-purple-900/10 rounded-xl border border-purple-900/50 p-4 transition-colors hover:border-purple-800 text-left"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                <Moon className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-zinc-100">Log Recovery</p>
                <p className="text-sm text-zinc-400">How are you feeling today?</p>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-purple-400" />
          </div>
        </button>
      ) : (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <div className="flex items-center gap-3 mb-3">
            <Moon className="h-5 w-5 text-purple-400" />
            <span className="font-medium text-zinc-100">Today&apos;s Recovery</span>
          </div>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-zinc-800 rounded-lg p-2">
              <p className="text-lg font-bold text-zinc-100">
                {recovery?.log?.sleepHours || "--"}
              </p>
              <p className="text-xs text-zinc-400">hrs sleep</p>
            </div>
            <div className="bg-zinc-800 rounded-lg p-2">
              <p className="text-lg font-bold text-zinc-100">
                {recovery?.log?.energyLevel || "--"}/5
              </p>
              <p className="text-xs text-zinc-400">energy</p>
            </div>
            <div className="bg-zinc-800 rounded-lg p-2">
              <p className="text-lg font-bold text-zinc-100">
                {recovery?.log?.overallSoreness || "--"}/5
              </p>
              <p className="text-xs text-zinc-400">soreness</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/weight"
          className="flex flex-col items-center gap-3 p-6 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors"
        >
          <Scale className="h-8 w-8 text-blue-500" />
          <div className="text-center">
            <p className="font-medium">Log Weight</p>
            <p className="text-sm text-zinc-300">
              {data?.currentWeight ? `${data.currentWeight} lbs` : "Track daily"}
            </p>
          </div>
        </Link>

        <Link
          href="/progress"
          className="flex flex-col items-center gap-3 p-6 bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors"
        >
          <Activity className="h-8 w-8 text-orange-500" />
          <div className="text-center">
            <p className="font-medium">Progress</p>
            <p className="text-sm text-zinc-300">View trends</p>
          </div>
        </Link>
      </div>

      {/* Progress Overview */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-zinc-300" />
          <h2 className="font-semibold">This Week</h2>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{data?.workoutsThisWeek || 0}</p>
            <p className="text-sm text-zinc-300">Workouts</p>
          </div>
          <div>
            <p className="text-2xl font-bold">
              {data?.weekAvgWeight || "--"}
            </p>
            <p className="text-sm text-zinc-300">Avg Weight</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <Flame className="h-5 w-5 text-orange-500" />
              <p className="text-2xl font-bold">{data?.streak || 0}</p>
            </div>
            <p className="text-sm text-zinc-300">Day Streak</p>
          </div>
        </div>
      </div>

      {/* Getting Started - show only if no program */}
      {!data?.hasProgram && (
        <div className="bg-blue-950/30 border border-blue-900/50 rounded-xl p-6">
          <h3 className="font-semibold text-blue-400 mb-2">Getting Started</h3>
          <ul className="text-sm text-zinc-300 space-y-2">
            <li>1. Log your current weight to establish a baseline</li>
            <li>2. Enroll in the PPL Recomp program</li>
            <li>3. Track daily to see your progress over time</li>
          </ul>
        </div>
      )}
    </div>
  );
}
