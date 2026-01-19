# IT-Markt-Verzeichnis Design Guidelines

## 1. Brand Identity

**Purpose**: Professional tool for IT service technicians to access and contribute to a centralized, secure market directory with sensitive infrastructure information.

**Aesthetic Direction**: **Industrial/Technical Precision**
- Clean, high-contrast interface optimized for outdoor field use
- Trustworthy, security-focused visual language
- No-nonsense, information-dense layouts for efficiency
- Strong hierarchy to surface critical data quickly

**Memorable Element**: Color-coded security indicators and role-based UI badges that make permissions instantly visible.

## 2. Navigation Architecture

**Root Navigation**: Bottom Navigation (4 tabs) + FAB
- **Märkte** (Home) - Market directory search and list
- **Scan** (FAB center) - QR/Barcode scanner
- **Aktivität** - Activity log/recent changes
- **Profil** - User profile, settings, admin panel

**Authentication Required**: Yes (SSO not applicable - custom enterprise auth with mandatory 2FA)

## 3. Screen-by-Screen Specifications

### Login/Auth Screens
**Login Screen**
- Logo/app icon centered top
- WAWI-Nummer or Email field
- Password field with show/hide toggle
- "Anmelden" button (full-width)
- "Passwort vergessen?" link below
- IP address shown in footer (security transparency)

**2FA Screen**
- 6-digit TOTP input
- "Code aus Authenticator eingeben"
- Resend button (disabled for 30s)
- Back button to logout

### Märkte (Home) Screen
- **Header**: Custom transparent with search bar
  - Search icon left (expands to search field)
  - Filter icon right
  - Role badge (Admin/Dev/User) top-right corner
- **Content**: RecyclerView list
  - Each card shows: WAWI-Nr, Name, Adresse, "Zuletzt aktualisiert"
  - Security indicator icon if sensitive data present
- **FAB**: "+" to add market (Admin only) or "Info hinzufügen" (all users)
- **Empty State**: "Keine Märkte gefunden" illustration
- **Insets**: Top: headerHeight + 16dp, Bottom: bottomNavHeight + 16dp

### Markt Detail Screen
- **Header**: Default with market name as title
  - Back button left
  - Edit (Admin only) and Share icons right
- **Content**: Scrollable sections with expansion panels
  - WAWI-Info (always expanded)
  - Parkplatz & Zugang (expandable, 🔐 icon if locked)
  - IT-Infrastruktur (expandable)
  - Barcodes (expandable, shows QR/barcode images)
  - Kommentare & Ergänzungen (expandable)
  - Anhänge (expandable, PDF/image thumbnails)
- **Version History** button at bottom (shows who added/changed what)
- **Insets**: Top: 16dp, Bottom: 16dp

### Info Hinzufügen Screen (Modal)
- **Header**: "Info hinzufügen" title, X close right, Save checkmark right
- **Form**: Scrollable with labeled sections
  - Category dropdown (Parkplatz, IT-Info, Barcode, Sonstiges)
  - Text input fields based on category
  - File upload button
  - "Als Entwurf speichern" and "Zur Freigabe senden" buttons at bottom
- **Insets**: Top: 16dp, Bottom: 16dp

### Scan Screen (Center Tab)
- **Header**: None (fullscreen camera)
- **Camera viewfinder** with overlay frame
- **Bottom sheet** showing scan history (last 5 scans)
- **Torch toggle** floating top-right
- **Insets**: Fullscreen with status bar overlay

### Aktivität Screen
- **Header**: "Aktivität" title, filter icon right
- **Content**: Timeline list (RecyclerView)
  - Each item: timestamp, user avatar, action description, affected market
  - Color-coded: green (added), yellow (modified), red (deleted)
- **Filter**: Date range, action type, user
- **Insets**: Top: headerHeight + 16dp, Bottom: bottomNavHeight + 16dp

### Profil Screen
- **Header**: "Profil" title, settings icon right
- **Content**: Scrollable
  - User avatar (generated) + name + role badge
  - "2FA Status" indicator (active/inactive)
  - Settings sections: Benachrichtigungen, Sicherheit, Über
  - **Admin Panel** button (visible only for Admin/Dev roles)
  - "Abmelden" button (red, confirmation dialog)
- **Insets**: Top: headerHeight + 16dp, Bottom: bottomNavHeight + 16dp

### Admin Panel Screen
- **Header**: "Admin-Bereich" title with role badge, back left
- **Content**: Tabbed interface
  - Benutzer: List of users with status indicators, actions menu
  - Freigaben: Pending info additions awaiting approval
  - Audit-Logs: Searchable, filterable log viewer
- **Insets**: Top: 16dp, Bottom: bottomNavHeight + 16dp

## 4. Color Palette

**Primary**: #1565C0 (Strong Blue - trust, security, enterprise)
**Primary Dark**: #0D47A1
**Accent**: #FF6F00 (Amber - warnings, attention items)
**Background**: #FAFAFA (Light Gray)
**Surface**: #FFFFFF
**Error**: #D32F2F
**Success**: #388E3C
**Warning**: #F57C00

**Role Colors**:
- Admin: #D32F2F (Red badge)
- Developer: #7B1FA2 (Purple badge)
- User: #455A64 (Gray badge)

**Security Indicators**:
- Encrypted: #FFA000 (Amber lock icon)
- Pending Approval: #FF6F00 (Orange dot)
- Verified: #388E3C (Green checkmark)

## 5. Typography

**Font**: Roboto (Material Design standard, optimized for readability on mobile)

**Type Scale**:
- H1: Roboto Bold, 24sp (Screen titles)
- H2: Roboto Medium, 20sp (Section headers)
- Body: Roboto Regular, 16sp (Main content)
- Caption: Roboto Regular, 14sp (Metadata, timestamps)
- Button: Roboto Medium, 14sp (All caps)

## 6. Visual Design

- **Icons**: Material Icons from Material Design
- **Touchable Feedback**: Ripple effect (Material standard)
- **Cards**: 2dp elevation, 8dp corner radius
- **FAB**: 6dp elevation (normal), 12dp elevation (pressed)
  - shadowOffset: {width: 0, height: 4}
  - shadowOpacity: 0.25
  - shadowRadius: 4
- **Role Badges**: Chip style with role color + white text, 4dp corner radius

## 7. Assets to Generate

**Required**:
1. **icon.png** - App icon with industrial/technical aesthetic (shield with IT symbols), used on device home screen
2. **splash-icon.png** - Same icon for splash screen during launch
3. **empty-markets.png** - Empty state for market list (filing cabinet illustration), used in Märkte screen when no markets found
4. **empty-activity.png** - Empty state for activity log (clipboard with checkmarks), used in Aktivität screen when no logs
5. **admin-badge-icon.png** - Red admin role badge icon, used throughout app for role indicators
6. **dev-badge-icon.png** - Purple developer role badge icon, used throughout app for role indicators
7. **user-badge-icon.png** - Gray user role badge icon, used throughout app for role indicators
8. **security-lock.png** - Amber lock icon for encrypted fields, used in Markt Detail screen
9. **avatar-placeholder-1.png** - Default user avatar (technician silhouette), used in Profil screen

**Recommended**:
10. **onboarding-security.png** - Illustration showing 2FA setup, used in initial setup flow
11. **success-approval.png** - Checkmark illustration, used when info is approved by admin

**Image Quality**: Clean, semi-flat illustrations with limited color palette (primary blue + accent amber), consistent line weights, optimized for Android (xxxhdpi).