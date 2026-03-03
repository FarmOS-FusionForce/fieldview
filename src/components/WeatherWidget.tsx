import { Cloud, Sun, CloudRain, Wind, Droplets } from "lucide-react";

interface WeatherData {
  condition: "sunny" | "cloudy" | "rainy" | "partly-cloudy";
  temperature: number;
  humidity: number;
  wind: number;
  forecast: { day: string; temp: number; condition: "sunny" | "cloudy" | "rainy" }[];
}

interface WeatherWidgetProps {
  data: WeatherData;
}

const WeatherWidget = ({ data }: WeatherWidgetProps) => {
  const getWeatherIcon = (condition: string, size: string = "w-8 h-8") => {
    const iconClass = `${size} text-foreground`;
    switch (condition) {
      case "sunny": return <Sun className={iconClass} />;
      case "rainy": return <CloudRain className={iconClass} />;
      case "cloudy": return <Cloud className={iconClass} />;
      default: return <Cloud className={iconClass} />;
    }
  };

  return (
    <div className="data-card animate-fade-in">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="data-label mb-2">Current Weather</p>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-semibold text-foreground tracking-tight">
              {data.temperature}
            </span>
            <span className="text-2xl text-muted-foreground">°C</span>
          </div>
        </div>
        {getWeatherIcon(data.condition)}
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Droplets className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Humidity</span>
          <span className="text-sm font-medium text-foreground ml-auto">{data.humidity}%</span>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Wind</span>
          <span className="text-sm font-medium text-foreground ml-auto">{data.wind} km/h</span>
        </div>
      </div>
      
      <div className="border-t border-border pt-4">
        <p className="text-xs text-muted-foreground mb-3">3-Day Forecast</p>
        <div className="flex justify-between">
          {data.forecast.map((day) => (
            <div key={day.day} className="text-center">
              <p className="text-xs text-muted-foreground mb-2">{day.day}</p>
              {getWeatherIcon(day.condition, "w-5 h-5")}
              <p className="text-sm font-medium text-foreground mt-2">{day.temp}°</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
