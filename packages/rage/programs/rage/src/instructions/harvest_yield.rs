use anchor_lang::prelude::*;

use anchor_spl::token_interface::{Mint, TokenInterface};

use crate::utils::token::{get_account_balance, transfer_sol_from_pda};

use crate::states::{BondingCurveState, HarvestEvent};

use crate::utils::seed::{
    BONDING_CURVE_AUTH_SEED, BONDING_CURVE_STATE_SEED, TRADING_FEE_AUTH_SEED,
};

use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct HarvestYield<'info> {
    /// The payer of the transaction and the signer
    #[account(mut)]
    pub signer: Signer<'info>,

    /// CHECK: pda to control meme_ata & lamports
    #[account(mut,
        seeds = [BONDING_CURVE_AUTH_SEED.as_bytes(), token_0_mint.key().as_ref()],
        bump,
  
    )]
    pub bonding_curve_auth: AccountInfo<'info>,

    /// CHECK: pda to control reward pool
    #[account(mut,
            seeds = [TRADING_FEE_AUTH_SEED.as_bytes(), token_0_mint.key().as_ref()],
            bump,
     
        )]
    pub trading_fee_auth: AccountInfo<'info>,

    /// CHECK: pda to store current price
    #[account(
        mut,
        seeds = [BONDING_CURVE_STATE_SEED.as_bytes(), token_0_mint.key().as_ref()],
        bump,
    
    )]
    pub bonding_curve_state: Account<'info, BondingCurveState>,

    /// Mint associated with the meme coin
    #[account(mut,
        mint::token_program = token_0_program,
    
    )]
    pub token_0_mint: Box<InterfaceAccount<'info, Mint>>,

    /// SPL token program for the meme coin
    pub token_0_program: Interface<'info, TokenInterface>,

    /// System program
    pub system_program: Program<'info, System>,
}

pub fn harvest_yield(ctx: Context<HarvestYield>) -> Result<()> {
    let pda = &ctx.accounts.trading_fee_auth;
    let creator = &ctx.accounts.signer;

    require!(
        creator.key() == ctx.accounts.bonding_curve_state.creator,
        ErrorCode::UnauthorizedSigner
    );

    let pda_balance = get_account_balance(pda.to_account_info())?;

    let lamports = pda_balance;

    require!(lamports > 0, ErrorCode::InsufficientYield);

    transfer_sol_from_pda(pda, creator, lamports)?;

    let curve = &mut ctx.accounts.bonding_curve_state;

    let pda_balance = get_account_balance(pda.to_account_info())?;

    curve.trading_fees = pda_balance;

    let block_timestamp = Clock::get()?.unix_timestamp;

    let time = block_timestamp as u64;

    emit!(HarvestEvent {
        signer: creator.key(),
        mint: ctx.accounts.token_0_mint.key(),
        lamports,
        time
    });

    Ok(())
}
