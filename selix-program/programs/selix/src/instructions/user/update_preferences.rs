use crate::{
    constants::*, errors::SelixError, events::UserPreferencesUpdated, state::UserProfile, utils::*,
};
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct UpdatePreferencesParams {
    pub default_listing_duration: Option<i64>,
    pub default_slippage_bps: Option<u16>,
}

#[derive(Accounts)]
pub struct UpdatePreferences<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [USER_PROFILE_SEED, user.key().as_ref()],
        bump = user_profile.bump,
        has_one = user @ SelixError::UnauthorizedAuthority,
    )]
    pub user_profile: Account<'info, UserProfile>,
}

pub fn handler(ctx: Context<UpdatePreferences>, params: UpdatePreferencesParams) -> Result<()> {
    let profile = &mut ctx.accounts.user_profile;
    let current_time = Clock::get()?.unix_timestamp;

    // Update default listing duration if provided
    if let Some(duration) = params.default_listing_duration {
        require!(
            duration >= MIN_LISTING_DURATION,
            SelixError::DurationTooShort
        );
        require!(
            duration <= MAX_LISTING_DURATION,
            SelixError::DurationTooLong
        );
        profile.default_listing_duration = duration;
    }

    // Update default slippage if provided
    if let Some(slippage) = params.default_slippage_bps {
        validate_slippage_bps(slippage)?;
        profile.default_slippage_bps = slippage;
    }

    profile.last_activity_at = current_time;

    emit!(UserPreferencesUpdated {
        user: ctx.accounts.user.key(),
        default_listing_duration: profile.default_listing_duration,
        default_slippage_bps: profile.default_slippage_bps,
        timestamp: current_time,
    });

    // User audit log
    msg!("USER PREFERENCES UPDATED");
    msg!("---------------------------");
    msg!("User: {}", ctx.accounts.user.key());
    msg!(
        "Default Listing Duration: {}s",
        profile.default_listing_duration
    );
    msg!("Default Slippage BPS: {}", profile.default_slippage_bps);
    msg!("--- User Stats ---");
    msg!("Listings Created: {}", profile.listings_created);
    msg!("Swaps Executed: {}", profile.swaps_executed);
    msg!("Active Listings: {}", profile.active_listings);
    msg!("Volume as Maker: {}", profile.volume_as_maker);
    msg!("Volume as Taker: {}", profile.volume_as_taker);
    msg!("Timestamp: {}", current_time);

    Ok(())
}
