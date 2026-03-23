import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { styles } from "../styles";

export default function TabButton({ label, active, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.tabButton, active && styles.tabButtonActive]}
      onPress={onPress}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}