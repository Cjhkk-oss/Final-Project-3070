import React from "react";
import { View, Text, TouchableOpacity, Linking, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { styles } from "../styles";

export default function EmergencyModeScreen() {
  const navigation = useNavigation();

  const callNow = (number) => {
    Linking.openURL(`tel:${number}`).catch(() => {});
  };

  return (
    <ScrollView style={styles.emergencyWrap} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.secondaryButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.emergencyTitle}>Emergency Mode</Text>
      <Text style={styles.emergencyText}>
        Fast access to critical actions during a high-stress situation.
      </Text>

      <View style={styles.emergencyCard}>
        <Text style={styles.cardTitle}>Immediate Priorities</Text>
        <Text style={styles.cardBody}>1. Stay calm and assess danger.</Text>
        <Text style={styles.cardBody}>2. Move to a safer location if needed.</Text>
        <Text style={styles.cardBody}>3. Contact emergency services if required.</Text>
      </View>

      <TouchableOpacity style={styles.dangerButton} onPress={() => callNow("999")}>
        <Text style={styles.dangerButtonText}>Call Police / Emergency</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.dangerButton} onPress={() => callNow("995")}>
        <Text style={styles.dangerButtonText}>Call Ambulance / Fire</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}