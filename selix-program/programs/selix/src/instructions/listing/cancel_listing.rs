use crate::{
    constants::*,
    errors::SelixError,
    events::ListingCancelled,
    state::{Listing, ListingStatus, UserProfile},
    utils::*,
};
use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

#[derive(Accounts)]
pub struct CancelListing<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,

    #[account(
        mut,
        seeds = [USER_PROFILE_SEED, maker.key().as_ref()],
        bump = maker_profile.bump,
    )]
    pub maker_profile: Option<Account<'info, UserProfile>>,

    #[account(
        mut,
        close = maker,
        seeds = [LISTING_SEED, maker.key().as_ref(), &listing.id.to_le_bytes()],
        bump = listing.bump,
        has_one = maker @ SelixError::UnauthorizedAuthority,
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
}

pub fn handler(ctx: Context<CancelListing>) -> Result<()> {
    let listing = &ctx.accounts.listing;
    let current_time = Clock::get()?.unix_timestamp;

    // Validate listing can be cancelled (Active or PartiallyFilled)
    require!(
        listing.status == ListingStatus::Active || listing.status == ListingStatus::PartiallyFilled,
        SelixError::InvalidListingStatus
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

    // Update user profile if exists
    if let Some(profile) = &mut ctx.accounts.maker_profile {
        profile.listings_cancelled = profile
            .listings_cancelled
            .checked_add(1)
            .ok_or(SelixError::ArithmeticOverflow)?;
        profile.active_listings = profile.active_listings.saturating_sub(1);
        profile.last_activity_at = current_time;
    }

    emit!(ListingCancelled {
        listing_id: listing.id,
        maker: ctx.accounts.maker.key(),
        amount_returned: amount_to_return,
        timestamp: current_time,
    });

    // Listing audit log
    msg!("LISTING CANCELLED");
    msg!("--------------------");
    msg!("Listing ID: {}", listing.id);
    msg!("Maker: {}", ctx.accounts.maker.key());
    msg!("Status: {:?}", listing.status);
    msg!("Amount Returned: {}", amount_to_return);
    msg!("Source Token: {}", ctx.accounts.token_mint_source.key());
    msg!("Vault Closed: {}", ctx.accounts.vault.key());
    msg!("Timestamp: {}", current_time);

    Ok(())
}
