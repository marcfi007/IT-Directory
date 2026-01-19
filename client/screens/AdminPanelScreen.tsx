import React, { useState, useCallback } from "react";
import { View, StyleSheet, ScrollView, Pressable, FlatList } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { RoleBadge } from "@/components/RoleBadge";
import { ActivityItem } from "@/components/ActivityItem";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { useMarketContext } from "@/contexts/MarketContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { MarketInfo, ActivityLog } from "@/types";

type TabType = "pending" | "users" | "logs";

const TABS: { key: TabType; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: "pending", label: "Freigaben", icon: "clock" },
  { key: "users", label: "Benutzer", icon: "users" },
  { key: "logs", label: "Audit-Logs", icon: "file-text" },
];

const DEMO_USERS = [
  { id: "1", name: "Max Admin", email: "admin@itmarkt.de", role: "admin" as const, status: "active" },
  { id: "2", name: "Anna Entwickler", email: "dev@itmarkt.de", role: "developer" as const, status: "active" },
  { id: "3", name: "Thomas Techniker", email: "tech@itmarkt.de", role: "user" as const, status: "active" },
];

export default function AdminPanelScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { user } = useAuth();
  const {
    getPendingInfos,
    activityLogs,
    approveMarketInfo,
    rejectMarketInfo,
    getMarketById,
  } = useMarketContext();

  const [activeTab, setActiveTab] = useState<TabType>("pending");
  const pendingInfos = getPendingInfos();

  const handleApprove = async (info: MarketInfo) => {
    if (!user) return;
    await approveMarketInfo(info.id, user.id, user.name);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleReject = async (info: MarketInfo) => {
    if (!user) return;
    await rejectMarketInfo(info.id, user.id, user.name);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  };

  const renderPendingItem = useCallback(
    ({ item, index }: { item: MarketInfo; index: number }) => {
      const market = getMarketById(item.marketId);
      return (
        <Animated.View
          entering={FadeInDown.delay(index * 50).duration(250)}
          style={[styles.pendingCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
        >
          <View style={styles.pendingHeader}>
            <View style={[styles.categoryBadge, { backgroundColor: theme.primary + "15" }]}>
              <ThemedText style={[styles.categoryText, { color: theme.primary }]}>
                {item.category}
              </ThemedText>
            </View>
            <ThemedText style={[styles.pendingDate, { color: theme.textSecondary }]}>
              {new Date(item.createdAt).toLocaleDateString("de-DE")}
            </ThemedText>
          </View>
          
          {market ? (
            <View style={styles.marketInfo}>
              <Feather name="shopping-bag" size={14} color={theme.textSecondary} />
              <ThemedText style={[styles.marketName, { color: theme.textSecondary }]}>
                {market.name}
              </ThemedText>
            </View>
          ) : null}

          <ThemedText style={styles.pendingContent}>{item.content}</ThemedText>
          
          <View style={styles.pendingFooter}>
            <ThemedText style={[styles.pendingAuthor, { color: theme.textSecondary }]}>
              von {item.createdByName}
            </ThemedText>
            <View style={styles.pendingActions}>
              <Pressable
                onPress={() => handleReject(item)}
                style={[styles.actionButton, { backgroundColor: theme.error + "15" }]}
              >
                <Feather name="x" size={18} color={theme.error} />
              </Pressable>
              <Pressable
                onPress={() => handleApprove(item)}
                style={[styles.actionButton, { backgroundColor: theme.verified + "15" }]}
              >
                <Feather name="check" size={18} color={theme.verified} />
              </Pressable>
            </View>
          </View>
        </Animated.View>
      );
    },
    [theme, getMarketById, handleApprove, handleReject]
  );

  const renderUserItem = useCallback(
    ({ item, index }: { item: typeof DEMO_USERS[0]; index: number }) => (
      <Animated.View
        entering={FadeInDown.delay(index * 50).duration(250)}
        style={[styles.userCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
      >
        <View style={[styles.userAvatar, { backgroundColor: theme.primary }]}>
          <ThemedText style={styles.userAvatarText}>
            {item.name.split(" ").map((n) => n[0]).join("")}
          </ThemedText>
        </View>
        <View style={styles.userInfo}>
          <ThemedText type="h4" style={styles.userName}>
            {item.name}
          </ThemedText>
          <ThemedText style={[styles.userEmail, { color: theme.textSecondary }]}>
            {item.email}
          </ThemedText>
        </View>
        <RoleBadge role={item.role} size="small" />
      </Animated.View>
    ),
    [theme]
  );

  const renderLogItem = useCallback(
    ({ item, index }: { item: ActivityLog; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 30).duration(200)}>
        <ActivityItem log={item} />
      </Animated.View>
    ),
    []
  );

  const renderContent = () => {
    switch (activeTab) {
      case "pending":
        return pendingInfos.length > 0 ? (
          <FlatList
            data={pendingInfos}
            keyExtractor={(item) => item.id}
            renderItem={renderPendingItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <EmptyState
            icon="check-circle"
            title="Keine ausstehenden Freigaben"
            description="Alle Ergaenzungen wurden bearbeitet"
          />
        );
      case "users":
        return (
          <FlatList
            data={DEMO_USERS}
            keyExtractor={(item) => item.id}
            renderItem={renderUserItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        );
      case "logs":
        return activityLogs.length > 0 ? (
          <FlatList
            data={activityLogs.slice(0, 50)}
            keyExtractor={(item) => item.id}
            renderItem={renderLogItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <EmptyState
            icon="file-text"
            title="Keine Logs vorhanden"
            description="Es wurden noch keine Aktivitaeten protokolliert"
          />
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.tabBar, { paddingTop: headerHeight + Spacing.md }]}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = tab.key === "pending" ? pendingInfos.length : undefined;
          
          return (
            <Pressable
              key={tab.key}
              onPress={() => {
                setActiveTab(tab.key);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.tab,
                {
                  backgroundColor: isActive ? theme.primary : "transparent",
                  borderColor: isActive ? theme.primary : theme.border,
                },
              ]}
            >
              <Feather
                name={tab.icon}
                size={16}
                color={isActive ? "#FFFFFF" : theme.textSecondary}
              />
              <ThemedText
                style={[
                  styles.tabLabel,
                  { color: isActive ? "#FFFFFF" : theme.text },
                ]}
              >
                {tab.label}
              </ThemedText>
              {count !== undefined && count > 0 ? (
                <View style={[styles.tabBadge, { backgroundColor: isActive ? "#FFFFFF" : theme.pending }]}>
                  <ThemedText
                    style={[
                      styles.tabBadgeText,
                      { color: isActive ? theme.primary : "#FFFFFF" },
                    ]}
                  >
                    {count}
                  </ThemedText>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.contentContainer}>{renderContent()}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginLeft: Spacing.xs,
  },
  tabBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.xs,
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  contentContainer: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.lg,
  },
  pendingCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  pendingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  pendingDate: {
    fontSize: 11,
  },
  marketInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  marketName: {
    fontSize: 13,
    marginLeft: Spacing.xs,
  },
  pendingContent: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  pendingFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  pendingAuthor: {
    fontSize: 12,
  },
  pendingActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  userAvatarText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
  },
});
