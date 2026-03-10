import { onValueWritten } from "firebase-functions/v2/database";
import { initializeApp } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

initializeApp();
const rtdb = getDatabase();

export const processRoverUpdate = onValueWritten(
  "/incoming/{roverId}",
  async (event) => {
    const roverId = event.params.roverId;
    const raw = event.data?.after.val();

    if (!raw) return;

    const structured = {
      rover: {
        id: roverId,
        name: raw.name ?? "Unknown Rover",
        status: raw.status ?? "idle",
        battery_level: raw.battery ?? 0,
        current_task: raw.task ?? "none",
        last_ping: new Date().toISOString(),
        uptime_hours: raw.uptime ?? 0,
        firmware_version: raw.firmware ?? "v1.0.0",
      },
      sensors: {
        temperature: raw.temperature ?? 0,
        soil_moisture: raw.soil_moisture ?? 0,
        humidity: raw.humidity ?? 0,
        light_intensity: raw.light ?? 0,
        soil_ph: raw.soil_ph ?? 7,
        wind_speed: raw.wind_speed ?? 0,
      },
      gps: {
        latitude: raw.latitude ?? 0,
        longitude: raw.longitude ?? 0,
      },
      alerts: generateAlerts(raw),
      timestamp: new Date().toISOString(),
    };

    await rtdb.ref(`rovers/${roverId}`).set(structured);
  }
);

function generateAlerts(raw: any) {
  const alerts = [];

  if (raw.battery < 20) {
    alerts.push({
      type: "battery",
      severity: "high",
      message: "Battery critically low",
    });
  }

  if (raw.temperature > 45) {
    alerts.push({
      type: "temperature",
      severity: "medium",
      message: "High temperature detected",
    });
  }

  return alerts;
}