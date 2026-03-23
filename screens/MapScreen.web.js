import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, Linking, ScrollView } from "react-native";
import { styles } from "../styles";
import { haversineKm } from "../utils/helpers";

export default function MapScreen({ coords = null, shelters = [] }) {
  const nearestShelter = useMemo(() => {
    if (!coords || !shelters.length) return null;

    let nearest = null;
    let minDistance = Infinity;

    for (const shelter of shelters) {
      const distance = haversineKm(
        coords.latitude,
        coords.longitude,
        shelter.lat,
        shelter.lon
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearest = { ...shelter, distanceKm: distance };
      }
    }

    return nearest;
  }, [coords, shelters]);

  const openShelterInMaps = () => {
    if (!nearestShelter) return;

    const url = `https://www.google.com/maps/search/?api=1&query=${nearestShelter.lat},${nearestShelter.lon}`;
    Linking.openURL(url).catch((error) => {
      console.log("Failed to open maps:", error);
    });
  };

  return (
    <ScrollView
      style={styles.screenScroll}
      contentContainerStyle={styles.screenScrollContent}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.sectionTitle}>Shelter Map</Text>
      <Text style={styles.sectionBody}>
        Interactive map view is best supported on mobile. On web, you can still view the
        nearest shelter and open it in Google Maps.
      </Text>

      {!coords ? (
        <View style={styles.card}>
          <Text style={styles.cardBody}>
            Enable location services to calculate the nearest shelter.
          </Text>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Location</Text>
          <Text style={styles.cardBody}>
            Latitude {coords.latitude.toFixed(5)}, Longitude {coords.longitude.toFixed(5)}
          </Text>
        </View>
      )}

      <View style={styles.mapInfoCard}>
        <Text style={styles.cardTitle}>Nearest Shelter</Text>

        {nearestShelter ? (
          <>
            <Text style={styles.cardBody}>{nearestShelter.name}</Text>
            <Text style={styles.cardBody}>{nearestShelter.address}</Text>
            <Text style={styles.summaryHighlight}>
              Approx. {nearestShelter.distanceKm.toFixed(2)} km away
            </Text>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={openShelterInMaps}
            >
              <Text style={styles.primaryButtonText}>Open in Maps</Text>
            </TouchableOpacity>
          </>
        ) : (
          <Text style={styles.cardBody}>No nearby shelter data available.</Text>
        )}
      </View>

      <Text style={styles.subsectionTitle}>Available Shelters</Text>
      {shelters.map((shelter) => (
        <View key={shelter.id} style={styles.card}>
          <Text style={styles.cardTitle}>{shelter.name}</Text>
          <Text style={styles.cardBody}>{shelter.address}</Text>
        </View>
      ))}
    </ScrollView>
  );
}