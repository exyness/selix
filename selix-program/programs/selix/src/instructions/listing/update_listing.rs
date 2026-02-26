use crate::{
    constants::*,
    errors::SelixError,
    events::ListingUpdated,
    state::{Listing, ListingStatus, Platform},
    utils::*,
};
use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct UpdateListingParams {
    pub new_amount_destination: Option<u64>,
    pub new_min_fill_amount: Option<u64>,
    pub new_max_slippage_bps: Option<u16>,
    pub extend_duration_seconds: Option<i64>,
}

#[derive(Accounts)]
pub struct UpdateListing<'info> {
    #[account(mut)]
    pub maker: Signer<'info>,

    #[account(
        seeds = [PLATFORM_SEED, platform.authority.as_ref()],
        bump = platform.bump,
    )]
    pub platform: Account<'info, Platform>,

    #[account(
        mut,
        seeds = [LISTING_SEED, maker.key().as_ref(), &listing.id.to_le_bytes()],
        bump = listing.bump,
        has_one = maker @ SelixError::UnauthorizedAuthority,
    )]
    pub listing: Account<'info, Listing>,
}

pub fn handler(ctx: Context<UpdateListing>, params: UpdateListingParams) -> Result<()> {
    let listing = &mut ctx.accounts.listing;
    let platform = &ctx.accounts.platform;
    let current_time = Clock::get()?.unix_timestamp;

    // Validate platform not paused
    validate_not_paused(platform)?;

    // Validate listing is active or partially filled
    require!(
        listing.status == ListingStatus::Active || listing.status == ListingStatus::PartiallyFilled,
        SelixError::InvalidListingStatus
    );

    // Validate not expired
    require!(!is_expired(listing.expires_at)?, SelixError::ListingExpired);

    let old_amount_destination = listing.amount_destination_remaining;

    // Update destination amount if provided
    if let Some(new_dest) = params.new_amount_destination {
        validate_amount(new_dest, platform.min_trade_amount)?;

        // Calculate proportional remaining based on filled amount
        let filled_ratio = (listing.amount_source_total - listing.amount_source_remaining) as u128;

        if filled_ratio > 0 {
            // Adjust proportionally
            let new_dest_remaining = (new_dest as u128)
                .checked_mul(listing.amount_source_remaining as u128)
                .ok_or(SelixError::ArithmeticOverflow)?
                .checked_div(listing.amount_source_total as u128)
                .ok_or(SelixError::DivisionByZero)?;

            listing.amount_destination_remaining =
                u64::try_from(new_dest_remaining).map_err(|_| SelixError::ArithmeticOverflow)?;
        } else {
            listing.amount_destination_remaining = new_dest;
        }

        listing.amount_destination_total = new_dest;
    }

    // Update min fill amount if provided
    if let Some(new_min_fill) = params.new_min_fill_amount {
        validate_min_fill_amount(new_min_fill, listing.amount_source_remaining)?;
        listing.min_fill_amount = new_min_fill;
    }

    // Update slippage if provided
    if let Some(new_slippage) = params.new_max_slippage_bps {
        validate_slippage_bps(new_slippage)?;
        listing.max_slippage_bps = new_slippage;
    }

    // Extend duration if provided
    if let Some(extend_duration) = params.extend_duration_seconds {
        let new_expiry = listing
            .expires_at
            .checked_add(extend_duration)
            .ok_or(SelixError::ArithmeticOverflow)?;

        // Validate new expiry is reasonable
        let max_expiry = current_time
            .checked_add(platform.max_listing_duration)
            .ok_or(SelixError::ArithmeticOverflow)?;

        require!(new_expiry <= max_expiry, SelixError::DurationTooLong);

        listing.expires_at = new_expiry;
    }

    listing.updated_at = current_time;

    emit!(ListingUpdated {
        listing_id: listing.id,
        maker: ctx.accounts.maker.key(),
        old_amount_destination,
        new_amount_destination: listing.amount_destination_remaining,
        timestamp: current_time,
    });

    // Listing audit log
    msg!("LISTING UPDATED");
    msg!("------------------");
    msg!("Listing ID: {}", listing.id);
    msg!("Maker: {}", ctx.accounts.maker.key());
    if params.new_amount_destination.is_some() {
        msg!("Old Destination Amount: {}", old_amount_destination);
        msg!(
            "New Destination Amount: {}",
            listing.amount_destination_remaining
        );
    }
    if params.new_min_fill_amount.is_some() {
        msg!("New Min Fill: {}", listing.min_fill_amount);
    }
    if params.new_max_slippage_bps.is_some() {
        msg!("New Max Slippage BPS: {}", listing.max_slippage_bps);
    }
    if params.extend_duration_seconds.is_some() {
        msg!("New Expiry: {}", listing.expires_at);
    }
    msg!("Timestamp: {}", current_time);

    Ok(())
}
