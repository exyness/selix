use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct TokenWhitelist {
    /// The token mint this entry refers to
    pub mint: Pubkey,

    /// Whether the token is currently whitelisted
    pub is_whitelisted: bool,

    /// Timestamp when this entry was created or last updated
    pub updated_at: i64,

    /// PDA bump
    pub bump: u8,
}