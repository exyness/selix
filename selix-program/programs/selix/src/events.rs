use crate::state::ListingStatus;
use anchor_lang::prelude::*;

/// Emitted when platform is initialized
#[event]
pub struct PlatformInitialized {
    pub authority: Pubkey,
    pub fee_collector: Pubkey,
    pub fee_basis_points: u16,
    pub timestamp: i64,
}

/// Emitted when platform config is updated
#[event]
pub struct PlatformConfigUpdated {
    pub authority: Pubkey,
    pub fee_basis_points: u16,
    pub min_listing_duration: i64,
    pub max_listing_duration: i64,
    pub timestamp: i64,
}

/// Emitted when platform is paused
#[event]
pub struct PlatformPaused {
    pub authority: Pubkey,
    pub timestamp: i64,
}

/// Emitted when platform is resumed
#[event]
pub struct PlatformResumed {
    pub authority: Pubkey,
    pub timestamp: i64,
}

/// Emitted when fee collector is updated
#[event]
pub struct FeeCollectorUpdated {
    pub authority: Pubkey,
    pub old_collector: Pubkey,
    pub new_collector: Pubkey,
    pub timestamp: i64,
}

/// Emitted when a new listing is created
#[event]
pub struct ListingCreated {
    pub listing_id: u64,
    pub maker: Pubkey,
    pub token_mint_source: Pubkey,
    pub token_mint_destination: Pubkey,
    pub amount_source: u64,
    pub amount_destination: u64,
    pub min_fill_amount: u64,
    pub expires_at: i64,
    pub timestamp: i64,
}

/// Emitted when a listing is updated
#[event]
pub struct ListingUpdated {
    pub listing_id: u64,
    pub maker: Pubkey,
    pub old_amount_destination: u64,
    pub new_amount_destination: u64,
    pub timestamp: i64,
}

/// Emitted when a listing is cancelled
#[event]
pub struct ListingCancelled {
    pub listing_id: u64,
    pub maker: Pubkey,
    pub amount_returned: u64,
    pub timestamp: i64,
}

/// Emitted when a listing expires
#[event]
pub struct ListingExpired {
    pub listing_id: u64,
    pub maker: Pubkey,
    pub closer: Pubkey,
    pub amount_returned: u64,
    pub timestamp: i64,
}

/// Emitted when a swap is executed
#[event]
pub struct SwapExecuted {
    pub listing_id: u64,
    pub maker: Pubkey,
    pub taker: Pubkey,
    pub token_mint_source: Pubkey,
    pub token_mint_destination: Pubkey,
    pub amount_source: u64,
    pub amount_destination: u64,
    pub fee_amount: u64,
    pub is_partial: bool,
    pub remaining_source: u64,
    pub new_status: ListingStatus,
    pub timestamp: i64,
}

/// Emitted when a user profile is created
#[event]
pub struct UserProfileCreated {
    pub user: Pubkey,
    pub referrer: Option<Pubkey>,
    pub timestamp: i64,
}

/// Emitted when user preferences are updated
#[event]
pub struct UserPreferencesUpdated {
    pub user: Pubkey,
    pub default_listing_duration: i64,
    pub default_slippage_bps: u16,
    pub timestamp: i64,
}

/// Emitted when token whitelist is updated
#[event]
pub struct TokenWhitelistUpdated {
    pub mint: Pubkey,
    pub is_whitelisted: bool,
    pub authority: Pubkey,
    pub timestamp: i64,
}
