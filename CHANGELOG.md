# Changelog

Alle bemerkenswerten Änderungen an diesem Projekt werden in dieser Datei dokumentiert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.0.0/),
und dieses Projekt folgt [Semantic Versioning](https://semver.org/lang/de/).

## [1.1.0] - 2026-01-21

### Hinzugefügt

#### Barcode-Felder
- **Kassen-Barcode**: Separates Feld für Kassen-Zugang
- **ExitGate-Barcode**: Separates Feld für eGate/Ausgang
- Barcodes werden als echte CODE128-Barcodes angezeigt

#### 2-Faktor-Authentifizierung (Neu)
- 2FA ist jetzt **verpflichtend für ALLE Benutzer**
- Zwei Methoden: TOTP (Authenticator App) oder E-Mail
- 2FA-Setup beim ersten Login
- Code-Resend-Funktion

#### Registrierung mit Freigabe
- Neue Benutzer können sich selbst registrieren
- Registrierungen müssen von Admin/Entwickler freigegeben werden
- Admin kann Rolle bei Freigabe zuweisen
- Neuer Tab "Registrierungen" im Admin-Bereich

#### Dokumentation
- APK-Build-Anleitung (EAS und lokal)
- Server-Konfiguration dokumentiert
- Docker Deployment Anleitung
- Vollständige Berechtigungsmatrix

### Geändert
- LoginScreen mit Registrierung und 2FA-Setup erweitert
- AdminPanelScreen mit Registrierungsverwaltung
- AuthContext komplett überarbeitet für 2FA und Registrierung
- AddMarketScreen mit neuen Barcode-Feldern
- MarketDetailScreen zeigt Kassen- und ExitGate-Barcodes

### Technisch
- Neue Types: TwoFactorMethod, RegistrationStatus, PendingRegistration
- Market-Type um kassenBarcode und exitGateBarcode erweitert
- StoredUser um 2FA-Felder und registrationStatus erweitert

---

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
