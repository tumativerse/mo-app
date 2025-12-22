"use client";

import { useState } from "react";
import { Moon, Battery, Activity, Brain, X, Check } from "lucide-react";
import { toast } from "sonner";

interface RecoveryCheckinProps {
  onComplete?: () => void;
  onClose?: () => void;
  compact?: boolean;
}

export function RecoveryCheckin({ onComplete, onClose, compact = false }: RecoveryCheckinProps) {
  const [sleepHours, setSleepHours] = useState<string>("");
  const [sleepQuality, setSleepQuality] = useState<number | null>(null);
  const [energyLevel, setEnergyLevel] = useState<number | null>(null);
  const [soreness, setSoreness] = useState<number | null>(null);
  const [stressLevel, setStressLevel] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit() {
    // At least one field should be filled
    if (!sleepHours && !sleepQuality && !energyLevel && !soreness && !stressLevel) {
      toast.error("Please fill in at least one field");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sleepHours: sleepHours ? parseFloat(sleepHours) : undefined,
          sleepQuality,
          energyLevel,
          overallSoreness: soreness,
          stressLevel,
        }),
      });

      if (!res.ok) throw new Error("Failed to log recovery");

      toast.success("Recovery logged!");
      onComplete?.();
    } catch (err) {
      toast.error("Failed to log recovery");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Compact version for dashboard
  if (compact) {
    return (
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-zinc-100">Quick Recovery Check</h3>
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded">
              <X className="h-4 w-4 text-zinc-400" />
            </button>
          )}
        </div>

        <div className="space-y-4">
          {/* Sleep hours */}
          <div className="flex items-center gap-3">
            <Moon className="h-5 w-5 text-blue-400" />
            <div className="flex-1">
              <label className="text-sm text-zinc-400">Sleep</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Hours"
                  value={sleepHours}
                  onChange={(e) => setSleepHours(e.target.value)}
                  className="w-20 px-3 py-1.5 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  min="0"
                  max="24"
                  step="0.5"
                />
                <span className="text-zinc-500 text-sm">hrs</span>
              </div>
            </div>
          </div>

          {/* Energy */}
          <div className="flex items-center gap-3">
            <Battery className="h-5 w-5 text-green-400" />
            <div className="flex-1">
              <label className="text-sm text-zinc-400">Energy</label>
              <RatingButtons value={energyLevel} onChange={setEnergyLevel} />
            </div>
          </div>

          {/* Soreness */}
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-orange-400" />
            <div className="flex-1">
              <label className="text-sm text-zinc-400">Soreness</label>
              <RatingButtons value={soreness} onChange={setSoreness} labels={["None", "", "", "", "Very"]} />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? "Saving..." : (
              <>
                <Check className="h-4 w-4" />
                Log Recovery
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Full version
  return (
    <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <h3 className="font-semibold text-zinc-100">Daily Recovery Check-in</h3>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded">
            <X className="h-4 w-4 text-zinc-400" />
          </button>
        )}
      </div>

      <div className="p-4 space-y-6">
        {/* Sleep Hours */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Moon className="h-5 w-5 text-blue-400" />
            <label className="font-medium text-zinc-100">Sleep Duration</label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              placeholder="0"
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              className="w-24 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-zinc-100 text-center text-lg [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              min="0"
              max="24"
              step="0.5"
            />
            <span className="text-zinc-400">hours</span>
          </div>
        </div>

        {/* Sleep Quality */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Moon className="h-5 w-5 text-indigo-400" />
            <label className="font-medium text-zinc-100">Sleep Quality</label>
          </div>
          <RatingButtons
            value={sleepQuality}
            onChange={setSleepQuality}
            labels={["Poor", "Fair", "OK", "Good", "Great"]}
            size="lg"
          />
        </div>

        {/* Energy Level */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Battery className="h-5 w-5 text-green-400" />
            <label className="font-medium text-zinc-100">Energy Level</label>
          </div>
          <RatingButtons
            value={energyLevel}
            onChange={setEnergyLevel}
            labels={["Low", "", "Moderate", "", "High"]}
            size="lg"
          />
        </div>

        {/* Soreness */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-5 w-5 text-orange-400" />
            <label className="font-medium text-zinc-100">Muscle Soreness</label>
          </div>
          <RatingButtons
            value={soreness}
            onChange={setSoreness}
            labels={["None", "Light", "Moderate", "Heavy", "Severe"]}
            size="lg"
          />
        </div>

        {/* Stress Level */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-5 w-5 text-purple-400" />
            <label className="font-medium text-zinc-100">Stress Level</label>
          </div>
          <RatingButtons
            value={stressLevel}
            onChange={setStressLevel}
            labels={["Low", "", "Moderate", "", "High"]}
            size="lg"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {isSubmitting ? "Saving..." : (
            <>
              <Check className="h-5 w-5" />
              Log Recovery
            </>
          )}
        </button>
      </div>
    </div>
  );
}

// Rating buttons component
interface RatingButtonsProps {
  value: number | null;
  onChange: (value: number) => void;
  labels?: string[];
  size?: "sm" | "lg";
}

function RatingButtons({ value, onChange, labels = ["1", "2", "3", "4", "5"], size = "sm" }: RatingButtonsProps) {
  const ratings = [1, 2, 3, 4, 5];

  return (
    <div className="flex gap-2">
      {ratings.map((rating) => (
        <button
          key={rating}
          onClick={() => onChange(rating)}
          className={`flex-1 ${size === "lg" ? "py-2.5" : "py-1.5"} rounded-lg text-sm font-medium transition-colors ${
            value === rating
              ? "bg-blue-600 text-white"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          }`}
        >
          {labels[rating - 1] || rating}
        </button>
      ))}
    </div>
  );
}

export default RecoveryCheckin;
