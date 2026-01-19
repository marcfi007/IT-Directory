# IT-Markt Verzeichnis App

## Projektbeschreibung
Eine mobile App fuer IT-Servicetechniker zur Verwaltung von Markt-Informationen mit sensiblen IT-Daten. Die App bietet rollenbasierte Zugriffskontrolle, 2-Faktor-Authentifizierung und revisionssichere Protokollierung.

## Tech-Stack
- **Frontend**: React Native mit Expo
- **Backend**: Express.js (fuer statische Dateien)
- **Datenspeicherung**: AsyncStorage (lokaler Cache)
- **Navigation**: React Navigation 7+
- **State Management**: React Context + TanStack Query

## Projektstruktur
```
client/
├── App.tsx                    # Haupt-App mit Providern
├── components/                # Wiederverwendbare UI-Komponenten
│   ├── ActivityItem.tsx       # Aktivitaets-Log Eintrag
│   ├── EmptyState.tsx         # Leere-Zustand Anzeige
│   ├── FAB.tsx                # Floating Action Button
│   ├── InfoRow.tsx            # Info-Zeile mit Kopieren/Bearbeiten
│   ├── InfoSection.tsx        # Aufklappbare Info-Sektion
│   ├── Input.tsx              # Eingabefeld
│   ├── MarketCard.tsx         # Markt-Karte
│   ├── RoleBadge.tsx          # Rollen-Badge
│   └── SearchBar.tsx          # Suchleiste
├── contexts/
│   ├── AuthContext.tsx        # Authentifizierung
│   └── MarketContext.tsx      # Markt-Daten
├── hooks/
│   ├── useMarkets.ts          # Markt-Logik
│   └── useScreenOptions.ts    # Navigation Optionen
├── navigation/
│   ├── RootStackNavigator.tsx
│   ├── MainTabNavigator.tsx
│   └── ...StackNavigators
├── screens/
│   ├── LoginScreen.tsx
│   ├── MarketsScreen.tsx
│   ├── MarketDetailScreen.tsx
│   ├── AddInfoScreen.tsx
│   ├── ScanScreen.tsx
│   ├── ActivityScreen.tsx
│   ├── ProfileScreen.tsx
│   └── AdminPanelScreen.tsx
└── types/
    └── index.ts               # TypeScript Typen
```

## Benutzerrollen
| Rolle | Beschreibung | 2FA |
|-------|--------------|-----|
| Admin | Vollzugriff, Freigaben, Audit-Logs | Ja |
| Entwickler | Wie User + API-Keys, Debug-Logs | Ja |
| User/Techniker | Maerkte ansehen, Infos hinzufuegen | Optional |

## Demo-Zugaenge
- `admin@itmarkt.de` / `admin123` (2FA Code: 123456)
- `dev@itmarkt.de` / `dev123` (2FA Code: 123456)
- `tech@itmarkt.de` / `tech123` (kein 2FA)

## Hauptfunktionen

### Markt-Verzeichnis
- Suche nach WAWI-Nr., Name, Stadt
- Detailansicht mit allen IT-Informationen
- Verschluesselte Tuercodes (aufklappbar)
- QR-Codes fuer eGate-Zugang

### Tuercode-Verwaltung
- **Aufdecken**: Tippen auf Schloss-Symbol zeigt Code
- **Bearbeiten**: Alle Benutzer koennen Codes aktualisieren
- **Verlauf**: Alte Codes in Rot mit Durchstreichung angezeigt

### Info hinzufuegen
- Alle Benutzer koennen Ergaenzungen hinzufuegen
- Ergaenzungen werden zur Freigabe an Admin gesendet
- Kategorien: Parkplatz, IT-Info, Barcode, Sonstiges

### Barcode-Scanner
- QR- und Barcode-Erkennung
- Automatische Markt-Suche bei Scan

### Aktivitaetsprotokoll
- Alle Aktionen werden protokolliert
- Wer, Wann, Was, Markt

### Admin-Bereich (nur fuer Admins)
- Benutzer verwalten
- Freigaben bearbeiten
- Audit-Logs einsehen

## Workflows
- **Start Frontend**: `npm run expo:dev` - Expo Dev Server auf Port 8081
- **Start Backend**: `npm run server:dev` - Express Server auf Port 5000

## Entwicklung
Die App nutzt Hot Module Reloading. Aenderungen im Code werden automatisch aktualisiert ohne Server-Neustart.

## Letzte Aenderungen
- 2026-01-19: Tuercode-Bearbeitungsfunktion hinzugefuegt
- 2026-01-19: Verlaufsanzeige fuer alte Codes (in Rot)
- 2026-01-19: Code-Aufdeckung durch Klick auf Schloss
- 2026-01-19: Initiale MVP-Entwicklung abgeschlossen
