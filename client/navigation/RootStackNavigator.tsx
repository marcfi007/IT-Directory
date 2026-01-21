import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MainTabNavigator from "@/navigation/MainTabNavigator";
import LoginScreen from "@/screens/LoginScreen";
import MarketDetailScreen from "@/screens/MarketDetailScreen";
import AddInfoScreen from "@/screens/AddInfoScreen";
import AddMarketScreen from "@/screens/AddMarketScreen";
import AdminPanelScreen from "@/screens/AdminPanelScreen";
import NotificationsSettingsScreen from "@/screens/NotificationsSettingsScreen";
import SecuritySettingsScreen from "@/screens/SecuritySettingsScreen";
import AboutScreen from "@/screens/AboutScreen";
import { useScreenOptions } from "@/hooks/useScreenOptions";
import { useAuth } from "@/contexts/AuthContext";

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
  MarketDetail: { marketId: string };
  AddInfo: { marketId: string | undefined };
  AddMarket: undefined;
  AdminPanel: undefined;
  NotificationsSettings: undefined;
  SecuritySettings: undefined;
  About: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootStackNavigator() {
  const screenOptions = useScreenOptions();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator screenOptions={screenOptions}>
      {isAuthenticated ? (
        <>
          <Stack.Screen
            name="Main"
            component={MainTabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="MarketDetail"
            component={MarketDetailScreen}
            options={{ headerTitle: "Markt Details" }}
          />
          <Stack.Screen
            name="AddInfo"
            component={AddInfoScreen}
            options={{
              presentation: "modal",
              headerTitle: "Info hinzufuegen",
            }}
          />
          <Stack.Screen
            name="AddMarket"
            component={AddMarketScreen}
            options={{
              presentation: "modal",
              headerTitle: "Neuer Markt",
            }}
          />
          <Stack.Screen
            name="AdminPanel"
            component={AdminPanelScreen}
            options={{ headerTitle: "Admin-Bereich" }}
          />
          <Stack.Screen
            name="NotificationsSettings"
            component={NotificationsSettingsScreen}
            options={{ headerTitle: "Benachrichtigungen" }}
          />
          <Stack.Screen
            name="SecuritySettings"
            component={SecuritySettingsScreen}
            options={{ headerTitle: "Sicherheit" }}
          />
          <Stack.Screen
            name="About"
            component={AboutScreen}
            options={{ headerTitle: "Ueber die App" }}
          />
        </>
      ) : (
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
      )}
    </Stack.Navigator>
  );
}
