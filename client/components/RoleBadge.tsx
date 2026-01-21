import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";
import { UserRole } from "@/types";

interface RoleBadgeProps {
  role: UserRole;
  size?: "small" | "medium" | "large";
  style?: ViewStyle;
}

const ROLE_CONFIG: Record<
  UserRole,
  { label: string; icon: keyof typeof Feather.glyphMap }
> = {
  admin: { label: "Admin", icon: "shield" },
  developer: { label: "Entwickler", icon: "code" },
  user: { label: "Techniker", icon: "tool" },
};

export function RoleBadge({ role, size = "medium", style }: RoleBadgeProps) {
  const { theme } = useTheme();

  const getRoleColor = () => {
    switch (role) {
      case "admin":
        return theme.roleAdmin;
      case "developer":
        return theme.roleDeveloper;
      case "user":
        return theme.roleUser;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "small":
        return {
          paddingHorizontal: Spacing.sm,
          paddingVertical: 2,
          iconSize: 10,
          fontSize: 10,
        };
      case "medium":
        return {
          paddingHorizontal: Spacing.md,
          paddingVertical: 4,
          iconSize: 12,
          fontSize: 12,
        };
      case "large":
        return {
          paddingHorizontal: Spacing.lg,
          paddingVertical: 6,
          iconSize: 14,
          fontSize: 14,
        };
    }
  };

  const config = ROLE_CONFIG[role];
  const sizeStyles = getSizeStyles();
  const roleColor = getRoleColor();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: roleColor,
          paddingHorizontal: sizeStyles.paddingHorizontal,
          paddingVertical: sizeStyles.paddingVertical,
        },
        style,
      ]}
    >
      <Feather
        name={config.icon}
        size={sizeStyles.iconSize}
        color="#FFFFFF"
        style={styles.icon}
      />
      <ThemedText
        style={[
          styles.label,
          { fontSize: sizeStyles.fontSize, color: "#FFFFFF" },
        ]}
      >
        {config.label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.xs,
  },
  icon: {
    marginRight: 4,
  },
  label: {
    fontWeight: "600",
  },
});
