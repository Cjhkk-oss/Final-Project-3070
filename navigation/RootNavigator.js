import React, { useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import WelcomeScreen from "../screens/WelcomeScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import AppTabs from "./AppTabs";
import EmergencyModeScreen from "../screens/EmergencyModeScreen";

const Stack = createNativeStackNavigator();

export default function RootNavigator() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!hasSeenOnboarding ? (
        <>
          <Stack.Screen name="Welcome">
            {(props) => (
              <WelcomeScreen
                {...props}
                onContinue={() => props.navigation.navigate("Onboarding")}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Onboarding">
            {(props) => (
              <OnboardingScreen
                {...props}
                onFinish={() => setHasSeenOnboarding(true)}
              />
            )}
          </Stack.Screen>
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={AppTabs} />
          <Stack.Screen name="EmergencyMode" component={EmergencyModeScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}