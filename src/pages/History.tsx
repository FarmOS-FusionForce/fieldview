import MobileLayout from "@/components/MobileLayout";
import MobileHeader from "@/components/MobileHeader";
import BottomNav from "@/components/BottomNav";
import { useHistoricalReadings } from "@/hooks/useSensorReadings";
import { useRobots } from "@/hooks/useRobots";
import { HistoricalChart } from "@/components/charts/HistoricalChart";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Thermometer, Droplets, Sprout } from "lucide-react";
import { useState } from "react";

const History = () => {
  const [selectedRobotId, setSelectedRobotId] = useState<string | undefined>();
  const [timeRange, setTimeRange] = useState<number>(7);
  
  const { data: robots, isLoading: robotsLoading } = useRobots();
  const { data: readings, isLoading: readingsLoading } = useHistoricalReadings(selectedRobotId, timeRange);

  const isLoading = robotsLoading || readingsLoading;

  return (
    <MobileLayout>
      <MobileHeader />
      <main className="px-4 pt-4 pb-24">
        <h1 className="text-lg font-bold mb-4 tracking-tight">Historical Data</h1>

        <div className="space-y-2.5 mb-4">
          <Select value={selectedRobotId ?? "all"} onValueChange={(v) => setSelectedRobotId(v === "all" ? undefined : v)}>
            <SelectTrigger className="w-full h-10 rounded-xl">
              <SelectValue placeholder="Select robot" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Robots</SelectItem>
              {robots?.map((r) => <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={timeRange.toString()} onValueChange={(v) => setTimeRange(parseInt(v))}>
            <SelectTrigger className="w-full h-10 rounded-xl">
              <SelectValue placeholder="Time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Last 24 hours</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Tabs defaultValue="temperature" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-4 rounded-xl">
            <TabsTrigger value="temperature" className="text-xs rounded-lg"><Thermometer className="w-3 h-3 mr-1" />Temp</TabsTrigger>
            <TabsTrigger value="moisture" className="text-xs rounded-lg"><Droplets className="w-3 h-3 mr-1" />Moisture</TabsTrigger>
            <TabsTrigger value="growth" className="text-xs rounded-lg"><Sprout className="w-3 h-3 mr-1" />Growth</TabsTrigger>
          </TabsList>
          
          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-2xl" />
          ) : !readings || readings.length === 0 ? (
            <div className="premium-card p-8 text-center">
              <p className="text-sm text-muted-foreground">No historical data available</p>
            </div>
          ) : (
            <>
              <TabsContent value="temperature">
                <div className="premium-card p-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Temperature (°C)</h3>
                  <div className="h-56">
                    <HistoricalChart data={readings} title="" dataKey="temperature" unit="°C" color="hsl(var(--primary))" />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="moisture">
                <div className="premium-card p-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Soil Moisture (%)</h3>
                  <div className="h-56">
                    <HistoricalChart data={readings} title="" dataKey="soil_moisture" unit="%" color="hsl(var(--primary))" />
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="growth">
                <div className="premium-card p-4">
                  <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Growth Index (%)</h3>
                  <div className="h-56">
                    <HistoricalChart data={readings} title="" dataKey="grass_growth_index" unit="%" color="hsl(var(--primary))" />
                  </div>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </main>
      <BottomNav />
    </MobileLayout>
  );
};

export default History;
