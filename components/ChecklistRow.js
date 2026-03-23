import React from "react";
import { TouchableOpacity, View, Text } from "react-native";
import { styles } from "../styles";

export default function ChecklistRow({ item, checked, onToggle }) {
  return (
    <TouchableOpacity
      style={[styles.checklistRow, checked && styles.checklistRowChecked]}
      onPress={onToggle}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
        <Text style={styles.checkboxMark}>{checked ? "✓" : ""}</Text>
      </View>

      <View style={styles.checklistTextBlock}>
        <Text style={styles.checklistLabel}>{item.label}</Text>
        <Text style={styles.checklistReason}>{item.reason}</Text>
      </View>

      <Text style={styles.checklistPoints}>+{item.points}</Text>
    </TouchableOpacity>
  );
}