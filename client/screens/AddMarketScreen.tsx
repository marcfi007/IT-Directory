import React, { useState } from "react";
import { View, StyleSheet, ScrollView, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useMarketContext } from "@/contexts/MarketContext";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function AddMarketScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { addMarket } = useMarketContext();

  const [wawiNumber, setWawiNumber] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [parkingInfo, setParkingInfo] = useState("");
  const [doorCodes, setDoorCodes] = useState("");
  const [egateAccess, setEgateAccess] = useState("");
  const [egateBarcode, setEgateBarcode] = useState("");
  const [serverLocation, setServerLocation] = useState("");
  const [switchRouterLocation, setSwitchRouterLocation] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [freeTextNotes, setFreeTextNotes] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!wawiNumber.trim()) {
      setError("WAWI-Nummer ist erforderlich");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!name.trim()) {
      setError("Marktname ist erforderlich");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!address.trim()) {
      setError("Adresse ist erforderlich");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!city.trim()) {
      setError("Stadt ist erforderlich");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (!user) return;

    setIsLoading(true);
    setError("");

    try {
      await addMarket(
        {
          wawiNumber: wawiNumber.trim(),
          name: name.trim(),
          address: address.trim(),
          city: city.trim(),
          contactPerson: contactPerson.trim() || undefined,
          parkingInfo: parkingInfo.trim() || undefined,
          doorCodes: doorCodes.trim()
            ? `encrypted:${doorCodes.trim()}`
            : undefined,
          egateAccess: egateAccess.trim() || undefined,
          egateBarcode: egateBarcode.trim() || undefined,
          serverLocation: serverLocation.trim() || undefined,
          switchRouterLocation: switchRouterLocation.trim() || undefined,
          specialNotes: specialNotes.trim() || undefined,
          freeTextNotes: freeTextNotes.trim() || undefined,
          createdBy: user.id,
        },
        user.id,
        user.name,
      );

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
        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
        >
          <ThemedText style={[styles.sectionTitle, { color: theme.primary }]}>
            Pflichtangaben
          </ThemedText>

          <Input
            label="WAWI-Marktnummer *"
            placeholder="z.B. 1006"
            value={wawiNumber}
            onChangeText={setWawiNumber}
            keyboardType="number-pad"
            leftIcon="hash"
          />

          <Input
            label="Marktname *"
            placeholder="z.B. MediaMarkt Berlin Mitte"
            value={name}
            onChangeText={setName}
            leftIcon="shopping-bag"
          />

          <Input
            label="Adresse *"
            placeholder="z.B. Alexanderplatz 1"
            value={address}
            onChangeText={setAddress}
            leftIcon="map-pin"
          />

          <Input
            label="Stadt *"
            placeholder="z.B. Berlin"
            value={city}
            onChangeText={setCity}
            leftIcon="map"
          />
        </View>

        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
        >
          <ThemedText style={[styles.sectionTitle, { color: theme.primary }]}>
            Kontakt & Zugang
          </ThemedText>

          <Input
            label="Ansprechpartner"
            placeholder="z.B. Herr Mueller"
            value={contactPerson}
            onChangeText={setContactPerson}
            leftIcon="user"
          />

          <Input
            label="Parkplatz-Info"
            placeholder="z.B. Tiefgarage Einfahrt links"
            value={parkingInfo}
            onChangeText={setParkingInfo}
            leftIcon="navigation"
          />

          <Input
            label="Tuercodes"
            placeholder="z.B. 4521"
            value={doorCodes}
            onChangeText={setDoorCodes}
            leftIcon="lock"
          />

          <Input
            label="eGate-Zugang"
            placeholder="z.B. Badge + PIN"
            value={egateAccess}
            onChangeText={setEgateAccess}
            leftIcon="key"
          />

          <Input
            label="eGate-Barcode"
            placeholder="z.B. MM1006MITTE"
            value={egateBarcode}
            onChangeText={setEgateBarcode}
            leftIcon="maximize"
          />
        </View>

        <View
          style={[
            styles.section,
            {
              backgroundColor: theme.cardBackground,
              borderColor: theme.border,
            },
          ]}
        >
          <ThemedText style={[styles.sectionTitle, { color: theme.primary }]}>
            IT-Infrastruktur
          </ThemedText>

          <Input
            label="Server-Standort"
            placeholder="z.B. Serverraum UG, Rack 3"
            value={serverLocation}
            onChangeText={setServerLocation}
            leftIcon="server"
          />

          <Input
            label="Switch/Router Standort"
            placeholder="z.B. Hauptverteiler EG"
            value={switchRouterLocation}
            onChangeText={setSwitchRouterLocation}
            leftIcon="git-branch"
          />

          <Input
            label="Besonderheiten"
            placeholder="z.B. VLAN 10 fuer Kassen"
            value={specialNotes}
            onChangeText={setSpecialNotes}
            leftIcon="alert-circle"
          />

          <Input
            label="Freitext-Notizen"
            placeholder="Weitere Informationen..."
            value={freeTextNotes}
            onChangeText={setFreeTextNotes}
            leftIcon="file-text"
          />
        </View>

        {error ? (
          <ThemedText style={[styles.error, { color: theme.error }]}>
            {error}
          </ThemedText>
        ) : null}

        <Button
          onPress={handleSubmit}
          disabled={isLoading}
          style={styles.submitButton}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            "Markt anlegen"
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
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.lg,
  },
  error: {
    textAlign: "center",
    marginBottom: Spacing.md,
    fontSize: 14,
  },
  submitButton: {
    marginBottom: Spacing.lg,
  },
});
