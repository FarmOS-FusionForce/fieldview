import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  return [storedValue, setValue] as const;
}

export interface CropDetails {
  cropId: string;
  irrigationFrequency?: "daily" | "every-2-3-days" | "weekly" | "custom";
  irrigationCustom?: string;
  irrigationMethod?: "drip" | "sprinkler" | "flood" | "other";
  irrigationMethodCustom?: string;
  cropStage?: "seeded" | "vegetative" | "flowering" | "fruiting" | "not-sure";
  plantingDate?: string; // ISO date string
  fieldArea?: number;
  fieldAreaUnit?: "acres" | "hectares";
}

export interface FarmPreferences {
  onboardingCompleted: boolean;
  selectedCrops: string[];
  cropDetails: Record<string, CropDetails>;
  notificationsEnabled: boolean;
  locationEnabled: boolean;
  location: { lat: number; lng: number } | null;
  locationName: string | null;
}

const defaultPreferences: FarmPreferences = {
  onboardingCompleted: false,
  selectedCrops: [],
  cropDetails: {},
  notificationsEnabled: false,
  locationEnabled: false,
  location: null,
  locationName: null,
};

export function useFarmPreferences() {
  return useLocalStorage<FarmPreferences>("farmOS-preferences", defaultPreferences);
}
