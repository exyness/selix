use anchor_lang::prelude::*;

#[error_code]
pub enum SelixError {
    // Platform Errors (6000-6099)
    #[msg("Platform is currently paused")]
    PlatformPaused,

    #[msg("Platform is not paused")]
    PlatformNotPaused,

    #[msg("Unauthorized: Only platform authority can perform this action")]
    UnauthorizedAuthority,

    #[msg("Invalid fee configuration: must be between 0 and 1000 basis points")]
    InvalidFeeConfiguration,

    #[msg("Platform already initialized")]
    PlatformAlreadyInitialized,

    #[msg("Invalid duration bounds: min must be less than max")]
    InvalidDurationBounds,

    // Listing Errors (6100-6199)
    #[msg("Invalid amount: must be greater than zero")]
    InvalidAmount,

    #[msg("Amount too small: below minimum trade amount")]
    AmountTooSmall,

    #[msg("Invalid token mints: source and destination must be different")]
    SameTokenMints,

    #[msg("Listing duration too short")]
    DurationTooShort,

    #[msg("Listing duration too long")]
    DurationTooLong,

    #[msg("Listing has expired")]
    ListingExpired,

    #[msg("Listing is not active")]
    ListingNotActive,

    #[msg("Listing already completed")]
    ListingAlreadyCompleted,

    #[msg("Invalid listing status for this operation")]
    InvalidListingStatus,

    #[msg("User has reached maximum active listings limit")]
    MaxListingsReached,

    #[msg("Minimum fill amount too large")]
    MinFillAmountTooLarge,

    #[msg("Listing not expired yet")]
    ListingNotExpired,

    // Trading Errors (6200-6299)
    #[msg("Slippage tolerance exceeded")]
    SlippageExceeded,

    #[msg("Fill amount below minimum")]
    FillAmountTooSmall,

    #[msg("Insufficient maker balance")]
    InsufficientMakerBalance,

    #[msg("Insufficient taker balance")]
    InsufficientTakerBalance,

    #[msg("Invalid swap amount: exceeds remaining")]
    SwapAmountExceedsRemaining,

    #[msg("Cannot swap with own listing")]
    CannotSwapOwnListing,

    // Token Errors (6300-6399)
    #[msg("Token mint not whitelisted")]
    TokenNotWhitelisted,

    #[msg("Token mint is blacklisted")]
    TokenBlacklisted,

    #[msg("Invalid token account")]
    InvalidTokenAccount,

    #[msg("Token account mint mismatch")]
    TokenAccountMintMismatch,

    #[msg("Token account authority mismatch")]
    TokenAccountAuthorityMismatch,

    // Math Errors (6400-6499)
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,

    #[msg("Arithmetic underflow")]
    ArithmeticUnderflow,

    #[msg("Division by zero")]
    DivisionByZero,

    #[msg("Invalid calculation result")]
    InvalidCalculation,

    // User Errors (6500-6599)
    #[msg("User profile already exists")]
    UserProfileAlreadyExists,

    #[msg("User profile not found")]
    UserProfileNotFound,

    #[msg("Invalid referrer")]
    InvalidReferrer,

    // Vault Errors (6600-6699)
    #[msg("Failed to transfer tokens to vault")]
    VaultDepositFailed,

    #[msg("Failed to withdraw tokens from vault")]
    VaultWithdrawalFailed,

    #[msg("Failed to close vault")]
    VaultClosureFailed,

    #[msg("Vault balance mismatch")]
    VaultBalanceMismatch,

    // Account Errors (6700-6799)
    #[msg("Invalid PDA derivation")]
    InvalidPDA,

    #[msg("Account already closed")]
    AccountAlreadyClosed,

    #[msg("Invalid account owner")]
    InvalidAccountOwner,

    #[msg("Account not initialized")]
    AccountNotInitialized,
}
