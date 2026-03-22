import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator,
  Linking,
} from "react-native";
import * as Location from "expo-location";

/**
 * Expanded prototype scope (still feasible):
 * - Gamified preparedness task ("Build an Emergency Kit") ✅
 * - Points + badge logic ✅
 * - Progress visualization ✅
 * - Simulated emergency alert modal ✅
 * - Weather report (real API, no key) ✅
 * - Nearby earthquake alerts (real API) ✅
 * - Nearest shelter finder (static dataset + distance) ✅
 * - Guides: disaster instructions + survival skills (static content module) ✅
 *
 * Notes:
 * - Weather uses Open-Meteo (no API key required)
 * - Earthquake alerts use USGS event service (GeoJSON)
 * - Shelters are static for prototype; can be replaced by official data sources later
 */

const KIT_ITEMS = [
  { id: "water", label: "Water (at least 3L per person)", points: 10 },
  { id: "food", label: "Non-perishable food (3-day supply)", points: 10 },
  { id: "firstaid", label: "First aid kit", points: 15 },
  { id: "torch", label: "Torch + spare batteries", points: 10 },
  { id: "radio", label: "Portable radio / power bank", points: 10 },
  { id: "meds", label: "Essential medication list + supplies", points: 15 },
  { id: "docs", label: "Copies of important documents (waterproof)", points: 15 },
  { id: "cash", label: "Cash in small notes", points: 5 },
  { id: "whistle", label: "Whistle / basic signalling tool", points: 5 },
  { id: "mask", label: "Masks / hygiene items", points: 5 },
];

// Prototype shelter dataset (replace with official sources later)
const SHELTERS = [
  {
    id: "s1",
    name: "Community Shelter A",
    lat: 1.3000,
    lon: 103.8000,
    address: "Shelter 1",
  },
  {
    id: "s2",
    name: "Community Shelter B",
    lat: 1.3100,
    lon: 103.8200,
    address: "Shelter 2",
  },
  {
    id: "s3",
    name: "Community Shelter C",
    lat: 1.2900,
    lon: 103.8500,
    address: "Shelter 3",
  },
];

// Guides content (static for prototype)
const DISASTER_GUIDES = [
  {
    id: "earthquake",
    title: "Earthquake",
    steps: [
      "Drop, Cover, Hold On.",
      "Stay away from windows and unsecured furniture.",
      "When shaking stops, check injuries and hazards.",
      "If outdoors, move away from buildings and power lines.",
    ],
  },
  {
    id: "flood",
    title: "Flood",
    steps: [
      "Move to higher ground immediately.",
      "Avoid walking or driving through floodwater.",
      "Switch off electricity if safe to do so.",
      "Follow official evacuation instructions early.",
    ],
  },
  {
    id: "fire",
    title: "Fire / Smoke",
    steps: [
      "Evacuate early if instructed.",
      "Keep low to reduce smoke inhalation.",
      "Cover nose and mouth with cloth if needed.",
      "Do not re-enter buildings after evacuation.",
    ],
  },
  {
    id: "storm",
    title: "Storm / Severe Weather",
    steps: [
      "Stay indoors and away from windows.",
      "Secure loose outdoor items if time permits.",
      "Avoid flooded roads and downed power lines.",
      "Charge devices and keep emergency supplies close.",
    ],
  },
];

const SURVIVAL_SKILLS = [
  {
    id: "bandage",
    title: "Bandage a Wound (Basic)",
    steps: [
      "Apply direct pressure to stop bleeding.",
      "Clean around the wound if possible.",
      "Cover with sterile dressing and secure with bandage.",
      "Seek medical help if bleeding won’t stop or wound is deep.",
    ],
  },
  {
    id: "shelter",
    title: "Set Up a Basic Shelter",
    steps: [
      "Choose dry ground away from hazards.",
      "Use tarp/poncho and cord to create a simple lean-to.",
      "Anchor corners securely (rocks, stakes, heavy objects).",
      "Keep ventilation and avoid enclosed smoke exposure.",
    ],
  },
  {
    id: "water",
    title: "Safe Drinking Water (Basic)",
    steps: [
      "Use sealed bottled water first.",
      "If unsure, boil water where possible.",
      "If boiling is not possible, use water purification tablets/filters.",
      "Avoid water that smells chemical or looks contaminated.",
    ],
  },
];

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
function deg2rad(d) {
  return (d * Math.PI) / 180;
}

