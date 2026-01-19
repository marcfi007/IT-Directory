import React from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing, Shadows } from "@/constants/theme";
import { Market } from "@/types";

interface MarketCardProps {
  market: Market;
  onPress: () => void;
  hasPendingInfo?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function MarketCard({ market, onPress, hasPendingInfo }: MarketCardProps) {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const hasSecureData = market.doorCodes || market.egateAccess;

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        styles.container,
        {
          backgroundColor: theme.cardBackground,
          borderColor: theme.border,
        },
        animatedStyle,
        Shadows.card,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.wawiContainer}>
          <ThemedText style={[styles.wawiLabel, { color: theme.textSecondary }]}>
            WAWI-Nr.
          </ThemedText>
          <ThemedText style={[styles.wawiNumber, { color: theme.primary }]}>
            {market.wawiNumber}
          </ThemedText>
        </View>
        <View style={styles.indicators}>
          {hasSecureData ? (
            <View style={[styles.indicator, { backgroundColor: theme.encrypted + "20" }]}>
              <Feather name="lock" size={14} color={theme.encrypted} />
            </View>
          ) : null}
          {hasPendingInfo ? (
            <View style={[styles.indicator, { backgroundColor: theme.pending + "20" }]}>
              <Feather name="clock" size={14} color={theme.pending} />
            </View>
          ) : null}
        </View>
      </View>

      <ThemedText type="h4" style={styles.name} numberOfLines={1}>
        {market.name}
      </ThemedText>

      <View style={styles.addressRow}>
        <Feather name="map-pin" size={14} color={theme.textSecondary} />
        <ThemedText style={[styles.address, { color: theme.textSecondary }]} numberOfLines={1}>
          {market.address}, {market.city}
        </ThemedText>
      </View>

      {market.contactPerson ? (
        <View style={styles.contactRow}>
          <Feather name="user" size={14} color={theme.textSecondary} />
          <ThemedText style={[styles.contact, { color: theme.textSecondary }]} numberOfLines={1}>
            {market.contactPerson}
          </ThemedText>
        </View>
      ) : null}

      <View style={styles.footer}>
        <ThemedText style={[styles.updated, { color: theme.textSecondary }]}>
          Aktualisiert: {new Date(market.updatedAt).toLocaleDateString("de-DE")}
        </ThemedText>
        <Feather name="chevron-right" size={20} color={theme.textSecondary} />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  wawiContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  wawiLabel: {
    fontSize: 12,
    marginRight: Spacing.xs,
  },
  wawiNumber: {
    fontSize: 14,
    fontWeight: "700",
  },
  indicators: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  indicator: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.xs,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    marginBottom: Spacing.sm,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  address: {
    fontSize: 14,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  contact: {
    fontSize: 14,
    marginLeft: Spacing.sm,
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  updated: {
    fontSize: 12,
  },
});
