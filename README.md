# IT-Markt Verzeichnis App

Eine mobile App für IT-Servicetechniker zur Verwaltung von Markt-Informationen mit sensiblen IT-Daten. Die App bietet rollenbasierte Zugriffskontrolle, 2-Faktor-Authentifizierung (verpflichtend für alle) und revisionssichere Protokollierung.

![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue)
![Expo](https://img.shields.io/badge/Expo-54-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![License](https://img.shields.io/badge/License-Private-red)

## Inhaltsverzeichnis

- [Features](#features)
- [Tech-Stack](#tech-stack)
- [Systemvoraussetzungen](#systemvoraussetzungen)
- [Installation](#installation)
- [APK Build (Android)](#apk-build-android)
- [Server-Konfiguration](#server-konfiguration)
- [Demo-Zugänge](#demo-zugänge)
- [Benutzerrollen & Berechtigungen](#benutzerrollen--berechtigungen)
- [2-Faktor-Authentifizierung](#2-faktor-authentifizierung)
- [Registrierung](#registrierung)
- [Projektstruktur](#projektstruktur)
- [Troubleshooting](#troubleshooting)

## Features

- **Markt-Verzeichnis**: Zentrale Verwaltung aller IT-relevanten Marktinformationen
- **Sichere Code-Speicherung**: Verschlüsselte Türcodes mit Verlaufshistorie
- **Barcode-Integration**: Separate Barcodes für Kasse und ExitGate (CODE128-Format)
- **Rollenbasierte Berechtigungen**: Admin, Entwickler, Techniker
- **2-Faktor-Authentifizierung**: Verpflichtend für ALLE Benutzer (TOTP oder E-Mail)
- **Registrierung mit Freigabe**: Neue Benutzer müssen von Admin/Entwickler freigegeben werden
- **Audit-Protokollierung**: Vollständige Nachverfolgung aller Änderungen
- **Offline-Fähig**: Daten werden lokal zwischengespeichert

## Tech-Stack

| Komponente | Technologie |
|------------|-------------|
| Frontend | React Native 0.81.5 mit Expo 54 |
| Sprache | TypeScript 5.9 |
| Navigation | React Navigation 7+ |
| State Management | React Context + TanStack Query |
| Datenspeicherung | AsyncStorage (lokaler Cache) |
| Backend | Express.js (optional) |
| Barcode | @kichiyaki/react-native-barcode-generator |
| 2FA | TOTP (Authenticator App) oder E-Mail |

## Systemvoraussetzungen

### Für Entwicklung

- **Node.js**: Version 18.x oder höher
- **npm**: Version 9.x oder höher
- **Git**: Für Versionskontrolle
- **Java JDK**: Version 17 (für Android-Builds)
- **Android Studio**: Für Android SDK und Emulatoren

### Für APK-Build

- **EAS CLI**: Expo Application Services
- **Expo Account**: Kostenlos auf expo.dev

### Für Mobile Testing

- **Android**: Android 6.0+ (API Level 23)
- **iOS**: iPhone mit iOS 13.0+ (nur mit macOS)

## Installation

### 1. Repository klonen

```bash
git clone https://github.com/marcfi007/IT-Directory.git
cd IT-Directory
```

### 2. Dependencies installieren

```bash
npm install
```

### 3. App starten (Entwicklung)

```bash
# Mit Expo Go App auf dem Handy
npm run expo:dev

# Im Android Emulator
npx expo start --android

# Im iOS Simulator (nur macOS)
npx expo start --ios

# Im Browser (Web)
npx expo start --web
```

## APK Build (Android)

### Methode 1: EAS Build (Empfohlen)

EAS Build erstellt die APK in der Cloud - kein lokales Android SDK erforderlich.

#### 1. EAS CLI installieren

```bash
npm install -g eas-cli
```

#### 2. Bei Expo anmelden

```bash
eas login
```

#### 3. EAS konfigurieren (einmalig)

```bash
eas build:configure
```

#### 4. APK erstellen

```bash
# Development APK (zum Testen)
eas build --platform android --profile preview

# Production APK
eas build --platform android --profile production
```

#### 5. APK herunterladen

Nach Abschluss des Builds erhalten Sie einen Download-Link. Die APK kann direkt auf Android-Geräten installiert werden.

### Methode 2: Lokaler Build

Für lokale Builds benötigen Sie Android Studio und das Android SDK.

#### 1. Voraussetzungen

```bash
# Prüfen, ob Android SDK installiert ist
echo $ANDROID_HOME

# Sollte ausgeben: /Users/[username]/Library/Android/sdk (macOS)
# oder: C:\Users\[username]\AppData\Local\Android\Sdk (Windows)
```

#### 2. Native Ordner generieren

```bash
npx expo prebuild --platform android
```

#### 3. Debug APK erstellen

```bash
cd android
./gradlew assembleDebug
```

Die APK befindet sich in: `android/app/build/outputs/apk/debug/app-debug.apk`

#### 4. Release APK erstellen

```bash
cd android
./gradlew assembleRelease
```

### APK auf Gerät installieren

```bash
# Via ADB (Android Debug Bridge)
adb install app-release.apk

# Oder: APK auf Gerät kopieren und dort öffnen
```

## Server-Konfiguration

Die App funktioniert standalone mit AsyncStorage. Für Produktionsumgebungen empfehlen wir ein Backend.

### Lokaler Entwicklungsserver

```bash
# Server starten
npm run server:dev

# Server läuft auf http://localhost:5000
```

### Produktions-Backend einrichten

#### 1. Umgebungsvariablen

Erstellen Sie `.env.local`:

```env
# API Endpoint
EXPO_PUBLIC_API_URL=https://api.ihre-domain.de

# Datenbank (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/itmarkt

# JWT für Authentifizierung
JWT_SECRET=ihr-super-geheimer-schluessel-mindestens-32-zeichen

# E-Mail für 2FA (SMTP)
SMTP_HOST=smtp.ihre-domain.de
SMTP_PORT=587
SMTP_USER=noreply@ihre-domain.de
SMTP_PASS=ihr-smtp-passwort
SMTP_FROM=IT-Markt <noreply@ihre-domain.de>
```

#### 2. Datenbank einrichten

```bash
# Datenbank-Schema pushen (Drizzle ORM)
npm run db:push
```

#### 3. Server für Produktion bauen

```bash
# Server kompilieren
npm run server:build

# Server starten
npm run server:prod
```

### Docker Deployment

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY server_dist ./server_dist

EXPOSE 5000
CMD ["node", "server_dist/index.js"]
```

```bash
# Docker Image bauen
docker build -t itmarkt-server .

# Container starten
docker run -d -p 5000:5000 --env-file .env itmarkt-server
```

## Demo-Zugänge

| Rolle | E-Mail | Passwort | 2FA |
|-------|--------|----------|-----|
| Administrator | `admin@rewe-group.de` | `admin123` | TOTP |
| Entwickler | `dev@rewe-group.de` | `dev123` | TOTP |
| Techniker | `tech@rewe-group.de` | `tech123` | E-Mail |

> **Hinweis**: Bei der Demo wird der 2FA-Code in der Browser-Konsole angezeigt. In Produktion erfolgt die Zustellung per E-Mail oder Authenticator-App.

## Benutzerrollen & Berechtigungen

### Administrator
- Vollzugriff auf alle Funktionen
- Kann Märkte bearbeiten und löschen
- Kann Informationen bearbeiten und löschen
- Kann Ergänzungen freigeben/ablehnen
- Kann Benutzer verwalten und Registrierungen freigeben
- Zugriff auf Audit-Logs
- **2FA ist verpflichtend**

### Entwickler
- Gleiche Rechte wie Administrator
- Kann Registrierungen freigeben
- Zugriff auf API-Status
- **2FA ist verpflichtend**

### Techniker
- Kann Märkte ansehen und durchsuchen
- Kann neue Märkte anlegen
- Kann Informationen hinzufügen (zur Freigabe)
- Kann Türcodes ansehen und aktualisieren
- **2FA ist verpflichtend**

### Berechtigungsübersicht

| Aktion | Admin | Entwickler | Techniker |
|--------|-------|------------|-----------|
| Märkte ansehen | ✅ | ✅ | ✅ |
| Märkte anlegen | ✅ | ✅ | ✅ |
| Märkte bearbeiten | ✅ | ❌ | ❌ |
| Märkte löschen | ✅ | ❌ | ❌ |
| Infos hinzufügen | ✅ | ✅ | ✅ |
| Infos freigeben | ✅ | ❌ | ❌ |
| Infos löschen | ✅ | ❌ | ❌ |
| Benutzer verwalten | ✅ | ❌ | ❌ |
| Registrierungen freigeben | ✅ | ✅ | ❌ |

## 2-Faktor-Authentifizierung

2FA ist **verpflichtend für ALLE Benutzer**.

### Unterstützte Methoden

#### 1. TOTP (Authenticator App)
- Google Authenticator
- Microsoft Authenticator
- Authy
- 1Password
- Bitwarden

#### 2. E-Mail
- 6-stelliger Code per E-Mail
- Gültig für 5 Minuten

### 2FA einrichten

1. Bei der ersten Anmeldung wird 2FA-Einrichtung gefordert
2. Methode wählen (TOTP oder E-Mail)
3. Bei TOTP: Secret in Authenticator-App eingeben
4. Verifizierungscode eingeben

### 2FA-Codes (Demo)

In der Entwicklungsumgebung werden die Codes in der Konsole angezeigt:
```
[2FA Email] Code fuer admin@rewe-group.de: 123456
[2FA TOTP] Code fuer dev@rewe-group.de: 654321
```

## Registrierung

### Ablauf

1. **Registrierung beantragen**: Benutzer füllt Registrierungsformular aus
2. **Warten auf Freigabe**: Admin oder Entwickler prüft die Anfrage
3. **Freigabe/Ablehnung**: Admin weist eine Rolle zu und gibt frei
4. **2FA einrichten**: Beim ersten Login muss 2FA eingerichtet werden
5. **Zugang aktiv**: Benutzer kann die App vollständig nutzen

### Als Admin Registrierungen verwalten

1. Profil → Admin-Bereich
2. Tab "Registr." wählen
3. Anfrage prüfen
4. Rolle zuweisen (Admin/Entwickler/Techniker)
5. Freigeben oder Ablehnen

## Projektstruktur

```
IT-Directory/
├── client/                     # React Native App
│   ├── App.tsx                 # Haupt-App
│   ├── components/             # UI-Komponenten
│   ├── contexts/
│   │   ├── AuthContext.tsx     # Authentifizierung & 2FA
│   │   └── MarketContext.tsx   # Markt-Daten
│   ├── hooks/
│   │   └── useMarkets.ts       # Markt-Logik
│   ├── navigation/             # Navigation
│   ├── screens/
│   │   ├── LoginScreen.tsx     # Login, Registrierung, 2FA
│   │   ├── MarketsScreen.tsx   # Markt-Übersicht
│   │   ├── MarketDetailScreen.tsx # Markt-Details mit Barcodes
│   │   ├── AdminPanelScreen.tsx # Admin: Freigaben, Benutzer, Registrierungen
│   │   └── ...
│   └── types/
│       └── index.ts            # TypeScript Typen
├── server/                     # Express Backend
├── assets/                     # Bilder & Icons
├── app.json                    # Expo Konfiguration
├── eas.json                    # EAS Build Konfiguration
├── package.json
└── README.md
```

## Barcode-Felder

Die App unterstützt zwei separate Barcode-Felder pro Markt:

| Feld | Verwendung |
|------|------------|
| **Kassen-Barcode** | Für Kassen-Zugang und -Verwaltung |
| **ExitGate-Barcode** | Für eGate/Ausgang-Zugang |

Barcodes werden im **CODE128-Format** angezeigt und können direkt gescannt werden.

## Troubleshooting

### APK Build schlägt fehl

```bash
# EAS Cache löschen
eas build:cancel
eas build --clear-cache --platform android

# Lokaler Build: Gradle Cache löschen
cd android && ./gradlew clean
```

### 2FA Code wird nicht akzeptiert

- Stellen Sie sicher, dass die Systemzeit korrekt ist (für TOTP)
- E-Mail-Codes sind nur 5 Minuten gültig
- Fordern Sie einen neuen Code an

### Expo Go zeigt "Network Error"

```bash
# Tunnel-Modus verwenden
npx expo start --tunnel
```

### Metro Bundler Probleme

```bash
# Cache löschen und neu starten
npx expo start -c
```

### AsyncStorage Daten zurücksetzen

```javascript
// In der App-Konsole ausführen:
import AsyncStorage from '@react-native-async-storage/async-storage';
await AsyncStorage.clear();
```

## Support

Bei Fragen oder Problemen:
- GitHub Issue erstellen
- Dokumentation in `/docs` prüfen

---

© 2024-2026 IT-Markt Verzeichnis. Alle Rechte vorbehalten.
