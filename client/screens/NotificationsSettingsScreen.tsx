import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

const NOTIFICATION_SETTINGS_KEY = "@notification_settings";

interface NotificationSettings {
  newMarkets: boolean;
  pendingApprovals: boolean;
  infoUpdates: boolean;
  securityAlerts: boolean;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  newMarkets: true,
  pendingApprovals: true,
  infoUpdates: true,
  securityAlerts: true,
};

export default function NotificationsSettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const [settings, setSettings] =
    useState<NotificationSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading notification settings:", error);
    }
  };

  const updateSetting = async (
    key: keyof NotificationSettings,
    value: boolean,
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await AsyncStorage.setItem(
      NOTIFICATION_SETTINGS_KEY,
      JSON.stringify(newSettings),
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderSettingItem = (
    key: keyof NotificationSettings,
    icon: keyof typeof Feather.glyphMap,
    title: string,
    description: string,
  ) => (
    <View style={[styles.settingItem, { borderBottomColor: theme.border }]}>
      <View
        style={[styles.settingIcon, { backgroundColor: theme.primary + "15" }]}
      >
        <Feather name={icon} size={20} color={theme.primary} />
      </View>
      <View style={styles.settingContent}>
        <ThemedText style={styles.settingTitle}>{title}</ThemedText>
        <ThemedText
          style={[styles.settingDescription, { color: theme.textSecondary }]}
        >
          {description}
        </ThemedText>
      </View>
      <Switch
        value={settings[key]}
        onValueChange={(value) => updateSetting(key, value)}
        trackColor={{ false: theme.border, true: theme.primary + "60" }}
        thumbColor={settings[key] ? theme.primary : theme.textSecondary}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.md,
            paddingBottom: insets.bottom + Spacing["2xl"],
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <ThemedText
            style={[styles.sectionTitle, { color: theme.textSecondary }]}
          >
            Push-Benachrichtigungen
          </ThemedText>

          {renderSettingItem(
            "newMarkets",
            "shopping-bag",
            "Neue Maerkte",
            "Benachrichtigung wenn neue Maerkte angelegt werden",
          )}

          {renderSettingItem(
            "pendingApprovals",
            "clock",
            "Ausstehende Freigaben",
            "Benachrichtigung bei neuen Freigabeanfragen",
          )}

          {renderSettingItem(
            "infoUpdates",
            "info",
            "Info-Aktualisierungen",
            "Benachrichtigung bei Aenderungen an Marktinfos",
          )}

          {renderSettingItem(
            "securityAlerts",
            "shield",
            "Sicherheitswarnungen",
            "Wichtige Sicherheitsbenachrichtigungen",
          )}
        </View>

        <View
          style={[styles.infoBox, { backgroundColor: theme.primary + "10" }]}
        >
          <Feather name="info" size={18} color={theme.primary} />
          <ThemedText style={[styles.infoText, { color: theme.primary }]}>
            Einige Benachrichtigungen sind systemkritisch und koennen nicht
            deaktiviert werden.
          </ThemedText>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  section: {
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  settingContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    marginLeft: Spacing.sm,
    lineHeight: 18,
  },
});
