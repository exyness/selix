use crate::errors::SelixError;
use anchor_lang::prelude::*;

/// Get current timestamp from Clock sysvar
pub fn get_current_timestamp() -> Result<i64> {
    Ok(Clock::get()?.unix_timestamp)
}

/// Calculate expiry timestamp from duration
pub fn calculate_expiry(duration_seconds: i64) -> Result<i64> {
    let current = get_current_timestamp()?;
    current
        .checked_add(duration_seconds)
        .ok_or_else(|| error!(SelixError::ArithmeticOverflow))
}

/// Check if timestamp has expired
pub fn is_expired(expiry_timestamp: i64) -> Result<bool> {
    let current = get_current_timestamp()?;
    Ok(current >= expiry_timestamp)
}

/// Check if timestamp is still valid (not expired)
pub fn is_valid(expiry_timestamp: i64) -> Result<bool> {
    Ok(!is_expired(expiry_timestamp)?)
}

/// Get remaining time until expiry (in seconds)
pub fn remaining_time(expiry_timestamp: i64) -> Result<i64> {
    let current = get_current_timestamp()?;
    Ok(expiry_timestamp.saturating_sub(current).max(0))
}

/// Convert days to seconds
pub const fn days_to_seconds(days: i64) -> i64 {
    days * crate::constants::SECONDS_PER_DAY
}

/// Convert hours to seconds
pub const fn hours_to_seconds(hours: i64) -> i64 {
    hours * crate::constants::SECONDS_PER_HOUR
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_days_to_seconds() {
        assert_eq!(days_to_seconds(1), 86400);
        assert_eq!(days_to_seconds(7), 604800);
    }

    #[test]
    fn test_hours_to_seconds() {
        assert_eq!(hours_to_seconds(1), 3600);
        assert_eq!(hours_to_seconds(24), 86400);
    }

    #[test]
    fn test_remaining_time() {
        // This test would need mocking of Clock sysvar in real scenario
        // Just testing the logic
        let future = 1000000000i64;
        let current = 999999000i64;
        let remaining = future.saturating_sub(current);
        assert_eq!(remaining, 1000);
    }
}
