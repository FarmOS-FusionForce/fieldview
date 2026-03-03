import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-robot-key",
};

interface TelemetryPayload {
  robot_id: string;
  field_id?: string;
  zone_id?: string;
  temperature?: number;
  soil_moisture?: number;
  humidity?: number;
  grass_growth_index?: number;
  wind_speed?: number;
  gps_latitude?: number;
  gps_longitude?: number;
  battery_level?: number;
  current_task?: string;
  status?: "active" | "idle" | "offline" | "maintenance";
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload: TelemetryPayload = await req.json();

    // Validate required fields
    if (!payload.robot_id) {
      return new Response(
        JSON.stringify({ error: "robot_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify robot exists
    const { data: robot, error: robotError } = await supabase
      .from("robots")
      .select("id, user_id")
      .eq("id", payload.robot_id)
      .single();

    if (robotError || !robot) {
      return new Response(
        JSON.stringify({ error: "Robot not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Insert sensor reading
    const { error: readingError } = await supabase
      .from("sensor_readings")
      .insert({
        robot_id: payload.robot_id,
        field_id: payload.field_id || null,
        zone_id: payload.zone_id || null,
        temperature: payload.temperature ?? null,
        soil_moisture: payload.soil_moisture ?? null,
        humidity: payload.humidity ?? null,
        grass_growth_index: payload.grass_growth_index ?? null,
        wind_speed: payload.wind_speed ?? null,
        gps_latitude: payload.gps_latitude ?? null,
        gps_longitude: payload.gps_longitude ?? null,
        recorded_at: new Date().toISOString(),
      });

    if (readingError) {
      console.error("Failed to insert sensor reading:", readingError);
      throw new Error("Failed to store sensor reading");
    }

    // Update robot status
    const robotUpdate: Record<string, unknown> = {
      last_seen_at: new Date().toISOString(),
    };

    if (payload.battery_level !== undefined) {
      robotUpdate.battery_level = payload.battery_level;
    }
    if (payload.current_task !== undefined) {
      robotUpdate.current_task = payload.current_task;
    }
    if (payload.status !== undefined) {
      robotUpdate.status = payload.status;
    }
    if (payload.field_id !== undefined) {
      robotUpdate.current_field_id = payload.field_id;
    }
    if (payload.zone_id !== undefined) {
      robotUpdate.current_zone_id = payload.zone_id;
    }

    const { error: updateError } = await supabase
      .from("robots")
      .update(robotUpdate)
      .eq("id", payload.robot_id);

    if (updateError) {
      console.error("Failed to update robot status:", updateError);
      // Non-critical error, don't throw
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Telemetry data recorded",
        timestamp: new Date().toISOString(),
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error processing telemetry:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
