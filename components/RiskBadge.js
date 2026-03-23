import React from "react";
import { View, Text } from "react-native";
import { styles } from "../styles";

export default function RiskBadge({ level }) {
  const badgeStyle =
    level === "High"
      ? styles.riskHigh
      : level === "Moderate"
      ? styles.riskModerate
      : styles.riskLow;

  return (
    <View style={[styles.riskBadge, badgeStyle]}>
      <Text style={styles.riskBadgeText}>{level} Risk</Text>
    </View>
  );
}