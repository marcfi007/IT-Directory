import React from "react";
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
}

export function InfoRow({ label, value, copyable = false, isEncrypted = false }: InfoRowProps) {
  const { theme } = useTheme();

  const handleCopy = async () => {
    if (copyable && !isEncrypted) {
      await Clipboard.setStringAsync(value);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const displayValue = isEncrypted ? "••••••••" : value;

  return (
    <View style={styles.container}>
      <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
        {label}
      </ThemedText>
      <Pressable
        onPress={copyable ? handleCopy : undefined}
        style={styles.valueContainer}
        disabled={!copyable || isEncrypted}
      >
        <ThemedText style={styles.value} numberOfLines={2}>
          {displayValue}
        </ThemedText>
        {copyable && !isEncrypted ? (
          <Feather name="copy" size={16} color={theme.primary} style={styles.copyIcon} />
        ) : null}
        {isEncrypted ? (
          <Feather name="lock" size={16} color={theme.encrypted} style={styles.copyIcon} />
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 12,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
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
  copyIcon: {
    marginLeft: Spacing.sm,
    marginTop: 2,
  },
});
