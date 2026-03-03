import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Mock Rover API that simulates real rover data
function generateMockRoverData() {
  const now = new Date();
  const battery = Math.floor(Math.random() * 30) + 60; // 60-90%
  const statuses = ["active", "idle", "scanning"] as const;
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const tasks = [
    "Soil moisture scanning",
    "Crop health imaging",
    "Perimeter patrol",
    "Irrigation monitoring",
    "Weed detection sweep",
  ];

  return {
    rover: {
      id: "rover-001",
      name: "FarmBot Alpha",
      status,
      battery_level: battery,
      current_task: tasks[Math.floor(Math.random() * tasks.length)],
      last_ping: now.toISOString(),
      uptime_hours: Math.floor(Math.random() * 48) + 12,
      firmware_version: "v3.2.1",
    },
    sensors: {
      temperature: +(20 + Math.random() * 15).toFixed(1),
      soil_moisture: +(30 + Math.random() * 40).toFixed(1),
      humidity: +(40 + Math.random() * 35).toFixed(1),
      light_intensity: Math.floor(Math.random() * 80000) + 20000,
      soil_ph: +(5.5 + Math.random() * 2).toFixed(1),
      wind_speed: +(Math.random() * 25).toFixed(1),
    },
    gps: {
      latitude: 12.9716 + (Math.random() - 0.5) * 0.01,
      longitude: 77.5946 + (Math.random() - 0.5) * 0.01,
    },
    alerts: generateRoverAlerts(),
    timestamp: now.toISOString(),
  };
}

function generateRoverAlerts() {
  const alerts: Array<{ type: string; severity: string; message: string }> = [];
  
  if (Math.random() > 0.7) {
    alerts.push({
      type: "soil",
      severity: "warning",
      message: "Low soil moisture detected in Zone B — consider watering.",
    });
  }
  if (Math.random() > 0.8) {
    alerts.push({
      type: "pest",
      severity: "info",
      message: "Minor pest activity detected near crop row 3.",
    });
  }
  if (Math.random() > 0.9) {
    alerts.push({
      type: "battery",
      severity: "warning",
      message: "Rover battery below 30% — returning to charging station.",
    });
  }

  return alerts;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { apiKey, action } = await req.json();

    // Validate API key format (any non-empty string is accepted for mock)
    if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length < 8) {
      return new Response(
        JSON.stringify({ error: "Invalid API key. Key must be at least 8 characters.", valid: false }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (action === "validate") {
      return new Response(
        JSON.stringify({ valid: true, message: "API key validated successfully.", roverName: "FarmBot Alpha" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Default: return rover data
    const data = generateMockRoverData();

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Rover data error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
