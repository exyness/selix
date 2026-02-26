use crate::errors::SelixError;
use anchor_lang::prelude::*;
use anchor_spl::token_interface::{
    transfer_checked, Mint, TokenAccount, TokenInterface, TransferChecked,
};

/// Transfer tokens with checked decimals
pub fn transfer_tokens<'info>(
    from: &InterfaceAccount<'info, TokenAccount>,
    to: &InterfaceAccount<'info, TokenAccount>,
    mint: &InterfaceAccount<'info, Mint>,
    authority: &AccountInfo<'info>,
    token_program: &Interface<'info, TokenInterface>,
    amount: u64,
    signer_seeds: Option<&[&[&[u8]]]>,
) -> Result<()> {
    let cpi_accounts = TransferChecked {
        from: from.to_account_info(),
        to: to.to_account_info(),
        authority: authority.to_account_info(),
        mint: mint.to_account_info(),
    };

    let cpi_context = if let Some(seeds) = signer_seeds {
        CpiContext::new_with_signer(token_program.to_account_info(), cpi_accounts, seeds)
    } else {
        CpiContext::new(token_program.to_account_info(), cpi_accounts)
    };

    transfer_checked(cpi_context, amount, mint.decimals)
}

/// Close token account and return rent
pub fn close_token_account<'info>(
    account: &InterfaceAccount<'info, TokenAccount>,
    destination: &AccountInfo<'info>,
    authority: &AccountInfo<'info>,
    token_program: &Interface<'info, TokenInterface>,
    signer_seeds: Option<&[&[&[u8]]]>,
) -> Result<()> {
    let cpi_accounts = anchor_spl::token_interface::CloseAccount {
        account: account.to_account_info(),
        destination: destination.to_account_info(),
        authority: authority.to_account_info(),
    };

    let cpi_context = if let Some(seeds) = signer_seeds {
        CpiContext::new_with_signer(token_program.to_account_info(), cpi_accounts, seeds)
    } else {
        CpiContext::new(token_program.to_account_info(), cpi_accounts)
    };

    anchor_spl::token_interface::close_account(cpi_context)
}

/// Validate token account matches expected mint and authority
pub fn validate_token_account(
    account: &InterfaceAccount<TokenAccount>,
    expected_mint: &Pubkey,
    expected_authority: &Pubkey,
) -> Result<()> {
    require_keys_eq!(
        account.mint,
        *expected_mint,
        SelixError::TokenAccountMintMismatch
    );

    require_keys_eq!(
        account.owner,
        *expected_authority,
        SelixError::TokenAccountAuthorityMismatch
    );

    Ok(())
}

/// Check if token account has sufficient balance
pub fn check_sufficient_balance(
    account: &InterfaceAccount<TokenAccount>,
    required_amount: u64,
) -> Result<()> {
    require!(
        account.amount >= required_amount,
        SelixError::InsufficientMakerBalance
    );
    Ok(())
}
