import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View } from "react-native";
import MarketsStackNavigator from "@/navigation/MarketsStackNavigator";
import ScanScreen from "@/screens/ScanScreen";
import ActivityStackNavigator from "@/navigation/ActivityStackNavigator";
import ProfileStackNavigator from "@/navigation/ProfileStackNavigator";
import { useTheme } from "@/hooks/useTheme";
import { useMarketContext } from "@/contexts/MarketContext";
import { Spacing } from "@/constants/theme";

export type MainTabParamList = {
  MarketsTab: undefined;
  ScanTab: undefined;
  ActivityTab: undefined;
  ProfileTab: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  const { theme, isDark } = useTheme();
  const { getPendingInfos, activityLogs } = useMarketContext();

  const pendingCount = getPendingInfos().length;

  return (
    <Tab.Navigator
      initialRouteName="MarketsTab"
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: theme.backgroundRoot,
          }),
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="MarketsTab"
        component={MarketsStackNavigator}
        options={{
          title: "Maerkte",
          tabBarIcon: ({ color, size }) => (
            <Feather name="shopping-bag" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ScanTab"
        component={ScanScreen}
        options={{
          title: "Scan",
          tabBarIcon: ({ color, size }) => (
            <View style={styles.scanIconContainer}>
              <View
                style={[styles.scanIconBg, { backgroundColor: theme.primary }]}
              >
                <Feather name="maximize" size={22} color="#FFFFFF" />
              </View>
            </View>
          ),
          tabBarLabel: () => null,
        }}
      />
      <Tab.Screen
        name="ActivityTab"
        component={ActivityStackNavigator}
        options={{
          title: "Aktivitaet",
          tabBarIcon: ({ color, size }) => (
            <Feather name="activity" size={size} color={color} />
          ),
          tabBarBadge: activityLogs.length > 0 ? undefined : undefined,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{
          title: "Profil",
          tabBarIcon: ({ color, size }) => (
            <View>
              <Feather name="user" size={size} color={color} />
              {pendingCount > 0 ? (
                <View
                  style={[styles.badge, { backgroundColor: theme.pending }]}
                />
              ) : null}
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  scanIconContainer: {
    position: "relative",
    top: -8,
  },
  scanIconBg: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
