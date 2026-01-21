# IT-Markt Verzeichnis App

Eine mobile App für IT-Servicetechniker zur Verwaltung von Markt-Informationen mit sensiblen IT-Daten. Die App bietet rollenbasierte Zugriffskontrolle, 2-Faktor-Authentifizierung und revisionssichere Protokollierung.

![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue)
![Expo](https://img.shields.io/badge/Expo-54-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![License](https://img.shields.io/badge/License-Private-red)

## Inhaltsverzeichnis

- [Features](#features)
- [Screenshots](#screenshots)
- [Tech-Stack](#tech-stack)
- [Systemvoraussetzungen](#systemvoraussetzungen)
- [Installation](#installation)
- [Konfiguration](#konfiguration)
- [Demo-Zugänge](#demo-zugänge)
- [Projektstruktur](#projektstruktur)
- [Benutzerrollen](#benutzerrollen)
- [Hauptfunktionen](#hauptfunktionen)
- [Development](#development)
- [Build & Deployment](#build--deployment)
- [Troubleshooting](#troubleshooting)

## Features

- **Markt-Verzeichnis**: Zentrale Verwaltung aller IT-relevanten Marktinformationen
- **Sichere Code-Speicherung**: Verschlüsselte Türcodes mit Verlaufshistorie
- **Barcode-Integration**: Anzeige und Scannen von Barcodes (CODE128-Format)
- **Rollenbasierte Berechtigungen**: Admin, Entwickler, Techniker
- **2-Faktor-Authentifizierung**: Für Admins und Entwickler verpflichtend
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
| Backend | Express.js (für statische Dateien) |
| Barcode | @kichiyaki/react-native-barcode-generator |
| Icons | @expo/vector-icons (Feather) |

## Systemvoraussetzungen

### Für Entwicklung

- **Node.js**: Version 18.x oder höher
- **npm**: Version 9.x oder höher (oder yarn/pnpm)
- **Git**: Für Versionskontrolle
- **Expo CLI**: Wird automatisch über npx verwendet

### Für Mobile Testing

- **iOS**: iPhone mit iOS 13.0+ oder iOS Simulator (nur macOS)
- **Android**: Android 6.0+ (API Level 23) oder Android Emulator
- **Expo Go App**: Für schnelles Testing auf physischen Geräten

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

### 3. Expo CLI prüfen

Expo wird über npx verwendet, keine separate Installation nötig:

```bash
npx expo --version
```

### 4. App starten

#### Option A: Mit Expo Go (empfohlen für Entwicklung)

```bash
# Frontend starten
npm run expo:dev
```

Scanne den QR-Code mit:
- **iOS**: Kamera-App öffnen und QR-Code scannen
- **Android**: Expo Go App öffnen und QR-Code scannen

#### Option B: Mit Simulator/Emulator

```bash
# iOS Simulator (nur macOS)
npx expo start --ios

# Android Emulator
npx expo start --android
```

#### Option C: Web-Version

```bash
npx expo start --web
```

### 5. Backend starten (optional)

Das Backend ist für die lokale Entwicklung optional, da die App AsyncStorage für Datenspeicherung verwendet:

```bash
npm run server:dev
```

## Konfiguration

### Umgebungsvariablen

Erstelle eine `.env.local` Datei für lokale Konfiguration:

```env
# API Endpoint (optional, wenn Backend verwendet wird)
EXPO_PUBLIC_API_URL=http://localhost:5000

# Feature Flags
EXPO_PUBLIC_ENABLE_BARCODE_SCANNER=true
EXPO_PUBLIC_ENABLE_BIOMETRIC_AUTH=true
```

### App-Konfiguration

Die App-Konfiguration befindet sich in `app.json`:

```json
{
  "expo": {
    "name": "Techniker Verzeichnissapp",
    "slug": "technikerverzeichnissapp",
    "version": "1.0.0",
    ...
  }
}
```

## Demo-Zugänge

| Rolle | E-Mail | Passwort | 2FA Code |
|-------|--------|----------|----------|
| Administrator | `admin@rewe-group.de` | `admin123` | `123456` |
| Entwickler | `dev@rewe-group.de` | `dev123` | `123456` |
| Techniker | `tech@rewe-group.de` | `tech123` | - |

> **Hinweis**: Der 2FA-Code ist für Demo-Zwecke statisch auf `123456` gesetzt.

## Projektstruktur

```
IT-Directory/
├── client/                     # React Native App
│   ├── App.tsx                 # Haupt-App mit Providern
│   ├── components/             # Wiederverwendbare UI-Komponenten
│   │   ├── ActivityItem.tsx    # Aktivitäts-Log Eintrag
│   │   ├── Button.tsx          # Button-Komponente
│   │   ├── Card.tsx            # Karten-Komponente
│   │   ├── EmptyState.tsx      # Leerer Zustand Anzeige
│   │   ├── FAB.tsx             # Floating Action Button
│   │   ├── InfoRow.tsx         # Info-Zeile mit Kopieren/Bearbeiten
│   │   ├── InfoSection.tsx     # Aufklappbare Info-Sektion
│   │   ├── Input.tsx           # Eingabefeld-Komponente
│   │   ├── MarketCard.tsx      # Markt-Karte
│   │   ├── RoleBadge.tsx       # Rollen-Badge
│   │   └── SearchBar.tsx       # Suchleiste
│   ├── constants/
│   │   └── theme.ts            # Design-Tokens & Farben
│   ├── contexts/
│   │   ├── AuthContext.tsx     # Authentifizierung State
│   │   └── MarketContext.tsx   # Markt-Daten State
│   ├── hooks/
│   │   ├── useMarkets.ts       # Markt-Daten Logik
│   │   ├── useScreenOptions.ts # Navigation Optionen
│   │   └── useTheme.ts         # Theme Hook
│   ├── navigation/
│   │   ├── RootStackNavigator.tsx
│   │   ├── MainTabNavigator.tsx
│   │   └── *StackNavigator.tsx
│   ├── screens/
│   │   ├── LoginScreen.tsx           # Anmeldung + 2FA
│   │   ├── MarketsScreen.tsx         # Markt-Übersicht
│   │   ├── MarketDetailScreen.tsx    # Markt-Details
│   │   ├── AddMarketScreen.tsx       # Neuer Markt
│   │   ├── AddInfoScreen.tsx         # Info hinzufügen
│   │   ├── ScanScreen.tsx            # Barcode-Scanner
│   │   ├── ActivityScreen.tsx        # Aktivitäts-Log
│   │   ├── ProfileScreen.tsx         # Profil & Einstellungen
│   │   ├── AdminPanelScreen.tsx      # Admin-Bereich
│   │   ├── NotificationsSettingsScreen.tsx
│   │   ├── SecuritySettingsScreen.tsx
│   │   └── AboutScreen.tsx
│   └── types/
│       └── index.ts            # TypeScript Typen
├── server/                     # Express Backend
│   ├── index.ts
│   ├── routes.ts
│   └── storage.ts
├── shared/
│   └── schema.ts               # Datenbank Schema (Drizzle)
├── assets/
│   └── images/                 # App-Icons & Bilder
├── app.json                    # Expo Konfiguration
├── package.json
├── tsconfig.json
└── README.md
```

## Benutzerrollen

### Administrator
- **Vollzugriff** auf alle Funktionen
- Kann Märkte bearbeiten und löschen
- Kann Informationen bearbeiten und löschen
- Kann Ergänzungen freigeben/ablehnen
- Kann Benutzer verwalten (aktivieren/deaktivieren)
- Zugriff auf Audit-Logs
- **2FA ist verpflichtend**

### Entwickler
- Gleiche Rechte wie Techniker
- Zugriff auf API-Status und Debug-Informationen
- **2FA ist verpflichtend**

### Techniker (Standard-Benutzer)
- Kann Märkte ansehen und durchsuchen
- Kann neue Märkte anlegen
- Kann Informationen hinzufügen (werden zur Freigabe gesendet)
- Kann Türcodes ansehen und aktualisieren
- **2FA ist optional**

## Hauptfunktionen

### Markt-Verzeichnis
- Suche nach WAWI-Nummer, Name oder Stadt
- Detailansicht mit allen IT-Informationen
- Verschlüsselte Türcodes (durch Tippen aufdecken)
- Barcodes werden als echte Barcodes (CODE128) angezeigt

### Türcode-Verwaltung
- **Aufdecken**: Tippen auf das Schloss-Symbol zeigt den Code
- **Bearbeiten**: Alle Benutzer können Codes aktualisieren
- **Verlauf**: Alte Codes werden in Rot mit Durchstreichung angezeigt

### Info hinzufügen
- Alle Benutzer können Ergänzungen hinzufügen
- Ergänzungen werden zur Freigabe an Admin gesendet
- Kategorien: Parkplatz, IT-Info, Barcode, Sonstiges
- Bei Barcode: Live-Vorschau des Barcodes

### Barcode-Scanner
- QR- und Barcode-Erkennung
- Automatische Markt-Suche bei Scan

### Admin-Bereich
- **Freigaben**: Ergänzungen freigeben oder ablehnen
- **Benutzer**: Mitarbeiter verwalten
- **Audit-Logs**: Alle Aktivitäten einsehen

### Einstellungen
- **Benachrichtigungen**: Push-Einstellungen konfigurieren
- **Sicherheit**: Biometrische Anmeldung, Passwort ändern
- **Über die App**: App-Info, rechtliche Dokumente

## Development

### Scripts

```bash
# Frontend starten (Expo Dev Server)
npm run expo:dev

# Backend starten (Express Server)
npm run server:dev

# TypeScript prüfen
npm run check:types

# Linting
npm run lint
npm run lint:fix

# Formatierung
npm run format
npm run check:format
```

### Hot Module Reloading

Die App nutzt Hot Module Reloading. Änderungen im Code werden automatisch aktualisiert ohne Server-Neustart.

### Debugging

1. **React Native Debugger**: Schüttle das Gerät oder drücke `m` im Terminal
2. **Console Logs**: Werden im Terminal angezeigt
3. **Network Requests**: In den React DevTools sichtbar

## Build & Deployment

### Expo Build (EAS)

```bash
# EAS CLI installieren
npm install -g eas-cli

# Bei Expo anmelden
eas login

# Build für iOS
eas build --platform ios

# Build für Android
eas build --platform android

# Build für beide Plattformen
eas build --platform all
```

### Lokaler Build

```bash
# iOS (nur macOS)
npx expo run:ios --configuration Release

# Android
npx expo run:android --variant release
```

### Web-Build

```bash
# Statischen Web-Build erstellen
npx expo export --platform web

# Oder mit dem vorhandenen Script
npm run expo:static:build
```

## Troubleshooting

### Häufige Probleme

#### "Unable to resolve module" Fehler

```bash
# Cache löschen und neu starten
npx expo start -c
```

#### Metro Bundler Probleme

```bash
# Node modules neu installieren
rm -rf node_modules
rm package-lock.json
npm install
```

#### iOS Simulator startet nicht (macOS)

```bash
# Xcode Command Line Tools installieren
xcode-select --install

# Simulator zurücksetzen
xcrun simctl shutdown all
xcrun simctl erase all
```

#### Android Emulator Probleme

1. Prüfe, ob ANDROID_HOME gesetzt ist
2. Stelle sicher, dass ein Emulator erstellt ist
3. Starte den Emulator manuell über Android Studio

#### Expo Go zeigt "Network Error"

1. Stelle sicher, dass Gerät und Computer im gleichen WLAN sind
2. Prüfe Firewall-Einstellungen
3. Verwende `npx expo start --tunnel` für Tunnel-Modus

### Logs

```bash
# Expo Logs anzeigen
npx expo start --clear

# Metro Logs
npx react-native log-android  # Android
npx react-native log-ios      # iOS
```

## Support

Bei Fragen oder Problemen:
- Erstelle ein GitHub Issue
- Kontaktiere das Entwicklungsteam

---

© 2024-2026 IT-Markt Verzeichnis. Alle Rechte vorbehalten.
