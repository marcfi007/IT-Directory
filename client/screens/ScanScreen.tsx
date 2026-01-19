import React, { useState, useEffect } from "react";
import { View, StyleSheet, Pressable, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useMarketContext } from "@/contexts/MarketContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { RootStackParamList } from "@/navigation/RootStackNavigator";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ScanScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { allMarkets } = useMarketContext();
  
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [torch, setTorch] = useState(false);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    setLastScanned(data);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const market = allMarkets.find(
      (m) => m.egateBarcode === data || m.wawiNumber === data
    );

    if (market) {
      navigation.navigate("MarketDetail", { marketId: market.id });
    }

    setTimeout(() => setScanned(false), 2000);
  };

  const toggleTorch = () => {
    setTorch(!torch);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (!permission) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.centered, { paddingTop: insets.top }]}>
          <ThemedText>Lade Kamera-Berechtigungen...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.centered, { paddingTop: insets.top + Spacing["4xl"] }]}>
          <View style={[styles.iconContainer, { backgroundColor: theme.primary + "15" }]}>
            <Feather name="camera-off" size={48} color={theme.primary} />
          </View>
          <ThemedText type="h3" style={styles.permissionTitle}>
            Kamera-Zugriff erforderlich
          </ThemedText>
          <ThemedText style={[styles.permissionText, { color: theme.textSecondary }]}>
            Um QR-Codes und Barcodes zu scannen, benoetigen wir Zugriff auf Ihre Kamera.
          </ThemedText>
          <Button onPress={requestPermission} style={styles.permissionButton}>
            Kamera aktivieren
          </Button>
        </View>
      </ThemedView>
    );
  }

  if (Platform.OS === "web") {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.centered, { paddingTop: insets.top + Spacing["4xl"] }]}>
          <View style={[styles.iconContainer, { backgroundColor: theme.primary + "15" }]}>
            <Feather name="smartphone" size={48} color={theme.primary} />
          </View>
          <ThemedText type="h3" style={styles.permissionTitle}>
            Scanner nur auf Mobilgeraet
          </ThemedText>
          <ThemedText style={[styles.permissionText, { color: theme.textSecondary }]}>
            Bitte nutzen Sie die Expo Go App auf Ihrem Smartphone, um den Barcode-Scanner zu verwenden.
          </ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "ean13", "ean8", "code128", "code39"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />

      <View style={[styles.overlay, { paddingTop: insets.top }]}>
        <Pressable
          onPress={toggleTorch}
          style={[styles.torchButton, { backgroundColor: torch ? theme.primary : "rgba(0,0,0,0.5)" }]}
        >
          <Feather name={torch ? "zap" : "zap-off"} size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      <View style={styles.scanFrame}>
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
      </View>

      <View style={[styles.bottomSheet, { paddingBottom: insets.bottom + Spacing.lg }]}>
        <ThemedText type="h4" style={styles.scanTitle}>
          QR-Code oder Barcode scannen
        </ThemedText>
        <ThemedText style={[styles.scanHint, { color: "rgba(255,255,255,0.7)" }]}>
          Richten Sie die Kamera auf einen eGate-Barcode oder WAWI-Nummer
        </ThemedText>

        {lastScanned ? (
          <View style={[styles.lastScannedBox, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
            <Feather name="check-circle" size={18} color={theme.verified} />
            <ThemedText style={styles.lastScannedText} numberOfLines={1}>
              Gescannt: {lastScanned}
            </ThemedText>
          </View>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingHorizontal: Spacing["2xl"],
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing["2xl"],
  },
  permissionTitle: {
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  permissionText: {
    textAlign: "center",
    marginBottom: Spacing["2xl"],
    lineHeight: 22,
  },
  permissionButton: {
    paddingHorizontal: Spacing["3xl"],
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: Spacing.lg,
    zIndex: 10,
  },
  torchButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  scanFrame: {
    position: "absolute",
    top: "30%",
    left: "15%",
    right: "15%",
    aspectRatio: 1,
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "#FFFFFF",
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 8,
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing["2xl"],
    paddingTop: Spacing["2xl"],
  },
  scanTitle: {
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  scanHint: {
    textAlign: "center",
    fontSize: 14,
    marginBottom: Spacing.lg,
  },
  lastScannedBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  lastScannedText: {
    color: "#FFFFFF",
    fontSize: 14,
    marginLeft: Spacing.sm,
    flex: 1,
  },
});
