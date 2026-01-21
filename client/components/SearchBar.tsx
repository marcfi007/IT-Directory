import React, { useState } from "react";
import { View, TextInput, StyleSheet, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useTheme } from "@/hooks/useTheme";
import { BorderRadius, Spacing } from "@/constants/theme";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export function SearchBar({
  value,
  onChangeText,
  placeholder = "Suchen...",
}: SearchBarProps) {
  const { theme } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const borderWidth = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    borderWidth: borderWidth.value,
  }));

  const handleFocus = () => {
    setIsFocused(true);
    borderWidth.value = withTiming(2, { duration: 150 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    borderWidth.value = withTiming(1, { duration: 150 });
  };

  const handleClear = () => {
    onChangeText("");
  };

  return (
    <AnimatedView
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundDefault,
          borderColor: isFocused ? theme.primary : theme.border,
        },
        animatedStyle,
      ]}
    >
      <Feather
        name="search"
        size={20}
        color={isFocused ? theme.primary : theme.textSecondary}
        style={styles.icon}
      />
      <TextInput
        style={[styles.input, { color: theme.text }]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
        onFocus={handleFocus}
        onBlur={handleBlur}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
      />
      {value.length > 0 ? (
        <Pressable onPress={handleClear} style={styles.clearButton}>
          <Feather name="x-circle" size={18} color={theme.textSecondary} />
        </Pressable>
      ) : null}
    </AnimatedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    height: 48,
  },
  icon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  clearButton: {
    padding: Spacing.xs,
  },
});
