import * as functions from "firebase-functions";

const corsHandler = cors({ origin: true });

export const weatherService = onRequest(async (req, res) => {
  corsHandler(req, res, async () => {
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    try {
      const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
      if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

      const { location, coords } = req.body; // Firebase parses JSON automatically
      if (!location) throw new Error("Location is required");

      // ... keep your logic for buildFromRealData and generateFallbackForecast ...
      // Replace 'fetch' with standard node-fetch (or native fetch in Node 18+)

      const responseData = { /* your structured response */ };

      res.status(200).json(responseData);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
});