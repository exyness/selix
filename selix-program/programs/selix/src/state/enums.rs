use anchor_lang::prelude::*;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, InitSpace, Debug)]
pub enum ListingStatus {
    /// Listing created but not yet active
    Pending,
    /// Listing is active and accepting swaps
    Active,
    /// Listing has been partially filled
    PartiallyFilled,
    /// Listing fully executed
    Completed,
    /// Listing cancelled by maker
    Cancelled,
    /// Listing expired without full execution
    Expired,
}

impl Default for ListingStatus {
    fn default() -> Self {
        ListingStatus::Pending
    }
}

impl ListingStatus {
    pub fn is_active(&self) -> bool {
        matches!(self, ListingStatus::Active | ListingStatus::PartiallyFilled)
    }

    pub fn can_be_cancelled(&self) -> bool {
        matches!(self, ListingStatus::Active | ListingStatus::PartiallyFilled)
    }

    pub fn can_be_traded(&self) -> bool {
        matches!(self, ListingStatus::Active | ListingStatus::PartiallyFilled)
    }
}
