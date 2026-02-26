use crate::{
    constants::*,
    errors::SelixError,
    events::ListingExpired,
    state::{Listing, Platform},
    utils::*,
};
use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

#[derive(Accounts)]
pub struct CloseExpiredListing<'info> {
    #[account(mut)]
    pub closer: Signer<'info>,

    /// CHECK: Maker receives refund
    #[account(mut)]
    pub maker: UncheckedAccount<'info>,

    #[account(
        seeds = [PLATFORM_SEED, platform.authority.as_ref()],
        bump = platform.bump,
    )]
    pub platform: Account<'info, Platform>,

    #[account(
        mut,
        close = maker,
        seeds = [LISTING_SEED, maker.key().as_ref(), &listing.id.to_le_bytes()],
        bump = listing.bump,
        has_one = maker,
    )]
    pub listing: Account<'info, Listing>,

    #[account(
        mut,
        associated_token::mint = token_mint_source,
        associated_token::authority = listing,
        associated_token::token_program = token_program,
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = token_mint_source,
        associated_token::authority = maker,
        associated_token::token_program = token_program,
    )]
    pub maker_token_account_source: InterfaceAccount<'info, TokenAccount>,

    #[account(mint::token_program = token_program)]
    pub token_mint_source: InterfaceAccount<'info, Mint>,

    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CloseExpiredListing>) -> Result<()> {
    let listing = &ctx.accounts.listing;
    let current_time = Clock::get()?.unix_timestamp;

    // Validate listing is expired
    require!(
        is_expired(listing.expires_at)?,
        SelixError::ListingNotExpired
    );

    let amount_to_return = ctx.accounts.vault.amount;

    // Return remaining tokens from vault to maker
    if amount_to_return > 0 {
        let maker_key = ctx.accounts.maker.key();
        let listing_seeds = &[
            LISTING_SEED,
            maker_key.as_ref(),
            &listing.id.to_le_bytes(),
            &[listing.bump],
        ];
        let signer_seeds = &[&listing_seeds[..]];

        transfer_tokens(
            &ctx.accounts.vault,
            &ctx.accounts.maker_token_account_source,
            &ctx.accounts.token_mint_source,
            &ctx.accounts.listing.to_account_info(),
            &ctx.accounts.token_program,
            amount_to_return,
            Some(signer_seeds),
        )?;

        // Close vault
        close_token_account(
            &ctx.accounts.vault,
            &ctx.accounts.maker.to_account_info(),
            &ctx.accounts.listing.to_account_info(),
            &ctx.accounts.token_program,
            Some(signer_seeds),
        )?;
    }

    // Optional: Pay small reward to closer from listing account rent
    // The rent is returned to maker via close = maker constraint

    emit!(ListingExpired {
        listing_id: listing.id,
        maker: ctx.accounts.maker.key(),
        closer: ctx.accounts.closer.key(),
        amount_returned: amount_to_return,
        timestamp: current_time,
    });

    // Listing audit log
    msg!("LISTING EXPIRED & CLOSED");
    msg!("---------------------------");
    msg!("Listing ID: {}", listing.id);
    msg!("Maker: {}", ctx.accounts.maker.key());
    msg!("Closer: {}", ctx.accounts.closer.key());
    msg!("Expired At: {}", listing.expires_at);
    msg!("Amount Returned: {}", amount_to_return);
    msg!("Source Token: {}", ctx.accounts.token_mint_source.key());
    msg!("Vault Closed: {}", ctx.accounts.vault.key());
    msg!("Timestamp: {}", current_time);

    Ok(())
}
