import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../styles";

const slides = [
  {
    title: "Prepare Before Emergencies",
    text: "Track your emergency kit and measure your readiness.",
  },
  {
    title: "Understand Local Risk",
    text: "Check weather conditions and nearby earthquake activity.",
  },
  {
    title: "Get Help Fast",
    text: "Access guides, shelters, and emergency contacts quickly.",
  },
];

export default function OnboardingScreen({ onFinish }) {
  const [index, setIndex] = useState(0);
  const slide = slides[index];

  return (
    <View style={styles.screenPad}>
      <Text style={styles.sectionTitle}>{slide.title}</Text>
      <Text style={styles.sectionBody}>{slide.text}</Text>

      <View style={{ flexDirection: "row", gap: 8, marginVertical: 24 }}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              i === index ? styles.dotActive : null,
            ]}
          />
        ))}
      </View>

      {index < slides.length - 1 ? (
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setIndex(index + 1)}
        >
          <Text style={styles.primaryButtonText}>Next</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.primaryButton} onPress={onFinish}>
          <Text style={styles.primaryButtonText}>Enter App</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}