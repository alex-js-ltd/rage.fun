use crate::utils::admin::is_admin;
use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::Token,
    token_interface::{Mint, TokenAccount, TokenInterface},
};
use raydium_cpmm_cpi::{
    cpi,
    program::RaydiumCpmm,
    states::{AmmConfig, OBSERVATION_SEED, POOL_LP_MINT_SEED, POOL_SEED, POOL_VAULT_SEED},
};

use anchor_spl::token::spl_token::native_mint;

use crate::states::{BondingCurveState, RaydiumEvent};

use crate::utils::seed::{AIRDROP_AUTH_SEED, BONDING_CURVE_AUTH_SEED, BONDING_CURVE_STATE_SEED};
use crate::utils::token::{
    assign_from_pda, create_or_allocate_account, create_wrapped_sol, get_account_balance,
    get_or_create_ata, set_authority_with_signer, token_mint_to, transfer_from_pool_vault_to_user,
};

use anchor_spl::token_interface::spl_token_2022::instruction::AuthorityType;

use anchor_spl::token_interface::spl_token_2022::ui_amount_to_amount;

use anchor_spl::token_2022::spl_token_2022;

use anchor_spl::token_interface::spl_token_2022::amount_to_ui_amount;

use crate::error::ErrorCode;

#[derive(Accounts)]
pub struct ProxyInitialize<'info> {
    /// The payer for the transaction
    #[account(
        mut,
        constraint = is_admin(&signer.key()) @ ErrorCode::UnauthorizedSigner
    )]
    pub signer: Signer<'info>,

    pub cp_swap_program: Program<'info, RaydiumCpmm>,
    /// Address paying to create the pool. Can be anyone
    /// CHECK: Address paying to create the pool. Must be the bonding curve hodl account
    #[account(mut,
        seeds = [BONDING_CURVE_AUTH_SEED.as_bytes(), bonding_curve_mint.key().as_ref()],
        bump,
    )]
    pub creator: UncheckedAccount<'info>,

    /// CHECK: pda to control bonding curve state
    #[account(
            mut,
            seeds = [BONDING_CURVE_STATE_SEED.as_bytes(), bonding_curve_mint.key().as_ref()],
            bump,
        )]
    pub bonding_curve_state: Account<'info, BondingCurveState>,

    /// Which config the pool belongs to.
    pub amm_config: Box<Account<'info, AmmConfig>>,

    /// CHECK: pool vault and lp mint authority
    #[account(
        seeds = [
            raydium_cpmm_cpi::AUTH_SEED.as_bytes(),
        ],
        seeds::program = cp_swap_program.key(),
        bump,
    )]
    pub authority: UncheckedAccount<'info>,

    /// CHECK: Initialize an account to store the pool state, init by cp-swap
    #[account(
        mut,
        seeds = [
            POOL_SEED.as_bytes(),
            amm_config.key().as_ref(),
            token_0_mint.key().as_ref(),
            token_1_mint.key().as_ref(),
        ],
        seeds::program = cp_swap_program.key(),
        bump,
    )]
    pub pool_state: UncheckedAccount<'info>,

    /// Token_0 mint, the key must smaller then token_1 mint.
    #[account(
        constraint = token_0_mint.key() < token_1_mint.key(),
        mint::token_program = token_0_program,
    )]
    pub token_0_mint: Box<InterfaceAccount<'info, Mint>>,

    /// Token_1 mint, the key must grater then token_0 mint.
    #[account(
        mint::token_program = token_1_program,
    )]
    pub token_1_mint: Box<InterfaceAccount<'info, Mint>>,

    #[account(mut,
        mint::authority = creator,
    )]
    pub bonding_curve_mint: Box<InterfaceAccount<'info, Mint>>,

    /// CHECK: pool lp mint, init by cp-swap
    #[account(
        mut,
        seeds = [
            POOL_LP_MINT_SEED.as_bytes(),
            pool_state.key().as_ref(),
        ],
        seeds::program = cp_swap_program.key(),
        bump,
    )]
    pub lp_mint: UncheckedAccount<'info>,

    /// CHECK:
    #[account(mut)]
    pub creator_token_0: AccountInfo<'info>,

    /// CHECK:
    #[account(mut)]
    pub creator_token_1: AccountInfo<'info>,

    /// CHECK: creator lp ATA token account, init by cp-swap
    #[account(mut)]
    pub creator_lp_token: UncheckedAccount<'info>,

    /// CHECK: Token_0 vault for the pool, init by cp-swap
    #[account(
        mut,
        seeds = [
            POOL_VAULT_SEED.as_bytes(),
            pool_state.key().as_ref(),
            token_0_mint.key().as_ref()
        ],
        seeds::program = cp_swap_program.key(),
        bump,
    )]
    pub token_0_vault: UncheckedAccount<'info>,

    /// CHECK: Token_1 vault for the pool, init by cp-swap
    #[account(
        mut,
        seeds = [
            POOL_VAULT_SEED.as_bytes(),
            pool_state.key().as_ref(),
            token_1_mint.key().as_ref()
        ],
        seeds::program = cp_swap_program.key(),
        bump,
    )]
    pub token_1_vault: UncheckedAccount<'info>,

    /// create pool fee account
    #[account(
        mut,
        address= raydium_cpmm_cpi::create_pool_fee_reveiver::id(),
    )]
    pub create_pool_fee: Box<InterfaceAccount<'info, TokenAccount>>,

    /// CHECK: an account to store oracle observations, init by cp-swap
    #[account(
        mut,
        seeds = [
            OBSERVATION_SEED.as_bytes(),
            pool_state.key().as_ref(),
        ],
        seeds::program = cp_swap_program.key(),
        bump,
    )]
    pub observation_state: UncheckedAccount<'info>,

    /// Program to create mint account and mint tokens
    pub token_program: Program<'info, Token>,
    /// Spl token program or token program 2022
    pub token_0_program: Interface<'info, TokenInterface>,
    /// Spl token program or token program 2022
    pub token_1_program: Interface<'info, TokenInterface>,
    /// Program to create an ATA for receiving position NFT
    pub associated_token_program: Program<'info, AssociatedToken>,
    /// To create a new program account
    pub system_program: Program<'info, System>,
    /// Sysvar for program account
    pub rent: Sysvar<'info, Rent>,
}

