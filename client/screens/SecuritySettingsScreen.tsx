import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Switch,
  Pressable,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";

const SECURITY_SETTINGS_KEY = "@security_settings";

interface SecuritySettings {
  biometricEnabled: boolean;
  autoLockEnabled: boolean;
  autoLockTimeout: number; // minutes
}

const DEFAULT_SETTINGS: SecuritySettings = {
  biometricEnabled: false,
  autoLockEnabled: true,
  autoLockTimeout: 5,
};

export default function SecuritySettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [settings, setSettings] = useState<SecuritySettings>(DEFAULT_SETTINGS);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    loadSettings();
    checkBiometricAvailability();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SECURITY_SETTINGS_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Error loading security settings:", error);
    }
  };

  const checkBiometricAvailability = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setBiometricAvailable(compatible && enrolled);
  };

  const updateSetting = async (
    key: keyof SecuritySettings,
    value: boolean | number,
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await AsyncStorage.setItem(
      SECURITY_SETTINGS_KEY,
      JSON.stringify(newSettings),
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Biometrische Authentifizierung aktivieren",
        disableDeviceFallback: false,
      });
      if (result.success) {
        updateSetting("biometricEnabled", true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } else {
      updateSetting("biometricEnabled", false);
    }
  };

  const handleChangePassword = () => {
    setPasswordError("");

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Alle Felder sind erforderlich");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Das Passwort muss mindestens 6 Zeichen lang sein");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Die Passwoerter stimmen nicht ueberein");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    // In a real app, this would verify the current password and update it
    Alert.alert("Erfolg", "Ihr Passwort wurde erfolgreich geaendert.", [
      { text: "OK", onPress: () => setShowPasswordModal(false) },
    ]);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
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
      >
        {/* Two Factor Status */}
        <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <View style={styles.statusCard}>
            <View
              style={[
                styles.statusIcon,
                {
                  backgroundColor: user?.twoFactorEnabled
                    ? theme.verified + "20"
                    : theme.warning + "20",
                },
              ]}
            >
              <Feather
                name={user?.twoFactorEnabled ? "shield" : "shield-off"}
                size={24}
                color={user?.twoFactorEnabled ? theme.verified : theme.warning}
              />
            </View>
            <View style={styles.statusContent}>
              <ThemedText style={styles.statusTitle}>
                2-Faktor-Authentifizierung
              </ThemedText>
              <ThemedText
                style={[
                  styles.statusDescription,
                  {
                    color: user?.twoFactorEnabled
                      ? theme.verified
                      : theme.warning,
                  },
                ]}
              >
                {user?.twoFactorEnabled ? "Aktiv" : "Inaktiv"}
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Biometric Authentication */}
        <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <ThemedText
            style={[styles.sectionTitle, { color: theme.textSecondary }]}
          >
            Geraetesicherheit
          </ThemedText>

          <View
            style={[styles.settingItem, { borderBottomColor: theme.border }]}
          >
            <View
              style={[
                styles.settingIcon,
                { backgroundColor: theme.primary + "15" },
              ]}
            >
              <Feather name="smartphone" size={20} color={theme.primary} />
            </View>
            <View style={styles.settingContent}>
              <ThemedText style={styles.settingTitle}>
                Biometrische Anmeldung
              </ThemedText>
              <ThemedText
                style={[
                  styles.settingDescription,
                  { color: theme.textSecondary },
                ]}
              >
                {biometricAvailable
                  ? "Face ID / Fingerabdruck verwenden"
                  : "Nicht verfuegbar auf diesem Geraet"}
              </ThemedText>
            </View>
            <Switch
              value={settings.biometricEnabled}
              onValueChange={handleBiometricToggle}
              disabled={!biometricAvailable}
              trackColor={{ false: theme.border, true: theme.primary + "60" }}
              thumbColor={
                settings.biometricEnabled ? theme.primary : theme.textSecondary
              }
            />
          </View>

          <View
            style={[styles.settingItem, { borderBottomColor: theme.border }]}
          >
            <View
              style={[
                styles.settingIcon,
                { backgroundColor: theme.primary + "15" },
              ]}
            >
              <Feather name="clock" size={20} color={theme.primary} />
            </View>
            <View style={styles.settingContent}>
              <ThemedText style={styles.settingTitle}>
                Automatische Sperre
              </ThemedText>
              <ThemedText
                style={[
                  styles.settingDescription,
                  { color: theme.textSecondary },
                ]}
              >
                App nach Inaktivitaet sperren
              </ThemedText>
            </View>
            <Switch
              value={settings.autoLockEnabled}
              onValueChange={(value) => updateSetting("autoLockEnabled", value)}
              trackColor={{ false: theme.border, true: theme.primary + "60" }}
              thumbColor={
                settings.autoLockEnabled ? theme.primary : theme.textSecondary
              }
            />
          </View>
        </View>

        {/* Password Change */}
        <View
          style={[styles.section, { backgroundColor: theme.cardBackground }]}
        >
          <ThemedText
            style={[styles.sectionTitle, { color: theme.textSecondary }]}
          >
            Passwort
          </ThemedText>

          <Pressable
            onPress={() => setShowPasswordModal(true)}
            style={[styles.settingItem, { borderBottomColor: theme.border }]}
          >
            <View
              style={[
                styles.settingIcon,
                { backgroundColor: theme.primary + "15" },
              ]}
            >
              <Feather name="lock" size={20} color={theme.primary} />
            </View>
            <View style={styles.settingContent}>
              <ThemedText style={styles.settingTitle}>
                Passwort aendern
              </ThemedText>
              <ThemedText
                style={[
                  styles.settingDescription,
                  { color: theme.textSecondary },
                ]}
              >
                Ihr Zugangskennwort aktualisieren
              </ThemedText>
            </View>
            <Feather
              name="chevron-right"
              size={20}
              color={theme.textSecondary}
            />
          </Pressable>
        </View>

        {/* Security Info */}
        <View
          style={[styles.infoBox, { backgroundColor: theme.verified + "10" }]}
        >
          <Feather name="check-circle" size={18} color={theme.verified} />
          <ThemedText style={[styles.infoText, { color: theme.verified }]}>
            Ihre Daten werden verschluesselt gespeichert und uebertragen.
          </ThemedText>
        </View>
      </ScrollView>

      {/* Password Change Modal */}
      <Modal
        visible={showPasswordModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPasswordModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: theme.cardBackground },
            ]}
          >
            <View style={styles.modalHeader}>
              <ThemedText type="h3">Passwort aendern</ThemedText>
              <Pressable
                onPress={() => setShowPasswordModal(false)}
                style={styles.modalClose}
              >
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ThemedText
              style={[styles.inputLabel, { color: theme.textSecondary }]}
            >
              Aktuelles Passwort
            </ThemedText>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Aktuelles Passwort"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
            />

            <ThemedText
              style={[styles.inputLabel, { color: theme.textSecondary }]}
            >
              Neues Passwort
            </ThemedText>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Neues Passwort (min. 6 Zeichen)"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
            />

            <ThemedText
              style={[styles.inputLabel, { color: theme.textSecondary }]}
            >
              Passwort bestaetigen
            </ThemedText>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Neues Passwort wiederholen"
              placeholderTextColor={theme.textSecondary}
              secureTextEntry
            />

            {passwordError ? (
              <ThemedText style={[styles.errorText, { color: theme.error }]}>
                {passwordError}
              </ThemedText>
            ) : null}

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setShowPasswordModal(false)}
                style={[styles.cancelButton, { borderColor: theme.border }]}
              >
                <ThemedText style={{ color: theme.text }}>Abbrechen</ThemedText>
              </Pressable>
              <Button onPress={handleChangePassword} style={styles.saveButton}>
                Speichern
              </Button>
            </View>
          </View>
        </View>
      </Modal>
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
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
  },
  statusIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  statusDescription: {
    fontSize: 14,
    fontWeight: "500",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  settingContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    marginLeft: Spacing.sm,
    lineHeight: 18,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    borderRadius: BorderRadius.lg,
    padding: Spacing["2xl"],
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  modalClose: {
    padding: Spacing.xs,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  modalInput: {
    height: 48,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    marginBottom: Spacing.sm,
  },
  errorText: {
    fontSize: 13,
    marginBottom: Spacing.md,
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    flex: 1,
  },
});
