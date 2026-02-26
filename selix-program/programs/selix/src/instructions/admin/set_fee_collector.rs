use crate::{constants::*, errors::SelixError, events::FeeCollectorUpdated, state::Platform};
use anchor_lang::prelude::*;

#[derive(Accounts)]
pub struct SetFeeCollector<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [PLATFORM_SEED, authority.key().as_ref()],
        bump = platform.bump,
        has_one = authority @ SelixError::UnauthorizedAuthority
    )]
    pub platform: Account<'info, Platform>,

    /// CHECK: New fee collector can be any account
    pub new_fee_collector: UncheckedAccount<'info>,
}

pub fn handler(ctx: Context<SetFeeCollector>) -> Result<()> {
    let platform = &mut ctx.accounts.platform;
    let current_time = Clock::get()?.unix_timestamp;
    let old_collector = platform.fee_collector;

    platform.fee_collector = ctx.accounts.new_fee_collector.key();
    platform.updated_at = current_time;

    emit!(FeeCollectorUpdated {
        authority: ctx.accounts.authority.key(),
        old_collector,
        new_collector: ctx.accounts.new_fee_collector.key(),
        timestamp: current_time,
    });

    // Admin audit log
    msg!("ADMIN ACTION: FEE COLLECTOR UPDATED");
    msg!("-------------------------------------");
    msg!("Authority: {}", ctx.accounts.authority.key());
    msg!("Old Collector: {}", old_collector);
    msg!("New Collector: {}", ctx.accounts.new_fee_collector.key());
    msg!("Timestamp: {}", current_time);

    Ok(())
}
