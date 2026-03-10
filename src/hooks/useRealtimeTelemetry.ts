import { useEffect, useState } from "react";
import { rtdb, auth } from "@/integrations/firebase/client";
import { ref, onValue } from "firebase/database";

export interface RoverData {
  id: string;
  name: string;
  status: string;
  battery_level: number;
  last_ping: number;
  uptime_hours: number;
  firmware_version: string;

  sensors: {
    temperature?: number;
    humidity?: number;
    soil_moisture?: number;
    soil_ph?: number;
    wind_speed?: number;
    light_intensity?: number;
  };

  gps: {
    latitude?: number;
    longitude?: number;
  };

  latest_alert?: {
    type: string;
    severity: string;
    message: string;
    timestamp: number;
  } | null;

  timestamp: number;
}

export function useRealtimeRover(roverId?: string) {
  const [data, setData] = useState<RoverData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const user = auth.currentUser;

  useEffect(() => {
    if (!roverId || !user?.uid) {
      setLoading(false);
      return;
    }

    const roverRef = ref(
      rtdb,
      `devices/${user.uid}/rovers/${roverId}`
    );

    const unsubscribe = onValue(
      roverRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setData(snapshot.val());
        }
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [roverId, user?.uid]);

  return { data, loading, error };
}