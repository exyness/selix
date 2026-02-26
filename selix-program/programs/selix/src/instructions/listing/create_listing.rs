use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};
use crate::{
    constants::*,
    errors::SelixError,
    events::ListingCreated,
    state::{Listing, ListingStatus, Platform, TokenWhitelist, UserProfile},
    utils::*,
};

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CreateListingParams {
    pub id: u64,
    pub amount_source: u64,
    pub amount_destination: u64,
    pub min_fill_amount: u64,
    pub max_slippage_bps: u16,
    pub duration_seconds: i64,
}

#[derive(Accounts)]
#[instruction(params: CreateListingParams)]
pub struct CreateListing<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,

    #[account(
        mut,
        seeds = [USER_PROFILE_SEED, maker.key().as_ref()],
        bump = maker_profile.bump,
    )]
    pub maker_profile: Account<'info, UserProfile>,

    #[account(
        mut,
        seeds = [PLATFORM_SEED, platform.authority.as_ref()],
        bump = platform.bump,
    )]
    pub platform: Account<'info, Platform>,

    #[account(
        init,
        payer = maker,
        space = 8 + Listing::INIT_SPACE,
        seeds = [LISTING_SEED, maker.key().as_ref(), &params.id.to_le_bytes()],
        bump
    )]
    pub listing: Account<'info, Listing>,

    #[account(
        init,
        payer = maker,
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

    #[account(mint::token_program = token_program)]
    pub token_mint_destination: InterfaceAccount<'info, Mint>,

    /// Optional: required when platform.whitelist_enabled is true
    pub source_whitelist: Option<Account<'info, TokenWhitelist>>,

    /// Optional: required when platform.whitelist_enabled is true
    pub dest_whitelist: Option<Account<'info, TokenWhitelist>>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<CreateListing>, params: CreateListingParams) -> Result<()> {
    let platform = &ctx.accounts.platform;
    let current_time = Clock::get()?.unix_timestamp;

    // Validate platform not paused
    validate_not_paused(platform)?;

    // Validate amounts
    validate_amount(params.amount_source, platform.min_trade_amount)?;
    validate_amount(params.amount_destination, platform.min_trade_amount)?;
    validate_min_fill_amount(params.min_fill_amount, params.amount_source)?;

    // Validate token mints are different
    validate_different_mints(
        &ctx.accounts.token_mint_source.key(),
        &ctx.accounts.token_mint_destination.key(),
    )?;

    // Validate duration
    validate_duration(params.duration_seconds, platform)?;

    // Validate slippage
    validate_slippage_bps(params.max_slippage_bps)?;

    // Validate whitelist if enabled
    if platform.whitelist_enabled {
        // Source token whitelist check
        let source_wl = ctx.accounts.source_whitelist.as_ref()
            .ok_or(SelixError::TokenNotWhitelisted)?;
        let (expected_source_pda, _) = Pubkey::find_program_address(
            &[WHITELIST_SEED, ctx.accounts.token_mint_source.key().as_ref()],
            ctx.program_id,
        );
        require_keys_eq!(source_wl.key(), expected_source_pda, SelixError::InvalidPDA);
        require!(source_wl.is_whitelisted, SelixError::TokenNotWhitelisted);

        // Destination token whitelist check
        let dest_wl = ctx.accounts.dest_whitelist.as_ref()
            .ok_or(SelixError::TokenNotWhitelisted)?;
        let (expected_dest_pda, _) = Pubkey::find_program_address(
            &[WHITELIST_SEED, ctx.accounts.token_mint_destination.key().as_ref()],
            ctx.program_id,
        );
        require_keys_eq!(dest_wl.key(), expected_dest_pda, SelixError::InvalidPDA);
        require!(dest_wl.is_whitelisted, SelixError::TokenNotWhitelisted);
    }

    // Check user listing limit
    validate_listing_limit(
        ctx.accounts.maker_profile.active_listings,
        platform.max_listings_per_user,
    )?;

    // Check maker has sufficient balance
    check_sufficient_balance(&ctx.accounts.maker_token_account_source, params.amount_source)?;

    // Transfer tokens to vault
    transfer_tokens(
        &ctx.accounts.maker_token_account_source,
        &ctx.accounts.vault,
        &ctx.accounts.token_mint_source,
        &ctx.accounts.maker.to_account_info(),
        &ctx.accounts.token_program,
        params.amount_source,
        None,
    )?;

    // Calculate expiry
    let expires_at = calculate_expiry(params.duration_seconds)?;

    // Initialize listing
    let listing = &mut ctx.accounts.listing;
    listing.id = params.id;
    listing.maker = ctx.accounts.maker.key();
    listing.token_mint_source = ctx.accounts.token_mint_source.key();
    listing.token_mint_destination = ctx.accounts.token_mint_destination.key();
    listing.amount_source_total = params.amount_source;
    listing.amount_source_remaining = params.amount_source;
    listing.amount_destination_total = params.amount_destination;
    listing.amount_destination_remaining = params.amount_destination;
    listing.min_fill_amount = params.min_fill_amount;
    listing.max_slippage_bps = params.max_slippage_bps;
    listing.expires_at = expires_at;
    listing.created_at = current_time;
    listing.updated_at = current_time;
    listing.status = ListingStatus::Active;
    listing.fill_count = 0;
    listing.bump = ctx.bumps.listing;

    // Update user profile
    let profile = &mut ctx.accounts.maker_profile;
    profile.listings_created = profile.listings_created.checked_add(1)
        .ok_or(SelixError::ArithmeticOverflow)?;
    profile.active_listings = profile.active_listings.checked_add(1)
        .ok_or(SelixError::ArithmeticOverflow)?;
    profile.last_activity_at = current_time;

    // Update platform stats
    let platform = &mut ctx.accounts.platform;
    platform.total_listings_created = platform.total_listings_created.checked_add(1)
        .ok_or(SelixError::ArithmeticOverflow)?;

    emit!(ListingCreated {
        listing_id: params.id,
        maker: ctx.accounts.maker.key(),
        token_mint_source: ctx.accounts.token_mint_source.key(),
        token_mint_destination: ctx.accounts.token_mint_destination.key(),
        amount_source: params.amount_source,
        amount_destination: params.amount_destination,
        min_fill_amount: params.min_fill_amount,
        expires_at,
        timestamp: current_time,
    });

    msg!("=== LISTING CREATED ===");
    msg!("Listing ID: {}", params.id);
    msg!("Maker: {}", ctx.accounts.maker.key());
    msg!("Source Token: {}", ctx.accounts.token_mint_source.key());
    msg!("Destination Token: {}", ctx.accounts.token_mint_destination.key());
    msg!("Amount Source: {}", params.amount_source);
    msg!("Amount Destination: {}", params.amount_destination);
    msg!("Min Fill: {}", params.min_fill_amount);
    msg!("Expires At: {}", expires_at);
    msg!("Timestamp: {}", current_time);
    msg!("=======================");

    Ok(())
}