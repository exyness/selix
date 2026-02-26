use anchor_lang::prelude::*;

pub mod constants;
pub mod errors;
pub mod events;
pub mod instructions;
pub mod state;
pub mod utils;

use instructions::*;

declare_id!("FbTwE39HR4e4bGg5BoA8dJTuPV3ahCUGei1Ro22b4yBy");

#[program]
pub mod selix {
    use super::*;

    // Admin Instructions

    /// Initialize the platform (one-time setup)
    pub fn initialize_platform(
        ctx: Context<InitializePlatform>,
        params: InitializePlatformParams,
    ) -> Result<()> {
        instructions::admin::initialize_platform::handler(ctx, params)
    }

    /// Update platform configuration
    pub fn update_config(ctx: Context<UpdateConfig>, params: UpdateConfigParams) -> Result<()> {
        instructions::admin::update_config::handler(ctx, params)
    }

    /// Pause the platform (emergency stop)
    pub fn pause_platform(ctx: Context<PausePlatform>) -> Result<()> {
        instructions::admin::pause_platform::pause_handler(ctx)
    }

    /// Resume the platform
    pub fn resume_platform(ctx: Context<PausePlatform>) -> Result<()> {
        instructions::admin::pause_platform::resume_handler(ctx)
    }

    /// Set fee collector address
    pub fn set_fee_collector(ctx: Context<SetFeeCollector>) -> Result<()> {
        instructions::admin::set_fee_collector::handler(ctx)
    }

    /// Manage token whitelist
    pub fn manage_whitelist(ctx: Context<ManageWhitelist>, is_whitelisted: bool) -> Result<()> {
        instructions::admin::manage_whitelist::handler(ctx, is_whitelisted)
    }

    // Listing Instructions

    /// Create a new swap listing
    pub fn create_listing(ctx: Context<CreateListing>, params: CreateListingParams) -> Result<()> {
        instructions::listing::create_listing::handler(ctx, params)
    }

    /// Update an existing listing
    pub fn update_listing(ctx: Context<UpdateListing>, params: UpdateListingParams) -> Result<()> {
        instructions::listing::update_listing::handler(ctx, params)
    }

    /// Cancel a listing and return funds
    pub fn cancel_listing(ctx: Context<CancelListing>) -> Result<()> {
        instructions::listing::cancel_listing::handler(ctx)
    }

    /// Close an expired listing (anyone can call)
    pub fn close_expired_listing(ctx: Context<CloseExpiredListing>) -> Result<()> {
        instructions::listing::close_expired::handler(ctx)
    }

    // Trading Instructions

    /// Execute a swap (full or partial)
    pub fn execute_swap(ctx: Context<ExecuteSwap>, params: ExecuteSwapParams) -> Result<()> {
        instructions::trading::execute_swap::handler(ctx, params)
    }

    // User Instructions

    /// Initialize user profile
    pub fn initialize_user(
        ctx: Context<InitializeUser>,
        params: InitializeUserParams,
    ) -> Result<()> {
        instructions::user::initialize_user::handler(ctx, params)
    }

    /// Update user preferences
    pub fn update_preferences(
        ctx: Context<UpdatePreferences>,
        params: UpdatePreferencesParams,
    ) -> Result<()> {
        instructions::user::update_preferences::handler(ctx, params)
    }
}
