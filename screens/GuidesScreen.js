import React from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { styles } from "../styles";
import GuideModal from "../components/GuideModal";

export default function GuidesScreen({
  search = "",
  onChangeSearch = () => {},
  disasterGuides = [],
  survivalSkills = [],
  onOpenGuide = () => {},
  selectedGuide = null,
  selectedGuideType = "guide",
  onCloseGuide = () => {},
}) {
  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.screenScroll}
        contentContainerStyle={styles.screenScrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.sectionTitle}>Guides</Text>
        <Text style={styles.sectionBody}>
          Tap a guide to view step-by-step emergency instructions.
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
              activeOpacity={0.8}
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
              activeOpacity={0.8}
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
      </ScrollView>

      <GuideModal
        visible={!!selectedGuide}
        guide={selectedGuide}
        type={selectedGuideType}
        onClose={onCloseGuide}
      />
    </View>
  );
}