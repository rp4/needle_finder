# 🌾 NeedleFinder - Farm-Themed Audit Anomaly Visualization

## Finding the Needle in the Haystack

NeedleFinder is a privacy-preserving, client-side web application that helps auditors visualize and explore anomalies in audit data through intuitive agricultural metaphors. All data processing happens locally in your browser - no data ever leaves your device.

## 🎯 Features

### 🚜 Farm-Themed Navigation
- **The Farmstead** - Upload and validate your data harvest
- **The Fields** - Explore overview with Crop Circle Map and Planting Rows
- **The Barn** - Investigate detailed anomalies in grain bins
- **The Silo** - Analyze and compare different cohort batches
- **Weather Station** - Monitor drift and environmental changes
- **The Market** - Generate reports and export evidence packs

### 🔒 Privacy & Security
- 100% client-side processing - no server communication
- CSP headers preventing external requests
- PII masking with "fence" overlay metaphor
- Local audit trail as "Farm Logbook"
- Encrypted state bundles for session persistence

### 📊 Rich Visualizations
- **Crop Circle Map** - Risk constellation visualization
- **Planting Rows** - Time-based anomaly intensity
- **Seed Packets** - Top contributing factors
- **Scarecrow Alerts** - Data quality warnings
- **Harvest Grid** - SHAP value contributions
- **Growth Timeline** - Event sequence visualization
- **Neighboring Fields** - Peer comparisons

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Usage
1. Open the application in your browser
2. Either:
   - **Load Sample Data**: Click "Load Sample Farm Data" button to explore with 250 mock anomalies
   - **Upload Your Data**: Drag and drop your JSON anomaly dataset onto the barn doors
3. Navigate through the different farm areas to explore your data
4. Generate reports and export evidence packs from The Market

## 📁 Project Structure

```
NeedleFinder/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── farm/        # Farm-themed components
│   │   ├── visualizations/ # D3/Canvas visualizations
│   │   └── common/      # Shared components
│   ├── features/        # Feature modules
│   │   ├── farmstead/   # Upload & validation
│   │   ├── fields/      # Explore mode
│   │   ├── barn/        # Investigate mode
│   │   ├── silo/        # Group analyzer
│   │   ├── weather/     # Drift monitoring
│   │   └── market/      # Reports & export
│   ├── services/        # Business logic
│   ├── stores/          # State management (Zustand)
│   └── types/           # TypeScript definitions
```

## 🎨 Technology Stack

- **React 18** with TypeScript
- **Vite** for fast builds and hot reload
- **Tailwind CSS** with custom farm theme
- **D3.js** for custom visualizations
- **Zustand** for state management
- **Web Workers** for heavy data processing
- **PWA** support for offline usage

## 📋 JSON Data Format

The application expects a JSON file with the following structure:

```json
{
  "run_id": "ISO-8601",
  "dataset_profile": {
    "rows": 0,
    "columns": 0,
    "primary_keys": ["..."],
    "entity_keys": ["..."],
    "time_key": "...",
    "currency": "USD"
  },
  "anomalies": [{
    "id": "...",
    "subject_type": "transaction|entity|group|sequence",
    "subject_id": "...",
    "timestamp": "ISO-8601",
    "severity": 0.0,
    "materiality": 0.0,
    "unified_score": 0.0,
    // ... additional fields
  }],
  // ... additional sections
}
```

## 🌻 Farm Theme Elements

- **Colors**: Barn red, wheat gold, grass green, sky blue, soil brown
- **Animations**: Barn door opening, windmill rotation, plant growth
- **Metaphors**: 
  - Anomalies = "Needles in the haystack"
  - Data upload = "Bringing harvest through barn doors"
  - Investigation = "Grain bin inspection"
  - Groups = "Different crop batches in silos"

## 🔐 Privacy Guarantee

NeedleFinder enforces strict privacy through:
- Content Security Policy blocking all network requests
- No external dependencies loaded at runtime
- All processing done in-browser
- No telemetry or analytics
- Option to mask PII throughout the interface

## 📝 License

This project is designed for internal audit use with sensitive data privacy requirements.

## 🚜 Development

```bash
# Run type checking
npm run typecheck

# Run linting
npm run lint

# Run development server with hot reload
npm run dev
```

The application will be available at `http://localhost:5173`

## 🌾 Contributing

When contributing, please maintain the farm theme throughout:
- Use agricultural metaphors in UI text
- Follow the established color palette
- Maintain the privacy-first architecture
- Add appropriate farm-themed icons and animations

---

Built with 🌾 for finding needles in haystacks