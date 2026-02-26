use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Platform {
    /// Platform authority (can update config)
    pub authority: Pubkey,

    /// Fee collector address
    pub fee_collector: Pubkey,

    /// Trading fee in basis points (0-1000 = 0-10%)
    pub fee_basis_points: u16,

    /// Minimum listing duration in seconds
    pub min_listing_duration: i64,

    /// Maximum listing duration in seconds
    pub max_listing_duration: i64,

    /// Minimum trade amount (prevents dust)
    pub min_trade_amount: u64,

    /// Maximum active listings per user
    pub max_listings_per_user: u16,

    /// Platform paused state
    pub is_paused: bool,

    /// Whitelist enabled (if true, only whitelisted tokens allowed)
    pub whitelist_enabled: bool,

    /// Total listings created (counter)
    pub total_listings_created: u64,

    /// Total swaps executed (counter)
    pub total_swaps_executed: u64,

    /// Total volume traded (in lamports equivalent)
    pub total_volume_traded: u128,

    /// Total fees collected
    pub total_fees_collected: u64,

    /// Platform creation timestamp
    pub created_at: i64,

    /// Last config update timestamp
    pub updated_at: i64,

    /// PDA bump
    pub bump: u8,
}

impl Platform {
    pub fn is_paused(&self) -> bool {
        self.is_paused
    }

    pub fn validate_fee(&self, fee_bps: u16) -> bool {
        fee_bps <= crate::constants::MAX_FEE_BPS
    }

    pub fn validate_duration(&self, duration: i64) -> bool {
        duration >= self.min_listing_duration && duration <= self.max_listing_duration
    }
}
