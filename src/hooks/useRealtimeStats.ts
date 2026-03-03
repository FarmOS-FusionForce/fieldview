import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '../integrations/firebase/firebaseConfig';
import { useAuth } from './useAuth'; // Your Firebase Auth hook

export const useRealtimeStats = (robotId: string) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!user) return;

    // Path matches your ESP32 push path: devices/{uid}/robots/{robotId}
    const statsRef = ref(db, `devices/${user.uid}/robots/${robotId}`);
    
    const unsubscribe = onValue(statsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setStats(data);
      }
    });

    return () => unsubscribe();
  }, [user, robotId]);

  return stats;
};