# Selix Protocol - Web Application

Next.js frontend for the Selix Protocol decentralized token swap platform on Solana.

## Features

- **Marketplace** - Browse and search token swap listings
- **Create Listings** - List your tokens for swap with custom parameters
- **Execute Swaps** - Swap tokens with other users (full or partial fills)
- **My Listings** - Manage your active, completed, and cancelled listings
- **My Swaps** - View your swap history with detailed transaction data
- **User Profiles** - Track activity, volume, and statistics
- **Admin Dashboard** - Platform management and configuration (admin only)
- **Theme Support** - Light and dark mode with system preference detection
- **Wallet Integration** - Support for Phantom, Solflare, and other Solana wallets

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Wallet**: Solana Wallet Adapter
- **State Management**: TanStack Query
- **Blockchain**: Anchor/Solana Web3.js
- **Notifications**: Sonner (toast notifications)

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Yarn package manager
- A Solana wallet extension (Phantom, Solflare, etc.)

### Installation

1. Install dependencies:
```bash
yarn install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
NEXT_PUBLIC_SOLANA_NETWORK=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
```

3. Run the development server:
```bash
yarn dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
yarn build
yarn start
```

## Project Structure

```
web/
├── app/                    # Next.js app router pages
│   ├── listings/          # Marketplace and listing pages
│   ├── user/              # User-specific pages
│   └── admin/             # Admin dashboard
├── components/            # React components
│   ├── layout/           # Navigation, footer, etc.
│   ├── ui/               # Reusable UI components
│   └── wallet/           # Wallet connection components
├── lib/                   # Utilities and hooks
│   ├── solana/           # Solana/Anchor integration
│   └── anchor/           # Program IDL and setup
└── public/               # Static assets
```

## Key Features

### Marketplace
- Browse all active listings
- Filter by token pairs
- Search functionality
- Real-time updates

### Listing Management
- Create new listings with custom parameters
- View your active listings
- Cancel listings
- Update listing parameters
- Track fill progress

### Swap Execution
- Execute full or partial swaps
- Slippage protection
- Fee calculation
- Transaction confirmation

### User Profiles
- View any user's profile by address
- Activity statistics
- Volume tracking
- Referral information

### Admin Dashboard
- Platform configuration
- Fee management
- Token whitelist
- Pause/resume platform

## Wallet Integration

The application supports multiple Solana wallets through the Wallet Adapter:
- Phantom
- Solflare
- Backpack
- And more...

Connect your wallet using the button in the navigation bar.

## Theme Support

The application supports light and dark themes:
- Toggle using the theme button in navigation
- Respects system preferences
- Persistent across sessions

## Development

### Available Scripts

```bash
# Development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start

# Lint code
yarn lint

# Type check
yarn type-check
```

### Code Style

- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Tailwind CSS for styling

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SOLANA_NETWORK` | Solana network (mainnet-beta, devnet, testnet) | devnet |
| `NEXT_PUBLIC_SOLANA_RPC_URL` | RPC endpoint URL | https://api.devnet.solana.com |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Configure environment variables
4. Deploy

### Other Platforms

The application can be deployed to any platform that supports Next.js:
- Netlify
- AWS Amplify
- Railway
- Self-hosted

## Troubleshooting

### Wallet Connection Issues
- Ensure wallet extension is installed
- Check network matches (devnet/mainnet)
- Try refreshing the page

### Transaction Failures
- Check wallet balance for fees
- Verify token accounts exist
- Check platform is not paused

### RPC Issues
- Try a different RPC endpoint
- Check rate limits
- Use a custom RPC provider

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see [LICENSE](../LICENSE) for details
