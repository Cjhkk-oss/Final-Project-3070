import React from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView } from "react-native";
import { styles } from "../styles";

export default function GuideModal({ visible, guide, type, onClose }) {
  if (!guide) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {guide.icon} {guide.title}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.modalClose}>Close</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.modalSubheading}>
            {type === "skill" ? "Survival Skill" : "Disaster Guide"}
          </Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {guide.steps.map((step, index) => (
              <View key={`${guide.id}-${index}`} style={styles.stepRow}>
                <Text style={styles.stepNumber}>{index + 1}.</Text>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}