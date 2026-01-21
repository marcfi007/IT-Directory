import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing } from "@/constants/theme";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { login, verify2FA } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Bitte alle Felder ausfuellen");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    setError("");

    const success = await login(email, password);

    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const demoUser = email.toLowerCase();
      if (
        demoUser === "admin@rewe-group.de" ||
        demoUser === "dev@rewe-group.de"
      ) {
        setShowTwoFactor(true);
      }
    } else {
      setError("Ungueltige Anmeldedaten");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setIsLoading(false);
  };

  const handleVerify2FA = async () => {
    if (twoFactorCode.length !== 6) {
      setError("Bitte 6-stelligen Code eingeben");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    setError("");

    const success = await verify2FA(twoFactorCode);

    if (!success) {
      setError("Ungueltiger 2FA Code");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setIsLoading(false);
  };

  const handleBackToLogin = () => {
    setShowTwoFactor(false);
    setTwoFactorCode("");
    setError("");
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAwareScrollViewCompat
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + Spacing["4xl"],
            paddingBottom: insets.bottom + Spacing["2xl"],
          },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <ThemedText type="h1" style={styles.title}>
            IT-Markt Verzeichnis
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            REWE Group - Servicetechniker
          </ThemedText>
        </View>

        {showTwoFactor ? (
          <View style={styles.formContainer}>
            <View
              style={[
                styles.twoFactorBadge,
                { backgroundColor: theme.primary + "15" },
              ]}
            >
              <ThemedText
                style={[styles.twoFactorText, { color: theme.primary }]}
              >
                2-Faktor-Authentifizierung
              </ThemedText>
            </View>

            <ThemedText
              style={[styles.twoFactorInfo, { color: theme.textSecondary }]}
            >
              Bitte geben Sie den 6-stelligen Code aus Ihrer Authenticator-App
              ein.
            </ThemedText>

            <Input
              label="2FA Code"
              placeholder="123456"
              value={twoFactorCode}
              onChangeText={setTwoFactorCode}
              keyboardType="number-pad"
              maxLength={6}
              leftIcon="shield"
              autoFocus
            />

            {error ? (
              <ThemedText style={[styles.error, { color: theme.error }]}>
                {error}
              </ThemedText>
            ) : null}

            <Button
              onPress={handleVerify2FA}
              disabled={isLoading}
              style={styles.button}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                "Verifizieren"
              )}
            </Button>

            <Pressable onPress={handleBackToLogin} style={styles.backButton}>
              <ThemedText style={{ color: theme.primary }}>
                Zurueck zur Anmeldung
              </ThemedText>
            </Pressable>

            <View
              style={[
                styles.demoHint,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <ThemedText
                style={[styles.demoHintText, { color: theme.textSecondary }]}
              >
                Demo: Code &quot;123456&quot; verwenden
              </ThemedText>
            </View>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <Input
              label="E-Mail"
              placeholder="ihre.email@firma.de"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              leftIcon="mail"
            />

            <Input
              label="Passwort"
              placeholder="Ihr Passwort"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              leftIcon="lock"
            />

            {error ? (
              <ThemedText style={[styles.error, { color: theme.error }]}>
                {error}
              </ThemedText>
            ) : null}

            <Button
              onPress={handleLogin}
              disabled={isLoading}
              style={styles.button}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                "Anmelden"
              )}
            </Button>

            <View
              style={[
                styles.demoHint,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <ThemedText
                type="small"
                style={[styles.demoHintTitle, { color: theme.text }]}
              >
                Demo-Zugaenge:
              </ThemedText>
              <ThemedText
                style={[styles.demoHintText, { color: theme.textSecondary }]}
              >
                admin@rewe-group.de / admin123{"\n"}
                dev@rewe-group.de / dev123{"\n"}
                tech@rewe-group.de / tech123
              </ThemedText>
            </View>
          </View>
        )}
      </KeyboardAwareScrollViewCompat>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing["2xl"],
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing["4xl"],
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: Spacing.lg,
  },
  title: {
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 16,
  },
  formContainer: {
    flex: 1,
  },
  twoFactorBadge: {
    alignSelf: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    marginBottom: Spacing.lg,
  },
  twoFactorText: {
    fontWeight: "600",
    fontSize: 14,
  },
  twoFactorInfo: {
    textAlign: "center",
    marginBottom: Spacing["2xl"],
    lineHeight: 22,
  },
  error: {
    textAlign: "center",
    marginBottom: Spacing.md,
    fontSize: 14,
  },
  button: {
    marginTop: Spacing.sm,
  },
  backButton: {
    alignItems: "center",
    marginTop: Spacing.lg,
    padding: Spacing.sm,
  },
  demoHint: {
    marginTop: Spacing["3xl"],
    padding: Spacing.lg,
    borderRadius: 12,
  },
  demoHintTitle: {
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  demoHintText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
