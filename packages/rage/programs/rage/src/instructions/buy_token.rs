use anchor_lang::prelude::*;

use crate::states::{
    calculate_buy_amount, get_status, get_swap_event, update_bonding_curve_state,
    BondingCurveState, Status, SwapType,
};
use crate::utils::seed::{
    BONDING_CURVE_AUTH_SEED, BONDING_CURVE_STATE_SEED, TRADING_FEE_AUTH_SEED,
};
use crate::utils::token::{
    calculate_space_for_ata, get_account_balance, get_or_create_ata, token_mint_to,
    transfer_sol_to_vault,
};

use crate::utils::fees::trading_fee;

use anchor_spl::associated_token::AssociatedToken;

use anchor_spl::token_interface::{
    spl_token_2022::{self},
    Mint, TokenInterface,
};

use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct BuyToken<'info> {
    /// The payer of the transaction and the signer
    #[account(mut)]
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

    /// CHECK: pda to control reward pool
    #[account(mut,
            seeds = [TRADING_FEE_AUTH_SEED.as_bytes(), token_0_mint.key().as_ref()],
            bump,
     
        )]
    pub trading_fee_auth: AccountInfo<'info>,

    /// CHECK: ATA for payer
    #[account(mut)]
    pub token_0_payer_ata: UncheckedAccount<'info>,

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

pub fn buy_token(ctx: Context<BuyToken>, lamports: u64, min_output: u64) -> Result<()> {
    // check pda accounts
    require_eq!(ctx.accounts.bonding_curve_auth.owner, &crate::id());
    require_eq!(ctx.accounts.trading_fee_auth.owner, &crate::id());

    if ctx.accounts.bonding_curve_state.status != Status::Funding {
        return Err(ErrorCode::BondingCurveComplete.into());
    }

    if ctx.accounts.payer.lamports() < lamports {
        return Err(ErrorCode::InsufficientFunds.into());
    }

    if lamports < 10 {
        return Err(ErrorCode::InsufficientBuyAmount.into());
    }

    let is_new_account = ctx.accounts.token_0_payer_ata.data_is_empty();

    let rent_amount = if is_new_account {
        let space = calculate_space_for_ata(&ctx.accounts.token_0_mint.to_account_info())?;
        let rent = Rent::get()?.minimum_balance(space);
        rent
    } else {
        0
    };

    if is_new_account {
        get_or_create_ata(
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.token_0_payer_ata.to_account_info(),
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.token_0_mint.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.token_0_program.to_account_info(),
            ctx.accounts.associated_token_program.to_account_info(),
        )?;
    }

    let token_0_payer_ata = spl_token_2022::extension::StateWithExtensions::<
        spl_token_2022::state::Account,
    >::unpack(&ctx.accounts.token_0_payer_ata.data.borrow())?
    .base;

    require_eq!(ctx.accounts.payer.key(), token_0_payer_ata.owner);
    require_eq!(ctx.accounts.token_0_mint.key(), token_0_payer_ata.mint);

    // calculate trading fee
    let trading_result = trading_fee(u128::from(lamports)).ok_or(ErrorCode::InvalidInput)?;
    let trading_fee = u64::try_from(trading_result).unwrap();

    // calculate max deposit
    let max_deposit = ctx
        .accounts
        .bonding_curve_state
        .target_reserve
        .saturating_sub(ctx.accounts.bonding_curve_state.current_reserve);

    // apply fee first
    let deposit_amount = lamports.saturating_sub(trading_fee);

    let safe_deposit = if deposit_amount > max_deposit {
        max_deposit
    } else {
        deposit_amount
    };

    // use virtual suppply + current supply for price formula
    let supply = ctx.accounts.bonding_curve_state.virtual_supply
        + ctx.accounts.bonding_curve_state.current_supply;

    // use virtual reserve + current reserve for price formula
    let connector_balance = ctx.accounts.bonding_curve_state.virtual_reserve
        + ctx.accounts.bonding_curve_state.current_reserve;

    let token_amount = calculate_buy_amount(
        supply,
        safe_deposit,
        connector_balance,
        ctx.accounts.bonding_curve_state.decimals,
        ctx.accounts.bonding_curve_state.connector_weight,
    )?;

    // calculate max mint
    let max_mint = ctx
        .accounts
        .bonding_curve_state
        .target_supply
        .saturating_sub(ctx.accounts.bonding_curve_state.current_supply);

    let payer_amount = if token_amount > max_mint {
        max_mint
    } else {
        token_amount
    };

    if payer_amount < min_output {
        return Err(ErrorCode::SlippageExceeded.into());
    }

    // Mint to payer
    token_mint_to(
        ctx.accounts.bonding_curve_auth.to_account_info(),
        ctx.accounts.token_0_program.to_account_info(),
        ctx.accounts.token_0_mint.to_account_info(),
        ctx.accounts.token_0_payer_ata.to_account_info(),
        payer_amount,
        &[&[
            BONDING_CURVE_AUTH_SEED.as_bytes(),
            ctx.accounts.token_0_mint.key().as_ref(),
            &[ctx.bumps.bonding_curve_auth],
        ]],
    )?;

    // Transfer SOL to bonding curve
    transfer_sol_to_vault(
        ctx.accounts.payer.to_account_info(),
        ctx.accounts.bonding_curve_auth.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        safe_deposit,
    )?;

    // Transfer SOL to trading fee account
    transfer_sol_to_vault(
        ctx.accounts.payer.to_account_info(),
        ctx.accounts.trading_fee_auth.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        trading_fee,
    )?;

    let current_supply = ctx.accounts.bonding_curve_state.current_supply + payer_amount;
    let current_reserve = ctx.accounts.bonding_curve_state.current_reserve + safe_deposit;
    let target_reserve = ctx.accounts.bonding_curve_state.target_reserve;
    let trading_fees = get_account_balance(ctx.accounts.trading_fee_auth.to_account_info())?;
    let status = get_status(current_reserve, target_reserve);

    update_bonding_curve_state(
        &mut ctx.accounts.bonding_curve_state,
        current_supply,
        current_reserve,
        trading_fees,
        status,
    )?;

    let event = get_swap_event(
        ctx.accounts.token_0_mint.to_account_info(),
        ctx.accounts.payer.to_account_info(),
        ctx.accounts.token_0_mint.decimals,
        payer_amount,
        safe_deposit,
        rent_amount,
        SwapType::Buy,
    )?;

    emit!(event);

    Ok(())
}
