import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

interface InfoSectionProps {
  title: string;
  icon: keyof typeof Feather.glyphMap;
  isSecure?: boolean;
  defaultExpanded?: boolean;
  children: React.ReactNode;
}

export function InfoSection({
  title,
  icon,
  isSecure = false,
  defaultExpanded = false,
  children,
}: InfoSectionProps) {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const rotation = useSharedValue(defaultExpanded ? 180 : 0);
  const height = useSharedValue(defaultExpanded ? 1 : 0);

  const toggleExpanded = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    rotation.value = withTiming(newExpanded ? 180 : 0, { duration: 200 });
    height.value = withTiming(newExpanded ? 1 : 0, { duration: 200 });
  };

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: height.value,
    maxHeight: height.value === 0 ? 0 : undefined,
  }));

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.cardBackground, borderColor: theme.border },
      ]}
    >
      <Pressable onPress={toggleExpanded} style={styles.header}>
        <View style={styles.titleRow}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: theme.primary + "15" },
            ]}
          >
            <Feather name={icon} size={18} color={theme.primary} />
          </View>
          <ThemedText type="h4" style={styles.title}>
            {title}
          </ThemedText>
          {isSecure ? (
            <View
              style={[
                styles.secureIndicator,
                { backgroundColor: theme.encrypted + "20" },
              ]}
            >
              <Feather name="lock" size={12} color={theme.encrypted} />
            </View>
          ) : null}
        </View>
        <Animated.View style={chevronStyle}>
          <Feather name="chevron-down" size={20} color={theme.textSecondary} />
        </Animated.View>
      </Pressable>
      {isExpanded ? (
        <Animated.View style={[styles.content, contentStyle]}>
          {children}
        </Animated.View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    overflow: "hidden",
    borderWidth: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  title: {
    flex: 1,
  },
  secureIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
});
