import { useMemo } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SensorReading } from "@/hooks/useSensorReadings";
import { format } from "date-fns";

interface HistoricalChartProps {
  data: SensorReading[];
  title: string;
  dataKey: keyof SensorReading;
  unit: string;
  color?: string;
}

const chartConfig: ChartConfig = {
  temperature: {
    label: "Temperature",
    color: "hsl(var(--chart-1))",
  },
  soil_moisture: {
    label: "Soil Moisture",
    color: "hsl(var(--chart-2))",
  },
  humidity: {
    label: "Humidity",
    color: "hsl(var(--chart-3))",
  },
  grass_growth_index: {
    label: "Grass Growth",
    color: "hsl(var(--chart-4))",
  },
  wind_speed: {
    label: "Wind Speed",
    color: "hsl(var(--chart-5))",
  },
};

export function HistoricalChart({
  data,
  title,
  dataKey,
  unit,
  color = "hsl(var(--primary))",
}: HistoricalChartProps) {
  const chartData = useMemo(() => {
    return data.map((reading) => ({
      time: format(new Date(reading.recorded_at), "MMM d, HH:mm"),
      value: reading[dataKey] as number | null,
    })).filter(item => item.value !== null);
  }, [data, dataKey]);

  if (chartData.length === 0) {
    return (
      <Card className="data-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[200px] text-muted-foreground text-sm">
            No data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="data-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              className="text-muted-foreground"
            />
            <YAxis
              tick={{ fontSize: 10 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}${unit}`}
              className="text-muted-foreground"
            />
            <ChartTooltip
              content={<ChartTooltipContent />}
              formatter={(value) => [`${value}${unit}`, title]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: color }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
