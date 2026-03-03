import { useState, useEffect } from "react";
import { ref, onValue, get } from "firebase/database";
import { db } from "../integrations/firebase/firebaseConfig";
import { useAuth } from "./useAuth";

// Hook for Telemetry Data
export function useTelemetryData() {
  const { user } = useAuth();
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setTelemetry(null);
      setLoading(false);
      return;
    }

    const telemetryRef = ref(db, `devices/${user.uid}/telemetry`);
    const unsubscribe = onValue(telemetryRef, (snapshot) => {
      setTelemetry(snapshot.val());
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { telemetry, loading };
}

// Hook for Robot Status Data
export function useRobotData(robotId: string) {
  const { user } = useAuth();
  const [robotData, setRobotData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !robotId) {
      setRobotData(null);
      setLoading(false);
      return;
    }

    const robotRef = ref(db, `devices/${user.uid}/robots/${robotId}`);
    const unsubscribe = onValue(robotRef, (snapshot) => {
      setRobotData(snapshot.val());
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, robotId]);

  return { robotData, loading };
}

// Hook for General System Status
export function useSystemStatus() {
  const { user } = useAuth();
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setStatus(null);
      setLoading(false);
      return;
    }

    const statusRef = ref(db, `devices/${user.uid}/status`);
    const unsubscribe = onValue(statusRef, (snapshot) => {
      setStatus(snapshot.val());
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return { status, loading };
}

// Utility function for one-off reads if needed (replaces supabase.from().select())
export async function fetchDeviceDataOnce(uid: string, path: string) {
  const dataRef = ref(db, `devices/${uid}/${path}`);
  const snapshot = await get(dataRef);
  return snapshot.exists() ? snapshot.val() : null;
}
