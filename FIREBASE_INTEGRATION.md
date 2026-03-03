# Firebase Integration - Quick Reference

## File Structure

```
src/integrations/firebase/
├── client.ts                 # Main Firebase app initialization & service exports
├── realtimeDb.ts            # RTDB types, paths, and utility functions
```

## Service Exports

### From `@/integrations/firebase/client.ts`

```typescript
import { auth, db, rtdb, functions } from "@/integrations/firebase/client";

// auth      - Firebase Authentication instance
// db        - Firestore (for structured data like fields, crops, robots metadata)
// rtdb      - Realtime Database (for telemetry, status, real-time updates)
// functions - Cloud Functions (for backend logic, weather, AI chat, etc.)
```

## Database Paths Reference

### From `@/integrations/firebase/realtimeDb.ts`

```typescript
import { rtdbPaths } from "@/integrations/firebase/realtimeDb";

// Robot status paths
rtdbPaths.robotStatus(uid, robotId); // devices/{uid}/robots/{robotId}/status
rtdbPaths.robotBattery(uid, robotId); // devices/{uid}/robots/{robotId}/battery_level
rtdbPaths.robotFirmware(uid, robotId); // devices/{uid}/robots/{robotId}/firmware_version
rtdbPaths.robotHeartbeat(uid, robotId); // devices/{uid}/robots/{robotId}/last_heartbeat

// Telemetry paths
rtdbPaths.telemetry(uid); // devices/{uid}/telemetry
rtdbPaths.telemetrySensor(uid, sensorId); // devices/{uid}/telemetry/{sensorId}

// Device status paths
rtdbPaths.deviceStatus(uid); // devices/{uid}/status
rtdbPaths.deviceOnline(uid); // devices/{uid}/status/online
rtdbPaths.deviceLastSeen(uid); // devices/{uid}/status/last_seen
```

## Hook Usage Examples

### Real-time Robot Status

```typescript
import { useRealtimeRobotStatus } from "@/hooks/useRobots";

function RobotCard({ robotId }: { robotId: string }) {
  const { robotStatus, loading } = useRealtimeRobotStatus(robotId);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      Status: {robotStatus?.status}
      Battery: {robotStatus?.battery_level}%
    </div>
  );
}
```

### Real-time Telemetry

```typescript
import { useRealtimeTelemetry } from "@/hooks/useRealtimeTelemetry";

function TelemetryDisplay({ robotId }: { robotId: string }) {
  const { data, loading, error } = useRealtimeTelemetry(robotId);

  if (error) return <div>Error: {error.message}</div>;
  if (loading) return <div>Connecting...</div>;

  return (
    <div>
      Temperature: {data?.temperature}°C
      Humidity: {data?.humidity}%
      Soil Moisture: {data?.soil_moisture}%
    </div>
  );
}
```

### Device Online Status

```typescript
import { useDeviceOnlineStatus } from "@/hooks/useRealtimeTelemetry";

function SystemStatus() {
  const { online, loading } = useDeviceOnlineStatus();

  return (
    <div className={online ? "text-green-500" : "text-gray-500"}>
      {online ? "Device Online" : "Device Offline"}
    </div>
  );
}
```

### Firestore Queries

```typescript
import { useFields, useZones } from "@/hooks/useFields";

function FieldList() {
  const { data: fields, isLoading } = useFields();

  return fields?.map(field => (
    <div key={field.id}>{field.name}</div>
  ));
}
```

### Firebase Cloud Functions

```typescript
import { functions } from "@/integrations/firebase/client";
import { httpsCallable } from "firebase/functions";

async function getWeatherForecast(location: string) {
  const weatherService = httpsCallable(functions, "weather-service");
  const response = await weatherService({ location });
  return response.data;
}
```

## Team Tasks

### For Backend/DevOps