pub fn proxy_initialize(ctx: Context<ProxyInitialize>, open_time: u64) -> Result<()> {
    if ctx.accounts.bonding_curve_state.progress < 100.0 {
        return Err(ErrorCode::BondingCurveNotComplete.into());
    }

    // Transfer ownership of pda to system program
    assign_from_pda(&ctx.accounts.creator.to_account_info(), &system_program::ID)?;

    let reserve_balance = get_account_balance(ctx.accounts.creator.to_account_info())?;

    let (native_mint, native_program, native_ata) = get_native_accounts(
        &ctx.accounts.token_0_mint.to_account_info(),
        &ctx.accounts.token_0_program.to_account_info(),
        &ctx.accounts.creator_token_0.to_account_info(),
        &ctx.accounts.token_1_mint.to_account_info(),
        &ctx.accounts.token_1_program.to_account_info(),
        &ctx.accounts.creator_token_1.to_account_info(),
    )?;

    // create ata for wrapped sol
    get_or_create_ata(
        ctx.accounts.signer.to_account_info(),
        native_ata.to_account_info(),
        ctx.accounts.creator.to_account_info(),
        native_mint.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        native_program.to_account_info(),
        ctx.accounts.associated_token_program.to_account_info(),
    )?;

    let pool_creation_fee = ui_amount_to_amount(0.2, 9);

    let wrapped_sol_amount = reserve_balance - pool_creation_fee;

    // transfer lamports to wrapped sol ata
    create_wrapped_sol(
        &ctx.accounts.creator.to_account_info(),
        &native_ata,
        &ctx.accounts.system_program.to_account_info(),
        &native_program,
        wrapped_sol_amount,
        &[&[
            BONDING_CURVE_AUTH_SEED.as_bytes(),
            ctx.accounts.bonding_curve_mint.key().as_ref(),
            &[ctx.bumps.creator],
        ]],
    )?;

    let (bonding_curve_mint, bonding_curve_program, bonding_curve_ata) = get_2022_accounts(
        &ctx.accounts.token_0_mint.to_account_info(),
        &ctx.accounts.token_0_program.to_account_info(),
        &ctx.accounts.creator_token_0.to_account_info(),
        &ctx.accounts.token_1_mint.to_account_info(),
        &ctx.accounts.token_1_program.to_account_info(),
        &ctx.accounts.creator_token_1.to_account_info(),
    )?;

    let bonding_curve_account = spl_token_2022::extension::StateWithExtensions::<
        spl_token_2022::state::Account,
    >::unpack(&bonding_curve_ata.data.borrow())?
    .base;

    assert_eq!(
        ctx.accounts.creator.key(),
        bonding_curve_account.owner.key()
    );
    assert_eq!(
        ctx.accounts.bonding_curve_mint.key(),
        bonding_curve_mint.key()
    );

    let mint_data =
        spl_token_2022::extension::StateWithExtensions::<spl_token_2022::state::Mint>::unpack(
            &bonding_curve_mint.data.borrow(),
        )?
        .base;

    assert_eq!(
        ctx.accounts.bonding_curve_mint.mint_authority,
        mint_data.mint_authority
    );

    // mint remaining token supply
    let total_supply =
        ui_amount_to_amount(1_000_000_000.0, ctx.accounts.bonding_curve_mint.decimals);
    let current_supply = ctx.accounts.bonding_curve_mint.supply;
    let remaining_supply = total_supply.saturating_sub(current_supply);

    token_mint_to(
        ctx.accounts.creator.to_account_info(),
        bonding_curve_program.to_account_info(),
        bonding_curve_mint.to_account_info(),
        bonding_curve_ata.to_account_info(),
        remaining_supply,
        &[&[
            BONDING_CURVE_AUTH_SEED.as_bytes(),
            ctx.accounts.bonding_curve_mint.key().as_ref(),
            &[ctx.bumps.creator],
        ]],
    )?;

    set_authority_with_signer(
        bonding_curve_program.to_account_info(),
        ctx.accounts.creator.to_account_info(),
        bonding_curve_mint.to_account_info(),
        AuthorityType::MintTokens,
        None,
        &[&[
            BONDING_CURVE_AUTH_SEED.as_bytes(),
            ctx.accounts.bonding_curve_mint.key().as_ref(),
            &[ctx.bumps.creator],
        ]],
    )?;

    ctx.accounts.token_0_mint.reload()?;
    ctx.accounts.token_1_mint.reload()?;
    ctx.accounts.bonding_curve_mint.reload()?;

    assert_eq!(total_supply, ctx.accounts.bonding_curve_mint.supply);

    let init_0 =
        spl_token_2022::extension::StateWithExtensions::<spl_token_2022::state::Account>::unpack(
            &ctx.accounts.creator_token_0.data.borrow(),
        )?
        .base;

    let init_1 =
        spl_token_2022::extension::StateWithExtensions::<spl_token_2022::state::Account>::unpack(
            &ctx.accounts.creator_token_1.data.borrow(),
        )?
        .base;

    if init_0.is_native() {
        assert_eq!(init_1.amount, remaining_supply);
    } else {
        assert_eq!(init_0.amount, remaining_supply);
    };

    msg!(
        "init_amount_0: {}",
        amount_to_ui_amount(init_0.amount, ctx.accounts.token_0_mint.decimals)
    );

    msg!(
        "init_amount_1: {}",
        amount_to_ui_amount(init_1.amount, ctx.accounts.token_1_mint.decimals)
    );

    cpi::initialize(
        CpiContext::new_with_signer(
            ctx.accounts.cp_swap_program.to_account_info(),
            cpi::accounts::Initialize {
                creator: ctx.accounts.creator.to_account_info(),
                amm_config: ctx.accounts.amm_config.to_account_info(),
                authority: ctx.accounts.authority.to_account_info(),
                pool_state: ctx.accounts.pool_state.to_account_info(),
                token_0_mint: ctx.accounts.token_0_mint.to_account_info(),
                token_1_mint: ctx.accounts.token_1_mint.to_account_info(),
                lp_mint: ctx.accounts.lp_mint.to_account_info(),
                creator_token_0: ctx.accounts.creator_token_0.to_account_info(),
                creator_token_1: ctx.accounts.creator_token_1.to_account_info(),
                creator_lp_token: ctx.accounts.creator_lp_token.to_account_info(),
                token_0_vault: ctx.accounts.token_0_vault.to_account_info(),
                token_1_vault: ctx.accounts.token_1_vault.to_account_info(),
                create_pool_fee: ctx.accounts.create_pool_fee.to_account_info(),
                observation_state: ctx.accounts.observation_state.to_account_info(),
                token_program: ctx.accounts.token_program.to_account_info(),
                token_0_program: ctx.accounts.token_0_program.to_account_info(),
                token_1_program: ctx.accounts.token_1_program.to_account_info(),
                associated_token_program: ctx.accounts.associated_token_program.to_account_info(),
                system_program: ctx.accounts.system_program.to_account_info(),
                rent: ctx.accounts.rent.to_account_info(),
            },
            &[&[
                BONDING_CURVE_AUTH_SEED.as_bytes(),
                ctx.accounts.bonding_curve_mint.key().as_ref(),
                &[ctx.bumps.creator][..],
            ][..]],
        ),
        init_0.amount,
        init_1.amount,
        open_time,
    )?;

    // Transfer ownership of pda back to magic mint program
    create_or_allocate_account(
        &crate::id(),
        ctx.accounts.signer.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.creator.to_account_info(),
        &[
            BONDING_CURVE_AUTH_SEED.as_bytes(),
            ctx.accounts.bonding_curve_mint.key().as_ref(),
            &[ctx.bumps.creator],
        ],
        0,
    )?;

    let curve = &mut ctx.accounts.bonding_curve_state;

    curve.total_supply = ctx.accounts.bonding_curve_mint.supply;

    // check pda account
    require_eq!(ctx.accounts.creator.owner, &crate::id());

    let block_timestamp = Clock::get()?.unix_timestamp;

    emit!(RaydiumEvent {
        mint: bonding_curve_mint.key(),
        open_time: block_timestamp as u64
    });

    Ok(())
}

