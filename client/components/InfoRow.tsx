import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";

interface InfoRowProps {
  label: string;
  value: string;
  copyable?: boolean;
  isEncrypted?: boolean;
  onEdit?: () => void;
  editable?: boolean;
  history?: { value: string; date: string; user: string }[];
}

export function InfoRow({
  label,
  value,
  copyable = false,
  isEncrypted = false,
  onEdit,
  editable = false,
  history = [],
}: InfoRowProps) {
  const { theme } = useTheme();
  const [isRevealed, setIsRevealed] = useState(false);

  const handleCopy = async () => {
    if (copyable) {
      await Clipboard.setStringAsync(value);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleReveal = () => {
    if (isEncrypted) {
      setIsRevealed(!isRevealed);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const displayValue = isEncrypted && !isRevealed ? "••••••••" : value;

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
          {label}
        </ThemedText>
        {editable && onEdit ? (
          <Pressable onPress={onEdit} style={styles.editButton}>
            <Feather name="edit-2" size={14} color={theme.primary} />
          </Pressable>
        ) : null}
      </View>
      <Pressable
        onPress={isEncrypted ? handleReveal : copyable ? handleCopy : undefined}
        style={styles.valueContainer}
      >
        <ThemedText style={styles.value} numberOfLines={2}>
          {displayValue}
        </ThemedText>
        {copyable && (!isEncrypted || isRevealed) ? (
          <Pressable onPress={handleCopy} style={styles.iconButton}>
            <Feather name="copy" size={16} color={theme.primary} />
          </Pressable>
        ) : null}
        {isEncrypted ? (
          <Feather
            name={isRevealed ? "unlock" : "lock"}
            size={16}
            color={isRevealed ? theme.verified : theme.encrypted}
            style={styles.copyIcon}
          />
        ) : null}
      </Pressable>
      {history.length > 0 ? (
        <View style={styles.historyContainer}>
          <ThemedText
            style={[styles.historyLabel, { color: theme.textSecondary }]}
          >
            Verlauf:
          </ThemedText>
          {history.map((item, index) => (
            <View key={index} style={styles.historyItem}>
              <ThemedText style={[styles.historyValue, { color: theme.error }]}>
                {item.value}
              </ThemedText>
              <ThemedText
                style={[styles.historyMeta, { color: theme.textSecondary }]}
              >
                {item.date} - {item.user}
              </ThemedText>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  editButton: {
    padding: 4,
  },
  valueContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  value: {
    fontSize: 15,
    flex: 1,
    lineHeight: 22,
  },
  iconButton: {
    padding: 4,
    marginLeft: Spacing.xs,
  },
  copyIcon: {
    marginLeft: Spacing.sm,
    marginTop: 2,
  },
  historyContainer: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.08)",
  },
  historyLabel: {
    fontSize: 11,
    marginBottom: 4,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  historyValue: {
    fontSize: 13,
    fontWeight: "500",
    textDecorationLine: "line-through",
    marginRight: Spacing.sm,
  },
  historyMeta: {
    fontSize: 11,
  },
});
