import React from "react";
import { View, StyleSheet, ScrollView, Linking, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

const APP_VERSION = "1.0.0";
const BUILD_NUMBER = "2024.01.21";

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const handleOpenLink = async (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Error opening URL:", error);
    }
  };

  const renderLinkItem = (
    icon: keyof typeof Feather.glyphMap,
    title: string,
    description: string,
    url: string,
  ) => (
    <Pressable
      onPress={() => handleOpenLink(url)}
      style={[styles.linkItem, { borderBottomColor: theme.border }]}
    >
      <View
        style={[styles.linkIcon, { backgroundColor: theme.primary + "15" }]}
      >
        <Feather name={icon} size={20} color={theme.primary} />
      </View>
      <View style={styles.linkContent}>
        <ThemedText style={styles.linkTitle}>{title}</ThemedText>
        <ThemedText
          style={[styles.linkDescription, { color: theme.textSecondary }]}
        >
          {description}
        </ThemedText>
      </View>
      <Feather name="external-link" size={18} color={theme.textSecondary} />
    </Pressable>
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
        {/* App Info Card */}
        <View
          style={[
            styles.appInfoCard,
            { backgroundColor: theme.cardBackground },
          ]}
        >
          <View style={[styles.appIcon, { backgroundColor: theme.primary }]}>
            <Feather name="shopping-bag" size={32} color="#FFFFFF" />
          </View>
          <ThemedText type="h2" style={styles.appName}>
            IT-Markt Verzeichnis
          </ThemedText>
          <ThemedText
            style={[styles.appVersion, { color: theme.textSecondary }]}
          >
            Version {APP_VERSION} (Build {BUILD_NUMBER})
          </ThemedText>
          <ThemedText
            style={[styles.appDescription, { color: theme.textSecondary }]}
          >
            Die zentrale App fuer IT-Servicetechniker zur Verwaltung von
            Marktinformationen
          </ThemedText>
        </View>

        {/* Links Section */}
        <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <ThemedText
            style={[styles.sectionTitle, { color: theme.textSecondary }]}
          >
            Rechtliches
          </ThemedText>

          {renderLinkItem(
            "file-text",
            "Datenschutzerklaerung",
            "Informationen zum Datenschutz",
            "https://example.com/privacy",
          )}

          {renderLinkItem(
            "book-open",
            "Nutzungsbedingungen",
            "AGB und Nutzungsrichtlinien",
            "https://example.com/terms",
          )}

          {renderLinkItem(
            "info",
            "Impressum",
            "Rechtliche Informationen",
            "https://example.com/imprint",
          )}
        </View>

        {/* Support Section */}
        <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <ThemedText
            style={[styles.sectionTitle, { color: theme.textSecondary }]}
          >
            Support
          </ThemedText>

          {renderLinkItem(
            "help-circle",
            "Hilfe & FAQ",
            "Antworten auf haeufige Fragen",
            "https://example.com/help",
          )}

          {renderLinkItem(
            "mail",
            "Kontakt",
            "Unser Support-Team kontaktieren",
            "mailto:support@example.com",
          )}

          {renderLinkItem(
            "message-circle",
            "Feedback",
            "Verbesserungsvorschlaege senden",
            "https://example.com/feedback",
          )}
        </View>

        {/* Features Section */}
        <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <ThemedText
            style={[styles.sectionTitle, { color: theme.textSecondary }]}
          >
            Funktionen
          </ThemedText>

          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Feather name="check-circle" size={16} color={theme.verified} />
              <ThemedText style={[styles.featureText, { color: theme.text }]}>
                Zentrale Marktverwaltung
              </ThemedText>
            </View>
            <View style={styles.featureItem}>
              <Feather name="check-circle" size={16} color={theme.verified} />
              <ThemedText style={[styles.featureText, { color: theme.text }]}>
                Sichere Code-Speicherung
              </ThemedText>
            </View>
            <View style={styles.featureItem}>
              <Feather name="check-circle" size={16} color={theme.verified} />
              <ThemedText style={[styles.featureText, { color: theme.text }]}>
                Barcode-Integration
              </ThemedText>
            </View>
            <View style={styles.featureItem}>
              <Feather name="check-circle" size={16} color={theme.verified} />
              <ThemedText style={[styles.featureText, { color: theme.text }]}>
                Mehrbenutzersystem mit Rollen
              </ThemedText>
            </View>
            <View style={styles.featureItem}>
              <Feather name="check-circle" size={16} color={theme.verified} />
              <ThemedText style={[styles.featureText, { color: theme.text }]}>
                Audit-Protokollierung
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Copyright */}
        <View style={styles.copyrightSection}>
          <ThemedText
            style={[styles.copyrightText, { color: theme.textSecondary }]}
          >
            © {new Date().getFullYear()} IT-Markt Verzeichnis
          </ThemedText>
          <ThemedText
            style={[styles.copyrightText, { color: theme.textSecondary }]}
          >
            Alle Rechte vorbehalten.
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
  appInfoCard: {
    alignItems: "center",
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  appName: {
    marginBottom: Spacing.xs,
    textAlign: "center",
  },
  appVersion: {
    fontSize: 14,
    marginBottom: Spacing.md,
  },
  appDescription: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
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
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  linkIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  linkContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  linkDescription: {
    fontSize: 13,
  },
  featureList: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  featureText: {
    fontSize: 14,
    marginLeft: Spacing.sm,
  },
  copyrightSection: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  copyrightText: {
    fontSize: 12,
    marginBottom: 2,
  },
});
