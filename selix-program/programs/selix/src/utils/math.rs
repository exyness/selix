use crate::errors::SelixError;
use anchor_lang::prelude::*;

/// Calculate fee amount from total using basis points
pub fn calculate_fee(amount: u64, fee_bps: u16) -> Result<u64> {
    let fee = (amount as u128)
        .checked_mul(fee_bps as u128)
        .ok_or(SelixError::ArithmeticOverflow)?
        .checked_div(crate::constants::BPS_DENOMINATOR as u128)
        .ok_or(SelixError::DivisionByZero)?;

    u64::try_from(fee).map_err(|_| error!(SelixError::ArithmeticOverflow))
}

/// Calculate amount after fee deduction
pub fn calculate_amount_after_fee(amount: u64, fee_bps: u16) -> Result<u64> {
    let fee = calculate_fee(amount, fee_bps)?;
    amount
        .checked_sub(fee)
        .ok_or_else(|| error!(SelixError::ArithmeticUnderflow))
}

/// Calculate proportional amount for partial fills
/// Returns (source_amount, destination_amount)
pub fn calculate_partial_amounts(
    total_source: u64,
    total_destination: u64,
    partial_source: u64,
) -> Result<(u64, u64)> {
    // Calculate destination amount proportionally
    let destination = (partial_source as u128)
        .checked_mul(total_destination as u128)
        .ok_or(SelixError::ArithmeticOverflow)?
        .checked_div(total_source as u128)
        .ok_or(SelixError::DivisionByZero)?;

    let destination =
        u64::try_from(destination).map_err(|_| error!(SelixError::ArithmeticOverflow))?;

    Ok((partial_source, destination))
}

/// Calculate exchange rate (destination per source)
/// Returns rate in basis points for precision
pub fn calculate_rate(source_amount: u64, destination_amount: u64) -> Result<u64> {
    if source_amount == 0 {
        return Err(error!(SelixError::DivisionByZero));
    }

    let rate = (destination_amount as u128)
        .checked_mul(crate::constants::BPS_DENOMINATOR as u128)
        .ok_or(SelixError::ArithmeticOverflow)?
        .checked_div(source_amount as u128)
        .ok_or(SelixError::DivisionByZero)?;

    u64::try_from(rate).map_err(|_| error!(SelixError::ArithmeticOverflow))
}

/// Check if rate is within slippage tolerance
pub fn check_slippage(expected_rate: u64, actual_rate: u64, max_slippage_bps: u16) -> Result<bool> {
    let max_deviation = (expected_rate as u128)
        .checked_mul(max_slippage_bps as u128)
        .ok_or(SelixError::ArithmeticOverflow)?
        .checked_div(crate::constants::BPS_DENOMINATOR as u128)
        .ok_or(SelixError::DivisionByZero)?;

    let max_deviation =
        u64::try_from(max_deviation).map_err(|_| error!(SelixError::ArithmeticOverflow))?;

    let lower_bound = expected_rate.saturating_sub(max_deviation);
    let upper_bound = expected_rate.saturating_add(max_deviation);

    Ok(actual_rate >= lower_bound && actual_rate <= upper_bound)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_fee() {
        // 0.25% fee on 10000
        let fee = calculate_fee(10000, 25).unwrap();
        assert_eq!(fee, 25);

        // 1% fee on 10000
        let fee = calculate_fee(10000, 100).unwrap();
        assert_eq!(fee, 100);
    }

    #[test]
    fn test_calculate_amount_after_fee() {
        // 10000 - 0.25% = 9975
        let amount = calculate_amount_after_fee(10000, 25).unwrap();
        assert_eq!(amount, 9975);
    }

    #[test]
    fn test_calculate_partial_amounts() {
        // If total is 1000:2000 and partial is 500, result should be 500:1000
        let (source, dest) = calculate_partial_amounts(1000, 2000, 500).unwrap();
        assert_eq!(source, 500);
        assert_eq!(dest, 1000);
    }

    #[test]
    fn test_calculate_rate() {
        // 2000 destination / 1000 source = 2.0 rate (20000 in bps)
        let rate = calculate_rate(1000, 2000).unwrap();
        assert_eq!(rate, 20000);
    }

    #[test]
    fn test_check_slippage() {
        // Rate 20000, actual 20100, 1% slippage = OK
        let ok = check_slippage(20000, 20100, 100).unwrap();
        assert!(ok);

        // Rate 20000, actual 21000, 1% slippage = NOT OK
        let not_ok = check_slippage(20000, 21000, 100).unwrap();
        assert!(!not_ok);
    }
}
