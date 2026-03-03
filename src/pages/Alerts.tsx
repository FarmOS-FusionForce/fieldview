import { useState, useEffect } from "react";
import MobileLayout from "@/components/MobileLayout";
import MobileHeader from "@/components/MobileHeader";
import BottomNav from "@/components/BottomNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Bell,
  CloudRain,
  AlertTriangle,
  Bot,
  Leaf,
  CheckCircle2,
  X,
  Thermometer,
  Droplets,
} from "lucide-react";
import { db } from "@/integrations/firebase/client";
import { collection, query as fbQuery, orderBy, limit as fbLimit, getDocs } from "firebase/firestore";
import { useFarmPreferences } from "@/hooks/useLocalStorage";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useWeatherData } from "@/hooks/useWeatherData";

interface Alert {
  id: string;
  type: "weather" | "robot" | "disease" | "prediction" | "irrigation";
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  timestamp: string;
  read: boolean;
}

const Alerts = () => {
  const [preferences] = useFarmPreferences();
  const [alerts, setAlerts] = useLocalStorage<Alert[]>("farmOS-alerts", []);
  const [isLoading, setIsLoading] = useState(true);
  const { data: weather } = useWeatherData(
    preferences.locationName || null,
    preferences.location,
  );

  useEffect(() => {
    fetchAlerts();
  }, []);

  // Generate weather-based alerts when weather data updates
  useEffect(() => {
    if (!weather) return;

    const newWeatherAlerts: Alert[] = [];
    const now = new Date().toISOString();

    // Rain today
    const todayForecast = weather.prediction?.forecast?.[0];
    if (todayForecast && todayForecast.rainChance > 60) {
      newWeatherAlerts.push({
        id: `weather-rain-today-${new Date().toDateString()}`,
        type: "irrigation",
        title: "Rain detected today",
        message: "Rain detected today — irrigation not required.",
        severity: "info",
        timestamp: now,
        read: false,
      });
    }

    // Rain tomorrow
    const tomorrowForecast = weather.prediction?.forecast?.[1];
    if (tomorrowForecast && tomorrowForecast.rainChance > 50) {
      newWeatherAlerts.push({
        id: `weather-rain-tomorrow-${new Date().toDateString()}`,
        type: "irrigation",
        title: "Rain expected tomorrow",
        message: "Rain expected tomorrow — consider adjusting irrigation.",
        severity: "info",
        timestamp: now,
        read: false,
      });
    }

    // Heat stress
    if (weather.currentTemp && weather.currentTemp > 35) {
      newWeatherAlerts.push({
        id: `weather-heat-${new Date().toDateString()}`,
        type: "weather",
        title: "High temperature stress",
        message: "High temperature stress risk — monitor crop closely.",
        severity: "warning",
        timestamp: now,
        read: false,
      });
    }

    // Frost risk
    if (weather.currentTemp && weather.currentTemp < 5) {
      newWeatherAlerts.push({
        id: `weather-frost-${new Date().toDateString()}`,
        type: "weather",
        title: "Frost risk",
        message:
          "Low temperatures detected — protect sensitive crops from frost.",
        severity: "warning",
        timestamp: now,
        read: false,
      });
    }

    // Merge without duplicates
    const filteredNew = newWeatherAlerts.filter(
      (na) => !alerts.some((a) => a.id === na.id),
    );
    if (filteredNew.length > 0) {
      setAlerts((prev) => [...filteredNew, ...prev].slice(0, 30));
    }
  }, [weather]);

  const fetchAlerts = async () => {
    setIsLoading(true);
    try {
      const q = fbQuery(
        collection(db, "sensor_readings"),
        orderBy("recorded_at", "desc"),
        fbLimit(5),
      );
      const snap = await getDocs(q);
      const robotData = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const robotAlerts: Alert[] = (robotData || [])
        .slice(0, 2)
        .map((reading) => {
          let severity: "info" | "warning" | "critical" = "info";
          let message = `Sensor reading: Temp ${reading.temperature ?? "—"}°C, Moisture ${reading.soil_moisture ?? "—"}%`;

          if (reading.temperature && reading.temperature > 35) {
            severity = "warning";
            message = `High temperature detected (${reading.temperature}°C) — check crop conditions.`;
          }
          if (reading.soil_moisture !== null && reading.soil_moisture < 20) {
            severity = "warning";
            message = `Low soil moisture (${reading.soil_moisture}%) — consider irrigation.`;
          }

          return {
            id: `robot-${reading.id}`,
            type: "robot" as const,
            title: "Robot Status Update",
            message,
            severity,
            timestamp: reading.recorded_at,
            read: false,
          };
        });

      const newAlerts = robotAlerts.filter(
        (newAlert) => !alerts.some((a) => a.id === newAlert.id),
      );

      if (newAlerts.length > 0) {
        setAlerts([...newAlerts, ...alerts].slice(0, 30));
      }
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    }
    setIsLoading(false);
  };

  const markAsRead = (id: string) => {
    setAlerts(alerts.map((a) => (a.id === id ? { ...a, read: true } : a)));
  };

  const dismissAlert = (id: string) => {
    setAlerts(alerts.filter((a) => a.id !== id));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "weather":
        return <CloudRain className="w-4 h-4" />;
      case "robot":
        return <Bot className="w-4 h-4" />;
      case "disease":
        return <AlertTriangle className="w-4 h-4" />;
      case "prediction":
        return <Leaf className="w-4 h-4" />;
      case "irrigation":
        return <Droplets className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-destructive text-destructive-foreground";
      case "warning":
        return "bg-warning text-warning-foreground";
      default:
        return "bg-primary/10 text-primary";
    }
  };

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <MobileLayout>
      <MobileHeader />
      <main className="px-4 pt-4 pb-24 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center relative">
              <Bell className="w-5 h-5 text-primary" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] flex items-center justify-center font-bold px-1">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">
                Alerts
              </h1>
              <p className="text-xs text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
              </p>
            </div>
          </div>
          {alerts.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs rounded-xl"
              onClick={() =>
                setAlerts(alerts.map((a) => ({ ...a, read: true })))
              }
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Read all
            </Button>
          )}
        </div>

        {/* Alerts List */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-2xl" />
            ))}
          </div>
        ) : alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <Bell className="w-7 h-7 text-muted-foreground" />
            </div>
            <h2 className="text-base font-bold mb-1">No Alerts</h2>
            <p className="text-sm text-muted-foreground">
              You're all caught up!
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`premium-card p-3.5 transition-all cursor-pointer ${
                  !alert.read ? "border-primary/30 bg-primary/3" : ""
                }`}
                onClick={() => markAsRead(alert.id)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${getSeverityStyles(alert.severity)}`}
                  >
                    {getAlertIcon(alert.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className="text-sm font-semibold text-foreground">
                        {alert.title}
                      </h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 -mr-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissAlert(alert.id);
                        }}
                      >
                        <X className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {alert.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge
                        variant="secondary"
                        className="text-[9px] rounded-md px-1.5 py-0"
                      >
                        {alert.type}
                      </Badge>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </MobileLayout>
  );
};

export default Alerts;
