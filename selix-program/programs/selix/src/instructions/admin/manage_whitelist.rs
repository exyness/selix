use crate::{
    constants::*,
    errors::SelixError,
    events::TokenWhitelistUpdated,
    state::{Platform, TokenWhitelist},
};
use anchor_lang::prelude::*;
use anchor_spl::token_interface::Mint;

#[derive(Accounts)]
pub struct ManageWhitelist<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        seeds = [PLATFORM_SEED, authority.key().as_ref()],
        bump = platform.bump,
        has_one = authority @ SelixError::UnauthorizedAuthority
    )]
    pub platform: Account<'info, Platform>,

    pub token_mint: InterfaceAccount<'info, Mint>,

    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + TokenWhitelist::INIT_SPACE,
        seeds = [WHITELIST_SEED, token_mint.key().as_ref()],
        bump
    )]
    pub whitelist_entry: Account<'info, TokenWhitelist>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<ManageWhitelist>, is_whitelisted: bool) -> Result<()> {
    let current_time = Clock::get()?.unix_timestamp;

    let entry = &mut ctx.accounts.whitelist_entry;
    entry.mint = ctx.accounts.token_mint.key();
    entry.is_whitelisted = is_whitelisted;
    entry.updated_at = current_time;
    entry.bump = ctx.bumps.whitelist_entry;

    emit!(TokenWhitelistUpdated {
        mint: ctx.accounts.token_mint.key(),
        is_whitelisted,
        authority: ctx.accounts.authority.key(),
        timestamp: current_time,
    });

    msg!("ADMIN ACTION: WHITELIST UPDATED");
    msg!("------------------------------------");
    msg!("Authority: {}", ctx.accounts.authority.key());
    msg!("Token Mint: {}", ctx.accounts.token_mint.key());
    msg!(
        "Action: {}",
        if is_whitelisted { "ADDED" } else { "REMOVED" }
    );
    msg!("Timestamp: {}", current_time);

    Ok(())
}
