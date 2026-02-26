use super::enums::ListingStatus;
use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct Listing {
    /// Unique listing identifier
    pub id: u64,

    /// Listing creator
    pub maker: Pubkey,

    /// Token being offered (source)
    pub token_mint_source: Pubkey,

    /// Token being requested (destination)
    pub token_mint_destination: Pubkey,

    /// Original amount of source tokens
    pub amount_source_total: u64,

    /// Remaining amount of source tokens
    pub amount_source_remaining: u64,

    /// Original amount of destination tokens wanted
    pub amount_destination_total: u64,

    /// Remaining amount of destination tokens wanted
    pub amount_destination_remaining: u64,

    /// Minimum fill amount (for partial swaps)
    pub min_fill_amount: u64,

    /// Maximum slippage tolerance in basis points
    pub max_slippage_bps: u16,

    /// Listing expiration timestamp
    pub expires_at: i64,

    /// Listing creation timestamp
    pub created_at: i64,

    /// Last update timestamp
    pub updated_at: i64,

    /// Current status
    pub status: ListingStatus,

    /// Number of partial fills executed
    pub fill_count: u16,

    /// PDA bump
    pub bump: u8,
}

impl Listing {
    pub fn is_expired(&self, current_time: i64) -> bool {
        current_time >= self.expires_at
    }

    pub fn is_active(&self) -> bool {
        self.status.is_active()
    }

    pub fn can_be_traded(&self, current_time: i64) -> bool {
        self.status.can_be_traded() && !self.is_expired(current_time)
    }

    pub fn calculate_exchange_rate(&self) -> Result<u128> {
        if self.amount_source_remaining == 0 {
            return Err(error!(crate::errors::SelixError::InvalidAmount));
        }

        let rate = (self.amount_destination_remaining as u128)
            .checked_mul(crate::constants::BPS_DENOMINATOR as u128)
            .ok_or(crate::errors::SelixError::ArithmeticOverflow)?
            .checked_div(self.amount_source_remaining as u128)
            .ok_or(crate::errors::SelixError::DivisionByZero)?;

        Ok(rate)
    }

    pub fn update_after_fill(&mut self, source_filled: u64, destination_filled: u64) {
        self.amount_source_remaining = self.amount_source_remaining.saturating_sub(source_filled);
        self.amount_destination_remaining = self
            .amount_destination_remaining
            .saturating_sub(destination_filled);
        self.fill_count = self.fill_count.saturating_add(1);

        if self.amount_source_remaining == 0 {
            self.status = ListingStatus::Completed;
        } else {
            self.status = ListingStatus::PartiallyFilled;
        }
    }
}
