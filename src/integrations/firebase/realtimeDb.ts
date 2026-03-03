/**
 * Firebase Realtime Database Schema & Types
 *
 * Structure:
 * devices/{uid}/
 *   robots/{robotId}/
 *     status
 *     battery_level
 *     firmware_version
 *     last_heartbeat
 *   telemetry/
 *     {sensorId}/
 *       temperature
 *       humidity
 *       soil_moisture
 *       wind_speed
 *   status/
 *     online
 *     last_seen
 */

export interface RobotRealtimeStatus {
  status: "active" | "idle" | "offline" | "maintenance";
  battery_level: number;
  firmware_version: string;
  last_heartbeat: number; // timestamp
  current_task?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface TelemetryReading {
  temperature?: number;
  humidity?: number;
  soil_moisture?: number;
  soil_ph?: number;
  wind_speed?: number;
  light_intensity?: number;
  timestamp: number;
}

export interface DeviceStatus {
  online: boolean;
  last_seen: number; // timestamp
}

export interface RobotTelemetry {
  [robotId: string]: {
    status: RobotRealtimeStatus;
    telemetry: {
      [sensorId: string]: TelemetryReading;
    };
  };
}

export interface DeviceData {
  robots: {
    [robotId: string]: RobotRealtimeStatus;
  };
  telemetry: {
    [sensorId: string]: TelemetryReading;
  };
  status: DeviceStatus;
}

/**
 * Helper to build Firebase Realtime Database paths
 */
export const rtdbPaths = {
  // Device paths
  device: (uid: string) => `devices/${uid}`,

  // Robot paths
  robots: (uid: string) => `devices/${uid}/robots`,
  robot: (uid: string, robotId: string) => `devices/${uid}/robots/${robotId}`,
  robotStatus: (uid: string, robotId: string) =>
    `devices/${uid}/robots/${robotId}/status`,
  robotBattery: (uid: string, robotId: string) =>
    `devices/${uid}/robots/${robotId}/battery_level`,
  robotFirmware: (uid: string, robotId: string) =>
    `devices/${uid}/robots/${robotId}/firmware_version`,
  robotHeartbeat: (uid: string, robotId: string) =>
    `devices/${uid}/robots/${robotId}/last_heartbeat`,

  // Telemetry paths
  telemetry: (uid: string) => `devices/${uid}/telemetry`,
  telemetrySensor: (uid: string, sensorId: string) =>
    `devices/${uid}/telemetry/${sensorId}`,

  // Status paths
  deviceStatus: (uid: string) => `devices/${uid}/status`,
  deviceOnline: (uid: string) => `devices/${uid}/status/online`,
  deviceLastSeen: (uid: string) => `devices/${uid}/status/last_seen`,
};

/**
 * Parse Firebase timestamp from realtime database
 */
export function parseTimestamp(timestamp: unknown): Date {
  if (typeof timestamp === "number") {
    return new Date(timestamp);
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date();
}

/**
 * Convert timestamp to ISO string
 */
export function timestampToISO(timestamp: unknown): string {
  return parseTimestamp(timestamp).toISOString();
}
