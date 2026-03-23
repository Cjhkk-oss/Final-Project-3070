import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { styles } from "../styles";
import GuideModal from "../components/GuideModal";

function GuidesScreen({
  search,
  onChangeSearch,
  disasterGuides,
  survivalSkills,
  onOpenGuide,
}) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Guides & Survival Skills</Text>
      <Text style={styles.sectionBody}>
        Search for concise, step-by-step emergency guidance.
      </Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search guides..."
        value={search}
        onChangeText={onChangeSearch}
      />

      <Text style={styles.subsectionTitle}>Disaster Guides</Text>
      {disasterGuides.length === 0 ? (
        <Text style={styles.cardBody}>No disaster guides found.</Text>
      ) : (
        disasterGuides.map((guide) => (
          <TouchableOpacity
            key={guide.id}
            style={styles.card}
            onPress={() => onOpenGuide(guide, "guide")}
          >
            <Text style={styles.cardTitle}>
              {guide.icon} {guide.title}
            </Text>
            <Text style={styles.cardBody}>
              Tap to view step-by-step emergency actions.
            </Text>
          </TouchableOpacity>
        ))
      )}

      <Text style={styles.subsectionTitle}>Survival Skills</Text>
      {survivalSkills.length === 0 ? (
        <Text style={styles.cardBody}>No survival skills found.</Text>
      ) : (
        survivalSkills.map((skill) => (
          <TouchableOpacity
            key={skill.id}
            style={styles.card}
            onPress={() => onOpenGuide(skill, "skill")}
          >
            <Text style={styles.cardTitle}>
              {skill.icon} {skill.title}
            </Text>
            <Text style={styles.cardBody}>
              Tap to view practical survival instructions.
            </Text>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
}

GuidesScreen.ModalWrapper = function ModalWrapper({ guide, type, onClose }) {
  return <GuideModal visible={!!guide} guide={guide} type={type} onClose={onClose} />;
};

export default GuidesScreen;