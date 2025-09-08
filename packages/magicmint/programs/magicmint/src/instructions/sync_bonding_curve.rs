use crate::states::{bonding_curve, calculate_initial_supply, BondingCurveState};
use crate::utils::admin::is_admin;
use crate::utils::seed::{BONDING_CURVE_AUTH_SEED, BONDING_CURVE_STATE_SEED};
use crate::utils::token::token_mint_to;
use anchor_lang::prelude::*;

use anchor_spl::associated_token::AssociatedToken;

use crate::error::ErrorCode;

use anchor_spl::token_interface::{spl_token_2022, Mint, TokenAccount, TokenInterface};

#[derive(Accounts)]
pub struct SyncBondingCurve<'info> {
    /// The payer of the transaction and the signer
    /// The payer for the transaction
    #[account(
        mut,
        constraint = is_admin(&payer.key()) @ ErrorCode::UnauthorizedSigner
    )]
    pub payer: Signer<'info>,

    /// CHECK: pda to control meme_ata & lamports
    #[account(mut,
        seeds = [BONDING_CURVE_AUTH_SEED.as_bytes(), token_0_mint.key().as_ref()],
        bump,
  
    )]
    pub bonding_curve_auth: AccountInfo<'info>,

    /// CHECK: pda to store current price
    #[account(
        mut,
        seeds = [BONDING_CURVE_STATE_SEED.as_bytes(), token_0_mint.key().as_ref()],
        bump,
    
    )]
    pub bonding_curve_state: Account<'info, BondingCurveState>,

    /// Token account to which the tokens will be minted (created if needed)
    #[account(
                mut,
                     associated_token::mint = token_0_mint,
                     associated_token::authority = bonding_curve_auth,
                     associated_token::token_program = token_0_program,
                 )]
    pub token_0_bonding_curve_ata: Box<InterfaceAccount<'info, TokenAccount>>,

    /// Mint associated with the meme coin
    #[account(mut,
        mint::token_program = token_0_program,
        mint::authority = bonding_curve_auth,
    )]
    pub token_0_mint: Box<InterfaceAccount<'info, Mint>>,

    /// SPL token program for the meme coin
    pub token_0_program: Interface<'info, TokenInterface>,

    /// System program
    pub system_program: Program<'info, System>,

    /// Associated token program
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn sync_bonding_curve(ctx: Context<SyncBondingCurve>) -> Result<()> {
    let current_supply = ctx.accounts.token_0_mint.supply;

    let drift_amount = ctx
        .accounts
        .bonding_curve_state
        .total_supply
        .saturating_sub(current_supply);

    if drift_amount == 0 {
        return Ok(());
    }

    // Mint missing supply to bonding curve ata
    token_mint_to(
        ctx.accounts.bonding_curve_auth.to_account_info(),
        ctx.accounts.token_0_program.to_account_info(),
        ctx.accounts.token_0_mint.to_account_info(),
        ctx.accounts.token_0_bonding_curve_ata.to_account_info(),
        drift_amount,
        &[&[
            BONDING_CURVE_AUTH_SEED.as_bytes(),
            ctx.accounts.token_0_mint.key().as_ref(),
            &[ctx.bumps.bonding_curve_auth],
        ]],
    )?;

    let token_0_mint =
        spl_token_2022::extension::StateWithExtensions::<spl_token_2022::state::Mint>::unpack(
            &ctx.accounts.token_0_mint.to_account_info().data.borrow(),
        )?
        .base;

    require_eq!(
        ctx.accounts.bonding_curve_state.total_supply,
        token_0_mint.supply
    );

    Ok(())
}
