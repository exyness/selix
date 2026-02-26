use crate::{
    constants::*,
    errors::SelixError,
    events::{PlatformPaused, PlatformResumed},
    state::Platform,
};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct PausePlatform<'info> {
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

pub fn pause_handler(ctx: Context<PausePlatform>) -> Result<()> {
    let platform = &mut ctx.accounts.platform;
    let current_time = Clock::get()?.unix_timestamp;

    require!(!platform.is_paused, SelixError::PlatformPaused);

    platform.is_paused = true;
    platform.updated_at = current_time;

    emit!(PlatformPaused {
        authority: ctx.accounts.authority.key(),
        timestamp: current_time,
    });

    msg!("ADMIN ACTION: PLATFORM PAUSED");
    msg!("--------------------------------");
    msg!("Authority: {}", ctx.accounts.authority.key());
    msg!("Timestamp: {}", current_time);

    Ok(())
}

pub fn resume_handler(ctx: Context<PausePlatform>) -> Result<()> {
    let platform = &mut ctx.accounts.platform;
    let current_time = Clock::get()?.unix_timestamp;

    require!(platform.is_paused, SelixError::PlatformNotPaused);

    platform.is_paused = false;
    platform.updated_at = current_time;

    emit!(PlatformResumed {
        authority: ctx.accounts.authority.key(),
        timestamp: current_time,
    });

    msg!("ADMIN ACTION: PLATFORM RESUMED");
    msg!("---------------------------------");
    msg!("Authority: {}", ctx.accounts.authority.key());
    msg!("Timestamp: {}", current_time);

    Ok(())
}
