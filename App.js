import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  Alert,
  Linking,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { styles } from "./styles";
import TabButton from "./components/TabButton";
import PrepScreen from "./screens/PrepScreen";
import AlertsScreen from "./screens/AlertsScreen";
import GuidesScreen from "./screens/GuidesScreen";
import ResourcesScreen from "./screens/ResourcesScreen";

import {
  KIT_ITEMS,
  DISASTER_GUIDES,
  SURVIVAL_SKILLS,
  SHELTERS,
  EMERGENCY_CONTACTS,
} from "./data/content";

import {
  getBadge,
  getCompletionPercentage,
  getWeatherRiskSummary,
  getQuakeSummary,
  haversineKm,
  fmt,
} from "./utils/helpers";

const CHECKLIST_STORAGE_KEY = "disaster_prep_checklist_v1";

export default function App() {
  const [activeTab, setActiveTab] = useState("prep");

  const [completed, setCompleted] = useState(new Set());
  const [hasLoadedChecklist, setHasLoadedChecklist] = useState(false);

  const [guideSearch, setGuideSearch] = useState("");
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [selectedGuideType, setSelectedGuideType] = useState("guide");

  const [coords, setCoords] = useState(null);
  const [placeLabel, setPlaceLabel] = useState("");
  const [locationStatus, setLocationStatus] = useState("Requesting location...");
  const [locationLoading, setLocationLoading] = useState(false);

  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState("");

  const [quakes, setQuakes] = useState([]);
  const [quakeLoading, setQuakeLoading] = useState(false);
  const [quakeError, setQuakeError] = useState("");

  useEffect(() => {
    const initialiseApp = async () => {
      await loadChecklist();
      getLocationAndAlerts();
    };

    initialiseApp();
  }, []);

  useEffect(() => {
    if (!hasLoadedChecklist) return;

    const saveChecklist = async () => {
      try {
        await AsyncStorage.setItem(
          CHECKLIST_STORAGE_KEY,
          JSON.stringify([...completed])
        );
      } catch (error) {
        console.log("Failed to save checklist:", error);
      }
    };

    saveChecklist();
  }, [completed, hasLoadedChecklist]);

  const totalPoints = useMemo(
    () => KIT_ITEMS.reduce((sum, item) => sum + item.points, 0),
    []
  );

  const earnedPoints = useMemo(() => {
    return KIT_ITEMS.filter((item) => completed.has(item.id)).reduce(
      (sum, item) => sum + item.points,
      0
    );
  }, [completed]);

  const completionPercentage = useMemo(() => {
    return getCompletionPercentage(completed.size, KIT_ITEMS.length);
  }, [completed]);

  const badge = useMemo(() => {
    return getBadge(earnedPoints, completed.size, KIT_ITEMS.length);
  }, [earnedPoints, completed]);

  const nearestShelter = useMemo(() => {
    if (!coords) return null;

    let nearest = null;
    let minDistance = Infinity;

    for (const shelter of SHELTERS) {
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
  }, [coords]);

  const filteredDisasterGuides = useMemo(() => {
    return DISASTER_GUIDES.filter((guide) =>
      guide.title.toLowerCase().includes(guideSearch.toLowerCase())
    );
  }, [guideSearch]);

  const filteredSurvivalSkills = useMemo(() => {
    return SURVIVAL_SKILLS.filter((skill) =>
      skill.title.toLowerCase().includes(guideSearch.toLowerCase())
    );
  }, [guideSearch]);

  async function loadChecklist() {
    try {
      const saved = await AsyncStorage.getItem(CHECKLIST_STORAGE_KEY);

      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setCompleted(new Set(parsed));
        }
      }
    } catch (error) {
      console.log("Failed to load checklist:", error);
    } finally {
      setHasLoadedChecklist(true);
    }
  }

  function toggleChecklistItem(itemId) {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  }

  function resetChecklist() {
    Alert.alert(
      "Reset checklist",
      "Are you sure you want to clear all saved checklist progress?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              setCompleted(new Set([]));
              await AsyncStorage.removeItem(CHECKLIST_STORAGE_KEY);
              console.log("Checklist reset successfully");
            } catch (error) {
              console.log("Reset failed:", error);
            }
          },
        },
      ]
    );
  }

  async function getLocationAndAlerts() {
    setLocationLoading(true);
    setLocationStatus("Requesting location...");
    setWeatherError("");
    setQuakeError("");

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setLocationStatus("Location permission denied.");
        setCoords(null);
        setPlaceLabel("");
        return;
      }

      setLocationStatus("Fetching current location...");
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newCoords = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      };

      setCoords(newCoords);
      setLocationStatus("Location available.");

      try {
        const places = await Location.reverseGeocodeAsync(newCoords);
        if (places && places.length > 0) {
          const place = places[0];
          const label = [place.name, place.city, place.region]
            .filter(Boolean)
            .join(", ");
          setPlaceLabel(label);
        } else {
          setPlaceLabel("");
        }
      } catch (error) {
        console.log("Reverse geocode failed:", error);
        setPlaceLabel("");
      }

      await Promise.all([fetchWeather(newCoords), fetchQuakes(newCoords)]);
    } catch (error) {
      console.log("Location error:", error);
      setLocationStatus("Unable to retrieve location.");
      setCoords(null);
      setPlaceLabel("");
    } finally {
      setLocationLoading(false);
    }
  }

  async function fetchWeather(currentCoords) {
    setWeatherLoading(true);
    setWeatherError("");

    try {
      const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${currentCoords.latitude}` +
        `&longitude=${currentCoords.longitude}` +
        `&current=temperature_2m,precipitation,wind_speed_10m`;

      const response = await fetch(url);
      const json = await response.json();

      if (!json.current) {
        throw new Error("No current weather data found.");
      }

      setWeatherData(json.current);
    } catch (error) {
      console.log("Weather fetch failed:", error);
      setWeatherError("Unable to load weather data.");
      setWeatherData(null);
    } finally {
      setWeatherLoading(false);
    }
  }

  async function fetchQuakes(currentCoords) {
    setQuakeLoading(true);
    setQuakeError("");

    try {
      const response = await fetch(
        "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson"
      );
      const json = await response.json();

      if (!json.features || !Array.isArray(json.features)) {
        throw new Error("No earthquake data found.");
      }

      const recentNearbyQuakes = json.features
        .map((feature) => {
          const [lon, lat] = feature.geometry.coordinates;
          const distanceKm = haversineKm(
            currentCoords.latitude,
            currentCoords.longitude,
            lat,
            lon
          );

          return {
            id: feature.id,
            place: feature.properties.place,
            mag: feature.properties.mag,
            time: feature.properties.time,
            distanceKm,
          };
        })
        .filter(
          (quake) =>
            quake.distanceKm <= 1000 &&
            typeof quake.mag === "number" &&
            quake.mag >= 1
        )
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, 5);

      setQuakes(recentNearbyQuakes);
    } catch (error) {
      console.log("Quake fetch failed:", error);
      setQuakeError("Unable to load earthquake data.");
      setQuakes([]);
    } finally {
      setQuakeLoading(false);
    }
  }

  function openGuide(guide, type = "guide") {
    setSelectedGuide(guide);
    setSelectedGuideType(type);
  }

  function closeGuide() {
    setSelectedGuide(null);
  }

  function openMapToNearestShelter() {
    if (!nearestShelter) return;

    const url = `https://www.google.com/maps/search/?api=1&query=${nearestShelter.lat},${nearestShelter.lon}`;
    Linking.openURL(url).catch((error) => {
      console.log("Failed to open map:", error);
      Alert.alert("Error", "Unable to open mapping application.");
    });
  }

  function callEmergencyContact(phoneNumber) {
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url).catch((error) => {
      console.log("Failed to open dialer:", error);
      Alert.alert("Error", "Unable to open phone dialer.");
    });
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Text style={styles.title}>Disaster Prep</Text>
        <Text style={styles.subtitle}>
          Preparedness, alerts, guides, and local resources in one app
        </Text>
      </View>

      <View style={styles.tabs}>
        <TabButton
          label="Prep"
          active={activeTab === "prep"}
          onPress={() => setActiveTab("prep")}
        />
        <TabButton
          label="Alerts"
          active={activeTab === "alerts"}
          onPress={() => setActiveTab("alerts")}
        />
        <TabButton
          label="Guides"
          active={activeTab === "guides"}
          onPress={() => setActiveTab("guides")}
        />
        <TabButton
          label="Resources"
          active={activeTab === "resources"}
          onPress={() => setActiveTab("resources")}
        />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "prep" && (
          <PrepScreen
            kitItems={KIT_ITEMS}
            completed={completed}
            onToggleItem={toggleChecklistItem}
            earnedPoints={earnedPoints}
            totalPoints={totalPoints}
            completionPercentage={completionPercentage}
            badge={badge}
            onResetChecklist={resetChecklist}
          />
        )}

        {activeTab === "alerts" && (
          <AlertsScreen
            coords={coords}
            placeLabel={placeLabel}
            locationStatus={locationStatus}
            locationLoading={locationLoading}
            weatherData={weatherData}
            weatherLoading={weatherLoading}
            weatherError={weatherError}
            quakes={quakes}
            quakeLoading={quakeLoading}
            quakeError={quakeError}
            onRefresh={getLocationAndAlerts}
            weatherSummary={getWeatherRiskSummary(weatherData)}
            quakeSummary={getQuakeSummary(quakes)}
            fmt={fmt}
          />
        )}

        {activeTab === "guides" && (
          <GuidesScreen
            search={guideSearch}
            onChangeSearch={setGuideSearch}
            disasterGuides={filteredDisasterGuides}
            survivalSkills={filteredSurvivalSkills}
            onOpenGuide={openGuide}
          />
        )}

        {activeTab === "resources" && (
          <ResourcesScreen
            emergencyContacts={EMERGENCY_CONTACTS}
            coords={coords}
            placeLabel={placeLabel}
            nearestShelter={nearestShelter}
            onOpenMap={openMapToNearestShelter}
            onCallContact={callEmergencyContact}
          />
        )}
      </ScrollView>

      {selectedGuide && (
        <GuidesScreen.ModalWrapper
          guide={selectedGuide}
          type={selectedGuideType}
          onClose={closeGuide}
        />
      )}
    </SafeAreaView>
  );
}