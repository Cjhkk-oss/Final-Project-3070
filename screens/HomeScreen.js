import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { styles } from "../styles";

export default function HomeScreen() {
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.sectionTitle}>Emergency Dashboard</Text>
      <Text style={styles.sectionBody}>
        Your quick access hub for preparedness, alerts, and urgent actions.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Preparedness Status</Text>
        <Text style={styles.cardBody}>Review your emergency kit and improve readiness.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Live Alerts</Text>
        <Text style={styles.cardBody}>Check local weather and earthquake activity.</Text>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, { marginTop: 8 }]}
        onPress={() => navigation.navigate("EmergencyMode")}
      >
        <Text style={styles.primaryButtonText}>Open Emergency Mode</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}