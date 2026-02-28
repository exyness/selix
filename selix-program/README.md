# Selix Protocol - Solana Program

Anchor-based Solana program for decentralized peer-to-peer token swaps with configurable parameters and platform-level controls.

## Features

- **Token Swap Listings** - Create listings with custom amounts, rates, and expiration
- **Partial Fills** - Support for partial swap execution with minimum fill amounts
- **Vault-Based Escrow** - Secure token custody using associated token accounts
- **User Profiles** - On-chain activity tracking and referral support
- **Platform Controls** - Admin functions for fees, whitelist, and pause/resume
- **Fee Collection** - Configurable basis points with automatic fee calculation
- **Token-2022 Support** - Compatible with both SPL Token and Token-2022

## Architecture

### Program Structure

```
programs/selix/src/
├── lib.rs                  # Program entry point
├── constants.rs            # Global constants
├── errors.rs               # Error definitions
├── events.rs               # Event logging
├── instructions/           # Instruction handlers
│   ├── admin/             # Platform management
│   ├── listing/           # Listing lifecycle
│   ├── trading/           # Swap execution
│   └── user/              # User profiles
├── state/                 # Account structures
│   ├── platform.rs        # Platform config
│   ├── listing.rs         # Listing account
│   ├── user_profile.rs    # User account
│   └── whitelist.rs       # Token whitelist
└── utils/                 # Helper functions
    ├── math.rs            # Safe arithmetic
    ├── pda.rs             # PDA derivation
    ├── time.rs            # Timestamp utils
    ├── token.rs           # Token operations
    └── validation.rs      # Input validation
```

### Key Accounts

#### Platform
Global configuration account:
- Authority (admin)
- Fee collector
- Fee basis points
- Pause state
- Statistics (volume, swaps, fees)

#### Listing
Individual swap listing:
- Maker (creator)
- Token mints (source/destination)
- Amounts and rates
- Fill tracking
- Status and expiration

#### UserProfile
User activity tracking:
- Listings created/cancelled
- Swaps executed/received
- Volume statistics
- Referral information

#### TokenWhitelist
Optional token approval:
- Token mint
- Approval status
- Metadata

## Instructions

### Admin Instructions

#### initialize_platform
Initialize the platform with configuration.

**Accounts:**
- `authority` - Platform admin (signer)
- `platform` - Platform PDA (init)
- `fee_collector` - Fee collection wallet

**Parameters:**
- `fee_basis_points` - Platform fee (0-1000 = 0-10%)
- `min_listing_duration` - Minimum listing duration
- `max_listing_duration` - Maximum listing duration

#### update_config
Update platform configuration.

**Parameters:**
- `fee_basis_points` - New fee (optional)
- `min_listing_duration` - New min duration (optional)
- `max_listing_duration` - New max duration (optional)

#### pause_platform / resume_platform
Pause or resume platform operations.

#### manage_whitelist
Add or remove tokens from whitelist.

**Parameters:**
- `token_mint` - Token to manage
- `is_approved` - Approval status

### Listing Instructions

#### create_listing
Create a new token swap listing.

**Parameters:**
- `amount_source_total` - Total source tokens
- `amount_destination_total` - Total destination tokens
- `min_fill_amount` - Minimum fill amount
- `duration` - Listing duration (seconds)

#### update_listing
Update an existing listing.

**Parameters:**
- `new_amount_destination` - New destination amount (optional)
- `new_min_fill_amount` - New minimum fill (optional)
- `new_duration` - New duration (optional)

#### cancel_listing
Cancel an active listing and return tokens.

#### close_expired
Close an expired listing and return tokens.

### Trading Instructions

#### execute_swap
Execute a swap against a listing.

**Parameters:**
- `amount_source` - Amount to swap
- `max_amount_destination` - Maximum slippage

### User Instructions

#### initialize_user
Create a user profile.

**Parameters:**
- `referrer` - Referrer address (optional)
- `default_listing_duration` - Default duration
- `default_slippage_bps` - Default slippage

#### update_preferences
Update user preferences.

## Development

### Prerequisites

- Rust 1.75+
- Solana CLI 1.18+
- Anchor CLI 0.32.1
- Node.js 18+ and Yarn

### Setup

1. Install dependencies:
```bash
yarn install
```

2. Build the program:
```bash
anchor build
```

3. Run tests:
```bash
anchor test
```

### Testing

Run all tests:
```bash
anchor test
```

Run with custom timeout:
```bash
yarn run ts-mocha -p ./tsconfig.json -t 1000000 "tests/**/*.ts"
```

Run specific test file:
```bash
anchor test tests/listing.spec.ts
```

### Deployment

#### Localnet
```bash
# Start local validator
solana-test-validator

# Deploy
anchor deploy
```

#### Devnet
```bash
# Configure CLI
solana config set --url devnet

# Airdrop SOL
solana airdrop 2

# Deploy
anchor deploy
```

#### Mainnet
```bash
# Configure CLI
solana config set --url mainnet-beta

# Deploy (requires SOL for deployment)
anchor deploy
```

## Configuration

### Anchor.toml

```toml
[programs.localnet]
selix = "YOUR_PROGRAM_ID"

[programs.devnet]
selix = "YOUR_PROGRAM_ID"

[programs.mainnet]
selix = "YOUR_PROGRAM_ID"
```

### Constants

Key constants in `constants.rs`:
- `DEFAULT_FEE_BPS` - Default platform fee (25 = 0.25%)
- `MAX_FEE_BPS` - Maximum fee (1000 = 10%)
- `MIN_LISTING_DURATION` - Minimum duration (300s = 5min)
- `MAX_LISTING_DURATION` - Maximum duration (2,592,000s = 30 days)

## Security

### Safety Features
- Overflow checks enabled
- Input validation on all instructions
- PDA-based account derivation
- Token account ownership verification
- Safe arithmetic operations
- Reentrancy protection

### Audit Status
Not yet audited. Use at your own risk.

## Error Codes

Error codes are organized by category:

- `6000-6099` - Platform errors
- `6100-6199` - Listing errors
- `6200-6299` - Trading errors
- `6300-6399` - User errors
- `6400-6499` - Validation errors

See `errors.rs` for complete list.

## Events

The program emits events for:
- Platform initialization and updates
- Listing creation, updates, and cancellation
- Swap execution
- User profile creation

## Gas Optimization

- Link-time optimization (LTO) enabled
- Single codegen unit
- Minimal account data
- Efficient PDA derivation

## Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Add tests for new features
4. Submit a pull request

## License

MIT License - see [LICENSE](../LICENSE) for details

## Resources

- [Anchor Documentation](https://www.anchor-lang.com/)
- [Solana Documentation](https://docs.solana.com/)
- [SPL Token Program](https://spl.solana.com/token)
