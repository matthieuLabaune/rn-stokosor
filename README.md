# Stokosor

A React Native Expo app for home inventory management with QR codes, barcode scanning, and hierarchical organization.

## Screenshots

<p align="center">
  <img src="./screenshots/home.png" width="200" alt="Home Screen" />
  <img src="./screenshots/lieu.png" width="200" alt="Lieu Screen" />
  <img src="./screenshots/zone.png" width="200" alt="Zone Screen" />
  <img src="./screenshots/contenant.png" width="200" alt="Contenant Screen" />
</p>

<p align="center">
  <img src="./screenshots/item.png" width="200" alt="Item Screen" />
  <img src="./screenshots/scanner.png" width="200" alt="Scanner Screen" />
  <img src="./screenshots/search.png" width="200" alt="Search Screen" />
  <img src="./screenshots/stats.png" width="200" alt="Stats Screen" />
</p>

## Features

### Hierarchical Organization
- **Lieux** (Locations) - Your homes, offices, storage units
- **Zones** - Rooms within each location
- **Contenants** (Containers) - Furniture, boxes, shelves with nested sub-containers
- **Items** - Your belongings with detailed information

### QR Codes
- Auto-generated unique QR codes for each container
- Scan QR codes to instantly navigate to container contents
- Export QR codes for printing and labeling

### Barcode Scanning
- Scan product barcodes (EAN-13, UPC, etc.)
- Auto-fill item data from **Open Food Facts** (food products)
- Auto-fill item data from **Google Books** (ISBN codes)

### Item Management
- Photos (up to 5 per item)
- Categories with smart form fields
- Purchase price & estimated value tracking
- Expiration dates (food) & warranty dates (electronics)
- Tags for easy searching
- Notes

### Search & Stats
- Global search across all items
- Filter by category
- Statistics dashboard with charts
- Total inventory value calculation

### Export
- JSON export (full backup)
- CSV export (spreadsheet compatible)

### UX
- Material Design 3 (React Native Paper)
- Light & Dark theme (system automatic)
- French & English localization
- Haptic feedback
- Smooth animations
- Onboarding for new users

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React Native + Expo SDK 54 |
| UI | React Native Paper (Material Design 3) |
| Navigation | React Navigation (Stack + Bottom Tabs) |
| State | Zustand |
| Database | SQLite (expo-sqlite) |
| Animations | React Native Reanimated |
| i18n | i18n-js + expo-localization |
| Camera | expo-camera |
| QR Generation | react-native-qrcode-svg |

## Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator (or Expo Go on physical device)

### Installation

```bash
# Clone the repository
git clone https://github.com/matthieuLabaune/rn-stokosor.git
cd rn-stokosor

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running on Device

- **iOS Simulator**: Press `i` in the terminal
- **Android Emulator**: Press `a` in the terminal
- **Physical Device**: Scan the QR code with Expo Go app

## Project Structure

```
src/
├── components/        # Reusable UI components
├── constants/         # Categories, container types
├── database/          # SQLite schema and connection
├── i18n/              # Translations (FR/EN)
├── navigation/        # App navigator and tabs
├── screens/           # All app screens
│   ├── Home/          # Home + Add Lieu modal
│   ├── Lieu/          # Lieu detail + Add Zone modal
│   ├── Zone/          # Zone detail + Add Contenant modal
│   ├── Contenant/     # Contenant detail + items list
│   ├── Item/          # Item detail + Add/Edit modal
│   ├── Scanner/       # QR & barcode scanner
│   ├── Search/        # Global search
│   ├── Settings/      # Settings + Stats
│   └── Onboarding/    # First-time user flow
├── services/          # API integrations & export
├── store/             # Zustand stores (CRUD operations)
├── theme/             # Colors, spacing, typography
├── types/             # TypeScript definitions
└── utils/             # Haptics and helpers
```

## Categories

Items are organized into categories with smart form fields:

| Category | Icon | Special Fields |
|----------|------|----------------|
| Electronics | laptop | Brand, Model, Serial, Warranty |
| Furniture | sofa | Brand, Purchase Price |
| Clothing | tshirt-crew | Brand |
| Books | book-open-variant | (via ISBN scan) |
| Food | food-apple | Expiration Date |
| Kitchen | pot-steam | Brand |
| Tools | hammer-wrench | Brand, Model, Warranty |
| Sports | basketball | Brand |
| Toys | toy-brick | Brand |
| Documents | file-document | - |
| Appliances | washing-machine | Brand, Model, Serial, Warranty |
| Decoration | lamp | Brand, Purchase Price |
| Garden | flower | Brand |
| Hygiene | bottle-tonic | Expiration Date |
| Other | cube-outline | - |

## License

MIT

## Author

Made with React Native and Expo
