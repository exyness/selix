use anchor_lang::prelude::*;
use crate::{
    constants::*,
    errors::SelixError,
    events::PlatformInitialized,
    state::Platform,
    utils::{validate_duration_bounds, validate_fee_bps},
};

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct InitializePlatformParams {
    pub fee_basis_points: u16,
    pub min_listing_duration: i64,
    pub max_listing_duration: i64,
    pub min_trade_amount: u64,
    pub max_listings_per_user: u16,
}

#[derive(Accounts)]
pub struct InitializePlatform<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = 8 + Platform::INIT_SPACE,
        seeds = [PLATFORM_SEED, authority.key().as_ref()],
        bump
    )]
    pub platform: Account<'info, Platform>,

    /// CHECK: Fee collector can be any account
    pub fee_collector: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializePlatform>, params: InitializePlatformParams) -> Result<()> {
    // Validate parameters
    validate_fee_bps(params.fee_basis_points)?;
    validate_duration_bounds(params.min_listing_duration, params.max_listing_duration)?;
    
    require!(
        params.min_trade_amount > 0,
        SelixError::InvalidAmount
    );
    
    require!(
        params.max_listings_per_user > 0,
        SelixError::InvalidAmount
    );

    let platform = &mut ctx.accounts.platform;
    let current_time = Clock::get()?.unix_timestamp;

    platform.authority = ctx.accounts.authority.key();
    platform.fee_collector = ctx.accounts.fee_collector.key();
    platform.fee_basis_points = params.fee_basis_points;
    platform.min_listing_duration = params.min_listing_duration;
    platform.max_listing_duration = params.max_listing_duration;
    platform.min_trade_amount = params.min_trade_amount;
    platform.max_listings_per_user = params.max_listings_per_user;
    platform.is_paused = false;
    platform.whitelist_enabled = false;
    platform.total_listings_created = 0;
    platform.total_swaps_executed = 0;
    platform.total_volume_traded = 0;
    platform.total_fees_collected = 0;
    platform.created_at = current_time;
    platform.updated_at = current_time;
    platform.bump = ctx.bumps.platform;

    emit!(PlatformInitialized {
        authority: ctx.accounts.authority.key(),
        fee_collector: ctx.accounts.fee_collector.key(),
        fee_basis_points: params.fee_basis_points,
        timestamp: current_time,
    });

    // Admin audit log
    msg!("=== ADMIN ACTION: PLATFORM INITIALIZED ===");
    msg!("Authority: {}", ctx.accounts.authority.key());
    msg!("Fee Collector: {}", ctx.accounts.fee_collector.key());
    msg!("Fee BPS: {}", params.fee_basis_points);
    msg!("Min Listing Duration: {}s", params.min_listing_duration);
    msg!("Max Listing Duration: {}s", params.max_listing_duration);
    msg!("Min Trade Amount: {}", params.min_trade_amount);
    msg!("Max Listings Per User: {}", params.max_listings_per_user);
    msg!("Timestamp: {}", current_time);
    msg!("==========================================");
    
    Ok(())
}
