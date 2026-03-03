import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast";

function buildCropDescriptions(crops: string[], cropDetails: Record<string, any>) {
  return crops.map((cropId: string) => {
    const details = cropDetails?.[cropId] || {};
    const parts = [`Crop: ${cropId}`];
    if (details.fieldArea) parts.push(`Field area: ${details.fieldArea} ${details.fieldAreaUnit || "acres"}`);
    if (details.irrigationFrequency) {
      const freqLabel = details.irrigationFrequency === "custom" ? (details.irrigationCustom || "custom") : details.irrigationFrequency;
      parts.push(`Irrigation: ${freqLabel}`);
    }
    if (details.irrigationMethod) {
      const methodLabel = details.irrigationMethod === "other" ? (details.irrigationMethodCustom || "other") : details.irrigationMethod;
      parts.push(`Method: ${methodLabel}`);
    }
    if (details.cropStage) parts.push(`Current stage: ${details.cropStage}`);
    if (details.plantingDate) {
      const planted = new Date(details.plantingDate);
      const daysSincePlanting = Math.floor((Date.now() - planted.getTime()) / 86400000);
      parts.push(`Planted: ${details.plantingDate} (${daysSincePlanting} days ago)`);
    }
    return parts.join(", ");
  }).join("\n");
}

async function fetchWeatherData(location: { lat: number; lng: number }) {
  let weatherSummary = "Weather data unavailable.";
  let weatherAlerts: any[] = [];

  try {
    const meteoUrl = `${OPEN_METEO_URL}?latitude=${location.lat}&longitude=${location.lng}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max&timezone=auto&forecast_days=7`;
    const meteoRes = await fetch(meteoUrl);
    if (!meteoRes.ok) return { weatherSummary, weatherAlerts };

    const meteoData = await meteoRes.json();
    const current = meteoData.current;
    const daily = meteoData.daily;

    const next7Days = daily.temperature_2m_max.map((max: number, i: number) => ({
      day: i === 0 ? "Today" : i === 1 ? "Tomorrow" : `Day ${i + 1}`,
      tempHigh: Math.round(max),
      tempLow: Math.round(daily.temperature_2m_min[i]),
      precipMm: daily.precipitation_sum[i],
      rainChance: daily.precipitation_probability_max[i] ?? 0,
      code: daily.weather_code[i],
    }));

    weatherSummary = `Current: ${current.temperature_2m}°C, humidity ${current.relative_humidity_2m}%, precipitation ${current.precipitation}mm, code ${current.weather_code}. 7-day forecast: ${next7Days.map((d: any) => `${d.day}: ${d.tempHigh}/${d.tempLow}°C, rain ${d.rainChance}%, precip ${d.precipMm}mm`).join("; ")}`;

    if (current.precipitation > 0 || next7Days[0].rainChance > 60) {
      weatherAlerts.push({ type: "irrigation", severity: "info", title: "Rain detected today", message: "Rain detected today — irrigation not required." });
    }
    if (next7Days[1]?.rainChance > 50) {
      weatherAlerts.push({ type: "irrigation", severity: "info", title: "Rain expected tomorrow", message: "Rain expected tomorrow — consider adjusting irrigation." });
    }
    if (current.temperature_2m > 35) {
      weatherAlerts.push({ type: "heat_stress", severity: "warning", title: "High temperature stress", message: "High temperature stress risk — monitor crop closely." });
    }
    if (current.temperature_2m < 5) {
      weatherAlerts.push({ type: "frost_risk", severity: "warning", title: "Frost risk", message: "Low temperatures detected — protect sensitive crops from frost." });
    }
  } catch (e) {
    console.error("Weather fetch failed:", e);
  }

  return { weatherSummary, weatherAlerts };
}

