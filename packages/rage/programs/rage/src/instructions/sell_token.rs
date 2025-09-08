use crate::error::ErrorCode;
use crate::states::{
    calculate_market_cap, calculate_progress, calculate_sell_price, get_swap_event,
    update_bonding_curve_state, BondingCurveState, SwapType,
};
use crate::utils::fees::trading_fee;
use crate::utils::seed::{
    AIRDROP_AUTH_SEED, BONDING_CURVE_AUTH_SEED, BONDING_CURVE_STATE_SEED, TRADING_FEE_AUTH_SEED,
};
use crate::utils::token::{
    calculate_space_for_ata, get_account_balance, token_approve_delegate, token_burn,
    token_close_account, transfer_sol_from_pda,
};
use anchor_lang::prelude::*;
use anchor_spl::associated_token::AssociatedToken;
use anchor_spl::token_interface::{
    spl_token_2022::{self, amount_to_ui_amount},
    Mint, TokenAccount, TokenInterface,
};

#[derive(Accounts)]
pub struct SellToken<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    /// CHECK: pda to control vault_meme_ata & lamports
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

    /// Mint associated with the meme coin
    #[account(mut,
        mint::token_program = token_0_program,
        mint::authority = bonding_curve_auth,
    )]
    pub token_0_mint: Box<InterfaceAccount<'info, Mint>>,

    /// CHECK: ATA for seller
    #[account(mut)]
    pub token_0_seller_ata: UncheckedAccount<'info>,

    /// CHECK: pda to control vault_meme_ata & lamports
    #[account(mut,
            seeds = [AIRDROP_AUTH_SEED.as_bytes(), token_0_mint.key().as_ref()],
            bump,
        )]
    pub airdrop_auth: AccountInfo<'info>,

    /// Token account to which the tokens will be minted (created if needed)
    #[account(
                mut,
                     associated_token::mint = token_0_mint,
                     associated_token::authority = airdrop_auth,
                     associated_token::token_program = token_0_program,
                 )]
    pub token_0_airdrop_ata: Box<InterfaceAccount<'info, TokenAccount>>,

    /// Token program
    pub token_0_program: Interface<'info, TokenInterface>,

    /// System program
    pub system_program: Program<'info, System>,

    /// Associated token program
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn sell_token(ctx: Context<SellToken>, token_amount: u64) -> Result<()> {
    // check pda accounts
    require_eq!(ctx.accounts.bonding_curve_auth.owner, &crate::id());
    require_eq!(ctx.accounts.trading_fee_auth.owner, &crate::id());
    require_eq!(ctx.accounts.airdrop_auth.owner, &crate::id());

    let token_0_seller_ata = spl_token_2022::extension::StateWithExtensions::<
        spl_token_2022::state::Account,
    >::unpack(&ctx.accounts.token_0_seller_ata.data.borrow())?
    .base;

    require_eq!(ctx.accounts.signer.key(), token_0_seller_ata.owner);

    require_eq!(ctx.accounts.token_0_mint.key(), token_0_seller_ata.mint);

    if ctx.accounts.bonding_curve_state.progress >= 100.0 {
        return Err(ErrorCode::BondingCurveComplete.into());
    }

    if token_amount > token_0_seller_ata.amount {
        return Err(ErrorCode::InsufficientUserSupply.into());
    }

    let lamports = calculate_sell_price(
        ctx.accounts.bonding_curve_state.total_supply,
        token_amount,
        ctx.accounts.bonding_curve_state.reserve_balance,
        ctx.accounts.bonding_curve_state.decimals,
        ctx.accounts.bonding_curve_state.connector_weight,
    )?;

    if lamports >= ctx.accounts.bonding_curve_state.reserve_balance {
        return Err(ErrorCode::InsufficientReserve.into());
    }

    // calculate trading fee
    let trading_result = trading_fee(u128::from(lamports)).ok_or(ErrorCode::InvalidInput)?;
    let trading_fee = u64::try_from(trading_result).unwrap();

    let seller_amount = lamports - trading_fee;

    token_approve_delegate(
        ctx.accounts.token_0_program.to_account_info(),
        ctx.accounts.token_0_seller_ata.to_account_info(),
        ctx.accounts.bonding_curve_auth.to_account_info(),
        ctx.accounts.signer.to_account_info(),
        token_amount,
    )?;

    // Burn from seller
    token_burn(
        ctx.accounts.bonding_curve_auth.to_account_info(),
        ctx.accounts.token_0_program.to_account_info(),
        ctx.accounts.token_0_mint.to_account_info(),
        ctx.accounts.token_0_seller_ata.to_account_info(),
        token_amount,
        &[&[
            BONDING_CURVE_AUTH_SEED.as_bytes(),
            ctx.accounts.token_0_mint.key().as_ref(),
            &[ctx.bumps.bonding_curve_auth][..],
        ][..]],
    )?;

    let token_0_seller_ata = spl_token_2022::extension::StateWithExtensions::<
        spl_token_2022::state::Account,
    >::unpack(&ctx.accounts.token_0_seller_ata.data.borrow())?
    .base;

    let is_close_account = token_0_seller_ata.amount == 0;

    let rent_amount = if is_close_account {
        let space = calculate_space_for_ata(&ctx.accounts.token_0_mint.to_account_info())?;
        let rent = Rent::get()?.minimum_balance(space);
        rent
    } else {
        0
    };

    if is_close_account {
        token_close_account(
            ctx.accounts.token_0_program.to_account_info(),
            ctx.accounts.token_0_seller_ata.to_account_info(),
            ctx.accounts.signer.to_account_info(),
            ctx.accounts.signer.to_account_info(),
        )?;
    }

    let pda = &ctx.accounts.bonding_curve_auth;
    let seller = &ctx.accounts.signer;

    let trading_fee_account = &ctx.accounts.trading_fee_auth;

    transfer_sol_from_pda(pda, seller, seller_amount)?;
    transfer_sol_from_pda(pda, trading_fee_account, trading_fee)?;

    let reserve_balance = get_account_balance(ctx.accounts.bonding_curve_auth.to_account_info())?;

    let total_supply = ctx.accounts.bonding_curve_state.total_supply - token_amount;

    let locked_supply =
        ctx.accounts.bonding_curve_state.initial_supply + ctx.accounts.token_0_airdrop_ata.amount;

    let progress = calculate_progress(
        total_supply,
        ctx.accounts.bonding_curve_state.target_supply,
        locked_supply,
        ctx.accounts.bonding_curve_state.decimals,
    )?;

    let market_cap = calculate_market_cap(
        total_supply,
        reserve_balance,
        ctx.accounts.bonding_curve_state.decimals,
        ctx.accounts.bonding_curve_state.connector_weight,
    )?;

    let trading_fees = get_account_balance(ctx.accounts.trading_fee_auth.to_account_info())?;

    update_bonding_curve_state(
        &mut ctx.accounts.bonding_curve_state,
        total_supply,
        reserve_balance,
        progress,
        market_cap,
        trading_fees,
    )?;

    let event = get_swap_event(
        ctx.accounts.token_0_mint.to_account_info(),
        ctx.accounts.signer.to_account_info(),
        ctx.accounts.token_0_mint.decimals,
        token_amount,
        lamports,
        rent_amount,
        SwapType::Sell,
    )?;

    emit!(event);

    Ok(())
}
