import MobileLayout from "@/components/MobileLayout";
import MobileHeader from "@/components/MobileHeader";

import StatusCard from "@/components/StatusCard";
import { useFarmPreferences } from "@/hooks/useLocalStorage";
import { useLatestReadings, useRealtimeSensorReadings } from "@/hooks/useSensorReadings";

import { Thermometer, Droplets, Sprout, Battery, Map, Brain, ChevronRight, Bot } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [preferences] = useFarmPreferences();
  
  useRealtimeSensorReadings();

  return (
    <MobileLayout>
      <MobileHeader />
      <main className="px-4 pt-4 pb-24 space-y-5">
        {/* Greeting */}
        <section>
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            Good {getGreeting()} 👋
          </h1>
          {/* <p className="text-sm text-muted-foreground mt-0.5">
            {preferences.locationName ? `${preferences.locationName} • ` : ""}
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
          </p> */}
        </section>

        {/* Quick Stats */}
        <section>
          <div className="grid grid-cols-2 gap-2.5">
            {readingLoading ? (
              <>
                <Skeleton className="h-[100px] rounded-2xl" />
                <Skeleton className="h-[100px] rounded-2xl" />
                <Skeleton className="h-[100px] rounded-2xl" />
                <Skeleton className="h-[100px] rounded-2xl" />
              </>
            ) : (
              <>
                <StatusCard
                  title="Temperature"
                  value={latestReading?.temperature ?? "—"}
                  unit="°C"
                  icon={Thermometer}
                  status={latestReading ? "online" : "offline"}
                  subtitle={latestReading?.temperature ? "Sensor active" : "No data"}
                  compact
                />
                <StatusCard
                  title="Soil Moisture"
                  value={latestReading?.soil_moisture ?? "—"}
                  unit="%"
                  icon={Droplets}
                  status={latestReading ? "online" : "offline"}
                  subtitle={latestReading?.soil_moisture ? "Normal" : "No data"}
                  compact
                />
                <StatusCard
                  title="Growth Index"
                  value={latestReading?.grass_growth_index ?? "—"}
                  unit="%"
                  icon={Sprout}
                  status={latestReading ? "online" : "offline"}
                  subtitle={latestReading?.grass_growth_index ? "Healthy" : "No data"}
                  compact
                />
                <StatusCard
                  title="Robot"
                  value={primaryRobot?.battery_level ?? "—"}
                  unit="%"
                  icon={Battery}
                  status={primaryRobot?.status === "active" ? "online" : "offline"}
                  subtitle={primaryRobot?.status || "Offline"}
                  compact
                />
              </>
            )}
          </div>
        </section>

        {/* Field Overview */}
        {fields && fields.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Your Fields
              </h2>
              <Link to="/fields" className="text-xs text-primary font-medium flex items-center gap-0.5">
                View all <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-4 px-4 scrollbar-none">
              {fields.slice(0, 4).map((field) => (
                <Link key={field.id} to={`/fields/${field.id}`} className="min-w-[140px]">
                  <div className="premium-card p-3.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/8 flex items-center justify-center mb-2">
                      <Map className="w-4 h-4 text-primary" />
                    </div>
                    <p className="text-sm font-semibold text-foreground truncate">{field.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {field.area_hectares ? `${field.area_hectares} ha` : "—"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Rover Data (if connected) */}
        {roverData && (
          <section>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rover Status</h2>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${roverData.rover.status === "active" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                {roverData.rover.status}
              </span>
            </div>
            <div className="premium-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-primary/8 flex items-center justify-center">
                  <Bot className="w-4.5 h-4.5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{roverData.rover.name}</p>
                  <p className="text-[10px] text-muted-foreground">{roverData.rover.current_task}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{roverData.rover.battery_level}%</p>
                  <p className="text-[10px] text-muted-foreground">Battery</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-muted/40 rounded-lg p-2 text-center">
                  <p className="text-xs font-bold text-foreground">{roverData.sensors.temperature}°C</p>
                  <p className="text-[9px] text-muted-foreground">Temp</p>
                </div>
                <div className="bg-muted/40 rounded-lg p-2 text-center">
                  <p className="text-xs font-bold text-foreground">{roverData.sensors.soil_moisture}%</p>
                  <p className="text-[9px] text-muted-foreground">Moisture</p>
                </div>
                <div className="bg-muted/40 rounded-lg p-2 text-center">
                  <p className="text-xs font-bold text-foreground">{roverData.sensors.humidity}%</p>
                  <p className="text-[9px] text-muted-foreground">Humidity</p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* AI Insights Quick Link */}
        {preferences.selectedCrops.length > 0 && (
          <Link to="/predictions">
            <div className="premium-card p-4 bg-primary/4 border-primary/15">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                  <Brain className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">AI Crop Predictions</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {preferences.selectedCrops.length} crops tracked • Tap for insights
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </div>
            </div>
          </Link>
        )}

        {/* Weather */}
        {/* <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
            Weather
          </h2>
          <FarmerWeatherWidget 
            location={preferences.locationName || null} 
            coords={preferences.location}
          />
        </section> */}
      </main>
      <BottomNav />
    </MobileLayout>
  );
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
}

export default Dashboard;