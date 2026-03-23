import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// ==============================
// CHAT ENDPOINT
// ==============================
app.post("/chat", async (req, res) => {
  const { message, context } = req.body || {};

  if (!message || !message.trim()) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const reply = getContextAwareResponse(message, context || {});
    return res.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);

    return res.json({
      reply:
        "The assistant is currently unavailable. Please try again later.",
    });
  }
});

// ==============================
// CONTEXT-AWARE RESPONSE LOGIC
// ==============================
function getContextAwareResponse(message = "", context = {}) {
  const text = message.toLowerCase();

  const weather = context.weatherData || null;
  const quakes = Array.isArray(context.quakes) ? context.quakes : [];
  const nearestShelter = context.nearestShelter || null;
  const placeLabel = context.placeLabel || "";

  if (text.includes("earthquake")) {
    if (quakes.length > 0) {
      const strongest = Math.max(...quakes.map((q) => q.mag || 0));
      return `Recent earthquake activity has been detected nearby${
        placeLabel ? ` around ${placeLabel}` : ""
      }. The strongest recent quake in your feed was magnitude ${strongest.toFixed(
        1
      )}. Drop, cover, and hold on, then review your shelter and emergency kit.`;
    }
    return "No recent nearby earthquake activity is currently shown, but you should still prepare by securing heavy objects and knowing safe cover locations.";
  }

  if (text.includes("flood")) {
    if (weather && (weather.precipitation ?? 0) > 5) {
      return "Rainfall is currently elevated, so flood risk may be higher. Move to higher ground if needed and avoid walking or driving through flood water.";
    }
    return "Prepare for flooding by keeping emergency supplies waterproofed, identifying higher ground, and avoiding flood water during heavy rain.";
  }

  if (text.includes("storm") || text.includes("wind")) {
    if (weather && (weather.wind_speed_10m ?? 0) > 20) {
      return "Wind conditions are elevated right now. Stay indoors if possible, avoid windows, and secure loose outdoor items.";
    }
    return "For storm safety, monitor alerts, charge essential devices, and stay indoors during severe weather.";
  }

  if (text.includes("fire")) {
    return "If there is a fire, stay low to avoid smoke, exit immediately using the safest route, and do not use lifts. Call emergency services once you are safe.";
  }

  if (text.includes("kit") || text.includes("prepare") || text.includes("preparedness")) {
    return "Your emergency kit should include water, non-perishable food, a flashlight, batteries or power bank, first aid supplies, important documents, and essential medication.";
  }

  if (text.includes("shelter")) {
    if (nearestShelter) {
      return `Your nearest shelter is ${nearestShelter.name}${
        nearestShelter.address ? ` at ${nearestShelter.address}` : ""
      }, approximately ${nearestShelter.distanceKm.toFixed(
        1
      )} km away. You can use the Map or Resources tab to open directions.`;
    }
    return "Enable location services to identify the nearest shelter, then use the Map or Resources tab for directions.";
  }

  if (
    text.includes("weather") ||
    text.includes("rain") ||
    text.includes("temperature")
  ) {
    if (weather) {
      return `Current conditions show about ${formatNumber(
        weather.temperature_2m
      )}°C, rainfall around ${formatNumber(
        weather.precipitation
      )} mm, and wind speed around ${formatNumber(
        weather.wind_speed_10m
      )} km/h. Continue monitoring Alerts for changes.`;
    }
    return "Weather data is not currently available. Try refreshing the Alerts tab.";
  }

  if (text.includes("emergency") || text.includes("help")) {
    return "Use Emergency Mode for immediate priorities and quick emergency contact access. You should also check the Guides tab for disaster-specific instructions.";
  }

  return "I can help with floods, earthquakes, storms, fire safety, shelters, weather conditions, and emergency kit preparation. Try asking a more specific question.";
}

function formatNumber(value) {
  return typeof value === "number" ? value.toFixed(1) : "N/A";
}

// ==============================
// HEALTH CHECK
// ==============================
app.get("/", (req, res) => {
  res.send("Backend is running");
});

// ==============================
// START SERVER
// ==============================
const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Chat backend running on http://192.168.68.115:${port}`);
});