function getBadge(points, completedCount, totalCount) {
  const completionRate = totalCount === 0 ? 0 : completedCount / totalCount;

  if (completionRate >= 0.9 && points >= 90) return "Gold Responder";
  if (completionRate >= 0.5 && points >= 50) return "Silver Prepared";
  if (completionRate > 0) return "Bronze Starter";
  return "No badge yet";
}

export default function App() {
  // Existing state
  const [completed, setCompleted] = useState(() => new Set());
  const [activeTab, setActiveTab] = useState("prep"); // "prep" | "alerts" | "guides" | "resources"
  const [alertOpen, setAlertOpen] = useState(false);

  // New: location state
  const [locStatus, setLocStatus] = useState({ loading: true, error: null });
  const [coords, setCoords] = useState(null); // { latitude, longitude }

  // New: weather state
  const [weatherState, setWeatherState] = useState({
    loading: false,
    error: null,
    data: null,
  });

  // New: earthquakes state
  const [quakeState, setQuakeState] = useState({
    loading: false,
    error: null,
    items: [],
    updatedAt: null,
  });

  // Guides selection
  const [guideOpen, setGuideOpen] = useState(false);
  const [guideItem, setGuideItem] = useState(null);

  const { completedCount, totalCount, progress, points, badge } = useMemo(() => {
    const total = KIT_ITEMS.length;
    const done = completed.size;
    const prog = total === 0 ? 0 : done / total;

    let pts = 0;
    for (const item of KIT_ITEMS) {
      if (completed.has(item.id)) pts += item.points;
    }

    return {
      completedCount: done,
      totalCount: total,
      progress: prog,
      points: pts,
      badge: getBadge(pts, done, total),
    };
  }, [completed]);

  // Compute nearest shelter (prototype)
  const nearestShelter = useMemo(() => {
    if (!coords) return null;
    let best = null;
    for (const s of SHELTERS) {
      const d = haversineKm(coords.latitude, coords.longitude, s.lat, s.lon);
      if (!best || d < best.distanceKm) best = { ...s, distanceKm: d };
    }
    return best;
  }, [coords]);

  const toggleItem = (id) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const resetProgress = () => {
    Alert.alert("Reset progress?", "This will clear your checklist and points.", [
      { text: "Cancel", style: "cancel" },
      { text: "Reset", style: "destructive", onPress: () => setCompleted(new Set()) },
    ]);
  };

  // --------------- Location ---------------
  useEffect(() => {
    (async () => {
      try {
        setLocStatus({ loading: true, error: null });

        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          setLocStatus({ loading: false, error: "Location permission not granted" });
          return;
        }

        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setLocStatus({ loading: false, error: null });
      } catch (e) {
        setLocStatus({ loading: false, error: String(e.message || e) });
      }
    })();
  }, []);

  // --------------- Weather ---------------
  const fetchWeather = async () => {
    if (!coords) return;
    try {
      setWeatherState({ loading: true, error: null, data: null });

      const url =
        `https://api.open-meteo.com/v1/forecast` +
        `?latitude=${coords.latitude}&longitude=${coords.longitude}` +
        `&current=temperature_2m,precipitation,wind_speed_10m` +
        `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum` +
        `&forecast_days=3`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Weather request failed (${res.status})`);
      const json = await res.json();

      setWeatherState({ loading: false, error: null, data: json });
    } catch (e) {
      setWeatherState({ loading: false, error: String(e.message || e), data: null });
    }
  };

  // Auto-fetch weather once we have coords
  useEffect(() => {
    if (coords) fetchWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords?.latitude, coords?.longitude]);

  // --------------- Earthquakes (USGS) ---------------
  const fetchEarthquakes = async () => {
    if (!coords) return;
    try {
      setQuakeState((s) => ({ ...s, loading: true, error: null }));

      // Past 7 days, within 300km, magnitude >= 2.5 (tune for your demo)
      const url =
        `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson` +
        `&starttime=${encodeURIComponent(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())}` +
        `&latitude=${coords.latitude}&longitude=${coords.longitude}` +
        `&maxradiuskm=300&minmagnitude=2.5&orderby=time`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Earthquake request failed (${res.status})`);
      const json = await res.json();

      const features = Array.isArray(json.features) ? json.features : [];
      const items = features.slice(0, 15).map((f) => {
        const props = f.properties || {};
        const geom = f.geometry || {};
        const c = Array.isArray(geom.coordinates) ? geom.coordinates : [];
        const lon = c[0];
        const lat = c[1];
        const mag = props.mag;
        const place = props.place || "Unknown location";
        const time = props.time ? new Date(props.time) : null;
        const detailUrl = props.url || null;

        const distanceKm =
          typeof lat === "number" && typeof lon === "number"
            ? haversineKm(coords.latitude, coords.longitude, lat, lon)
            : null;

        return {
          id: f.id || `${place}-${props.time}`,
          mag,
          place,
          time,
          lat,
          lon,
          distanceKm,
          detailUrl,
        };
      });

      setQuakeState({
        loading: false,
        error: null,
        items,
        updatedAt: new Date(),
      });
    } catch (e) {
      setQuakeState((s) => ({ ...s, loading: false, error: String(e.message || e) }));
    }
  };

  // Auto-fetch quakes once we have coords
  useEffect(() => {
    if (coords) fetchEarthquakes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords?.latitude, coords?.longitude]);

  const openMapsToShelter = async () => {
    if (!nearestShelter) return;
    const { lat, lon, name } = nearestShelter;
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) throw new Error("Cannot open maps on this device");
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert("Unable to open maps", String(e.message || e));
    }
  };

  const openQuakeDetail = async (url) => {
    if (!url) return;
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) throw new Error("Cannot open link on this device");
      await Linking.openURL(url);
    } catch (e) {
      Alert.alert("Unable to open link", String(e.message || e));
    }
  };

  const openGuide = (item) => {
    setGuideItem(item);
    setGuideOpen(true);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Disaster Prep (Prototype)</Text>
        <Text style={styles.subtitle}>
          Gamified preparedness + alerts + location + guides
        </Text>
      </View>

      <View style={styles.tabs}>
        <TabButton label="Prep" active={activeTab === "prep"} onPress={() => setActiveTab("prep")} />
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

      {activeTab === "prep" && (
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Task: Build an Emergency Kit</Text>
            <Text style={styles.cardMeta}>
              Progress: {completedCount}/{totalCount} • Points: {points} • Badge: {badge}
            </Text>

            <ProgressBar value={progress} />

            <View style={styles.actionsRow}>
              <Pressable style={[styles.btn, styles.btnPrimary]} onPress={() => setAlertOpen(true)}>
                <Text style={styles.btnTextPrimary}>Simulate Emergency Alert</Text>
              </Pressable>

              <Pressable style={[styles.btn, styles.btnGhost]} onPress={resetProgress}>
                <Text style={styles.btnTextGhost}>Reset</Text>
              </Pressable>
            </View>
          </View>

          <View style={[styles.card, { flex: 1 }]}>
            <Text style={styles.cardTitle}>Checklist</Text>
            <FlatList
              data={KIT_ITEMS}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 16 }}
              renderItem={({ item }) => (
                <ChecklistRow
                  label={item.label}
                  points={item.points}
                  checked={completed.has(item.id)}
                  onPress={() => toggleItem(item.id)}
                />
              )}
            />
          </View>

          <EmergencyAlertModal
            visible={alertOpen}
            onClose={() => setAlertOpen(false)}
            points={points}
            badge={badge}
          />
        </View>
      )}

      {activeTab === "alerts" && (
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Location Status</Text>
            {locStatus.loading ? (
              <View style={styles.inlineRow}>
                <ActivityIndicator />
                <Text style={styles.cardBody}> Requesting location permission…</Text>
              </View>
            ) : locStatus.error ? (
              <Text style={styles.errorText}>⚠️ {locStatus.error}</Text>
            ) : (
              <Text style={styles.cardBody}>
                Latitude: {coords?.latitude?.toFixed(5)} • Longitude: {coords?.longitude?.toFixed(5)}
              </Text>
            )}
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Weather (Local)</Text>
              <Pressable
                style={[styles.smallBtn]}
                onPress={fetchWeather}
                disabled={!coords || weatherState.loading}
              >
                <Text style={styles.smallBtnText}>
                  {weatherState.loading ? "Refreshing…" : "Refresh"}
                </Text>
              </Pressable>
            </View>

            {!coords ? (
              <Text style={styles.cardBody}>Enable location to load weather.</Text>
            ) : weatherState.error ? (
              <Text style={styles.errorText}>⚠️ {weatherState.error}</Text>
            ) : weatherState.loading ? (
              <View style={styles.inlineRow}>
                <ActivityIndicator />
                <Text style={styles.cardBody}> Loading weather…</Text>
              </View>
            ) : weatherState.data ? (
              <WeatherCard data={weatherState.data} />
            ) : (
              <Text style={styles.cardBody}>No weather data yet.</Text>
            )}
          </View>

          <View style={[styles.card, { flex: 1 }]}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Nearby Earthquakes (Last 7 Days)</Text>
              <Pressable
                style={[styles.smallBtn]}
                onPress={fetchEarthquakes}
                disabled={!coords || quakeState.loading}
              >
                <Text style={styles.smallBtnText}>
                  {quakeState.loading ? "Refreshing…" : "Refresh"}
                </Text>
              </Pressable>
            </View>

            {quakeState.error ? <Text style={styles.errorText}>⚠️ {quakeState.error}</Text> : null}

            {quakeState.updatedAt ? (
              <Text style={styles.cardMeta}>
                Updated: {quakeState.updatedAt.toLocaleString()}
              </Text>
            ) : null}

            <FlatList
              data={quakeState.items}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ paddingBottom: 14 }}
              ListEmptyComponent={
                quakeState.loading ? (
                  <View style={styles.inlineRow}>
                    <ActivityIndicator />
                    <Text style={styles.cardBody}> Loading alerts…</Text>
                  </View>
                ) : (
                  <Text style={styles.cardBody}>No recent earthquakes found in range.</Text>
                )
              }
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => item.detailUrl && openQuakeDetail(item.detailUrl)}
                  style={styles.quakeRow}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.quakeTitle}>
                      M{typeof item.mag === "number" ? item.mag.toFixed(1) : "?"} •{" "}
                      {item.distanceKm != null ? `${item.distanceKm.toFixed(0)}km away` : "distance ?"}
                    </Text>
                    <Text style={styles.quakePlace}>{item.place}</Text>
                    <Text style={styles.quakeTime}>
                      {item.time ? item.time.toLocaleString() : "time unknown"}
                    </Text>
                  </View>
                  <Text style={styles.quakeLink}>{item.detailUrl ? "↗" : ""}</Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      )}

      {activeTab === "guides" && (
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Disaster Instructions</Text>
            <Text style={styles.cardBody}>
              Select a disaster type to see recommended actions. 
            </Text>
            <View style={{ height: 10 }} />
            {DISASTER_GUIDES.map((g) => (
              <Pressable key={g.id} style={styles.guideBtn} onPress={() => openGuide(g)}>
                <Text style={styles.guideBtnText}>{g.title}</Text>
                <Text style={styles.guideChevron}>›</Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Survival Skills</Text>
            <Text style={styles.cardBody}>
              Quick reference for essential skills. 
            </Text>
            <View style={{ height: 10 }} />
            {SURVIVAL_SKILLS.map((s) => (
              <Pressable key={s.id} style={styles.guideBtn} onPress={() => openGuide(s)}>
                <Text style={styles.guideBtnText}>{s.title}</Text>
                <Text style={styles.guideChevron}>›</Text>
              </Pressable>
            ))}
          </View>

          <GuideModal visible={guideOpen} onClose={() => setGuideOpen(false)} item={guideItem} />
        </View>
      )}

      {activeTab === "resources" && (
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Local Resource Hub</Text>
            <Text style={styles.cardBody}>
              This prototype uses static information and a sample shelter dataset. In later iterations,
              data could be populated from official sources or verified APIs.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Emergency Contacts (Example)</Text>
            <Text style={styles.resourceItem}>• Emergency Services: 999 / 112</Text>
            <Text style={styles.resourceItem}>• Non-emergency hotline: (your local number)</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Nearest Shelter (Prototype)</Text>
            {!coords ? (
              <Text style={styles.cardBody}>Enable location to find nearest shelter.</Text>
            ) : !nearestShelter ? (
              <Text style={styles.cardBody}>No shelter data available.</Text>
            ) : (
              <>
                <Text style={styles.resourceItem}>
                  • {nearestShelter.name} ({nearestShelter.distanceKm.toFixed(2)} km)
                </Text>
                <Text style={styles.resourceItem}>• {nearestShelter.address}</Text>
                <Pressable style={[styles.btn, styles.btnPrimary]} onPress={openMapsToShelter}>
                  <Text style={styles.btnTextPrimary}>Open in Maps</Text>
                </Pressable>
              </>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Quick Guidelines</Text>
            <Text style={styles.resourceItem}>• Keep phone charged and carry a power bank.</Text>
            <Text style={styles.resourceItem}>• Follow official advisories and avoid rumours.</Text>
            <Text style={styles.resourceItem}>• If evacuation is advised, leave early.</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

/** ---------- UI Components ---------- */

function TabButton({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.tabBtn, active ? styles.tabBtnActive : styles.tabBtnInactive]}
    >
      <Text style={[styles.tabText, active ? styles.tabTextActive : styles.tabTextInactive]}>
        {label}
      </Text>
    </Pressable>
  );
}

function ProgressBar({ value }) {
  const pct = clamp(Math.round(value * 100), 0, 100);
  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${pct}%` }]} />
      </View>
      <Text style={styles.progressLabel}>{pct}% complete</Text>
    </View>
  );
}

function ChecklistRow({ label, points, checked, onPress }) {
  return (
    <Pressable onPress={onPress} style={[styles.row, checked && styles.rowChecked]}>
      <View style={styles.rowLeft}>
        <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
          <Text style={styles.checkboxText}>{checked ? "✓" : ""}</Text>
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
      </View>
      <Text style={styles.rowPoints}>+{points}</Text>
    </Pressable>
  );
}

function EmergencyAlertModal({ visible, onClose, points, badge }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>⚠️ Emergency Alert (Simulated)</Text>
          <Text style={styles.modalMeta}>
            This simulates a location-based notification + guided response.
          </Text>

          <ScrollView style={{ maxHeight: 280 }} contentContainerStyle={{ paddingBottom: 12 }}>
            <Text style={styles.modalSectionTitle}>What to do now</Text>
            <Text style={styles.modalBullet}>1) Stay calm and check for official updates.</Text>
            <Text style={styles.modalBullet}>2) Grab your emergency kit and phone charger.</Text>
            <Text style={styles.modalBullet}>
              3) If advised to evacuate, leave early and follow routes.
            </Text>
            <Text style={styles.modalBullet}>
              4) If indoors, move away from hazards (windows, loose items).
            </Text>

            <Text style={styles.modalSectionTitle}>Your preparedness status</Text>
            <Text style={styles.modalBullet}>• Points earned: {points}</Text>
            <Text style={styles.modalBullet}>• Current badge: {badge}</Text>

            <Text style={styles.modalSectionTitle}>Prototype note</Text>
            <Text style={styles.modalBody}>
              In a full build, this alert would be triggered automatically based on GPS + hazard data,
              and the guidance would adapt to hazard type (flood, fire, storm, earthquake).
            </Text>
          </ScrollView>

          <View style={styles.modalActions}>
            <Pressable style={[styles.btn, styles.btnPrimary]} onPress={onClose}>
              <Text style={styles.btnTextPrimary}>Close</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function GuideModal({ visible, onClose, item }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>{item ? item.title : "Guide"}</Text>
          <Text style={styles.modalMeta}>Prototype guide content</Text>

          <ScrollView style={{ maxHeight: 320 }} contentContainerStyle={{ paddingBottom: 12 }}>
            {item?.steps?.map((s, idx) => (
              <Text key={`${item.id}-${idx}`} style={styles.modalBullet}>
                {idx + 1}) {s}
              </Text>
            ))}
          </ScrollView>

          <View style={styles.modalActions}>
            <Pressable style={[styles.btn, styles.btnPrimary]} onPress={onClose}>
              <Text style={styles.btnTextPrimary}>Close</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function WeatherCard({ data }) {
  const current = data?.current;
  const daily = data?.daily;

  const temp = current?.temperature_2m;
  const rain = current?.precipitation;
  const wind = current?.wind_speed_10m;

  const max = daily?.temperature_2m_max?.[0];
  const min = daily?.temperature_2m_min?.[0];
  const rainSum = daily?.precipitation_sum?.[0];

  return (
    <View style={{ gap: 6 }}>
      <Text style={styles.resourceItem}>
        • Current: {fmt(temp)}°C • Rain: {fmt(rain)}mm • Wind: {fmt(wind)} km/h
      </Text>
      <Text style={styles.resourceItem}>
        • Today: Min {fmt(min)}°C / Max {fmt(max)}°C • Total rain {fmt(rainSum)}mm
      </Text>
      <Text style={styles.cardBody}>
        Prototype note: In a full build, this can be tied to risk messaging (e.g., heavy rain → flood
        preparedness prompts).
      </Text>
    </View>
  );
}

function fmt(v) {
  return typeof v === "number" ? v.toFixed(1) : "—";
}

/** ---------- Styles ---------- */

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0b1020" },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  title: { color: "white", fontSize: 22, fontWeight: "800" },
  subtitle: { color: "#cbd5e1", marginTop: 4 },

  tabs: { flexDirection: "row", gap: 8, paddingHorizontal: 16, paddingBottom: 10 },
  tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, alignItems: "center" },
  tabBtnActive: { backgroundColor: "#1e293b" },
  tabBtnInactive: { backgroundColor: "#111827" },
  tabText: { fontWeight: "800" },
  tabTextActive: { color: "white" },
  tabTextInactive: { color: "#94a3b8" },

  content: { flex: 1, paddingHorizontal: 16, paddingBottom: 16, gap: 12 },

  card: {
    backgroundColor: "#111827",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  cardTitle: { color: "white", fontSize: 16, fontWeight: "800", marginBottom: 8 },
  cardMeta: { color: "#cbd5e1", marginBottom: 10 },
  cardBody: { color: "#cbd5e1", lineHeight: 18 },

  errorText: { color: "#fca5a5", fontWeight: "800" },
  inlineRow: { flexDirection: "row", alignItems: "center" },

  progressWrap: { gap: 6, marginBottom: 6 },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    backgroundColor: "#0b1020",
    borderWidth: 1,
    borderColor: "#1f2937",
    overflow: "hidden",
  },
  progressFill: { height: "100%", backgroundColor: "#22c55e" },
  progressLabel: { color: "#94a3b8", fontWeight: "600" },

  actionsRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  btn: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 12, alignItems: "center" },
  btnPrimary: { backgroundColor: "#2563eb", flex: 1 },
  btnGhost: { backgroundColor: "transparent", borderWidth: 1, borderColor: "#334155", width: 90 },
  btnTextPrimary: { color: "white", fontWeight: "800" },
  btnTextGhost: { color: "#cbd5e1", fontWeight: "800" },

  smallBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  smallBtnText: { color: "#cbd5e1", fontWeight: "900" },

  cardHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

  row: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#0b1020",
    borderWidth: 1,
    borderColor: "#1f2937",
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowChecked: { borderColor: "#22c55e" },
  rowLeft: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1, paddingRight: 8 },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#64748b",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: { borderColor: "#22c55e", backgroundColor: "#14532d" },
  checkboxText: { color: "white", fontWeight: "900" },
  rowLabel: { color: "white", flex: 1, lineHeight: 18 },
  rowPoints: { color: "#93c5fd", fontWeight: "900" },

  resourceItem: { color: "#e2e8f0", marginBottom: 8, lineHeight: 18 },

  quakeRow: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#0b1020",
    borderWidth: 1,
    borderColor: "#1f2937",
    marginBottom: 10,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  quakeTitle: { color: "white", fontWeight: "900" },
  quakePlace: { color: "#cbd5e1", marginTop: 2 },
  quakeTime: { color: "#94a3b8", marginTop: 2, fontWeight: "700" },
  quakeLink: { color: "#93c5fd", fontWeight: "900", fontSize: 18 },

  guideBtn: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "#0b1020",
    borderWidth: 1,
    borderColor: "#1f2937",
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  guideBtnText: { color: "white", fontWeight: "900" },
  guideChevron: { color: "#93c5fd", fontSize: 18, fontWeight: "900" },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "flex-end",
    padding: 12,
  },
  modalCard: {
    backgroundColor: "#0b1020",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  modalTitle: { color: "white", fontSize: 18, fontWeight: "900" },
  modalMeta: { color: "#cbd5e1", marginTop: 6, marginBottom: 10 },
  modalSectionTitle: { color: "white", fontWeight: "900", marginTop: 10, marginBottom: 6 },
  modalBullet: { color: "#e2e8f0", marginBottom: 8, lineHeight: 18 },
  modalBody: { color: "#cbd5e1", lineHeight: 18 },
  modalActions: { marginTop: 10 },
});
