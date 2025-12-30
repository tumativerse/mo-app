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
  Area,
  AreaChart,
} from 'recharts';

interface FatigueDataPoint {
  date: string;
  score: number;
  level: 'fresh' | 'manageable' | 'accumulating' | 'high';
}

interface FatigueChartProps {
  data: FatigueDataPoint[];
}

// Color mapping for fatigue levels
const LEVEL_COLORS = {
  fresh: '#10b981', // green
  manageable: '#eab308', // yellow
  accumulating: '#f97316', // orange
  high: '#ef4444', // red
};

export function FatigueChart({ data }: FatigueChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-zinc-500">
        No fatigue data yet
      </div>
    );
  }

  // Process data for chart
  const chartData = data.map((point) => ({
    date: new Date(point.date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    }),
    score: point.score,
    level: point.level,
  }));

  // Custom dot component with color based on level
  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const color = LEVEL_COLORS[payload.level as keyof typeof LEVEL_COLORS];

    return (
      <circle
        cx={cx}
        cy={cy}
        r={4}
        fill={color}
        stroke={color}
        strokeWidth={2}
      />
    );
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 5, right: 5, left: -20, bottom: 5 }}
        >
          <defs>
            <linearGradient id="fatigueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#27272a"
            opacity={0.5}
          />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#a1a1aa' }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[0, 10]}
            ticks={[0, 2, 4, 6, 8, 10]}
            tick={{ fontSize: 12, fill: '#a1a1aa' }}
            tickLine={false}
            axisLine={false}
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
              const score = value as number;
              const levelText =
                score < 4
                  ? 'Fresh'
                  : score < 6
                  ? 'Manageable'
                  : score < 8
                  ? 'Accumulating'
                  : 'High';
              return [`${score.toFixed(1)} (${levelText})`, 'Fatigue'];
            }}
          />
          {/* Reference lines for fatigue thresholds */}
          <ReferenceLine
            y={4}
            stroke="#10b981"
            strokeDasharray="3 3"
            opacity={0.3}
          />
          <ReferenceLine
            y={6}
            stroke="#eab308"
            strokeDasharray="3 3"
            opacity={0.3}
          />
          <ReferenceLine
            y={8}
            stroke="#f97316"
            strokeDasharray="3 3"
            opacity={0.3}
          />
          <Area
            type="monotone"
            dataKey="score"
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#fatigueGradient)"
            dot={<CustomDot />}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-zinc-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>&lt;4 Fresh</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span>4-6 Manageable</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-orange-500" />
          <span>6-8 Accumulating</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>&gt;8 High</span>
        </div>
      </div>
    </div>
  );
}