function buildSystemPrompt() {
  return `You are a practical agricultural AI assistant for real farmers. Generate detailed, explainable crop predictions based ONLY on the provided data.

RULES:
- Do NOT invent data. If information is missing, say so and lower confidence.
- Estimate growth stage from planting date + typical crop cycle if available.
- Harvest date estimates should be based on standard growth durations for each crop.
- If crop stage is "not-sure" or unknown, make reasonable assumptions and note them.
- Adjust predictions based on actual weather (temperature stress, drought, excess rain).
- For custom/unknown crops, use a general 90-120 day growth model and note lower confidence.
- Be specific about WHY things are happening, not just WHAT is happening.
- Use simple farmer-friendly language, avoid scientific jargon.

Respond with a JSON object containing a "predictions" array. Each prediction must include ALL of these fields:

- cropId: the crop identifier (lowercase)
- cropName: display name
- growthStage: one of "Seeded", "Vegetative", "Flowering", "Fruiting", "Harvest Ready"
- growthPercentage: 0-100 (estimated overall progress based on planting date and growth cycle)
- daysToHarvest: estimated days until harvest
- harvestWindow: string like "Feb 15 - Feb 25"
- healthScore: 0-100 based on weather conditions + irrigation adequacy
- confidenceLevel: "high", "medium", or "low"
- confidenceReason: short explanation of why this confidence level
- status: one sentence describing current growth status
- reason: one sentence explaining WHY (based on data - weather, irrigation, stage)
- action: one practical sentence on what to do next (or "No immediate action required")
- nextStage: object { name: string, estimatedDays: number, description: string } — what the next growth stage is and when to expect it
- assumptions: array of strings listing any assumptions made due to missing data (empty if all data available)
- risks: array of { type: string, severity: "info"|"warning"|"critical", message: string } — disease risks, weather risks, delay risks
- diseaseRisks: array of { name: string, likelihood: "low"|"medium"|"high", reason: string, earlySigns: string, preventiveActions: string[] } — possible diseases based on crop type + weather conditions
- irrigationAdvice: object { recommendedMethod: string, bestTime: string, frequencyAdvice: string, adjustment: string } — smart irrigation guidance
- harvestGuidance: object { estimatedWindow: string, signsToLookFor: string[], recommendation: string } — when and how to know harvest is ready
- optimalActions: array of 2-4 short actionable items the farmer should do now
- reminders: array of { timing: string, action: string } — upcoming things the farmer should remember`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { crops, cropDetails, location, locationName } = await req.json();

    if (!crops || crops.length === 0) {
      return new Response(
        JSON.stringify({ error: "No crops provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Fetch weather
    let weatherSummary = "Weather data unavailable.";
    let weatherAlerts: any[] = [];
    if (location?.lat && location?.lng) {
      const result = await fetchWeatherData(location);
      weatherSummary = result.weatherSummary;
      weatherAlerts = result.weatherAlerts;
    }

    const cropDescriptions = buildCropDescriptions(crops, cropDetails);
    const locationStr = locationName || "unknown location";
    const currentDate = new Date().toISOString().split("T")[0];
    const currentMonth = new Date().toLocaleString("default", { month: "long" });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: buildSystemPrompt() },
          {
            role: "user",
            content: `Date: ${currentDate}, Month: ${currentMonth}
Location: ${locationStr}

FARMER CROP DATA:
${cropDescriptions}

LIVE WEATHER:
${weatherSummary}

Generate detailed, realistic, explainable predictions for each crop based on this data. Include disease risks, irrigation advice, harvest guidance, and practical reminders.`
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);

      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("AI prediction failed");
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content;

    let predictions;
    try {
      const parsed = JSON.parse(content);
      predictions = parsed.predictions || parsed;
    } catch {
      predictions = crops.map((cropId: string) => ({
        cropId,
        cropName: cropId.charAt(0).toUpperCase() + cropId.slice(1).replace(/-/g, " "),
        growthStage: cropDetails?.[cropId]?.cropStage === "seeded" ? "Seeded" : "Vegetative",
        growthPercentage: 20,
        daysToHarvest: 60,
        harvestWindow: "Estimate unavailable",
        healthScore: 70,
        confidenceLevel: "low",
        confidenceReason: "AI response could not be parsed. Using minimal defaults.",
        status: "Prediction temporarily unavailable.",
        reason: "Unable to generate AI prediction at this time.",
        action: "Check back later for updated predictions.",
        nextStage: { name: "Unknown", estimatedDays: 0, description: "Unable to estimate." },
        assumptions: ["Using fallback data — AI response was unavailable"],
        risks: [],
        diseaseRisks: [],
        irrigationAdvice: { recommendedMethod: "Monitor manually", bestTime: "Morning", frequencyAdvice: "Maintain current schedule", adjustment: "No adjustment" },
        harvestGuidance: { estimatedWindow: "Unavailable", signsToLookFor: [], recommendation: "Check back later." },
        optimalActions: ["Monitor crop manually", "Ensure regular irrigation"],
        reminders: [],
      }));
    }

    return new Response(
      JSON.stringify({ predictions, weatherAlerts }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Predictive AI error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
