import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { styles } from "../styles";

export default function WelcomeScreen({ onContinue }) {
  return (
    <LinearGradient colors={["#2f6fed", "#123c99"]} style={styles.welcomeWrap}>
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeTitle}>Disaster Prep</Text>
        <Text style={styles.welcomeBody}>
          A mobile app for preparedness, alerts, guides, and local emergency support.
        </Text>

        <TouchableOpacity style={styles.primaryButton} onPress={onContinue}>
          <Text style={styles.primaryButtonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}