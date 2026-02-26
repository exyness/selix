use anchor_lang::prelude::*;
use crate::{
    constants::*,
    errors::SelixError,
    events::UserProfileCreated,
    state::UserProfile,
    utils::*,
};

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct InitializeUserParams {
    pub referrer: Option<Pubkey>,
    pub default_listing_duration: i64,
    pub default_slippage_bps: u16,
}

#[derive(Accounts)]
pub struct InitializeUser<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer = user,
        space = 8 + UserProfile::INIT_SPACE,
        seeds = [USER_PROFILE_SEED, user.key().as_ref()],
        bump
    )]
    pub user_profile: Account<'info, UserProfile>,

    /// CHECK: Optional referrer profile (validated if provided)
    pub referrer: Option<UncheckedAccount<'info>>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializeUser>, params: InitializeUserParams) -> Result<()> {
    let current_time = Clock::get()?.unix_timestamp;

    // Validate default duration
    require!(
        params.default_listing_duration >= MIN_LISTING_DURATION,
        SelixError::DurationTooShort
    );
    require!(
        params.default_listing_duration <= MAX_LISTING_DURATION,
        SelixError::DurationTooLong
    );

    // Validate default slippage
    validate_slippage_bps(params.default_slippage_bps)?;

    // Validate referrer if provided
    let referrer_key = if let Some(ref referrer) = params.referrer {
        // In production, you might want to verify the referrer profile exists
        Some(*referrer)
    } else {
        None
    };

    let profile = &mut ctx.accounts.user_profile;
    profile.user = ctx.accounts.user.key();
    profile.referrer = referrer_key;
    profile.listings_created = 0;
    profile.listings_cancelled = 0;
    profile.swaps_executed = 0;
    profile.swaps_received = 0;
    profile.active_listings = 0;
    profile.volume_as_maker = 0;
    profile.volume_as_taker = 0;
    profile.total_fees_paid = 0;
    profile.default_listing_duration = params.default_listing_duration;
    profile.default_slippage_bps = params.default_slippage_bps;
    profile.created_at = current_time;
    profile.last_activity_at = current_time;
    profile.bump = ctx.bumps.user_profile;

    emit!(UserProfileCreated {
        user: ctx.accounts.user.key(),
        referrer: referrer_key,
        timestamp: current_time,
    });

    // User audit log
    msg!("=== USER PROFILE CREATED ===");
    msg!("User: {}", ctx.accounts.user.key());
    if let Some(ref_key) = referrer_key {
        msg!("Referrer: {}", ref_key);
    } else {
        msg!("Referrer: None");
    }
    msg!("Default Listing Duration: {}s", params.default_listing_duration);
    msg!("Default Slippage BPS: {}", params.default_slippage_bps);
    msg!("Profile Address: {}", ctx.accounts.user_profile.key());
    msg!("Timestamp: {}", current_time);
    msg!("============================");
    
    Ok(())
}
