import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { styles } from "../styles";

export default function HomeScreen({
  navigation,
  badge,
  earnedPoints,
  totalPoints,
  weatherSummary,
  nearestShelter,
}) {
  const openEmergencyMode = () => {
    navigation.getParent()?.navigate("EmergencyMode");
  };

  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.sectionTitle}>Emergency Dashboard</Text>
      <Text style={styles.sectionBody}>
        Your quick access hub for preparedness, alerts, and urgent actions.
      </Text>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("Prep")}
      >
        <Text style={styles.cardTitle}>Preparedness Status</Text>
        <Text style={styles.cardBody}>
          {earnedPoints}/{totalPoints} points • {badge}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("Alerts")}
      >
        <Text style={styles.cardTitle}>Live Alerts</Text>
        <Text style={styles.cardBody}>
          {weatherSummary || "Check local weather and earthquake activity."}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("Resources")}
      >
        <Text style={styles.cardTitle}>Nearest Shelter</Text>
        <Text style={styles.cardBody}>
          {nearestShelter
            ? `${nearestShelter.name} • ${nearestShelter.distanceKm.toFixed(1)} km away`
            : "Enable location to view nearest shelter."}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.primaryButton, { marginTop: 8 }]}
        onPress={openEmergencyMode}
      >
        <Text style={styles.primaryButtonText}>Open Emergency Mode</Text>
      </TouchableOpacity>

      <TouchableOpacity
  style={styles.card}
  onPress={() => navigation.navigate("Map")}
>
       <Text style={styles.cardTitle}>Nearest Shelter</Text>
       <Text style={styles.cardBody}>
    {nearestShelter
      ? `${nearestShelter.name} • ${nearestShelter.distanceKm.toFixed(1)} km away`
      : "Enable location to view nearest shelter."}
       </Text>
       </TouchableOpacity>
    </ScrollView>
  );
}