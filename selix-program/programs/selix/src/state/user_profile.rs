use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct UserProfile {
    /// User wallet address
    pub user: Pubkey,
    
    /// Referrer (if any)
    pub referrer: Option<Pubkey>,
    
    /// Total listings created
    pub listings_created: u64,
    
    /// Total listings cancelled
    pub listings_cancelled: u64,
    
    /// Total swaps executed (as taker)
    pub swaps_executed: u64,
    
    /// Total swaps received (as maker)
    pub swaps_received: u64,
    
    /// Current active listings count
    pub active_listings: u16,
    
    /// Total volume as maker (in lamports)
    pub volume_as_maker: u128,
    
    /// Total volume as taker (in lamports)
    pub volume_as_taker: u128,
    
    /// Total fees paid
    pub total_fees_paid: u64,
    
    /// Default listing duration (seconds)
    pub default_listing_duration: i64,
    
    /// Default slippage tolerance (basis points)
    pub default_slippage_bps: u16,
    
    /// Account creation timestamp
    pub created_at: i64,
    
    /// Last activity timestamp
    pub last_activity_at: i64,
    
    /// PDA bump
    pub bump: u8,
}

impl UserProfile {
    pub fn can_create_listing(&self, max_listings: u16) -> bool {
        self.active_listings < max_listings
    }

    pub fn increment_active_listings(&mut self) {
        self.active_listings = self.active_listings.saturating_add(1);
        self.listings_created = self.listings_created.saturating_add(1);
    }

    pub fn decrement_active_listings(&mut self) {
        self.active_listings = self.active_listings.saturating_sub(1);
    }

    pub fn record_listing_cancelled(&mut self) {
        self.listings_cancelled = self.listings_cancelled.saturating_add(1);
        self.decrement_active_listings();
    }

    pub fn record_swap_as_maker(&mut self, volume: u64) {
        self.swaps_received = self.swaps_received.saturating_add(1);
        self.volume_as_maker = self.volume_as_maker.saturating_add(volume as u128);
        self.decrement_active_listings();
    }

    pub fn record_swap_as_taker(&mut self, volume: u64, fee: u64) {
        self.swaps_executed = self.swaps_executed.saturating_add(1);
        self.volume_as_taker = self.volume_as_taker.saturating_add(volume as u128);
        self.total_fees_paid = self.total_fees_paid.saturating_add(fee);
    }
}
