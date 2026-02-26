use crate::constants::*;
use anchor_lang::prelude::*;

/// Derive platform PDA
pub fn derive_platform_pda(authority: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[PLATFORM_SEED, authority.as_ref()], &crate::ID)
}

/// Derive listing PDA
pub fn derive_listing_pda(maker: &Pubkey, id: u64) -> (Pubkey, u8) {
    Pubkey::find_program_address(
        &[LISTING_SEED, maker.as_ref(), &id.to_le_bytes()],
        &crate::ID,
    )
}

/// Derive vault PDA for a listing
pub fn derive_vault_pda(listing: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[VAULT_SEED, listing.as_ref()], &crate::ID)
}

/// Derive user profile PDA
pub fn derive_user_profile_pda(user: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[USER_PROFILE_SEED, user.as_ref()], &crate::ID)
}

/// Derive token whitelist PDA
pub fn derive_whitelist_pda(mint: &Pubkey) -> (Pubkey, u8) {
    Pubkey::find_program_address(&[WHITELIST_SEED, mint.as_ref()], &crate::ID)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_derive_platform_pda() {
        let authority = Pubkey::new_unique();
        let (pda, bump) = derive_platform_pda(&authority);

        // Verify PDA is valid
        assert!(bump <= 255);

        // Verify PDA can be recreated
        let (pda2, bump2) = derive_platform_pda(&authority);
        assert_eq!(pda, pda2);
        assert_eq!(bump, bump2);
    }

    #[test]
    fn test_derive_listing_pda() {
        let maker = Pubkey::new_unique();
        let id = 12345u64;
        let (pda, bump) = derive_listing_pda(&maker, id);

        assert!(bump <= 255);

        // Different IDs should produce different PDAs
        let (pda2, _) = derive_listing_pda(&maker, id + 1);
        assert_ne!(pda, pda2);
    }

    #[test]
    fn test_derive_vault_pda() {
        let listing = Pubkey::new_unique();
        let (pda, bump) = derive_vault_pda(&listing);

        assert!(bump <= 255);

        // Same listing should produce same vault
        let (pda2, bump2) = derive_vault_pda(&listing);
        assert_eq!(pda, pda2);
        assert_eq!(bump, bump2);
    }
}
