import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../styles";

export default function ResourcesScreen({
  emergencyContacts = [],
  coords = null,
  placeLabel = "",
  nearestShelter = null,
  onOpenMap = () => {},
  onCallContact = () => {},
}) {
  return (
    <View>
      <Text style={styles.sectionTitle}>Resources</Text>
      <Text style={styles.sectionBody}>
        Access emergency numbers and find the nearest shelter.
      </Text>

      <Text style={styles.subsectionTitle}>Emergency Contacts</Text>
      {emergencyContacts.map((contact) => (
        <TouchableOpacity
          key={contact.id}
          style={styles.card}
          onPress={() => onCallContact(contact.number)}
        >
          <Text style={styles.cardTitle}>{contact.name}</Text>
          <Text style={styles.cardBody}>{contact.number}</Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.subsectionTitle}>Nearest Shelter</Text>
      {!coords ? (
        <View style={styles.card}>
          <Text style={styles.cardBody}>
            Enable location to view the nearest shelter.
          </Text>
        </View>
      ) : nearestShelter ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{nearestShelter.name}</Text>
          <Text style={styles.cardBody}>{nearestShelter.address}</Text>
          <Text style={styles.cardBody}>
            Approx. {nearestShelter.distanceKm.toFixed(1)} km away
          </Text>
          <Text style={styles.cardBody}>
            {placeLabel ? `Based on your location near ${placeLabel}` : "Based on your current location"}
          </Text>

          <TouchableOpacity style={styles.primaryButton} onPress={onOpenMap}>
            <Text style={styles.primaryButtonText}>Open in Maps</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardBody}>No shelter data available.</Text>
        </View>
      )}
    </View>
  );
}