# Changelog

Alle bemerkenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

## [1.0.0] - 2026-01-21

### Hinzugefügt

#### Berechtigungssystem
- Rollenbasiertes Berechtigungssystem (Admin, Entwickler, Techniker)
- Jeder Benutzer kann Märkte und Informationen hinzufügen
- Nur Admins können Märkte und Informationen bearbeiten/löschen
- Admin-Buttons für Bearbeiten und Löschen im MarketDetailScreen
- Delete-Funktion für Märkte und Infos (nur Admin)
- Edit-Funktion für Märkte (nur Admin)

#### Barcode-Integration
- Barcodes werden als echte Barcodes (CODE128-Format) angezeigt
- Barcode-Vorschau beim Hinzufügen von Barcode-Infos
- Integration von @kichiyaki/react-native-barcode-generator

#### Einstellungen
- Benachrichtigungseinstellungen (Push-Benachrichtigungen konfigurieren)
- Sicherheitseinstellungen (Biometrische Anmeldung, Passwort ändern)
- Über die App Screen (App-Info, rechtliche Links, Feature-Liste)

#### Neue Screens
- `NotificationsSettingsScreen` - Benachrichtigungseinstellungen
- `SecuritySettingsScreen` - Sicherheitseinstellungen mit Biometrie
- `AboutScreen` - App-Informationen und rechtliche Hinweise

### Geändert
- MarketDetailScreen mit Admin-Aktionen erweitert
- AddInfoScreen mit Barcode-Input und Live-Vorschau
- ProfileScreen mit Navigation zu Einstellungen
- RootStackNavigator mit neuen Routen
- MarketInfo-Typ um barcodeValue erweitert

### Technisch
- useMarkets Hook um deleteMarket, updateMarket, deleteMarketInfo erweitert
- Vollständige TypeScript-Typisierung

---

## [0.9.0] - 2026-01-19

### Hinzugefügt
- Türcode-Bearbeitungsfunktion
- Verlaufsanzeige für alte Codes (in Rot mit Durchstreichung)
- Code-Aufdeckung durch Klick auf Schloss-Symbol
- 2-Faktor-Authentifizierung für Admins und Entwickler

### Initiales Release
- Markt-Verzeichnis mit Suche
- Detailansicht für Märkte
- Verschlüsselte Türcode-Speicherung
- QR-Code Anzeige für eGate-Zugang
- Barcode-Scanner
- Aktivitätsprotokoll
- Admin-Bereich für Freigaben und Benutzerverwaltung
- Audit-Logs
