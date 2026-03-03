import { useMemo } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SensorReading } from "@/hooks/useSensorReadings";
import { format } from "date-fns";

interface MultiLineChartProps {
  data: SensorReading[];
  title: string;
  description?: string;
}

const chartConfig: ChartConfig = {
  temperature: {
    label: "Temperature (°C)",
    color: "hsl(var(--chart-1))",
  },
  soil_moisture: {
    label: "Soil Moisture (%)",
    color: "hsl(var(--chart-2))",
  },
  humidity: {
    label: "Humidity (%)",
    color: "hsl(var(--chart-3))",
  },
  grass_growth_index: {
    label: "Grass Growth (%)",
    color: "hsl(var(--chart-4))",
  },
};

export function MultiLineChart({ data, title, description }: MultiLineChartProps) {
  const chartData = useMemo(() => {
    // Aggregate data by day
    const groupedByDay = data.reduce((acc, reading) => {
      const day = format(new Date(reading.recorded_at), "MMM d");
      if (!acc[day]) {
        acc[day] = {
          temperatures: [],
          moistures: [],
          humidities: [],
          growths: [],
        };
      }
      if (reading.temperature !== null) acc[day].temperatures.push(reading.temperature);
      if (reading.soil_moisture !== null) acc[day].moistures.push(reading.soil_moisture);
      if (reading.humidity !== null) acc[day].humidities.push(reading.humidity);
      if (reading.grass_growth_index !== null) acc[day].growths.push(reading.grass_growth_index);
      return acc;
    }, {} as Record<string, { temperatures: number[]; moistures: number[]; humidities: number[]; growths: number[] }>);

    // Calculate averages
    return Object.entries(groupedByDay).map(([day, values]) => ({
      day,
      temperature: values.temperatures.length
        ? Math.round(values.temperatures.reduce((a, b) => a + b, 0) / values.temperatures.length * 10) / 10
        : null,
      soil_moisture: values.moistures.length
        ? Math.round(values.moistures.reduce((a, b) => a + b, 0) / values.moistures.length * 10) / 10
        : null,
      humidity: values.humidities.length
        ? Math.round(values.humidities.reduce((a, b) => a + b, 0) / values.humidities.length * 10) / 10
        : null,
      grass_growth_index: values.growths.length
        ? Math.round(values.growths.reduce((a, b) => a + b, 0) / values.growths.length * 10) / 10
        : null,
    }));
  }, [data]);

  if (chartData.length === 0) {
    return (
      <Card className="data-card">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground text-sm">
            No historical data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="data-card">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="hsl(var(--chart-1))"
              strokeWidth={2}
              dot={false}
              name="temperature"
            />
            <Line
              type="monotone"
              dataKey="soil_moisture"
              stroke="hsl(var(--chart-2))"
              strokeWidth={2}
              dot={false}
              name="soil_moisture"
            />
            <Line
              type="monotone"
              dataKey="humidity"
              stroke="hsl(var(--chart-3))"
              strokeWidth={2}
              dot={false}
              name="humidity"
            />
            <Line
              type="monotone"
              dataKey="grass_growth_index"
              stroke="hsl(var(--chart-4))"
              strokeWidth={2}
              dot={false}
              name="grass_growth_index"
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
