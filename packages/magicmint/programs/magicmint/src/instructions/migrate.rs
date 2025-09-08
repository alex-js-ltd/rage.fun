use crate::error::ErrorCode;
use crate::states::{AirdropState, BondingCurveState};
use crate::utils::admin::is_admin;
use crate::utils::seed::{
    AIRDROP_AUTH_SEED, AIRDROP_STATE_SEED, BONDING_CURVE_AUTH_SEED, BONDING_CURVE_STATE_SEED,
    TRADING_FEE_AUTH_SEED,
};
use crate::utils::token::get_account_balance;
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::spl_token_2022::ui_amount_to_amount;
use anchor_spl::token_interface::{self, spl_token_2022, Mint, TokenAccount, TokenInterface};

pub fn migrate<'c: 'info, 'info>(ctx: Context<'_, '_, 'c, 'info, Migrate<'info>>) -> Result<()> {
    let pda = &ctx.accounts.trading_fee_auth;

    let pda_balance = get_account_balance(pda.to_account_info())?;

    let curve = &mut ctx.accounts.bonding_curve_state;

    curve.trading_fees = pda_balance;

    Ok(())
}

#[derive(Accounts)]
pub struct Migrate<'info> {
    /// The payer for the transaction
    #[account(
        mut,
        constraint = is_admin(&payer.key()) @ ErrorCode::UnauthorizedSigner
    )]
    pub payer: Signer<'info>,

    /// The token mint associated with the bonding curve
    #[account(
        mint::token_program = token_0_program,
    )]
    pub token_0_mint: Box<InterfaceAccount<'info, Mint>>,

    /// CHECK: pda to control meme_ata & lamports
    #[account(mut,
        seeds = [BONDING_CURVE_AUTH_SEED.as_bytes(), token_0_mint.key().as_ref()],
        bump,
  
    )]
    pub bonding_curve_auth: AccountInfo<'info>,

    /// The bonding curve PDA to be updated
    #[account(
        mut,
        seeds = [BONDING_CURVE_STATE_SEED.as_bytes(), token_0_mint.key().as_ref()],
        bump,
    )]
    pub bonding_curve_state: Account<'info, BondingCurveState>,

    /// CHECK: pda to control trading fee
    #[account(mut,
            seeds = [TRADING_FEE_AUTH_SEED.as_bytes(), token_0_mint.key().as_ref()],
            bump,
     
        )]
    pub trading_fee_auth: AccountInfo<'info>,

    /// SPL Token-2022 interface
    pub token_0_program: Interface<'info, TokenInterface>,

    pub system_program: Program<'info, System>,

    /// Associated token program
    pub associated_token_program: Program<'info, AssociatedToken>,
}
