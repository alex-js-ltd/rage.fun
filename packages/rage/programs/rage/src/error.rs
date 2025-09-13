/// Errors that may be returned by the TokenSwap program.
use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    /// Insufficient balance of the required token in the user's wallet
    #[msg("Insufficient token balance")]
    InsufficientUserSupply,

    /// Insufficient funds in the user's wallet to cover the transaction
    #[msg("Insufficient SOL balance")]
    InsufficientFunds,

    /// The account must be rent-exempt (Solana account rent exemption required)
    #[msg("Account is not rent-exempt")]
    AccountNotRentExempt,

    /// The bonding curve has already completed and no further tokens can be minted
    #[msg("Bonding curve is complete")]
    BondingCurveComplete,

    /// The bonding curve is not yet complete and cannot proceed with this action
    #[msg("Bonding curve is incomplete")]
    BondingCurveNotComplete,

    /// Insufficient SOL to complete the purchase
    #[msg("Min buy amount is 0.0000001 SOL")]
    InsufficientBuyAmount,

    /// Insufficient reserve balance
    #[msg("Insufficient reserve balance")]
    InsufficientReserve,

    #[msg("Invalid input")]
    InvalidInput,

    #[msg("Unauthorized signer")]
    UnauthorizedSigner,

    /// Insufficient reward balance
    #[msg("Insufficient reward balance")]
    InsufficientReward,

    #[msg("Not approved")]
    NotApproved,

    #[msg("Invalid supply")]
    InvalidSupply,

    #[msg("Invalid reserve")]
    InvalidReserve,

    #[msg("Curve already in sync: no missing supply to mint")]
    CurveAlreadyInSync,

    /// Insufficient yield balance
    #[msg("Insufficient yield balance")]
    InsufficientYield,

    #[msg("Slippage exceeded.")]
    SlippageExceeded,
}
