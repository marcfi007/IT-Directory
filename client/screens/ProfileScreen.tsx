import React from "react";
import { View, StyleSheet, ScrollView, Pressable } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { RoleBadge } from "@/components/RoleBadge";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { useMarketContext } from "@/contexts/MarketContext";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ProfileScreen() {
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { user, logout } = useAuth();
  const { getPendingInfos, activityLogs } = useMarketContext();

  const pendingInfos = getPendingInfos();
  const userActivities = activityLogs.filter(
    (log) => log.userId === user?.id,
  ).length;

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    logout();
  };

  const handleAdminPanel = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("AdminPanel");
  };

  const handleNotificationsSettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("NotificationsSettings");
  };

  const handleSecuritySettings = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("SecuritySettings");
  };

  const handleAbout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("About");
  };

  if (!user) return null;

  const isAdmin = user.role === "admin";
  const isDeveloper = user.role === "developer";

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing["2xl"],
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.profileCard,
            { backgroundColor: theme.cardBackground },
            Shadows.card,
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: theme.primary }]}>
            <ThemedText style={styles.avatarText}>
              {user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </ThemedText>
          </View>
          <ThemedText type="h3" style={styles.userName}>
            {user.name}
          </ThemedText>
          <ThemedText
            style={[styles.userEmail, { color: theme.textSecondary }]}
          >
            {user.email}
          </ThemedText>
          <RoleBadge role={user.role} size="large" style={styles.roleBadge} />
        </View>

        <View style={styles.statsRow}>
          <View
            style={[styles.statCard, { backgroundColor: theme.cardBackground }]}
          >
            <Feather name="activity" size={24} color={theme.primary} />
            <ThemedText type="h3" style={styles.statValue}>
              {userActivities}
            </ThemedText>
            <ThemedText
              style={[styles.statLabel, { color: theme.textSecondary }]}
            >
              Aktivitaeten
            </ThemedText>
          </View>
          <View
            style={[styles.statCard, { backgroundColor: theme.cardBackground }]}
          >
            <Feather
              name={user.twoFactorEnabled ? "shield" : "shield-off"}
              size={24}
              color={user.twoFactorEnabled ? theme.verified : theme.warning}
            />
            <ThemedText
              type="h4"
              style={[
                styles.statValue,
                {
                  color: user.twoFactorEnabled ? theme.verified : theme.warning,
                },
              ]}
            >
              {user.twoFactorEnabled ? "Aktiv" : "Inaktiv"}
            </ThemedText>
            <ThemedText
              style={[styles.statLabel, { color: theme.textSecondary }]}
            >
              2FA Status
            </ThemedText>
          </View>
        </View>

        {isAdmin ? (
          <Pressable
            onPress={handleAdminPanel}
            style={[
              styles.adminButton,
              {
                backgroundColor: theme.roleAdmin + "15",
                borderColor: theme.roleAdmin,
              },
            ]}
          >
            <View style={styles.adminButtonContent}>
              <View
                style={[styles.adminIcon, { backgroundColor: theme.roleAdmin }]}
              >
                <Feather name="settings" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.adminTextContainer}>
                <ThemedText
                  style={[styles.adminTitle, { color: theme.roleAdmin }]}
                >
                  Admin-Bereich
                </ThemedText>
                <ThemedText
                  style={[styles.adminSubtitle, { color: theme.textSecondary }]}
                >
                  Benutzer, Freigaben, Audit-Logs
                </ThemedText>
              </View>
            </View>
            {pendingInfos.length > 0 ? (
              <View
                style={[
                  styles.pendingBadge,
                  { backgroundColor: theme.pending },
                ]}
              >
                <ThemedText style={styles.pendingText}>
                  {pendingInfos.length}
                </ThemedText>
              </View>
            ) : null}
            <Feather name="chevron-right" size={20} color={theme.roleAdmin} />
          </Pressable>
        ) : null}

        {isDeveloper ? (
          <View
            style={[
              styles.devSection,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <View style={styles.devHeader}>
              <Feather name="code" size={20} color={theme.roleDeveloper} />
              <ThemedText
                style={[styles.devTitle, { color: theme.roleDeveloper }]}
              >
                Entwickler-Tools
              </ThemedText>
            </View>
            <View style={styles.devInfo}>
              <ThemedText
                style={[styles.devLabel, { color: theme.textSecondary }]}
              >
                API-Status
              </ThemedText>
              <View style={styles.statusRow}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: theme.verified },
                  ]}
                />
                <ThemedText
                  style={[styles.statusText, { color: theme.verified }]}
                >
                  Online
                </ThemedText>
              </View>
            </View>
          </View>
        ) : null}

        <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <ThemedText
            style={[styles.sectionTitle, { color: theme.textSecondary }]}
          >
            Einstellungen
          </ThemedText>

          <Pressable
            style={styles.menuItem}
            onPress={handleNotificationsSettings}
          >
            <Feather name="bell" size={20} color={theme.text} />
            <ThemedText style={styles.menuLabel}>Benachrichtigungen</ThemedText>
            <Feather
              name="chevron-right"
              size={18}
              color={theme.textSecondary}
            />
          </Pressable>

          <Pressable style={styles.menuItem} onPress={handleSecuritySettings}>
            <Feather name="lock" size={20} color={theme.text} />
            <ThemedText style={styles.menuLabel}>Sicherheit</ThemedText>
            <Feather
              name="chevron-right"
              size={18}
              color={theme.textSecondary}
            />
          </Pressable>

          <Pressable style={styles.menuItem} onPress={handleAbout}>
            <Feather name="info" size={20} color={theme.text} />
            <ThemedText style={styles.menuLabel}>Ueber die App</ThemedText>
            <Feather
              name="chevron-right"
              size={18}
              color={theme.textSecondary}
            />
          </Pressable>
        </View>

        <Button
          onPress={handleLogout}
          style={[styles.logoutButton, { backgroundColor: theme.error }]}
        >
          Abmelden
        </Button>
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
  profileCard: {
    alignItems: "center",
    padding: Spacing["2xl"],
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 28,
    fontWeight: "700",
  },
  userName: {
    marginBottom: Spacing.xs,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: Spacing.md,
  },
  roleBadge: {
    marginTop: Spacing.xs,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  statValue: {
    marginTop: Spacing.sm,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
  },
  adminButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  adminButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  adminIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  adminTextContainer: {
    flex: 1,
  },
  adminTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  adminSubtitle: {
    fontSize: 12,
  },
  pendingBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  pendingText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  devSection: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  devHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  devTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: Spacing.sm,
  },
  devInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  devLabel: {
    fontSize: 14,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.xs,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    marginLeft: Spacing.md,
  },
  logoutButton: {
    marginTop: Spacing.sm,
  },
});
