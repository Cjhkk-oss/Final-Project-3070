import React from "react";
import { View, Text } from "react-native";
import { styles } from "../styles";

export default function ProgressBar({ percentage }) {
  return (
    <View style={styles.progressWrapper}>
      <View style={styles.progressBackground}>
        <View style={[styles.progressFill, { width: `${percentage}%` }]} />
      </View>
      <Text style={styles.progressText}>{percentage}% complete</Text>
    </View>
  );
}