- [ ] Deploy Firestore rules (security rules for user data isolation)
- [ ] Deploy Realtime Database rules (security rules for `/devices/{uid}/*` paths)
- [ ] Deploy Cloud Functions (crop-chat, weather-service, etc.)
- [ ] Configure Firebase Auth (Email/Password, Phone, Google, etc.)
- [ ] Set up Firebase emulator for local development

### For ESP32 Developers

Push sensor data to these RTDB paths:

```json
POST devices/{uid}/telemetry/{sensorId}
{
  "temperature": 25.5,
  "humidity": 65,
  "soil_moisture": 45,
  "soil_ph": 6.8,
  "wind_speed": 3.2,
  "light_intensity": 8000,
  "timestamp": 1709222400000
}

POST devices/{uid}/robots/{robotId}/status
{
  "status": "active",
  "battery_level": 85,
  "firmware_version": "v2.1.0",
  "last_heartbeat": 1709222400000
}

PUT devices/{uid}/status
{
  "online": true,
  "last_seen": 1709222400000
}
```

### For Frontend Developers

- Use `useRealtimeTelemetry()` for live sensor updates
- Use `useRealtimeRobotStatus()` for robot status
- Use `useDeviceOnlineStatus()` for device connectivity
- Use React Query hooks for Firestore data (auto-caching)
- All UI components remain unchanged

## Common Patterns

### Combining Realtime + Firestore Data

```typescript
// Get robot metadata from Firestore + live status from RTDB
const { data: robotMetadata } = useRobot(robotId);
const { robotStatus } = useRealtimeRobotStatus(robotId);

const complete = {
  ...robotMetadata,
  ...robotStatus,
};
```

### Optimizing Real-time Subscriptions

```typescript
// Auto cleanup on unmount
import { useEffect, useRef } from "react";
import { ref, onValue, off } from "firebase/database";

useEffect(() => {
  const dbRef = ref(rtdb, path);
  const unsubscribe = onValue(dbRef, (snapshot) => {
    // handle update
  });

  return () => off(dbRef); // cleanup
}, [path]);
```

### Error Handling

```typescript
const { data, loading, error } = useRealtimeTelemetry(robotId);

if (error?.code === "PERMISSION_DENIED") {
  return <div>You don't have access to this device</div>;
}

if (error?.code === "UNAVAILABLE") {
  return <div>Device connection lost</div>;
}
```

## Troubleshooting

| Issue                          | Solution                                                           |
| ------------------------------ | ------------------------------------------------------------------ |
| Real-time data not updating    | Check Firebase Realtime DB security rules allow read on `/devices` |
| Firestore queries return empty | Verify collection names and document IDs match exactly             |
| Functions returning 403        | Check Cloud Functions authentication rules in Firebase console     |
| Slow updates                   | Use specific paths instead of broad listeners, add indexes         |
| Memory leaks                   | Ensure `off()` is called in cleanup or unsubscribe returned        |

## Performance Tips

1. **Subscribe to specific paths**, not root

   ```typescript
   // ✅ Good: specific sensor
   ref(rtdb, `devices/${uid}/telemetry/${sensorId}`);

   // ❌ Avoid: entire telemetry
   ref(rtdb, `devices/${uid}/telemetry`);
   ```

2. **Use Firestore for historical data** (sensor_readings)
   - Indexed queries, better for analytics
3. **Use Realtime DB for live streams** (telemetry, status)
   - Optimized for high-frequency updates

4. **Cleanup listeners in useEffect cleanup**

   ```typescript
   return () => off(dbRef);
   ```

5. **Batch updates** to reduce bandwidth
   ```typescript
   // Write once instead of multiple updates
   await update(ref, { ...many_fields });
   ```

## References

- [Firebase Realtime Database Docs](https://firebase.google.com/docs/database)
- [Cloud Firestore Docs](https://firebase.google.com/docs/firestore)
- [Firebase Functions Docs](https://firebase.google.com/docs/functions)
- [Firebase Auth Docs](https://firebase.google.com/docs/auth)
