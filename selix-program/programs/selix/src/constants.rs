// Constants for the Selix program

// PDA Seeds
pub const PLATFORM_SEED: &[u8] = b"platform";
pub const LISTING_SEED: &[u8] = b"listing";
pub const VAULT_SEED: &[u8] = b"vault";
pub const USER_PROFILE_SEED: &[u8] = b"user_profile";
pub const WHITELIST_SEED: &[u8] = b"whitelist";

// Platform Defaults
pub const DEFAULT_FEE_BPS: u16 = 25; // 0.25%
pub const MAX_FEE_BPS: u16 = 1000; // 10%
pub const MIN_LISTING_DURATION: i64 = 300; // 5 minutes
pub const MAX_LISTING_DURATION: i64 = 2_592_000; // 30 days
pub const DEFAULT_LISTING_DURATION: i64 = 86_400; // 1 day
pub const MIN_TRADE_AMOUNT: u64 = 1000; // Prevent dust
pub const MAX_LISTINGS_PER_USER: u16 = 100;

// Slippage
pub const DEFAULT_SLIPPAGE_BPS: u16 = 100; // 1%
pub const MAX_SLIPPAGE_BPS: u16 = 1000; // 10%

// Rewards
pub const CLOSER_REWARD_LAMPORTS: u64 = 1_000_000; // 0.001 SOL for closing expired

// Basis Points
pub const BPS_DENOMINATOR: u64 = 10_000;

// Time
pub const SECONDS_PER_DAY: i64 = 86_400;
pub const SECONDS_PER_HOUR: i64 = 3_600;
