use crate::states::BondingCurveState;
use crate::utils::admin::is_admin;
use crate::utils::seed::BONDING_CURVE_STATE_SEED;

use anchor_lang::prelude::*;

use anchor_spl::token_interface::{Mint, TokenInterface};

use crate::error::ErrorCode;

pub fn realloc(ctx: Context<Realloc>) -> Result<()> {
    Ok(())
}

pub const PADDING: usize = 8 + 8 + 8 + 8 + 8 + 8; // = 48 bytes

#[derive(Accounts)]
pub struct Realloc<'info> {
    /// The payer for the transaction
    #[account(
        mut,
        constraint = is_admin(&payer.key()) @ ErrorCode::UnauthorizedSigner
    )]
    pub payer: Signer<'info>,

    #[account(
        mint::token_program = token_0_program,
   
    )]
    pub token_0_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(
        mut,
        seeds = [BONDING_CURVE_STATE_SEED.as_bytes(),  token_0_mint.key().as_ref()],
        bump,
        realloc = 8 + BondingCurveState::INIT_SPACE + PADDING,
        realloc::payer = payer,
        realloc::zero = true,
    )]
    pub bonding_curve_state: Account<'info, BondingCurveState>,

    /// Spl token program for meme coin
    pub token_0_program: Interface<'info, TokenInterface>,

    pub system_program: Program<'info, System>,
}
