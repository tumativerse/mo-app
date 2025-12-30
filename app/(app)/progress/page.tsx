"use client";

import { useState, useEffect } from "react";
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
import { FatigueChart } from "@/components/fatigue-chart";
import { VolumeChart } from "@/components/volume-chart";

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

  useEffect(() => {
    fetchProgression();
  }, [days]);

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
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center -mt-6">
        <div className="text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Progress</h1>
          <p className="text-zinc-300">Track your training progress</p>
        </div>
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
          <Activity className="h-16 w-16 mx-auto mb-4 text-zinc-500" />
          <h2 className="text-xl font-semibold mb-2">No Data Yet</h2>
          <p className="text-zinc-300">
            Complete some workouts to see your progress analysis.
          </p>
        </div>
      </div>
    );
  }

  const fatigueColor =
    data.fatigueStatus.level === "normal"
      ? "green"
      : data.fatigueStatus.level === "monitor"
      ? "yellow"
      : "red";

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Progress</h1>
          <p className="text-zinc-300">Training analysis & recommendations</p>
        </div>

        {/* Time range selector */}
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100"
        >
          <option value={7}>7 days</option>
          <option value={14}>14 days</option>
          <option value={30}>30 days</option>
        </select>
      </div>

      {/* Fatigue Score */}
      <div className={`bg-zinc-900 rounded-xl border ${
        fatigueColor === "green" ? "border-green-600/50" :
        fatigueColor === "yellow" ? "border-yellow-600/50" :
        "border-red-600/50"
      } p-5`}>
        <div className="flex items-start gap-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
            fatigueColor === "green" ? "bg-green-500/10" :
            fatigueColor === "yellow" ? "bg-yellow-500/10" :
            "bg-red-500/10"
          }`}>
            <span className={`text-2xl font-bold ${
              fatigueColor === "green" ? "text-green-400" :
              fatigueColor === "yellow" ? "text-yellow-400" :
              "text-red-400"
            }`}>
              {data.fatigueScore}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-zinc-100">Fatigue Score</h3>
              <span className={`text-xs px-2 py-0.5 rounded ${
                fatigueColor === "green" ? "bg-green-600/20 text-green-400" :
                fatigueColor === "yellow" ? "bg-yellow-600/20 text-yellow-400" :
                "bg-red-600/20 text-red-400"
              }`}>
                {data.fatigueStatus.level}
              </span>
            </div>
            <p className="text-sm text-zinc-400 mb-2">{data.fatigueStatus.message}</p>
            <p className="text-sm text-zinc-300">{data.fatigueStatus.action}</p>
          </div>
        </div>

        {/* Fatigue gauge */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-zinc-500 mb-1">
            <span>Fresh</span>
            <span>Fatigued</span>
          </div>
          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                fatigueColor === "green" ? "bg-green-500" :
                fatigueColor === "yellow" ? "bg-yellow-500" :
                "bg-red-500"
              }`}
              style={{ width: `${(data.fatigueScore / 7) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Dumbbell className="h-4 w-4 text-blue-400" />
            <span className="text-sm text-zinc-400">Sessions</span>
          </div>
          <p className="text-2xl font-bold text-zinc-100">{data.sessionCount}</p>
          <p className="text-xs text-zinc-500">in {days} days</p>
        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-orange-400" />
            <span className="text-sm text-zinc-400">Avg RPE</span>
          </div>
          <p className="text-2xl font-bold text-zinc-100">
            {data.avgSessionRpe.toFixed(1)}
          </p>
          <p className="text-xs text-zinc-500">per session</p>
        </div>
      </div>

      {/* Recovery Averages */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
        <h3 className="font-semibold text-zinc-100 mb-3">Recovery Averages</h3>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Moon className="h-4 w-4 text-blue-400" />
              <span className="text-lg font-bold text-zinc-100">
                {data.recovery.avgSleep.toFixed(1)}
              </span>
            </div>
            <p className="text-xs text-zinc-400">hrs sleep</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Battery className="h-4 w-4 text-green-400" />
              <span className="text-lg font-bold text-zinc-100">
                {data.recovery.avgEnergy.toFixed(1)}/5
              </span>
            </div>
            <p className="text-xs text-zinc-400">energy</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity className="h-4 w-4 text-orange-400" />
              <span className="text-lg font-bold text-zinc-100">
                {data.recovery.avgSoreness.toFixed(1)}/5
              </span>
            </div>
            <p className="text-xs text-zinc-400">soreness</p>
          </div>
        </div>
      </div>

      {/* Fatigue Trend */}
      {data.fatigueHistory && data.fatigueHistory.length > 0 && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <h3 className="font-semibold text-zinc-100 mb-3">Fatigue Trend</h3>
          <FatigueChart data={data.fatigueHistory} />
        </div>
      )}

      {/* Weekly Volume */}
      {data.volumeByWeek && data.volumeByWeek.length > 0 && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <h3 className="font-semibold text-zinc-100 mb-3">Weekly Volume</h3>
          <VolumeChart data={data.volumeByWeek} />
        </div>
      )}

      {/* Ready to Progress */}
      {data.readyToProgress.length > 0 && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-400" />
            <h3 className="font-semibold text-zinc-100">Ready to Progress</h3>
          </div>
          <div className="divide-y divide-zinc-800">
            {data.readyToProgress.map((exercise) => (
              <div key={exercise.exerciseId} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-zinc-100">{exercise.exerciseName}</h4>
                    <p className="text-sm text-zinc-400">
                      {exercise.latestWeight} lbs × {exercise.latestReps} @ RPE {exercise.latestRpe}
                    </p>
                  </div>
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <p className="mt-2 text-sm text-green-400">
                  Add 2.5-5 lbs next session
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plateaued Exercises */}
      {data.plateaued.length > 0 && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
          <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-yellow-400" />
            <h3 className="font-semibold text-zinc-100">Plateaued</h3>
          </div>
          <div className="divide-y divide-zinc-800">
            {data.plateaued.map((exercise) => (
              <div key={exercise.exerciseId} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-zinc-100">{exercise.exerciseName}</h4>
                    <p className="text-sm text-zinc-400">
                      Stuck at {exercise.latestWeight} lbs × {exercise.latestReps}
                    </p>
                  </div>
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="mt-2 space-y-1 text-sm text-zinc-400">
                  <p>Consider:</p>
                  <ul className="list-disc list-inside text-zinc-500">
                    <li>Try a different rep range</li>
                    <li>Switch to a variation</li>
                    <li>Take a deload week</li>
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {data.recommendations.length > 0 && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <h3 className="font-semibold text-zinc-100 mb-3">Recommendations</h3>
          <div className="space-y-2">
            {data.recommendations.map((rec, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2 text-sm text-zinc-300"
              >
                <ChevronRight className="h-4 w-4 text-zinc-500 mt-0.5 shrink-0" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state for exercises */}
      {data.readyToProgress.length === 0 && data.plateaued.length === 0 && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-6 text-center">
          <Activity className="h-12 w-12 mx-auto mb-3 text-zinc-500" />
          <h3 className="font-semibold text-zinc-100 mb-1">Keep Training</h3>
          <p className="text-sm text-zinc-400">
            Complete more workouts to get personalized progression recommendations.
          </p>
        </div>
      )}
    </div>
  );
}
