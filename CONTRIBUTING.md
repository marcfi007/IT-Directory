# Contributing Guide

Vielen Dank für Ihr Interesse an der Mitarbeit am IT-Markt Verzeichnis Projekt!

## Entwicklungsumgebung einrichten

1. Forke das Repository
2. Clone dein Fork lokal
3. Installiere Dependencies mit `npm install`
4. Starte die App mit `npm run expo:dev`

## Code Style

- Wir verwenden TypeScript für Typsicherheit
- ESLint und Prettier sind konfiguriert
- Führe `npm run lint` vor jedem Commit aus
- Führe `npm run check:types` aus, um TypeScript-Fehler zu prüfen

## Commit Messages

Wir folgen der Conventional Commits Spezifikation:

- `feat:` - Neue Features
- `fix:` - Bugfixes
- `docs:` - Dokumentationsänderungen
- `style:` - Codeformatierung (keine Logikänderungen)
- `refactor:` - Code-Refactoring
- `test:` - Tests hinzufügen oder ändern
- `chore:` - Build-Prozess oder Tooling

Beispiele:
```
feat: Barcode-Scanner für eGate-Zugang hinzugefügt
fix: Türcode-Verlauf wird jetzt korrekt angezeigt
docs: README mit Installationsanleitung aktualisiert
```

## Pull Requests

1. Erstelle einen Feature-Branch: `git checkout -b feat/mein-feature`
2. Committe deine Änderungen
3. Pushe zum Branch: `git push origin feat/mein-feature`
4. Erstelle einen Pull Request

### PR Checkliste

- [ ] Code kompiliert ohne Fehler (`npm run check:types`)
- [ ] Linting bestanden (`npm run lint`)
- [ ] Neue Features sind dokumentiert
- [ ] Tests hinzugefügt (falls zutreffend)

## Projektstruktur

```
client/
├── components/    # Wiederverwendbare UI-Komponenten
├── contexts/      # React Context Provider
├── hooks/         # Custom Hooks
├── navigation/    # Navigation Konfiguration
├── screens/       # Screen-Komponenten
└── types/         # TypeScript Typen
```

## Coding Guidelines

### Komponenten

- Verwende funktionale Komponenten mit Hooks
- Benenne Komponenten mit PascalCase
- Eine Komponente pro Datei

```tsx
// Gut
export function MarketCard({ market, onPress }: MarketCardProps) {
  // ...
}

// Schlecht
export const marketCard = ({ market, onPress }) => {
  // ...
}
```

### Hooks

- Präfix mit `use`
- Extrahiere komplexe Logik in eigene Hooks

```tsx
// Gut
function useMarkets() {
  // ...
}
```

### Styles

- Verwende `StyleSheet.create()` für Styles
- Verwende Theme-Tokens aus `constants/theme.ts`

```tsx
const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
});
```

## Fragen?

Bei Fragen erstelle ein GitHub Issue oder kontaktiere das Team.
