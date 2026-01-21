import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Barcode from "@kichiyaki/react-native-barcode-generator";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { useTheme } from "@/hooks/useTheme";
import { useMarketContext } from "@/contexts/MarketContext";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type RouteParams = RouteProp<RootStackParamList, "AddInfo">;

const CATEGORIES = [
  { key: "parking", label: "Parkplatz", icon: "navigation" as const },
  { key: "it-info", label: "IT-Info", icon: "server" as const },
  { key: "barcode", label: "Barcode", icon: "maximize" as const },
  { key: "other", label: "Sonstiges", icon: "file-text" as const },
];

export default function AddInfoScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const route = useRoute<RouteParams>();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { allMarkets, addMarketInfo } = useMarketContext();

  const [selectedMarketId, setSelectedMarketId] = useState(
    route.params?.marketId || "",
  );
  const [category, setCategory] = useState<string>("parking");
  const [content, setContent] = useState("");
  const [barcodeValue, setBarcodeValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showMarketPicker, setShowMarketPicker] = useState(false);
  const [error, setError] = useState("");

  const selectedMarket = allMarkets.find((m) => m.id === selectedMarketId);

  const handleSubmit = async () => {
    if (!selectedMarketId) {
      setError("Bitte waehlen Sie einen Markt aus");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (category === "barcode" && !barcodeValue.trim()) {
      setError("Bitte geben Sie einen Barcode-Wert ein");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (category !== "barcode" && !content.trim()) {
      setError("Bitte geben Sie einen Inhalt ein");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!user) return;

    setIsLoading(true);
    setError("");

    try {
      await addMarketInfo({
        marketId: selectedMarketId,
        category: category as "parking" | "it-info" | "barcode" | "other",
        content:
          category === "barcode"
            ? `Barcode: ${barcodeValue.trim()}${content.trim() ? ` - ${content.trim()}` : ""}`
            : content.trim(),
        barcodeValue: category === "barcode" ? barcodeValue.trim() : undefined,
        createdBy: user.id,
        createdByName: user.name,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    } catch (err) {
      setError("Fehler beim Speichern");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

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
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.section}>
          <ThemedText
            style={[styles.sectionLabel, { color: theme.textSecondary }]}
          >
            Markt auswaehlen
          </ThemedText>
          <Pressable
            onPress={() => setShowMarketPicker(!showMarketPicker)}
            style={[
              styles.marketSelector,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              },
            ]}
          >
            {selectedMarket ? (
              <View style={styles.selectedMarket}>
                <ThemedText style={styles.marketName}>
                  {selectedMarket.name}
                </ThemedText>
                <ThemedText
                  style={[styles.marketWawi, { color: theme.primary }]}
                >
                  WAWI: {selectedMarket.wawiNumber}
                </ThemedText>
              </View>
            ) : (
              <ThemedText
                style={[styles.placeholder, { color: theme.textSecondary }]}
              >
                Markt auswaehlen...
              </ThemedText>
            )}
            <Feather
              name={showMarketPicker ? "chevron-up" : "chevron-down"}
              size={20}
              color={theme.textSecondary}
            />
          </Pressable>

          {showMarketPicker ? (
            <View
              style={[
                styles.marketList,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                },
              ]}
            >
              {allMarkets.map((market) => (
                <Pressable
                  key={market.id}
                  onPress={() => {
                    setSelectedMarketId(market.id);
                    setShowMarketPicker(false);
                  }}
                  style={[
                    styles.marketOption,
                    selectedMarketId === market.id && {
                      backgroundColor: theme.primary + "15",
                    },
                  ]}
                >
                  <ThemedText style={styles.marketOptionName}>
                    {market.name}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.marketOptionWawi,
                      { color: theme.textSecondary },
                    ]}
                  >
                    {market.wawiNumber}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <ThemedText
            style={[styles.sectionLabel, { color: theme.textSecondary }]}
          >
            Kategorie
          </ThemedText>
          <View style={styles.categoryGrid}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.key}
                onPress={() => {
                  setCategory(cat.key);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor:
                      category === cat.key
                        ? theme.primary
                        : theme.cardBackground,
                    borderColor:
                      category === cat.key ? theme.primary : theme.border,
                  },
                ]}
              >
                <Feather
                  name={cat.icon}
                  size={20}
                  color={category === cat.key ? "#FFFFFF" : theme.text}
                />
                <ThemedText
                  style={[
                    styles.categoryLabel,
                    { color: category === cat.key ? "#FFFFFF" : theme.text },
                  ]}
                >
                  {cat.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        {category === "barcode" ? (
          <View style={styles.section}>
            <Input
              label="Barcode-Wert"
              placeholder="z.B. REWE2001ALEX"
              value={barcodeValue}
              onChangeText={setBarcodeValue}
              leftIcon="maximize"
            />

            {barcodeValue.trim().length > 0 ? (
              <View
                style={[
                  styles.barcodePreview,
                  {
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border,
                  },
                ]}
              >
                <ThemedText
                  style={[styles.previewLabel, { color: theme.textSecondary }]}
                >
                  Vorschau
                </ThemedText>
                <View
                  style={[
                    styles.barcodeWrapper,
                    { backgroundColor: "#FFFFFF" },
                  ]}
                >
                  <Barcode
                    value={barcodeValue.trim()}
                    format="CODE128"
                    width={2}
                    height={50}
                    background="#FFFFFF"
                    lineColor="#000000"
                  />
                </View>
                <ThemedText
                  style={[styles.barcodeValueText, { color: theme.text }]}
                >
                  {barcodeValue.trim()}
                </ThemedText>
              </View>
            ) : null}

            <ThemedText
              style={[
                styles.sectionLabel,
                { color: theme.textSecondary, marginTop: Spacing.lg },
              ]}
            >
              Beschreibung (optional)
            </ThemedText>
            <View
              style={[
                styles.textAreaContainer,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                },
              ]}
            >
              <TextInput
                placeholder="z.B. Scanner-Typ, Verwendung..."
                placeholderTextColor={theme.textSecondary}
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={3}
                style={[
                  styles.textArea,
                  styles.smallTextArea,
                  { color: theme.text },
                ]}
                textAlignVertical="top"
              />
            </View>
          </View>
        ) : (
          <View style={styles.section}>
            <ThemedText
              style={[styles.sectionLabel, { color: theme.textSecondary }]}
            >
              Information
            </ThemedText>
            <View
              style={[
                styles.textAreaContainer,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                },
              ]}
            >
              <TextInput
                placeholder="Beschreiben Sie die Information..."
                placeholderTextColor={theme.textSecondary}
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={6}
                style={[styles.textArea, { color: theme.text }]}
                textAlignVertical="top"
              />
            </View>
          </View>
        )}

        {error ? (
          <ThemedText style={[styles.error, { color: theme.error }]}>
            {error}
          </ThemedText>
        ) : null}

        <View
          style={[styles.infoBox, { backgroundColor: theme.primary + "10" }]}
        >
          <Feather name="info" size={18} color={theme.primary} />
          <ThemedText style={[styles.infoText, { color: theme.primary }]}>
            Ihre Ergaenzung wird zur Freigabe an einen Admin gesendet.
          </ThemedText>
        </View>

        <Button
          onPress={handleSubmit}
          disabled={isLoading}
          style={styles.submitButton}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            "Zur Freigabe senden"
          )}
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
  section: {
    marginBottom: Spacing["2xl"],
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  marketSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  selectedMarket: {
    flex: 1,
  },
  marketName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  marketWawi: {
    fontSize: 13,
    fontWeight: "600",
  },
  placeholder: {
    fontSize: 16,
  },
  marketList: {
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    maxHeight: 200,
    overflow: "hidden",
  },
  marketOption: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  marketOptionName: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 2,
  },
  marketOptionWawi: {
    fontSize: 12,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  categoryButton: {
    flex: 1,
    minWidth: "45%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: Spacing.sm,
  },
  textAreaContainer: {
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    padding: Spacing.sm,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  smallTextArea: {
    minHeight: 60,
  },
  barcodePreview: {
    marginTop: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: "center",
  },
  previewLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  barcodeWrapper: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  barcodeValueText: {
    fontSize: 14,
    fontWeight: "600",
  },
  error: {
    textAlign: "center",
    marginBottom: Spacing.md,
    fontSize: 14,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing["2xl"],
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    marginLeft: Spacing.sm,
    lineHeight: 18,
  },
  submitButton: {
    marginBottom: Spacing.lg,
  },
});
