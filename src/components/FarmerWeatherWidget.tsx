import { CloudSun, RefreshCw, Bot, Droplets, Wind, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useWeatherData, useRefreshWeather } from "@/hooks/useWeatherData";

interface FarmerWeatherWidgetProps {
  location: string | null;
  coords?: { lat: number; lng: number } | null;
}

const FarmerWeatherWidget = ({ location, coords }: FarmerWeatherWidgetProps) => {
  const { data: weather, isLoading, error } = useWeatherData(location, coords);
  const refreshMutation = useRefreshWeather();

  const handleRefresh = () => {
    if (location) {
      refreshMutation.mutate({ location, coords });
    }
  };

  if (!location) {
    return (
      <div className="premium-card p-5 text-center">
        <CloudSun className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">
          Enable location in settings for weather insights
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="premium-card p-5 text-center">
        <p className="text-sm text-muted-foreground mb-3">
          Unable to load weather. Please try again.
        </p>
        <Button variant="outline" size="sm" onClick={handleRefresh} className="rounded-xl">
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Current weather card */}
      <div className="premium-card overflow-hidden">
        <div className="gradient-primary p-4 pb-5 text-primary-foreground relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium opacity-80 mb-0.5">{location}</p>
              <p className="text-3xl font-bold tracking-tight">
                {weather.currentTemp !== undefined ? `${Math.round(weather.currentTemp)}°` : "—"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
              onClick={handleRefresh}
              disabled={refreshMutation.isPending}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshMutation.isPending ? "animate-spin" : ""}`} />
            </Button>
          </div>
          
          {/* Mini weather stats */}
          {weather.currentHumidity !== undefined && (
            <div className="flex items-center gap-4 mt-3 text-xs opacity-80">
              <span className="flex items-center gap-1">
                <Droplets className="w-3 h-3" />
                {weather.currentHumidity}%
              </span>
              {weather.currentWindSpeed !== undefined && (
                <span className="flex items-center gap-1">
                  <Wind className="w-3 h-3" />
                  {Math.round(weather.currentWindSpeed)} km/h
                </span>
              )}
            </div>
          )}
        </div>
        
        {/* Weather prediction text */}
        <div className="p-4">
          <div className="flex items-center gap-1.5 mb-2">
            <CloudSun className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Outlook
            </span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">
            {weather.prediction?.message || "Weather information updating..."}
          </p>
        </div>
      </div>

      {/* Advisory card */}
      <div className="premium-card p-4 bg-accent/40 border-primary/10">
        <div className="flex items-center gap-1.5 mb-2">
          <Bot className="w-3.5 h-3.5 text-primary" />
          <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">
            FarmOS Advisor
          </span>
        </div>
        <p className="text-sm text-foreground leading-relaxed">
          {weather.advisory || "Analyzing conditions for your farm..."}
        </p>
      </div>
    </div>
  );
};

export default FarmerWeatherWidget;
