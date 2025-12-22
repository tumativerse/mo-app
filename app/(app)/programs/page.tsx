"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ProgramDay {
  id: string;
  name: string;
  dayNumber: number;
  isRestDay: boolean;
  workoutType: string | null;
}

interface Program {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  durationWeeks: number | null;
  experience: string | null;
  goal: string | null;
  daysPerWeek: number;
  days: ProgramDay[];
}

export default function ProgramsPage() {
  const router = useRouter();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [activeProgram, setActiveProgram] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  async function fetchPrograms() {
    try {
      const res = await fetch("/api/programs");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setPrograms(data.programs);
      setActiveProgram(data.activeProgram?.programId || null);
    } catch (error) {
      toast.error("Failed to load programs");
    } finally {
      setIsLoading(false);
    }
  }

  async function enrollInProgram(programId: string) {
    setEnrolling(programId);
    try {
      const res = await fetch("/api/programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId }),
      });

      if (!res.ok) throw new Error("Failed to enroll");

      toast.success("Enrolled in program!");
      setActiveProgram(programId);
      router.push("/workout");
    } catch (error) {
      toast.error("Failed to enroll in program");
    } finally {
      setEnrolling(null);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-300">Loading programs...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-100">Training Programs</h1>
        <p className="text-zinc-300">Choose a program to get started</p>
      </div>

      {programs.length === 0 ? (
        <div className="bg-zinc-900 rounded-xl border border-zinc-800 p-8 text-center">
          <Dumbbell className="h-16 w-16 mx-auto mb-4 text-zinc-500" />
          <h2 className="text-xl font-semibold mb-2">No Programs Available</h2>
          <p className="text-zinc-300">
            Run the database seed to create the PPL program.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {programs.map((program) => {
            const isActive = activeProgram === program.id;
            const isEnrolling = enrolling === program.id;

            return (
              <div
                key={program.id}
                className={`bg-zinc-900 rounded-xl border p-6 ${
                  isActive ? "border-green-600" : "border-zinc-800"
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-semibold">{program.name}</h2>
                      {isActive && (
                        <span className="px-2 py-0.5 bg-green-600/20 text-green-400 text-xs rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    {program.description && (
                      <p className="text-zinc-300 mt-1">{program.description}</p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-3 text-sm">
                      <span className="px-2 py-1 bg-zinc-800 rounded-lg text-zinc-300">
                        {program.daysPerWeek} days/week
                      </span>
                      {program.durationWeeks && (
                        <span className="px-2 py-1 bg-zinc-800 rounded-lg text-zinc-300">
                          {program.durationWeeks} weeks
                        </span>
                      )}
                      {program.goal && (
                        <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded-lg">
                          {program.goal.replace("_", " ")}
                        </span>
                      )}
                    </div>
                  </div>

                  {!isActive && (
                    <button
                      onClick={() => enrollInProgram(program.id)}
                      disabled={isEnrolling}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      {isEnrolling ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Enrolling...
                        </>
                      ) : (
                        <>
                          <Dumbbell className="h-4 w-4" />
                          Start
                        </>
                      )}
                    </button>
                  )}

                  {isActive && (
                    <button
                      onClick={() => router.push("/workout")}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                      <Check className="h-4 w-4" />
                      Go to Workout
                    </button>
                  )}
                </div>

                {/* Weekly Schedule */}
                <div className="mt-4 pt-4 border-t border-zinc-800">
                  <h3 className="text-sm font-medium text-zinc-300 mb-2">
                    Weekly Schedule
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {program.days
                      .sort((a, b) => a.dayNumber - b.dayNumber)
                      .map((day) => (
                        <span
                          key={day.id}
                          className={`px-3 py-1 rounded-lg text-sm ${
                            day.isRestDay
                              ? "bg-zinc-800 text-zinc-400"
                              : "bg-zinc-800 text-zinc-200"
                          }`}
                        >
                          D{day.dayNumber}: {day.name}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
