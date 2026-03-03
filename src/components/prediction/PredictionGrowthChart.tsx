import type { CropPrediction } from "@/pages/Predictions";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
} from "recharts";

const buildGrowthData = (prediction: CropPrediction) => {
  const percentage = prediction.growthPercentage || 0;
  return Array.from({ length: 6 }, (_, i) => {
    const weekRatio = i / 5;
    const currentRatio = percentage / 100;
    const growth =
      weekRatio <= currentRatio
        ? Math.round(weekRatio * 100)
        : Math.round(
            percentage + (100 - percentage) * ((weekRatio - currentRatio) / (1 - currentRatio || 1))
          );
    return {
      week: `W${i + 1}`,
      growth: Math.min(100, Math.max(0, growth)),
    };
  });
};

interface Props {
  prediction: CropPrediction;
}

const PredictionGrowthChart = ({ prediction }: Props) => {
  const growthData = buildGrowthData(prediction);

  return (
    <div className="px-4 pb-2">
      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
        Growth Timeline
      </p>
      <div className="h-24">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={growthData}
            margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient
                id={`gradient-${prediction.cropId}`}
                x1="0" y1="0" x2="0" y2="1"
              >
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="week" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Area
              type="monotone"
              dataKey="growth"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill={`url(#gradient-${prediction.cropId})`}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default PredictionGrowthChart;
