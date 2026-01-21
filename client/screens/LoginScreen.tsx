import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Image,
  Pressable,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { TwoFactorMethod } from "@/types";

type ScreenMode = "login" | "register" | "2fa" | "2fa-setup";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { login, verify2FA, register, setup2FA, send2FACode, pendingUser, requires2FASetup } = useAuth();

  const [screenMode, setScreenMode] = useState<ScreenMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const [selected2FAMethod, setSelected2FAMethod] = useState<TwoFactorMethod>("email");
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Bitte alle Felder ausfuellen");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    setError("");

    const result = await login(email, password);

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (result.requires2FASetup) {
        setScreenMode("2fa-setup");
      } else if (result.requires2FA) {
        setScreenMode("2fa");
      }
    } else {
      setError(result.error || "Ungueltige Anmeldedaten");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setIsLoading(false);
  };

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !name.trim()) {
      setError("Bitte alle Felder ausfuellen");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwoerter stimmen nicht ueberein");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    if (password.length < 6) {
      setError("Passwort muss mindestens 6 Zeichen lang sein");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    setError("");

    const result = await register(email, password, name);

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSuccessMessage(result.message);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setName("");
      setTimeout(() => {
        setScreenMode("login");
        setSuccessMessage("");
      }, 3000);
    } else {
      setError(result.message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    setIsLoading(false);
  };

  const handleSetup2FA = async () => {
    setIsLoading(true);
    setError("");

    const result = await setup2FA(selected2FAMethod);

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (result.secret) {
        setTotpSecret(result.secret);
      }
      setScreenMode("2fa");
    } else {
      setError("2FA-Einrichtung fehlgeschlagen");
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

  const handleResendCode = async () => {
    setIsLoading(true);
    const success = await send2FACode();
    if (success) {
      setSuccessMessage("Neuer Code wurde gesendet");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
    setIsLoading(false);
  };

  const handleBackToLogin = () => {
    setScreenMode("login");
    setTwoFactorCode("");
    setError("");
    setSuccessMessage("");
    setTotpSecret(null);
  };

  const renderLogin = () => (
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

      <Pressable
        onPress={() => {
          setScreenMode("register");
          setError("");
        }}
        style={styles.linkButton}
      >
        <ThemedText style={{ color: theme.primary }}>
          Noch kein Konto? Registrieren
        </ThemedText>
      </Pressable>

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
  );

  const renderRegister = () => (
    <View style={styles.formContainer}>
      <View
        style={[
          styles.infoBadge,
          { backgroundColor: theme.primary + "15" },
        ]}
      >
        <Feather name="info" size={16} color={theme.primary} />
        <ThemedText
          style={[styles.infoText, { color: theme.primary }]}
        >
          Nach der Registrierung muss ein Administrator Ihr Konto freigeben. 2FA ist fuer alle Benutzer verpflichtend.
        </ThemedText>
      </View>

      <Input
        label="Name"
        placeholder="Vor- und Nachname"
        value={name}
        onChangeText={setName}
        leftIcon="user"
      />

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
        placeholder="Mindestens 6 Zeichen"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        leftIcon="lock"
      />

      <Input
        label="Passwort bestaetigen"
        placeholder="Passwort wiederholen"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        leftIcon="lock"
      />

      {error ? (
        <ThemedText style={[styles.error, { color: theme.error }]}>
          {error}
        </ThemedText>
      ) : null}

      {successMessage ? (
        <View style={[styles.successBox, { backgroundColor: theme.verified + "15" }]}>
          <Feather name="check-circle" size={16} color={theme.verified} />
          <ThemedText style={[styles.successText, { color: theme.verified }]}>
            {successMessage}
          </ThemedText>
        </View>
      ) : null}

      <Button
        onPress={handleRegister}
        disabled={isLoading}
        style={styles.button}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          "Registrierung beantragen"
        )}
      </Button>

      <Pressable onPress={handleBackToLogin} style={styles.linkButton}>
        <ThemedText style={{ color: theme.primary }}>
          Bereits ein Konto? Anmelden
        </ThemedText>
      </Pressable>
    </View>
  );

  const render2FASetup = () => (
    <View style={styles.formContainer}>
      <View
        style={[
          styles.twoFactorBadge,
          { backgroundColor: theme.warning + "15" },
        ]}
      >
        <Feather name="shield" size={18} color={theme.warning} />
        <ThemedText
          style={[styles.twoFactorText, { color: theme.warning }]}
        >
          2FA-Einrichtung erforderlich
        </ThemedText>
      </View>

      <ThemedText
        style={[styles.twoFactorInfo, { color: theme.textSecondary }]}
      >
        Fuer Ihre Sicherheit ist die 2-Faktor-Authentifizierung verpflichtend. Waehlen Sie Ihre bevorzugte Methode:
      </ThemedText>

      <Pressable
        onPress={() => setSelected2FAMethod("email")}
        style={[
          styles.methodOption,
          { 
            borderColor: selected2FAMethod === "email" ? theme.primary : theme.border,
            backgroundColor: selected2FAMethod === "email" ? theme.primary + "10" : "transparent",
          },
        ]}
      >
        <Feather 
          name="mail" 
          size={24} 
          color={selected2FAMethod === "email" ? theme.primary : theme.textSecondary} 
        />
        <View style={styles.methodTextContainer}>
          <ThemedText style={[styles.methodTitle, { color: selected2FAMethod === "email" ? theme.primary : theme.text }]}>
            E-Mail
          </ThemedText>
          <ThemedText style={[styles.methodDescription, { color: theme.textSecondary }]}>
            Code per E-Mail erhalten
          </ThemedText>
        </View>
        {selected2FAMethod === "email" ? (
          <Feather name="check-circle" size={20} color={theme.primary} />
        ) : null}
      </Pressable>

      <Pressable
        onPress={() => setSelected2FAMethod("totp")}
        style={[
          styles.methodOption,
          { 
            borderColor: selected2FAMethod === "totp" ? theme.primary : theme.border,
            backgroundColor: selected2FAMethod === "totp" ? theme.primary + "10" : "transparent",
          },
        ]}
      >
        <Feather 
          name="smartphone" 
          size={24} 
          color={selected2FAMethod === "totp" ? theme.primary : theme.textSecondary} 
        />
        <View style={styles.methodTextContainer}>
          <ThemedText style={[styles.methodTitle, { color: selected2FAMethod === "totp" ? theme.primary : theme.text }]}>
            Authenticator App
          </ThemedText>
          <ThemedText style={[styles.methodDescription, { color: theme.textSecondary }]}>
            Google/Microsoft Authenticator, etc.
          </ThemedText>
        </View>
        {selected2FAMethod === "totp" ? (
          <Feather name="check-circle" size={20} color={theme.primary} />
        ) : null}
      </Pressable>

      {error ? (
        <ThemedText style={[styles.error, { color: theme.error }]}>
          {error}
        </ThemedText>
      ) : null}

      <Button
        onPress={handleSetup2FA}
        disabled={isLoading}
        style={styles.button}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          "2FA einrichten"
        )}
      </Button>

      <Pressable onPress={handleBackToLogin} style={styles.linkButton}>
        <ThemedText style={{ color: theme.primary }}>
          Zurueck zur Anmeldung
        </ThemedText>
      </Pressable>
    </View>
  );

  const render2FA = () => (
    <View style={styles.formContainer}>
      <View
        style={[
          styles.twoFactorBadge,
          { backgroundColor: theme.primary + "15" },
        ]}
      >
        <Feather name="shield" size={18} color={theme.primary} />
        <ThemedText
          style={[styles.twoFactorText, { color: theme.primary }]}
        >
          2-Faktor-Authentifizierung
        </ThemedText>
      </View>

      {totpSecret ? (
        <View style={[styles.secretBox, { backgroundColor: theme.backgroundSecondary }]}>
          <ThemedText style={[styles.secretLabel, { color: theme.textSecondary }]}>
            Ihr TOTP-Secret (fuer Authenticator App):
          </ThemedText>
          <ThemedText style={[styles.secretValue, { color: theme.text }]}>
            {totpSecret}
          </ThemedText>
        </View>
      ) : null}

      <ThemedText
        style={[styles.twoFactorInfo, { color: theme.textSecondary }]}
      >
        {pendingUser?.twoFactorMethod === "email" 
          ? "Ein 6-stelliger Code wurde an Ihre E-Mail gesendet."
          : "Geben Sie den Code aus Ihrer Authenticator-App ein."}
      </ThemedText>

      <Input
        label="Verifizierungscode"
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

      {successMessage ? (
        <View style={[styles.successBox, { backgroundColor: theme.verified + "15" }]}>
          <Feather name="check-circle" size={16} color={theme.verified} />
          <ThemedText style={[styles.successText, { color: theme.verified }]}>
            {successMessage}
          </ThemedText>
        </View>
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

      <Pressable onPress={handleResendCode} style={styles.linkButton}>
        <ThemedText style={{ color: theme.primary }}>
          Code erneut senden
        </ThemedText>
      </Pressable>

      <Pressable onPress={handleBackToLogin} style={styles.linkButton}>
        <ThemedText style={{ color: theme.textSecondary }}>
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
          Demo: Der Code wird in der Konsole angezeigt (in Produktion per E-Mail/App)
        </ThemedText>
      </View>
    </View>
  );

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
            {screenMode === "register" ? "Neues Konto erstellen" : "Servicetechniker Portal"}
          </ThemedText>
        </View>

        {screenMode === "login" && renderLogin()}
        {screenMode === "register" && renderRegister()}
        {screenMode === "2fa-setup" && render2FASetup()}
        {screenMode === "2fa" && render2FA()}
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
    marginBottom: Spacing["3xl"],
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
  infoBadge: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    marginLeft: Spacing.sm,
    lineHeight: 18,
  },
  twoFactorBadge: {
    flexDirection: "row",
    alignSelf: "center",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
    marginBottom: Spacing.lg,
  },
  twoFactorText: {
    fontWeight: "600",
    fontSize: 14,
    marginLeft: Spacing.sm,
  },
  twoFactorInfo: {
    textAlign: "center",
    marginBottom: Spacing["2xl"],
    lineHeight: 22,
  },
  methodOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    marginBottom: Spacing.md,
  },
  methodTextContainer: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  methodDescription: {
    fontSize: 13,
  },
  secretBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
    alignItems: "center",
  },
  secretLabel: {
    fontSize: 12,
    marginBottom: Spacing.xs,
  },
  secretValue: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "monospace",
    letterSpacing: 2,
  },
  error: {
    textAlign: "center",
    marginBottom: Spacing.md,
    fontSize: 14,
  },
  successBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  successText: {
    flex: 1,
    fontSize: 14,
    marginLeft: Spacing.sm,
  },
  button: {
    marginTop: Spacing.sm,
  },
  linkButton: {
    alignItems: "center",
    marginTop: Spacing.lg,
    padding: Spacing.sm,
  },
  demoHint: {
    marginTop: Spacing["2xl"],
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
