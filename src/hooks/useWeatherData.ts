import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { db, functions } from "@/integrations/firebase/client";
import {
  collection,
  query as fbQuery,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import { httpsCallable } from "firebase/functions";

export interface WeatherResponse {
  currentTemp?: number;
  currentHumidity?: number;
  currentWindSpeed?: number;
  prediction: {
    message: string;
    forecast: Array<{
      day: string;
      condition: string;
      tempHigh: number;
      tempLow: number;
      rainChance: number;
    }>;
  };
  advisory: string;
}

export function useWeatherData(
  location: string | null,
  coords?: { lat: number; lng: number } | null,
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // listen to changes in the Firestore `weather_data` collection
    const q = fbQuery(
      collection(db, "weather_data"),
      orderBy("updated_at", "desc"),
    );
    const unsubscribe = onSnapshot(q, () => {
      queryClient.invalidateQueries({ queryKey: ["weather-data"] });
    });
    return unsubscribe;
  }, [queryClient]);

  return useQuery({
    queryKey: ["weather-data", location, coords?.lat, coords?.lng],
    queryFn: async () => {
      if (!location) return null;

      const call = httpsCallable(functions, "weather-service");
      const response = await call({ location, coords });
      return response.data as WeatherResponse;
    },
    enabled: !!location,
    refetchInterval: 10 * 60 * 1000, // 10 minutes
    staleTime: 5 * 60 * 1000,
  });
}

export function useRefreshWeather() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      location,
      coords,
    }: {
      location: string;
      coords?: { lat: number; lng: number } | null;
    }) => {
      const call = httpsCallable(functions, "weather-service");
      const response = await call({ location, coords, forceRefresh: true });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["weather-data"] });
    },
  });
}
