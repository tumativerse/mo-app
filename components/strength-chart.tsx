'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface PRDataPoint {
  date: string;
  exerciseId: string;
  exerciseName: string;
  estimated1rm: number;
  weight: number;
  reps: number;
}

interface StrengthChartProps {
  data: PRDataPoint[];
  selectedExercise: string | null;
}

// Color palette for different exercises
const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  '#f97316', // orange
  '#10b981', // emerald
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#eab308', // yellow
];

export function StrengthChart({ data, selectedExercise }: StrengthChartProps) {
  // Group data by date and exercise
  const processedData = processDataForChart(data, selectedExercise);

  // Get unique exercises for legend
  const exercises = selectedExercise
    ? [{ id: selectedExercise, name: data.find((d) => d.exerciseId === selectedExercise)?.exerciseName || '' }]
    : [...new Map(data.map((d) => [d.exerciseId, { id: d.exerciseId, name: d.exerciseName }])).values()].slice(0, 5);

  if (processedData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-muted-foreground">
        No data to display
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={processedData}
          margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--muted))"
            opacity={0.5}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              fontSize: '14px',
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
            formatter={(value, name) => [
              `${Math.round(value as number)} lbs`,
              name,
            ]}
          />
          {exercises.length > 1 && (
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              iconType="line"
            />
          )}
          {exercises.map((exercise, index) => (
            <Line
              key={exercise.id}
              type="monotone"
              dataKey={exercise.name}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={2}
              dot={{ fill: COLORS[index % COLORS.length], strokeWidth: 0, r: 3 }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function processDataForChart(data: PRDataPoint[], selectedExercise: string | null) {
  // Filter to selected exercise if specified
  const filteredData = selectedExercise
    ? data.filter((d) => d.exerciseId === selectedExercise)
    : data;

  // Get unique dates and sort
  const dates = [...new Set(filteredData.map((d) => d.date))].sort();

  // Get unique exercises (limit to 5 for readability)
  const exerciseIds = selectedExercise
    ? [selectedExercise]
    : [...new Set(filteredData.map((d) => d.exerciseId))].slice(0, 5);

  // Create data points for each date
  return dates.map((date) => {
    const point: Record<string, string | number> = {
      date: new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      }),
    };

    for (const exerciseId of exerciseIds) {
      const pr = filteredData.find(
        (d) => d.date === date && d.exerciseId === exerciseId
      );
      if (pr) {
        point[pr.exerciseName] = pr.estimated1rm;
      }
    }

    return point;
  });
}
