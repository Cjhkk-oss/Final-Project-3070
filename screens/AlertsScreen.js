import React from "react";
import { ScrollView, View, Text, TouchableOpacity } from "react-native";
import { styles } from "../styles";
import RiskBadge from "../components/RiskBadge";
import SectionCard from "../components/SectionCard";
import {
  getWeatherRiskLevel,
  formatRelativeTime,
} from "../utils/helpers";

function getQuakeRiskLevel(quakes) {
  if (!quakes || quakes.length === 0) return "Low";
  const strongest = Math.max(...quakes.map((q) => q.mag || 0));
  if (strongest >= 5) return "High";
  if (strongest >= 3) return "Moderate";
  return "Low";
}

export default function AlertsScreen({
  coords = null,
  placeLabel = "",
  locationStatus = "Location unavailable.",
  locationLoading = false,
  weatherData = null,
  weatherLoading = false,
  weatherError = "",
  quakes = [],
  quakeLoading = false,
  quakeError = "",
  onRefresh = () => {},
  weatherSummary = "",
  quakeSummary = "",
  fmt = (v) => v,
}) {
  const weatherRiskLevel = getWeatherRiskLevel(weatherData);
  const quakeRiskLevel = getQuakeRiskLevel(quakes);

  return (
    <ScrollView
    style={styles.screenScroll}
    contentContainerStyle={styles.screenScrollContent}
    showsVerticalScrollIndicator={false}
  >
      <Text style={styles.sectionTitle}>Alerts & Situational Awareness</Text>
      <Text style={styles.sectionBody}>
        This section combines location, weather, and nearby earthquake activity.
      </Text>

      <SectionCard title="Current Location">
        <Text style={styles.cardBody}>{locationStatus}</Text>
        {coords ? (
          <Text style={styles.cardBody}>
            {placeLabel ||
              `Latitude ${coords.latitude.toFixed(5)}, Longitude ${coords.longitude.toFixed(5)}`}
          </Text>
        ) : null}
      </SectionCard>

      <TouchableOpacity style={styles.primaryButton} onPress={onRefresh}>
        <Text style={styles.primaryButtonText}>
          {locationLoading ? "Refreshing..." : "Refresh Alerts"}
        </Text>
      </TouchableOpacity>

      <SectionCard
        title="Weather"
        subtitle="Live local weather conditions and interpreted risk level."
      >
        {weatherLoading ? (
          <Text style={styles.cardBody}>Loading weather...</Text>
        ) : weatherError ? (
          <Text style={styles.errorText}>{weatherError}</Text>
        ) : weatherData ? (
          <>
            <RiskBadge level={weatherRiskLevel} />
            <View style={styles.metricGrid}>
              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Temperature</Text>
                <Text style={styles.metricValue}>
                  {fmt(weatherData.temperature_2m)}°C
                </Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Rainfall</Text>
                <Text style={styles.metricValue}>
                  {fmt(weatherData.precipitation)} mm
                </Text>
              </View>

              <View style={styles.metricCard}>
                <Text style={styles.metricLabel}>Wind Speed</Text>
                <Text style={styles.metricValue}>
                  {fmt(weatherData.wind_speed_10m)} km/h
                </Text>
              </View>
            </View>

            <Text style={styles.summaryHighlight}>{weatherSummary}</Text>
          </>
        ) : (
          <Text style={styles.cardBody}>No weather data available.</Text>
        )}
      </SectionCard>

      <SectionCard
        title="Nearby Earthquake Activity"
        subtitle="Recent nearby earthquake events based on your current location."
      >
        {quakeLoading ? (
          <Text style={styles.cardBody}>Loading earthquake feed...</Text>
        ) : quakeError ? (
          <Text style={styles.errorText}>{quakeError}</Text>
        ) : (
          <>
            <RiskBadge level={quakeRiskLevel} />
            <Text style={styles.summaryHighlight}>{quakeSummary}</Text>

            {quakes.length === 0 ? (
              <Text style={styles.cardBody}>
                No recent nearby earthquakes found.
              </Text>
            ) : (
              quakes.map((quake) => (
                <View key={quake.id} style={styles.alertRow}>
                  <Text style={styles.alertTitle}>
                    M{fmt(quake.mag)} • {quake.place}
                  </Text>
                  <Text style={styles.cardBody}>
                    {fmt(quake.distanceKm)} km away •{" "}
                    {formatRelativeTime(quake.time)}
                  </Text>
                </View>
              ))
            )}
          </>
        )}
      </SectionCard>
    </ScrollView>
  );
}