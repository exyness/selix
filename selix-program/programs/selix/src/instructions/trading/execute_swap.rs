use crate::{
    constants::*,
    errors::SelixError,
    events::SwapExecuted,
    state::{Listing, ListingStatus, Platform, UserProfile},
    utils::*,
};
use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{Mint, TokenAccount, TokenInterface},
};

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ExecuteSwapParams {
    pub amount_source: u64,
    pub max_amount_destination: u64,
}

#[derive(Accounts)]
pub struct ExecuteSwap<'info> {
    #[account(mut)]
    pub taker: Signer<'info>,

    #[account(mut)]
    pub taker_profile: Option<Account<'info, UserProfile>>,

    /// CHECK: Maker receives destination tokens and vault rent.
    /// Validated via has_one on listing.
    #[account(mut)]
    pub maker: UncheckedAccount<'info>,

    #[account(mut)]
    pub maker_profile: Option<Account<'info, UserProfile>>,

    #[account(
        mut,
        seeds = [PLATFORM_SEED, platform.authority.as_ref()],
        bump = platform.bump,
    )]
    pub platform: Box<Account<'info, Platform>>,

    /// CHECK: Fee collector wallet. Validated against platform state.
    #[account(
        constraint = fee_collector.key() == platform.fee_collector
            @ SelixError::UnauthorizedAuthority
    )]
    pub fee_collector: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [LISTING_SEED, maker.key().as_ref(), &listing.id.to_le_bytes()],
        bump = listing.bump,
        has_one = maker,
    )]
    pub listing: Box<Account<'info, Listing>>,

    #[account(
        mut,
        associated_token::mint = token_mint_source,
        associated_token::authority = listing,
        associated_token::token_program = token_program,
    )]
    pub vault: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = taker,
        associated_token::mint = token_mint_source,
        associated_token::authority = taker,
        associated_token::token_program = token_program,
    )]
    pub taker_token_account_source: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = token_mint_destination,
        associated_token::authority = taker,
        associated_token::token_program = token_program,
    )]
    pub taker_token_account_destination: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mut,
        associated_token::mint = token_mint_destination,
        associated_token::authority = maker,
        associated_token::token_program = token_program,
    )]
    pub maker_token_account_destination: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        init_if_needed,
        payer = taker,
        associated_token::mint = token_mint_destination,
        associated_token::authority = fee_collector,
        associated_token::token_program = token_program,
    )]
    pub fee_collector_token_account: Box<InterfaceAccount<'info, TokenAccount>>,

    #[account(
        mint::token_program = token_program,
        constraint = token_mint_source.key() == listing.token_mint_source
            @ SelixError::TokenAccountMintMismatch,
    )]
    pub token_mint_source: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mint::token_program = token_program,
        constraint = token_mint_destination.key() == listing.token_mint_destination
            @ SelixError::TokenAccountMintMismatch,
    )]
    pub token_mint_destination: Box<InterfaceAccount<'info, Mint>>,

    pub token_program: Interface<'info, TokenInterface>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<ExecuteSwap>, params: ExecuteSwapParams) -> Result<()> {
    let current_time = Clock::get()?.unix_timestamp;

    // Validate platform not paused
    require!(!ctx.accounts.platform.is_paused, SelixError::PlatformPaused);

    // Snapshot listing data before mutable borrow
    let listing_id = ctx.accounts.listing.id;
    let listing_bump = ctx.accounts.listing.bump;
    let listing_status = ctx.accounts.listing.status;
    let listing_expires_at = ctx.accounts.listing.expires_at;
    let listing_amount_source_remaining = ctx.accounts.listing.amount_source_remaining;
    let listing_amount_destination_remaining = ctx.accounts.listing.amount_destination_remaining;
    let listing_min_fill_amount = ctx.accounts.listing.min_fill_amount;
    let fee_basis_points = ctx.accounts.platform.fee_basis_points;

    // Validate listing is active
    require!(
        listing_status == ListingStatus::Active || listing_status == ListingStatus::PartiallyFilled,
        SelixError::ListingNotActive
    );

    // Validate not expired
    require!(!is_expired(listing_expires_at)?, SelixError::ListingExpired);

    // Validate taker is not maker
    require_keys_neq!(
        ctx.accounts.taker.key(),
        ctx.accounts.maker.key(),
        SelixError::CannotSwapOwnListing
    );

    // Validate swap amount
    require!(
        params.amount_source <= listing_amount_source_remaining,
        SelixError::SwapAmountExceedsRemaining
    );
    require!(
        params.amount_source >= listing_min_fill_amount,
        SelixError::FillAmountTooSmall
    );

    // Calculate proportional destination amount
    let (amount_source, amount_destination) = calculate_partial_amounts(
        listing_amount_source_remaining,
        listing_amount_destination_remaining,
        params.amount_source,
    )?;

    // Validate slippage
    require!(
        amount_destination <= params.max_amount_destination,
        SelixError::SlippageExceeded
    );

    // Calculate fee
    let fee_amount = calculate_fee(amount_destination, fee_basis_points)?;
    let amount_to_maker = amount_destination
        .checked_sub(fee_amount)
        .ok_or(SelixError::ArithmeticUnderflow)?;

    // Check taker has sufficient balance
    require!(
        ctx.accounts.taker_token_account_destination.amount >= amount_destination,
        SelixError::InsufficientTakerBalance
    );

    // Build listing PDA signer seeds
    let maker_key = ctx.accounts.maker.key();
    let id_bytes = listing_id.to_le_bytes();
    let listing_seeds: &[&[u8]] = &[LISTING_SEED, maker_key.as_ref(), &id_bytes, &[listing_bump]];
    let signer_seeds = &[listing_seeds];

    // Grab AccountInfo before mutable borrow of listing
    let listing_account_info = ctx.accounts.listing.to_account_info();

    // 1. Vault → Taker (source tokens)
    transfer_tokens(
        &ctx.accounts.vault,
        &ctx.accounts.taker_token_account_source,
        &ctx.accounts.token_mint_source,
        &listing_account_info,
        &ctx.accounts.token_program,
        amount_source,
        Some(signer_seeds),
    )?;

    // 2. Taker → Maker (destination tokens minus fee)
    transfer_tokens(
        &ctx.accounts.taker_token_account_destination,
        &ctx.accounts.maker_token_account_destination,
        &ctx.accounts.token_mint_destination,
        &ctx.accounts.taker.to_account_info(),
        &ctx.accounts.token_program,
        amount_to_maker,
        None,
    )?;

    // 3. Taker → Fee collector
    if fee_amount > 0 {
        transfer_tokens(
            &ctx.accounts.taker_token_account_destination,
            &ctx.accounts.fee_collector_token_account,
            &ctx.accounts.token_mint_destination,
            &ctx.accounts.taker.to_account_info(),
            &ctx.accounts.token_program,
            fee_amount,
            None,
        )?;
    }

    // Update listing state
    let listing = &mut ctx.accounts.listing;
    listing.amount_source_remaining = listing
        .amount_source_remaining
        .checked_sub(amount_source)
        .ok_or(SelixError::ArithmeticUnderflow)?;
    listing.amount_destination_remaining = listing
        .amount_destination_remaining
        .checked_sub(amount_destination)
        .ok_or(SelixError::ArithmeticUnderflow)?;
    listing.fill_count = listing
        .fill_count
        .checked_add(1)
        .ok_or(SelixError::ArithmeticOverflow)?;
    listing.updated_at = current_time;

    let is_partial = listing.amount_source_remaining > 0;
    listing.status = if is_partial {
        ListingStatus::PartiallyFilled
    } else {
        ListingStatus::Completed
    };

    // Update platform stats
    let platform = &mut ctx.accounts.platform;
    platform.total_swaps_executed = platform
        .total_swaps_executed
        .checked_add(1)
        .ok_or(SelixError::ArithmeticOverflow)?;
    platform.total_volume_traded = platform
        .total_volume_traded
        .checked_add(amount_destination as u128)
        .ok_or(SelixError::ArithmeticOverflow)?;
    platform.total_fees_collected = platform
        .total_fees_collected
        .checked_add(fee_amount)
        .ok_or(SelixError::ArithmeticOverflow)?;

    // Update taker profile
    if let Some(taker_profile) = &mut ctx.accounts.taker_profile {
        taker_profile.swaps_executed = taker_profile
            .swaps_executed
            .checked_add(1)
            .ok_or(SelixError::ArithmeticOverflow)?;
        taker_profile.volume_as_taker = taker_profile
            .volume_as_taker
            .checked_add(amount_destination as u128)
            .ok_or(SelixError::ArithmeticOverflow)?;
        taker_profile.total_fees_paid = taker_profile
            .total_fees_paid
            .checked_add(fee_amount)
            .ok_or(SelixError::ArithmeticOverflow)?;
        taker_profile.last_activity_at = current_time;
    }

    // Update maker profile
    if let Some(maker_profile) = &mut ctx.accounts.maker_profile {
        maker_profile.swaps_received = maker_profile
            .swaps_received
            .checked_add(1)
            .ok_or(SelixError::ArithmeticOverflow)?;
        maker_profile.volume_as_maker = maker_profile
            .volume_as_maker
            .checked_add(amount_to_maker as u128)
            .ok_or(SelixError::ArithmeticOverflow)?;
        maker_profile.last_activity_at = current_time;

        if !is_partial {
            maker_profile.active_listings = maker_profile.active_listings.saturating_sub(1);
        }
    }

    // Close vault if fully filled
    if !is_partial {
        close_token_account(
            &ctx.accounts.vault,
            &ctx.accounts.maker.to_account_info(),
            &listing_account_info,
            &ctx.accounts.token_program,
            Some(signer_seeds),
        )?;
    }

    emit!(SwapExecuted {
        listing_id,
        maker: ctx.accounts.maker.key(),
        taker: ctx.accounts.taker.key(),
        token_mint_source: ctx.accounts.token_mint_source.key(),
        token_mint_destination: ctx.accounts.token_mint_destination.key(),
        amount_source,
        amount_destination,
        fee_amount,
        is_partial,
        remaining_source: listing.amount_source_remaining,
        new_status: listing.status,
        timestamp: current_time,
    });

    msg!(
        "SWAP: {} src={} dst={} fee={}",
        listing_id,
        amount_source,
        amount_destination,
        fee_amount
    );

    Ok(())
}
