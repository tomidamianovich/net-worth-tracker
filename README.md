# Net Worth Tracker

A modern Electron desktop application for tracking and managing your net worth, assets, and portfolio with privacy-focused features.

## Features

### Portfolio Management
- **Asset Portfolio**: Visualize all your assets in a comprehensive table with automatic calculations of variations and portfolio percentages
- **Multiple Asset Types**: Support for stocks, ETFs, cryptocurrencies, fiat currencies, and deposits
- **Real-time Price Updates**: Automatic price fetching for Bitcoin, Ethereum, gold, and other assets
- **Asset Distribution**: Visual pie chart showing the distribution of your portfolio by asset type
- **Category Management**: Organize assets with custom categories and colors

### Patrimonial Evolution
- **Historical Tracking**: Track your net worth evolution over time with monthly records
- **Interactive Charts**: Visual representation of your patrimonial growth
- **Variation Analysis**: Calculate variations, averages, and accumulated totals by year
- **Detailed Records**: Add notes and details for each patrimonial entry

### Property Investment
- **Rental Income Tracking**: Record monthly rental income in ARS and USD
- **Profit Analysis**: Calculate monthly and annual profits with automatic averaging
- **Annualized Returns**: View annualized profit percentages
- **Investment Tracking**: Track initial property investment and returns

### Privacy & Security
- **Blur Values**: Toggle button to blur all monetary values for privacy when sharing your screen
- **Local Database**: All data stored locally using SQLite
- **Encryption**: Secure data storage with encryption support
- **User Authentication**: Password-protected access with user management

### Data Management
- **Export/Import**: Export and import your complete data in JSON format
- **Backup & Restore**: Create backups and restore from previous backups
- **Data Migration**: Automatic database schema migration for seamless updates

## Screenshots

<img width="1920" height="1017" alt="Portfolio View" src="https://github.com/user-attachments/assets/3bf87d01-c5e9-49bd-b576-e33abca83edd" />

<img width="1920" height="1017" alt="Patrimonial Evolution" src="https://github.com/user-attachments/assets/3d12bed5-e1ad-4234-b3d0-803520f23356" />

<img width="1920" height="1017" alt="Property Investment" src="https://github.com/user-attachments/assets/5e5be689-0dc9-4b3f-9d21-9baf7dfa2fec" />

## Installation

### Prerequisites
- Node.js (v18 or higher)
- pnpm (recommended) or npm

### Setup

1. Clone the repository:
```bash
git clone https://github.com/tomidamianovich/net-worth-tracker.git
cd net-worth-tracker
```

2. Install dependencies:
```bash
pnpm install
```

## Development

Run the application in development mode:

```bash
pnpm dev
```

This will start:
- Vite dev server on http://localhost:5173
- Electron app with hot reload

### Development Scripts

- `pnpm dev` - Start development server and Electron app
- `pnpm dev:vite` - Start only Vite dev server
- `pnpm dev:electron` - Start only Electron app
- `pnpm dev:watch` - Start with watch mode for main process
- `pnpm type-check` - Run TypeScript type checking
- `pnpm test` - Run tests
- `pnpm test:ui` - Run tests with UI
- `pnpm test:coverage` - Run tests with coverage

## Building

### Build for Development

```bash
pnpm build
```

This compiles:
- React renderer code to `dist/`
- Electron main process code to `dist/main/`

### Build for Production

```bash
pnpm electron:build
```

This creates distributable packages in the `release/` directory:
- Linux: AppImage format

## Project Structure

```
net-worth-tracker/
├── electron/                    # Electron main process
│   ├── main.ts                  # Electron entry point
│   ├── preload.ts               # Preload script (IPC bridge)
│   ├── database.ts              # SQLite database layer
│   └── services/                # Business logic services
│       ├── assetService.ts      # Asset management
│       ├── authService.ts       # Authentication
│       ├── categoryService.ts   # Category management
│       ├── patrimonialEvolutionService.ts
│       ├── rentalIncomeService.ts
│       └── stockService.ts      # Stock management
├── src/                         # React renderer process
│   ├── components/              # React components
│   │   ├── Header/              # Application header
│   │   ├── PortfolioTable/      # Portfolio view
│   │   ├── PatrimonialEvolution/ # Patrimonial tracking
│   │   ├── PropertyInvestment/  # Rental income tracking
│   │   └── ...
│   ├── contexts/                # React contexts
│   │   └── BlurContext.tsx     # Privacy blur state
│   ├── i18n/                    # Internationalization
│   │   └── translations/       # Translation files
│   ├── styles/                  # Global styles
│   ├── types/                   # TypeScript types
│   ├── App.tsx                  # Main React component
│   └── main.tsx                # React entry point
├── dist/                        # Compiled output
└── release/                     # Production builds
```

## Technologies

- **Electron** - Cross-platform desktop application framework
- **React** - UI library for building user interfaces
- **TypeScript** - Static type checking
- **Vite** - Fast build tool and dev server
- **better-sqlite3** - High-performance SQLite3 bindings
- **SQLite** - Local database engine
- **React Icons** - Icon library

## Features in Detail

### Asset Management
- Add, edit, and delete assets
- Support for multiple asset types (stocks, ETFs, crypto, fiat, deposits)
- Automatic price updates for supported assets
- Portfolio percentage calculations
- Variation tracking (percentage and absolute)

### Privacy Features
- **Blur Values Button**: Click the eye icon in the header to blur all monetary values
- Useful when sharing your screen or taking screenshots
- Smooth transitions and hover effects

### Data Persistence
- All data stored locally in SQLite database
- Automatic backups on data operations
- Export/import functionality for data portability
- Schema migration for seamless updates

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details

## Author

**Tomidamianovich**
- GitHub: [@tomidamianovich](https://github.com/tomidamianovich)
