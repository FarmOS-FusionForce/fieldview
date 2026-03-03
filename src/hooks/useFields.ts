import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  collection,
  query,
  orderBy,
  where,
  getDocs,
  getDoc,
  doc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/integrations/firebase/client";

export interface Field {
  id: string;
  user_id: string;
  name: string;
  area_hectares: number | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface Zone {
  id: string;
  field_id: string;
  name: string;
  area_hectares: number | null;
  grass_type: string | null;
  created_at: string;
  updated_at: string;
}

export function useFields() {
  return useQuery({
    queryKey: ["fields"],
    queryFn: async () => {
      const q = query(collection(db, "fields"), orderBy("created_at", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Field[];
    },
  });
}

export function useField(fieldId: string | undefined) {
  return useQuery({
    queryKey: ["field", fieldId],
    queryFn: async () => {
      if (!fieldId) return null;

      const docRef = doc(db, "fields", fieldId);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return null;

      return {
        id: snapshot.id,
        ...snapshot.data(),
      } as Field;
    },
    enabled: !!fieldId,
  });
}

export function useZones(fieldId: string | undefined) {
  return useQuery({
    queryKey: ["zones", fieldId],
    queryFn: async () => {
      if (!fieldId) return [];

      const q = query(
        collection(db, "zones"),
        where("field_id", "==", fieldId),
        orderBy("name", "asc"),
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Zone[];
    },
    enabled: !!fieldId,
  });
}

export function useCreateField() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (field: {
      name: string;
      area_hectares?: number;
      location?: string;
    }) => {
      const docRef = await addDoc(collection(db, "fields"), {
        user_id: "anonymous",
        name: field.name,
        area_hectares: field.area_hectares ?? null,
        location: field.location ?? null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      return {
        id: docRef.id,
        user_id: "anonymous",
        name: field.name,
        area_hectares: field.area_hectares ?? null,
        location: field.location ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Field;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fields"] });
    },
  });
}

export function useCreateZone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (zone: {
      field_id: string;
      name: string;
      area_hectares?: number;
      grass_type?: string;
    }) => {
      const docRef = await addDoc(collection(db, "zones"), {
        field_id: zone.field_id,
        name: zone.name,
        area_hectares: zone.area_hectares ?? null,
        grass_type: zone.grass_type ?? null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      return {
        id: docRef.id,
        field_id: zone.field_id,
        name: zone.name,
        area_hectares: zone.area_hectares ?? null,
        grass_type: zone.grass_type ?? null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Zone;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["zones", variables.field_id],
      });
    },
  });
}
