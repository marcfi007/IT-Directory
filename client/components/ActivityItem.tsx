import React from "react";
import { View, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";
import { ActivityLog } from "@/types";

interface ActivityItemProps {
  log: ActivityLog;
}

const ACTION_CONFIG: Record<
  ActivityLog["action"],
  {
    icon: keyof typeof Feather.glyphMap;
    colorKey: "success" | "warning" | "error" | "primary";
  }
> = {
  login: { icon: "log-in", colorKey: "primary" },
  logout: { icon: "log-out", colorKey: "primary" },
  view: { icon: "eye", colorKey: "primary" },
  add: { icon: "plus-circle", colorKey: "success" },
  edit: { icon: "edit-2", colorKey: "warning" },
  delete: { icon: "trash-2", colorKey: "error" },
  approve: { icon: "check-circle", colorKey: "success" },
  reject: { icon: "x-circle", colorKey: "error" },
};

export function ActivityItem({ log }: ActivityItemProps) {
  const { theme } = useTheme();
  const config = ACTION_CONFIG[log.action];
  const actionColor = theme[config.colorKey];

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.cardBackground }]}>
      <View
        style={[styles.iconContainer, { backgroundColor: actionColor + "15" }]}
      >
        <Feather name={config.icon} size={18} color={actionColor} />
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText type="small" style={{ fontWeight: "600" }}>
            {log.userName}
          </ThemedText>
          <ThemedText style={[styles.time, { color: theme.textSecondary }]}>
            {formatTime(log.timestamp)}
          </ThemedText>
        </View>
        <ThemedText
          style={[styles.description, { color: theme.textSecondary }]}
        >
          {log.description}
        </ThemedText>
        {log.marketName ? (
          <View style={styles.marketRow}>
            <Feather name="shopping-bag" size={12} color={theme.primary} />
            <ThemedText style={[styles.marketName, { color: theme.primary }]}>
              {log.marketName}
            </ThemedText>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  time: {
    fontSize: 11,
  },
  description: {
    fontSize: 13,
    marginBottom: 4,
  },
  marketRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  marketName: {
    fontSize: 12,
    marginLeft: 4,
    fontWeight: "500",
  },
});
