export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function deg2rad(deg) {
  return (deg * Math.PI) / 180;
}

export function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getCompletionPercentage(completedCount, totalCount) {
  if (totalCount === 0) return 0;
  return Math.round((completedCount / totalCount) * 100);
}

export function getBadge(points, completedSetSize, totalCount) {
  const completionRate = totalCount === 0 ? 0 : completedSetSize / totalCount;

  if (completionRate >= 0.9 && points >= 90) return "Gold Responder";
  if (completionRate >= 0.5 && points >= 50) return "Silver Prepared";
  if (completionRate > 0) return "Bronze Starter";
  return "No badge yet";
}

export function fmt(value) {
  return typeof value === "number" ? value.toFixed(1) : "—";
}

export function getWeatherRiskSummary(weatherData) {
  if (!weatherData) return "No weather data available.";

  const rain = weatherData.precipitation ?? 0;
  const wind = weatherData.wind_speed_10m ?? 0;

  if (rain >= 20) {
    return "Heavy rainfall detected. Flood precautions may be needed.";
  }

  if (wind >= 40) {
    return "Strong winds detected. Stay alert for storm-related hazards.";
  }

  if (rain > 0 || wind > 20) {
    return "Moderate weather activity detected. Continue monitoring conditions.";
  }

  return "No significant immediate weather risk detected.";
}

export function getQuakeSummary(quakes) {
  if (!quakes || quakes.length === 0) {
    return "No recent significant nearby earthquakes found.";
  }

  const strongest = Math.max(...quakes.map((q) => q.mag));

  if (strongest >= 5) {
    return "Recent strong earthquake activity detected nearby. Monitor updates and safety guidance.";
  }

  return "Recent earthquake activity detected nearby. Stay informed and review response guidance.";
}

export function formatRelativeTime(timestamp) {
  const diffMs = Date.now() - timestamp;
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;

  const days = Math.floor(hours / 24);
  return `${days} day(s) ago`;
}

export function getWeatherRiskLevel(weatherData) {
  if (!weatherData) return "Low";

  const rain = weatherData.precipitation ?? 0;
  const wind = weatherData.wind_speed_10m ?? 0;

  if (rain >= 20 || wind >= 40) return "High";
  if (rain > 0 || wind > 20) return "Moderate";
  return "Low";
}