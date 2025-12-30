"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scale, TrendingDown, TrendingUp, Minus, CheckCircle } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { pageTransition, staggerContainer, staggerItem, animateNumber } from "@/lib/animations";
import { vibrateDevice, celebrateSimple } from "@/lib/celebrations";

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

function WeightSkeleton() {
  return (
    <div className="space-y-4">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>
      <Skeleton className="h-20 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
      <Skeleton className="h-80 w-full rounded-xl" />
    </div>
  );
}

export default function WeightPage() {
  const [weight, setWeight] = useState("");
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [stats, setStats] = useState<WeightStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Animated stat values
  const [animatedCurrent, setAnimatedCurrent] = useState(0);
  const [animatedAverage, setAnimatedAverage] = useState(0);

  useEffect(() => {
    fetchEntries();
  }, []);

  // Animate stat numbers when they change
  useEffect(() => {
    if (stats?.current) {
      animateNumber(animatedCurrent, stats.current, 0.8, setAnimatedCurrent);
    }
    if (stats?.average) {
      animateNumber(animatedAverage, stats.average, 0.8, setAnimatedAverage);
    }
  }, [stats]);

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
    vibrateDevice(50); // Haptic feedback on submit

    try {
      const res = await fetch("/api/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weight: parseFloat(weight) }),
      });

      if (!res.ok) throw new Error("Failed to log weight");

      // Success feedback
      toast.success("Weight logged!");
      celebrateSimple();
      vibrateDevice([50, 50, 100]);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      setWeight("");
      fetchEntries();
    } catch (error) {
      toast.error("Failed to log weight");
      vibrateDevice([100, 50, 100]); // Error vibration
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

  const getTrendIcon = () => {
    if (weekChange === null) return null;
    if (weekChange < 0) return <TrendingDown className="h-5 w-5 text-green-500" />;
    if (weekChange > 0) return <TrendingUp className="h-5 w-5 text-orange-500" />;
    return <Minus className="h-5 w-5 text-muted-foreground" />;
  };

  const getTrendColor = () => {
    if (weekChange === null) return "";
    if (weekChange < 0) return "text-green-500";
    if (weekChange > 0) return "text-orange-500";
    return "text-muted-foreground";
  };

  if (isLoading) {
    return (
      <motion.div
        initial="initial"
        animate="animate"
        variants={pageTransition}
        className="space-y-4 pb-8"
      >
        <WeightSkeleton />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageTransition}
      className="space-y-4 pb-8"
    >
      {/* Header */}
      <motion.div variants={staggerItem}>
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Weight Tracking
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Log daily for accurate trends
        </p>
      </motion.div>

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="space-y-4"
      >
        {/* Quick Log Form - Mobile Optimized */}
        <motion.div variants={staggerItem}>
          <Card className="border-2 border-blue-500/30 bg-gradient-to-br from-blue-950/20 to-blue-900/5">
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <Scale className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400 pointer-events-none" />
                  <input
                    type="number"
                    step="0.1"
                    inputMode="decimal"
                    placeholder="Enter weight"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full pl-12 pr-16 py-4 text-lg bg-secondary border-2 border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    style={{ minHeight: '56px' }} // Touch-friendly
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    lbs
                  </span>
                </div>

                <motion.div whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={!weight || isSubmitting}
                    className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 relative overflow-hidden"
                  >
                    <AnimatePresence mode="wait">
                      {isSubmitting ? (
                        <motion.span
                          key="submitting"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-2"
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                          />
                          Logging...
                        </motion.span>
                      ) : showSuccess ? (
                        <motion.span
                          key="success"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-5 w-5" />
                          Logged!
                        </motion.span>
                      ) : (
                        <motion.span
                          key="default"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        >
                          Log Weight
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Cards - Mobile First Grid */}
        {stats && (
          <motion.div
            variants={staggerItem}
            className="grid grid-cols-2 gap-3 sm:gap-4"
          >
            {/* Current Weight */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card className="h-full">
                <CardContent className="p-4 sm:p-5">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">Current</p>
                  <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-400 bg-clip-text text-transparent">
                    {stats.current ? `${animatedCurrent.toFixed(1)}` : "--"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">lbs</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* 7-Day Change */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card className="h-full">
                <CardContent className="p-4 sm:p-5">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">7-Day Change</p>
                  <div className="flex items-center gap-2">
                    <p className={`text-2xl sm:text-3xl font-bold ${getTrendColor()}`}>
                      {weekChange !== null ? (
                        <>
                          {weekChange > 0 ? "+" : ""}
                          {weekChange}
                        </>
                      ) : (
                        "--"
                      )}
                    </p>
                    {getTrendIcon()}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">lbs</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* 30-Day Average */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card className="h-full">
                <CardContent className="p-4 sm:p-5">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">30-Day Avg</p>
                  <p className="text-2xl sm:text-3xl font-bold">
                    {stats.average ? `${animatedAverage.toFixed(1)}` : "--"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">lbs</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* 30-Day Range */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Card className="h-full">
                <CardContent className="p-4 sm:p-5">
                  <p className="text-xs sm:text-sm text-muted-foreground mb-2">30-Day Range</p>
                  <p className="text-lg sm:text-2xl font-bold">
                    {stats.lowest && stats.highest
                      ? `${stats.lowest} - ${stats.highest}`
                      : "--"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">lbs</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {/* Chart - Mobile Responsive */}
        <motion.div variants={staggerItem}>
          <Card>
            <CardContent className="p-4 sm:p-6">
              <h2 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Last 30 Days
              </h2>
              {chartData.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="h-64 sm:h-80"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis
                        dataKey="date"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        domain={["dataMin - 2", "dataMax + 2"]}
                        width={40}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                        formatter={(value: any) => [`${value} lbs`, "Weight"]}
                      />
                      {stats?.average && (
                        <ReferenceLine
                          y={stats.average}
                          stroke="hsl(var(--primary))"
                          strokeDasharray="5 5"
                          label={{
                            value: "Avg",
                            position: "right",
                            fill: "hsl(var(--primary))",
                            fontSize: 11,
                          }}
                        />
                      )}
                      <Line
                        type="monotone"
                        dataKey="weight"
                        stroke="hsl(var(--primary))"
                        strokeWidth={3}
                        dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 4 }}
                        activeDot={{ r: 6, fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--background))" }}
                        animationDuration={1000}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <Scale className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    </motion.div>
                    <p className="text-muted-foreground font-medium">No weight entries yet</p>
                    <p className="text-sm text-muted-foreground mt-1">Log your first weight above</p>
                  </motion.div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Entries - Mobile Optimized */}
        {entries.length > 0 && (
          <motion.div variants={staggerItem}>
            <Card>
              <CardContent className="p-4 sm:p-6">
                <h2 className="font-semibold text-lg mb-4">Recent Entries</h2>
                <div className="space-y-1">
                  {entries.slice(0, 7).map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 4, backgroundColor: "hsl(var(--secondary))" }}
                      className="flex justify-between items-center py-3 px-3 rounded-lg transition-colors"
                    >
                      <span className="text-sm sm:text-base text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <Badge variant="outline" className="text-sm sm:text-base font-semibold">
                        {entry.weight} lbs
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  );
}
