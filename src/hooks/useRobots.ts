import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  collection,
  query,
  orderBy,
  getDocs,
  getDoc,
  doc,
  addDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db, rtdb, auth } from "@/integrations/firebase/client";
import {
  ref,
  onValue,
  off,
  get,
  serverTimestamp as rtdbTimestamp,
} from "firebase/database";
import {
  rtdbPaths,
  RobotRealtimeStatus,
  timestampToISO,
} from "@/integrations/firebase/realtimeDb";

export interface Robot {
  id: string;
  user_id: string;
  name: string;
  model: string | null;
  status: "active" | "idle" | "offline" | "maintenance";
  battery_level: number;
  current_task: string | null;
  current_field_id: string | null;
  current_zone_id: string | null;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
  // Realtime data from RTDB
  firmware_version?: string;
  last_heartbeat?: number;
}

/**
 * Get all robots from Firestore
 */
export function useRobots() {
  return useQuery({
    queryKey: ["robots"],
    queryFn: async () => {
      const q = query(collection(db, "robots"), orderBy("created_at", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Robot[];
    },
  });
}

/**
 * Get a single robot from Firestore + realtime status from RTDB
 */
export function useRobot(robotId: string | undefined) {
  const [rtdbStatus, setRtdbStatus] = useState<RobotRealtimeStatus | null>(
    null,
  );
  const user = auth.currentUser;

  useEffect(() => {
    if (!robotId || !user?.uid) return;

    const statusRef = ref(rtdb, rtdbPaths.robotStatus(user.uid, robotId));
    const unsubscribe = onValue(statusRef, (snapshot) => {
      if (snapshot.exists()) {
        setRtdbStatus(snapshot.val() as RobotRealtimeStatus);
      }
    });

    return () => {
      off(statusRef);
      unsubscribe();
    };
  }, [robotId, user?.uid]);

  return useQuery({
    queryKey: ["robot", robotId],
    queryFn: async () => {
      if (!robotId) return null;

      const docRef = doc(db, "robots", robotId);
      const snapshot = await getDoc(docRef);
      if (!snapshot.exists()) return null;

      return {
        id: snapshot.id,
        ...snapshot.data(),
        // Merge with realtime status if available
        ...(rtdbStatus && {
          status: rtdbStatus.status,
          battery_level: rtdbStatus.battery_level,
          firmware_version: rtdbStatus.firmware_version,
          last_heartbeat: rtdbStatus.last_heartbeat,
          last_seen_at: timestampToISO(rtdbStatus.last_heartbeat),
        }),
      } as Robot;
    },
    enabled: !!robotId,
  });
}

/**
 * Real-time subscription to robot status from RTDB
 */
export function useRealtimeRobotStatus(robotId: string | undefined) {
  const [robotStatus, setRobotStatus] = useState<RobotRealtimeStatus | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!robotId || !user?.uid) {
      setLoading(false);
      return;
    }

    const statusRef = ref(rtdb, rtdbPaths.robotStatus(user.uid, robotId));
    const unsubscribe = onValue(
      statusRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setRobotStatus(snapshot.val() as RobotRealtimeStatus);
        }
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching robot status:", error);
        setLoading(false);
      },
    );

    return () => off(statusRef);
  }, [robotId, user?.uid]);

  return { robotStatus, loading };
}

export function useCreateRobot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (robot: { name: string; model?: string }) => {
      const docRef = await addDoc(collection(db, "robots"), {
        user_id: "anonymous",
        name: robot.name,
        model: robot.model ?? null,
        status: "idle",
        battery_level: 100,
        current_task: null,
        current_field_id: null,
        current_zone_id: null,
        last_seen_at: null,
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      });

      // Also initialize RTDB entry for this robot
      if (auth.currentUser?.uid) {
        const statusRef = ref(
          rtdb,
          rtdbPaths.robotStatus(auth.currentUser.uid, docRef.id),
        );
        // Note: Use set() to initialize realtime data if needed
      }

      return {
        id: docRef.id,
        user_id: "anonymous",
        name: robot.name,
        model: robot.model ?? null,
        status: "idle" as const,
        battery_level: 100,
        current_task: null,
        current_field_id: null,
        current_zone_id: null,
        last_seen_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Robot;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["robots"] });
    },
  });
}

export function useUpdateRobot() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Robot> & { id: string }) => {
      const docRef = doc(db, "robots", id);
      await updateDoc(docRef, {
        ...updates,
        updated_at: serverTimestamp(),
      });

      const snapshot = await getDoc(docRef);
      return {
        id: snapshot.id,
        ...snapshot.data(),
      } as Robot;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["robots"] });
      queryClient.invalidateQueries({ queryKey: ["robot", data.id] });
    },
  });
}
