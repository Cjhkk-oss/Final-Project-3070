import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../styles";
import { formatRelativeTime } from "../utils/helpers";

export default function AlertsScreen({
  coords,
  placeLabel,
  locationStatus,
  locationLoading,
  weatherData,
  weatherLoading,
  weatherError,
  quakes,
  quakeLoading,
  quakeError,
  onRefresh,
  weatherSummary,
  quakeSummary,
  fmt,
}) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Alerts & Situational Awareness</Text>
      <Text style={styles.sectionBody}>
        This section combines location, weather, and nearby earthquake activity.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Location</Text>
        <Text style={styles.cardBody}>{locationStatus}</Text>
        {coords ? (
          <>
            <Text style={styles.cardBody}>
              {placeLabel ||
                `Latitude ${coords.latitude.toFixed(5)}, Longitude ${coords.longitude.toFixed(5)}`}
            </Text>
          </>
        ) : null}
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={onRefresh}>
        <Text style={styles.primaryButtonText}>
          {locationLoading ? "Refreshing..." : "Refresh Alerts"}
        </Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Weather</Text>
        {weatherLoading ? (
          <Text style={styles.cardBody}>Loading weather...</Text>
        ) : weatherError ? (
          <Text style={styles.errorText}>{weatherError}</Text>
        ) : weatherData ? (
          <>
            <Text style={styles.cardBody}>
              Temperature: {fmt(weatherData.temperature_2m)}°C
            </Text>
            <Text style={styles.cardBody}>
              Rainfall: {fmt(weatherData.precipitation)} mm
            </Text>
            <Text style={styles.cardBody}>
              Wind speed: {fmt(weatherData.wind_speed_10m)} km/h
            </Text>
            <Text style={styles.summaryHighlight}>{weatherSummary}</Text>
          </>
        ) : (
          <Text style={styles.cardBody}>No weather data available.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Nearby Earthquake Activity</Text>
        {quakeLoading ? (
          <Text style={styles.cardBody}>Loading earthquake feed...</Text>
        ) : quakeError ? (
          <Text style={styles.errorText}>{quakeError}</Text>
        ) : (
          <>
            <Text style={styles.summaryHighlight}>{quakeSummary}</Text>
            {quakes.length === 0 ? (
              <Text style={styles.cardBody}>No recent nearby earthquakes found.</Text>
            ) : (
              quakes.map((quake) => (
                <View key={quake.id} style={styles.alertRow}>
                  <Text style={styles.alertTitle}>
                    M{fmt(quake.mag)} • {quake.place}
                  </Text>
                  <Text style={styles.cardBody}>
                    {fmt(quake.distanceKm)} km away • {formatRelativeTime(quake.time)}
                  </Text>
                </View>
              ))
            )}
          </>
        )}
      </View>
    </View>
  );
}