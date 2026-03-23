import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, Linking } from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
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

  if (!coords) {
    return (
      <View style={styles.screenPad}>
        <Text style={styles.sectionTitle}>Shelter Map</Text>
        <Text style={styles.sectionBody}>
          Enable location services to view your current position and nearby shelters.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.mapScreenWrap}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
      >
        <Marker
          coordinate={{
            latitude: coords.latitude,
            longitude: coords.longitude,
          }}
          title="You are here"
          pinColor="blue"
        />

        <Circle
          center={{
            latitude: coords.latitude,
            longitude: coords.longitude,
          }}
          radius={500}
          strokeColor="rgba(47,111,237,0.35)"
          fillColor="rgba(47,111,237,0.10)"
        />

        {shelters.map((shelter) => {
          const isNearest = nearestShelter?.id === shelter.id;

          return (
            <Marker
              key={shelter.id}
              coordinate={{
                latitude: shelter.lat,
                longitude: shelter.lon,
              }}
              title={shelter.name}
              description={shelter.address || "Emergency shelter"}
              pinColor={isNearest ? "green" : "red"}
            />
          );
        })}
      </MapView>

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
    </View>
  );
}