pub fn get_native_accounts<'info>(
    token_0_mint: &AccountInfo<'info>,
    token_0_program: &AccountInfo<'info>,
    creator_token_0: &AccountInfo<'info>,

    token_1_mint: &AccountInfo<'info>,
    token_1_program: &AccountInfo<'info>,
    creator_token_1: &AccountInfo<'info>,
) -> Result<(AccountInfo<'info>, AccountInfo<'info>, AccountInfo<'info>)> {
    let token_0_is_native = token_0_mint.key() == native_mint::id();

    if token_0_is_native {
        Ok((
            token_0_mint.to_account_info(),
            token_0_program.to_account_info(),
            creator_token_0.to_account_info(),
        ))
    } else {
        Ok((
            token_1_mint.to_account_info(),
            token_1_program.to_account_info(),
            creator_token_1.to_account_info(),
        ))
    }
}

pub fn get_2022_accounts<'info>(
    token_0_mint: &AccountInfo<'info>,
    token_0_program: &AccountInfo<'info>,
    creator_token_0: &AccountInfo<'info>,

    token_1_mint: &AccountInfo<'info>,
    token_1_program: &AccountInfo<'info>,
    creator_token_1: &AccountInfo<'info>,
) -> Result<(AccountInfo<'info>, AccountInfo<'info>, AccountInfo<'info>)> {
    let token_0_is_native = token_0_mint.key() == native_mint::id();

    if token_0_is_native {
        Ok((
            token_1_mint.to_account_info(),
            token_1_program.to_account_info(),
            creator_token_1.to_account_info(),
        ))
    } else {
        Ok((
            token_0_mint.to_account_info(),
            token_0_program.to_account_info(),
            creator_token_0.to_account_info(),
        ))
    }
}
