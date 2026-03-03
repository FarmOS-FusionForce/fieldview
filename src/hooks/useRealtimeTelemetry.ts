import { useEffect, useState } from "react";
import { rtdb, auth } from "@/integrations/firebase/client";
import { ref, onValue, off } from "firebase/database";
import {
  rtdbPaths,
  TelemetryReading,
  timestampToISO,
} from "@/integrations/firebase/realtimeDb";

export interface TelemetryData {
  temperature?: number | null;
  humidity?: number | null;
  soil_moisture?: number | null;
  soil_ph?: number | null;
  wind_speed?: number | null;
  light_intensity?: number | null;
  timestamp: string;
  raw_timestamp?: number;
}

export interface RobotTelemetry {
  robot_id: string;
  latest_reading?: TelemetryData;
  readings: TelemetryData[];
}

/**
 * Subscribe to real-time telemetry data for a specific robot
 * Listens to: devices/{uid}/telemetry/{sensorId}
 */
export function useRealtimeTelemetry(robotId?: string) {
  const [data, setData] = useState<TelemetryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const user = auth.currentUser;

  useEffect(() => {
    if (!robotId || !user?.uid) {
      setLoading(false);
      return;
    }

    const telemetryRef = ref(
      rtdb,
      rtdbPaths.telemetrySensor(user.uid, robotId),
    );

    const unsubscribe = onValue(
      telemetryRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const rawData = snapshot.val() as Partial<TelemetryReading>;
          setData({
            temperature: rawData.temperature ?? null,
            humidity: rawData.humidity ?? null,
            soil_moisture: rawData.soil_moisture ?? null,
            soil_ph: rawData.soil_ph ?? null,
            wind_speed: rawData.wind_speed ?? null,
            light_intensity: rawData.light_intensity ?? null,
            timestamp: timestampToISO(rawData.timestamp),
            raw_timestamp: rawData.timestamp,
          });
        }
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      },
    );

    return () => off(telemetryRef);
  }, [robotId, user?.uid]);

  return { data, loading, error };
}

/**
 * Subscribe to all telemetry data for a device
 * Listens to: devices/{uid}/telemetry
 */
export function useRealtimeDeviceTelemetry() {
  const [telemetry, setTelemetry] = useState<Record<string, TelemetryData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const telemetryRef = ref(rtdb, rtdbPaths.telemetry(user.uid));

    const unsubscribe = onValue(
      telemetryRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const rawData = snapshot.val() as Record<
            string,
            Partial<TelemetryReading>
          >;
          const processed = Object.entries(rawData).reduce(
            (acc, [sensorId, reading]) => ({
              ...acc,
              [sensorId]: {
                temperature: reading.temperature ?? null,
                humidity: reading.humidity ?? null,
                soil_moisture: reading.soil_moisture ?? null,
                soil_ph: reading.soil_ph ?? null,
                wind_speed: reading.wind_speed ?? null,
                light_intensity: reading.light_intensity ?? null,
                timestamp: timestampToISO(reading.timestamp),
                raw_timestamp: reading.timestamp,
              },
            }),
            {} as Record<string, TelemetryData>,
          );
          setTelemetry(processed);
        }
        setLoading(false);
      },
      (err) => {
        setError(err as Error);
        setLoading(false);
      },
    );

    return () => off(telemetryRef);
  }, [user?.uid]);

  return { telemetry, loading, error };
}

/**
 * Subscribe to device online status
 * Listens to: devices/{uid}/status/online
 */
export function useDeviceOnlineStatus() {
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const statusRef = ref(rtdb, rtdbPaths.deviceOnline(user.uid));

    const unsubscribe = onValue(
      statusRef,
      (snapshot) => {
        setOnline(snapshot.val() === true);
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
    );

    return () => off(statusRef);
  }, [user?.uid]);

  return { online, loading };
}

/**
 * Subscribe to device last seen timestamp
 * Listens to: devices/{uid}/status/last_seen
 */
export function useDeviceLastSeen() {
  const [lastSeen, setLastSeen] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const statusRef = ref(rtdb, rtdbPaths.deviceLastSeen(user.uid));

    const unsubscribe = onValue(
      statusRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const timestamp = snapshot.val() as number;
          setLastSeen(new Date(timestamp));
        }
        setLoading(false);
      },
      () => {
        setLoading(false);
      },
    );

    return () => off(statusRef);
  }, [user?.uid]);

  return { lastSeen, loading };
}
