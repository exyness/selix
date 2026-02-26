use anchor_lang::prelude::*;
use crate::{constants::*, errors::SelixError, state::Platform};

/// Validate amount is above minimum
pub fn validate_amount(amount: u64, min_amount: u64) -> Result<()> {
    require!(amount > 0, SelixError::InvalidAmount);
    require!(amount >= min_amount, SelixError::AmountTooSmall);
    Ok(())
}

/// Validate two token mints are different
pub fn validate_different_mints(mint_a: &Pubkey, mint_b: &Pubkey) -> Result<()> {
    require_keys_neq!(*mint_a, *mint_b, SelixError::SameTokenMints);
    Ok(())
}

/// Validate listing duration is within bounds
pub fn validate_duration(duration: i64, platform: &Platform) -> Result<()> {
    require!(
        duration >= platform.min_listing_duration,
        SelixError::DurationTooShort
    );
    require!(
        duration <= platform.max_listing_duration,
        SelixError::DurationTooLong
    );
    Ok(())
}

/// Validate fee configuration
pub fn validate_fee_bps(fee_bps: u16) -> Result<()> {
    require!(
        fee_bps <= MAX_FEE_BPS,
        SelixError::InvalidFeeConfiguration
    );
    Ok(())
}

/// Validate slippage tolerance
pub fn validate_slippage_bps(slippage_bps: u16) -> Result<()> {
    require!(
        slippage_bps <= MAX_SLIPPAGE_BPS,
        SelixError::SlippageExceeded
    );
    Ok(())
}

/// Validate minimum fill amount is reasonable
pub fn validate_min_fill_amount(min_fill: u64, total_amount: u64) -> Result<()> {
    require!(
        min_fill <= total_amount,
        SelixError::MinFillAmountTooLarge
    );
    Ok(())
}

/// Validate platform is not paused
pub fn validate_not_paused(platform: &Platform) -> Result<()> {
    require!(!platform.is_paused, SelixError::PlatformPaused);
    Ok(())
}

/// Validate user hasn't exceeded listing limit
pub fn validate_listing_limit(active_count: u16, max_allowed: u16) -> Result<()> {
    require!(
        active_count < max_allowed,
        SelixError::MaxListingsReached
    );
    Ok(())
}

/// Validate timestamp is in the future
pub fn validate_future_timestamp(timestamp: i64, current_time: i64) -> Result<()> {
    require!(
        timestamp > current_time,
        SelixError::ListingExpired
    );
    Ok(())
}

/// Validate duration bounds configuration
pub fn validate_duration_bounds(min_duration: i64, max_duration: i64) -> Result<()> {
    require!(
        min_duration < max_duration,
        SelixError::InvalidDurationBounds
    );
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_amount() {
        assert!(validate_amount(1000, 100).is_ok());
        assert!(validate_amount(0, 100).is_err());
        assert!(validate_amount(50, 100).is_err());
    }

    #[test]
    fn test_validate_different_mints() {
        let mint_a = Pubkey::new_unique();
        let mint_b = Pubkey::new_unique();
        assert!(validate_different_mints(&mint_a, &mint_b).is_ok());
        assert!(validate_different_mints(&mint_a, &mint_a).is_err());
    }

    #[test]
    fn test_validate_fee_bps() {
        assert!(validate_fee_bps(25).is_ok());
        assert!(validate_fee_bps(1000).is_ok());
        assert!(validate_fee_bps(1001).is_err());
    }

    #[test]
    fn test_validate_min_fill_amount() {
        assert!(validate_min_fill_amount(100, 1000).is_ok());
        assert!(validate_min_fill_amount(1000, 1000).is_ok());
        assert!(validate_min_fill_amount(1001, 1000).is_err());
    }
}
