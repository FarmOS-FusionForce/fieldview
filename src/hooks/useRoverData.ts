import { useQuery } from "@tanstack/react-query";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { functions } from "@/integrations/firebase/client";
import { httpsCallable } from "firebase/functions";

export interface RoverData {
  rover: {
    id: string;
    name: string;
    status: string;
    battery_level: number;
    current_task: string;
    last_ping: string;
    uptime_hours: number;
    firmware_version: string;
  };
  sensors: {
    temperature: number;
    soil_moisture: number;
    humidity: number;
    light_intensity: number;
    soil_ph: number;
    wind_speed: number;
  };
  gps: { latitude: number; longitude: number };
  alerts: Array<{ type: string; severity: string; message: string }>;
  timestamp: string;
}

export function useRoverData() {
  const [apiKey] = useLocalStorage<string>("farmOS-rover-api-key", "");

  return useQuery({
    queryKey: ["rover-data", apiKey],
    queryFn: async () => {
      if (!apiKey) return null;
      const call = httpsCallable(functions, "rover-data");
      const res = await call({ apiKey, action: "fetch" });
      if (res.data?.error) throw new Error(res.data.error);
      return res.data as RoverData;
    },
    enabled: !!apiKey,
    refetchInterval: 30000, // 30s live updates
    staleTime: 15000,
  });
}

export function useValidateRoverKey() {
  return async (
    apiKey: string,
  ): Promise<{ valid: boolean; message?: string; roverName?: string }> => {
    const call = httpsCallable(functions, "rover-data");
    try {
      const res = await call({ apiKey, action: "validate" });
      return res.data;
    } catch {
      return { valid: false, message: "Connection failed" };
    }
  };
}
