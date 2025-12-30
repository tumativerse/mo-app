"use client";

import { useState, useEffect } from "react";
import { Scale, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { toast } from "sonner";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { ProfileLoadingAnimation } from "@/components/profile-loading-animation";
import { useMinimumLoadingTime } from "@/hooks/use-minimum-loading-time";

interface WeightEntry {
  id: string;
  weight: string;
  date: string;
  notes: string | null;
}

interface WeightStats {
  current: number | null;
  weekAgo: number | null;
  lowest: number | null;
  highest: number | null;
  average: number | null;
}

export default function WeightPage() {
  const [weight, setWeight] = useState("");
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [stats, setStats] = useState<WeightStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMinTimeElapsed = useMinimumLoadingTime(3500);

  useEffect(() => {
    fetchEntries();
  }, []);

  async function fetchEntries() {
    try {
      const res = await fetch("/api/weight?days=30");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setEntries(data.entries);
      setStats(data.stats);
    } catch (error) {
      toast.error("Failed to load weight data");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!weight) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: parseFloat(weight) }),
      });

      if (!res.ok) throw new Error("Failed to log weight");

      toast.success("Weight logged!");
      setWeight("");
      fetchEntries();
    } catch (error) {
      toast.error("Failed to log weight");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Prepare chart data (reverse to show oldest first)
  const chartData = [...entries]
    .reverse()
    .map((entry) => ({
      date: new Date(entry.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      weight: parseFloat(entry.weight),
    }));

  // Calculate week-over-week change
  const weekChange =
    stats?.current && stats?.weekAgo
      ? Math.round((stats.current - stats.weekAgo) * 10) / 10
      : null;

  if (isLoading || !isMinTimeElapsed) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center -mt-6">
        <ProfileLoadingAnimation loadingContext="weight" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Weight Tracking</h1>
        <p className="text-zinc-300">Log daily for accurate trends</p>
      </div>

      {/* Quick Log Form */}
      <form onSubmit={handleSubmit} className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <div className="relative">
              <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-300" />
              <input
                type="number"
                step="0.1"
                placeholder="Enter weight"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-300">
                lbs
              </span>
            </div>
          </div>
          <button
            type="submit"
            disabled={!weight || isSubmitting}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
          >
            {isSubmitting ? "..." : "Log"}
          </button>
        </div>
      </form>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
            <p className="text-sm text-zinc-300 mb-1">Current</p>
            <p className="text-2xl font-bold">
              {stats.current ? `${stats.current} lbs` : "--"}
            </p>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
            <p className="text-sm text-zinc-300 mb-1">7-Day Change</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">
                {weekChange !== null ? (
                  <>
                    {weekChange > 0 ? "+" : ""}
                    {weekChange} lbs
                  </>
                ) : (
                  "--"
                )}
              </p>
              {weekChange !== null && (
                <>
                  {weekChange < 0 ? (
                    <TrendingDown className="h-5 w-5 text-green-500" />
                  ) : weekChange > 0 ? (
                    <TrendingUp className="h-5 w-5 text-red-500" />
                  ) : (
                    <Minus className="h-5 w-5 text-zinc-300" />
                  )}
                </>
              )}
            </div>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
            <p className="text-sm text-zinc-300 mb-1">30-Day Avg</p>
            <p className="text-2xl font-bold">
              {stats.average ? `${stats.average} lbs` : "--"}
            </p>
          </div>
          <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
            <p className="text-sm text-zinc-300 mb-1">30-Day Range</p>
            <p className="text-2xl font-bold">
              {stats.lowest && stats.highest
                ? `${stats.lowest} - ${stats.highest}`
                : "--"}
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
        <h2 className="font-semibold mb-4">Last 30 Days</h2>
        {isLoading ? (
          <div className="h-64 flex items-center justify-center text-zinc-300">
            Loading...
          </div>
        ) : chartData.length > 0 ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                <XAxis
                  dataKey="date"
                  stroke="#71717a"
                  fontSize={12}
                  tickLine={false}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={12}
                  tickLine={false}
                  domain={["dataMin - 2", "dataMax + 2"]}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#18181b",
                    border: "1px solid #27272a",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "#a1a1aa" }}
                  formatter={(value) => [`${value} lbs`, "Weight"]}
                />
                {stats?.average && (
                  <ReferenceLine
                    y={stats.average}
                    stroke="#3b82f6"
                    strokeDasharray="5 5"
                    label={{
                      value: "Avg",
                      position: "right",
                      fill: "#3b82f6",
                      fontSize: 12,
                    }}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: "#22c55e", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: "#22c55e" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64 flex items-center justify-center text-zinc-300">
            <div className="text-center">
              <Scale className="h-12 w-12 mx-auto mb-3 text-zinc-500" />
              <p>No weight entries yet</p>
              <p className="text-sm text-zinc-400">Log your first weight above</p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Entries */}
      {entries.length > 0 && (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
          <h2 className="font-semibold mb-3">Recent Entries</h2>
          <div className="space-y-2">
            {entries.slice(0, 7).map((entry) => (
              <div
                key={entry.id}
                className="flex justify-between items-center py-2 border-b border-zinc-800 last:border-0"
              >
                <span className="text-zinc-300">
                  {new Date(entry.date).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <span className="font-medium">{entry.weight} lbs</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
