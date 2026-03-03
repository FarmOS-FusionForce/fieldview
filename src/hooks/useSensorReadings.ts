import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { db } from "@/integrations/firebase/client";
import {
  collection,
  query as fbQuery,
  where,
  orderBy,
  limit as fbLimit,
  getDocs,
  onSnapshot,
} from "firebase/firestore";

export interface SensorReading {
  id: string;
  robot_id: string;
  field_id: string | null;
  zone_id: string | null;
  temperature: number | null;
  soil_moisture: number | null;
  humidity: number | null;
  grass_growth_index: number | null;
  wind_speed: number | null;
  gps_latitude: number | null;
  gps_longitude: number | null;
  recorded_at: string;
  created_at: string;
}

export function useSensorReadings(
  robotId?: string,
  fieldId?: string,
  options?: {
    limit?: number;
    startDate?: Date;
    endDate?: Date;
  },
) {
  const limit = options?.limit ?? 100;

  return useQuery({
    queryKey: [
      "sensor_readings",
      robotId,
      fieldId,
      limit,
      options?.startDate,
      options?.endDate,
    ],
    queryFn: async () => {
      let q = fbQuery(
        collection(db, "sensor_readings"),
        orderBy("recorded_at", "desc"),
        fbLimit(limit),
      );
      if (robotId) {
        q = fbQuery(q, where("robot_id", "==", robotId));
      }
      if (fieldId) {
        q = fbQuery(q, where("field_id", "==", fieldId));
      }
      if (options?.startDate) {
        q = fbQuery(
          q,
          where("recorded_at", ">=", options.startDate.toISOString()),
        );
      }
      if (options?.endDate) {
        q = fbQuery(
          q,
          where("recorded_at", "<=", options.endDate.toISOString()),
        );
      }
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as SensorReading[];
    },
  });
}

export function useLatestReadings(robotId?: string) {
  return useQuery({
    queryKey: ["latest_readings", robotId],
    queryFn: async () => {
      let q = fbQuery(
        collection(db, "sensor_readings"),
        orderBy("recorded_at", "desc"),
        fbLimit(1),
      );
      if (robotId) {
        q = fbQuery(q, where("robot_id", "==", robotId));
      }
      const snap = await getDocs(q);
      return snap.docs[0]?.data() as SensorReading | undefined;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useRealtimeSensorReadings(robotId?: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    let q = fbQuery(
      collection(db, "sensor_readings"),
      orderBy("recorded_at", "desc"),
    );
    if (robotId) {
      q = fbQuery(q, where("robot_id", "==", robotId));
    }
    const unsubscribe = onSnapshot(q, () => {
      queryClient.invalidateQueries({ queryKey: ["sensor_readings"] });
      queryClient.invalidateQueries({ queryKey: ["latest_readings"] });
    });
    return unsubscribe;
  }, [robotId, queryClient]);
}

export function useHistoricalReadings(robotId?: string, days: number = 7) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return useQuery({
    queryKey: ["historical_readings", robotId, days],
    queryFn: async () => {
      let q = fbQuery(
        collection(db, "sensor_readings"),
        where("recorded_at", ">=", startDate.toISOString()),
        orderBy("recorded_at", "asc"),
      );
      if (robotId) {
        q = fbQuery(q, where("robot_id", "==", robotId));
      }
      const snap = await getDocs(q);
      return snap.docs.map((d) => ({ id: d.id, ...d.data() })) as SensorReading[];
    },
  });
}
