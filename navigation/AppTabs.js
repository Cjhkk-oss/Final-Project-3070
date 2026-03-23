import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import PrepScreen from "../screens/PrepScreen";
import AlertsScreen from "../screens/AlertsScreen";
import GuidesScreen from "../screens/GuidesScreen";
import ResourcesScreen from "../screens/ResourcesScreen";

const Tab = createBottomTabNavigator();

export default function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        tabBarActiveTintColor: "#2f6fed",
        tabBarInactiveTintColor: "#7a8798",
        tabBarStyle: { height: 64, paddingBottom: 8, paddingTop: 6 },
        tabBarIcon: ({ color, size }) => {
          const icons = {
            Home: "home-outline",
            Prep: "checkbox-outline",
            Alerts: "warning-outline",
            Guides: "book-outline",
            Resources: "location-outline",
          };

          return <Ionicons name={icons[route.name]} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Prep" component={PrepScreen} />
      <Tab.Screen name="Alerts" component={AlertsScreen} />
      <Tab.Screen name="Guides" component={GuidesScreen} />
      <Tab.Screen name="Resources" component={ResourcesScreen} />
    </Tab.Navigator>
  );
}