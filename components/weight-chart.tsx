'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

interface WeightEntry {
  id: string;
  weight: string;
  date: string;
  notes: string | null;
}

interface WeightChartProps {
  entries: WeightEntry[];
  goalWeight?: number;
}

export function WeightChart({ entries, goalWeight }: WeightChartProps) {
  const data = entries.map((entry) => ({
    date: new Date(entry.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    weight: parseFloat(entry.weight),
    fullDate: entry.date,
  }));

  // Calculate min/max for Y axis with some padding
  const weights = data.map((d) => d.weight);
  const allValues = goalWeight ? [...weights, goalWeight] : weights;
  const minWeight = Math.min(...allValues);
  const maxWeight = Math.max(...allValues);
  const padding = (maxWeight - minWeight) * 0.1 || 5;

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
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
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[minWeight - padding, maxWeight + padding]}
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
            formatter={(value) => [`${value} lbs`, 'Weight']}
          />
          {goalWeight && (
            <ReferenceLine
              y={goalWeight}
              stroke="hsl(var(--accent))"
              strokeDasharray="5 5"
              label={{
                value: `Goal: ${goalWeight}`,
                position: 'right',
                fill: 'hsl(var(--accent))',
                fontSize: 12,
              }}
            />
          )}
          <Line
            type="monotone"
            dataKey="weight"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, fill: 'hsl(var(--primary))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
