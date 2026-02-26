use anchor_lang::prelude::*;
use crate::{
    constants::*,
    errors::SelixError,
    events::PlatformConfigUpdated,
    state::Platform,
    utils::{validate_duration_bounds, validate_fee_bps},
};

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct UpdateConfigParams {
    pub fee_basis_points: Option<u16>,
    pub min_listing_duration: Option<i64>,
    pub max_listing_duration: Option<i64>,
    pub min_trade_amount: Option<u64>,
    pub max_listings_per_user: Option<u16>,
    pub whitelist_enabled: Option<bool>,
}

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [PLATFORM_SEED, authority.key().as_ref()],
        bump = platform.bump,
        has_one = authority @ SelixError::UnauthorizedAuthority
    )]
    pub platform: Account<'info, Platform>,
}

pub fn handler(ctx: Context<UpdateConfig>, params: UpdateConfigParams) -> Result<()> {
    let platform = &mut ctx.accounts.platform;
    let current_time = Clock::get()?.unix_timestamp;

    // Update fee if provided
    if let Some(fee_bps) = params.fee_basis_points {
        validate_fee_bps(fee_bps)?;
        platform.fee_basis_points = fee_bps;
    }

    // Update durations if provided
    let new_min = params.min_listing_duration.unwrap_or(platform.min_listing_duration);
    let new_max = params.max_listing_duration.unwrap_or(platform.max_listing_duration);
    
    validate_duration_bounds(new_min, new_max)?;
    
    if params.min_listing_duration.is_some() {
        platform.min_listing_duration = new_min;
    }
    if params.max_listing_duration.is_some() {
        platform.max_listing_duration = new_max;
    }

    // Update min trade amount if provided
    if let Some(min_amount) = params.min_trade_amount {
        require!(min_amount > 0, SelixError::InvalidAmount);
        platform.min_trade_amount = min_amount;
    }

    // Update max listings if provided
    if let Some(max_listings) = params.max_listings_per_user {
        require!(max_listings > 0, SelixError::InvalidAmount);
        platform.max_listings_per_user = max_listings;
    }

    // Update whitelist enabled if provided
    if let Some(whitelist) = params.whitelist_enabled {
        platform.whitelist_enabled = whitelist;
    }

    platform.updated_at = current_time;

    emit!(PlatformConfigUpdated {
        authority: ctx.accounts.authority.key(),
        fee_basis_points: platform.fee_basis_points,
        min_listing_duration: platform.min_listing_duration,
        max_listing_duration: platform.max_listing_duration,
        timestamp: current_time,
    });

    // Admin audit log
    msg!("=== ADMIN ACTION: CONFIG UPDATED ===");
    msg!("Authority: {}", ctx.accounts.authority.key());
    if params.fee_basis_points.is_some() {
        msg!("New Fee BPS: {}", platform.fee_basis_points);
    }
    if params.min_listing_duration.is_some() {
        msg!("New Min Duration: {}s", platform.min_listing_duration);
    }
    if params.max_listing_duration.is_some() {
        msg!("New Max Duration: {}s", platform.max_listing_duration);
    }
    if params.min_trade_amount.is_some() {
        msg!("New Min Trade Amount: {}", platform.min_trade_amount);
    }
    if params.max_listings_per_user.is_some() {
        msg!("New Max Listings: {}", platform.max_listings_per_user);
    }
    if params.whitelist_enabled.is_some() {
        msg!("Whitelist Enabled: {}", platform.whitelist_enabled);
    }
    msg!("Timestamp: {}", current_time);
    msg!("====================================");
    
    Ok(())
}
