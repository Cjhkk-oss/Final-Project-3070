import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../styles";
import ChecklistRow from "../components/ChecklistRow";
import ProgressBar from "../components/ProgressBar";

export default function PrepScreen({
  kitItems,
  completed,
  onToggleItem,
  earnedPoints,
  totalPoints,
  completionPercentage,
  badge,
  onResetChecklist,
}) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Preparedness Checklist</Text>
      <Text style={styles.sectionBody}>
        Build your emergency kit and track your preparedness progress.
      </Text>

      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Preparedness Summary</Text>
        <Text style={styles.summaryStat}>
          Points: {earnedPoints} / {totalPoints}
        </Text>
        <Text style={styles.summaryStat}>Badge: {badge}</Text>
        <ProgressBar percentage={completionPercentage} />

        <TouchableOpacity style={styles.secondaryButton} onPress={onResetChecklist}>
          <Text style={styles.secondaryButtonText}>Reset Checklist</Text>
        </TouchableOpacity>
      </View>

      {kitItems.map((item) => (
        <ChecklistRow
          key={item.id}
          item={item}
          checked={completed.has(item.id)}
          onToggle={() => onToggleItem(item.id)}
        />
      ))}
    </View>
  );
}