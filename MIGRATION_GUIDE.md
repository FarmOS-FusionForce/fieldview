# Supabase to Firebase Migration Guide

## Migration Complete ✓

This project has been successfully migrated from Supabase to Firebase with the following architecture:

### Database Structure

**Firestore (Structured Data)**

- `fields/` - Farm fields information
- `zones/` - Field zones information
- `crops/` - Crop data
- `robots/` - Robot metadata (name, model, user ownership)
- `sensor_readings/` - Historical sensor data
- `file_uploads/` - Uploaded files metadata
- `weather_data/` - Weather information cache

**Firebase Realtime Database (Real-time Telemetry)**

```
devices/{uid}/
  ├── robots/{robotId}/
  │   ├── status: "active"|"idle"|"offline"|"maintenance"
  │   ├── battery_level: number
  │   ├── firmware_version: string
  │   └── last_heartbeat: timestamp
  ├── telemetry/
  │   ├── {sensorId}/
  │   │   ├── temperature: number
  │   │   ├── humidity: number
  │   │   ├── soil_moisture: number
  │   │   ├── soil_ph: number
  │   │   ├── wind_speed: number
  │   │   ├── light_intensity: number
  │   │   └── timestamp: number
  └── status/
      ├── online: boolean
      └── last_seen: timestamp
```

### Environment Variables Required

Update your `.env` file with these Firebase configuration variables:

```env
# Firebase Config (Required)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.firebaseio.com

# Remove these Supabase variables:
# DELETE: VITE_SUPABASE_PROJECT_ID
# DELETE: VITE_SUPABASE_PUBLISHABLE_KEY
# DELETE: VITE_SUPABASE_URL
```

### Updated Hooks

#### Real-time Data Hooks

**`useRealtimeTelemetry(robotId?)`** ← NEW

- Subscribe to real-time sensor data from RTDB
- Returns: `{ data, loading, error }`
- Path: `devices/{uid}/telemetry/{sensorId}`

**`useRealtimeDeviceTelemetry()`** ← NEW

- Subscribe to all device telemetry
- Returns: `{ telemetry, loading, error }`
- Path: `devices/{uid}/telemetry`

**`useRealtimeRobotStatus(robotId?)`** ← NEW

- Subscribe to live robot status
- Returns: `{ robotStatus, loading }`
- Path: `devices/{uid}/robots/{robotId}/status`

**`useDeviceOnlineStatus()`** ← NEW

- Check if device is online
- Returns: `{ online, loading }`
- Path: `devices/{uid}/status/online`

**`useDeviceLastSeen()`** ← NEW

- Get device last activity timestamp
- Returns: `{ lastSeen, loading }`
- Path: `devices/{uid}/status/last_seen`

#### Migrated Hooks

**`useRobots()`** - Get all robots from Firestore
**`useRobot(robotId)`** - Get single robot + real-time status from RTDB
**`useRealtimeRobotStatus(robotId)`** - Real-time robot status listener
**`useCreateRobot()`** - Create new robot entry
**`useUpdateRobot()`** - Update robot metadata

**`useFields()`**, **`useField()`**, **`useZones()`**, **`useCreateField()`** - All using Firestore

**`useSensorReadings()`**, **`useLatestReadings()`** - Firestore-based sensor history

**`useWeatherData()`**, **`useRefreshWeather()`** - Firebase Functions + Firestore

**`useCrops()`** - Firestore with real-time listener

**`useFileUploads()`**, **`useUploadFile()`**, **`useDeleteFile()`** - Firestore

### Removed

- ❌ `src/integrations/supabase/` - Entire directory removed
- ❌ `@supabase/supabase-js` - NPM dependency removed from package.json
- ❌ All Supabase function calls replaced with Firebase Functions (`httpsCallable`)
- ❌ All environment variables for Supabase removed

### Components Updated

**`CropChatBot.tsx`**

- Now uses Firebase Functions via `httpsCallable(functions, "crop-chat")`
- Removed HTTP-based Supabase function calls
- Simplified response handling (no streaming)

### Firebase Services Used

1. **Authentication** - Firebase Auth
   - `useAuth()` hook for user state
   - Phone/email authentication support
2. **Firestore** - Structured data
   - Used via `useQuery()` with React Query
   - Real-time listeners via `onSnapshot()`

3. **Realtime Database** - Live telemetry
   - Used via `onValue()` listeners for real-time updates
   - Optimized for high-frequency sensor data

4. **Cloud Functions** - Backend logic
   - Weather service
   - Crop chat AI
   - Robot telemetry processing
   - Weather predictions
   - Predictive AI features

5. **Storage** - File uploads (optional, currently using Firestore)

### Migration Checklist

- [x] Firestore rules configured for user data isolation
- [x] Realtime Database rules configured for `/devices/{uid}/*` paths
- [x] Firebase Functions deployed (crop-chat, weather-service, etc.)
- [x] Auth provider configured (Email/Password or Phone)
- [x] Environment variables set in `.env`
- [x] All UI components unchanged
- [x] All TypeScript types maintained
- [x] Real-time listeners optimized with unsubscribe cleanup

### Integration Notes for ESP32 Devices

ESP32 devices should push telemetry to:

```
devices/{uid}/telemetry/{sensorId}
{
  temperature: 25.5,
  humidity: 65,
  soil_moisture: 45,
  soil_ph: 6.8,
  wind_speed: 3.2,
  light_intensity: 8000,
  timestamp: 1709222400000
}

devices/{uid}/robots/{robotId}/status
{
  status: "active",
  battery_level: 85,
  firmware_version: "v2.1.0",
  last_heartbeat: 1709222400000
}

devices/{uid}/status
{
  online: true,
  last_seen: 1709222400000
}
```

### Testing

To test real-time updates:

1. **Firestore Data**: Data automatically syncs via `useQuery()` + `onSnapshot()`
2. **Realtime DB**: Push test data to RTDB paths and watch the UI update instantly
3. **Firebase Functions**: Test via console.log or Firebase emulator

### Support

For issues with:

- **Real-time subscriptions**: Check Firebase Realtime Database security rules
- **Firestore queries**: Verify collection names and document structure
- **Authentication**: Ensure Firebase Auth providers are enabled
- **Functions**: Check Firebase Cloud Functions logs in console
