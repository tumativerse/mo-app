'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';

interface VolumeDataPoint {
  week: string;
  volume: number;
  baseline: number;
}

interface VolumeChartProps {
  data: VolumeDataPoint[];
}

export function VolumeChart({ data }: VolumeChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-zinc-500">
        No volume data yet
      </div>
    );
  }

  // Calculate color based on volume vs baseline
  const getBarColor = (volume: number, baseline: number) => {
    const ratio = volume / baseline;
    if (ratio >= 1.2) return '#ef4444'; // red - too much
    if (ratio >= 1.1) return '#f97316'; // orange - high
    if (ratio >= 0.9) return '#10b981'; // green - good
    if (ratio >= 0.8) return '#eab308'; // yellow - low
    return '#ef4444'; // red - too low
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#27272a"
            opacity={0.5}
          />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 12, fill: '#a1a1aa' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: '#a1a1aa' }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#18181b',
              border: '1px solid #27272a',
              borderRadius: '8px',
              fontSize: '14px',
            }}
            labelStyle={{ color: '#f4f4f5' }}
            formatter={(value, name) => {
              if (name === 'volume') {
                return [`${(value as number).toLocaleString()} lbs`, 'Volume'];
              }
              return [value, name];
            }}
          />
          <ReferenceLine
            y={data[0]?.baseline || 0}
            stroke="#71717a"
            strokeDasharray="3 3"
            label={{
              value: 'Baseline',
              position: 'right',
              fill: '#71717a',
              fontSize: 12,
            }}
          />
          <Bar dataKey="volume" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={getBarColor(entry.volume, entry.baseline)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-zinc-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span>±10% baseline</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-yellow-500" />
          <span>-20% baseline</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-orange-500" />
          <span>+10-20%</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span>&gt;±20%</span>
        </div>
      </div>
    </div>
  );
}
