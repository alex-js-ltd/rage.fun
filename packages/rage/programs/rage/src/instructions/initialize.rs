use crate::utils::admin::is_admin;

use anchor_lang::{prelude::*, system_program};

use anchor_spl::{
    associated_token::AssociatedToken,
    token_interface::{
        spl_token_2022::instruction::AuthorityType,
        spl_token_metadata_interface::state::TokenMetadata, Mint, Token2022,
    },
};

use crate::utils::token::{
    create_or_allocate_account, create_token_metadata, edit_token_metadata_update_authority,
    get_account_balance, get_meta_list_size, get_mint_extensible_extension_data, get_or_create_ata,
    set_authority, token_mint_to, transfer_sol_to_vault,
    update_account_lamports_to_minimum_balance,
};

use anchor_spl::token_interface::spl_token_2022::{self, amount_to_ui_amount, ui_amount_to_amount};

use crate::states::{
    calculate_initial_supply, calculate_market_cap, calculate_progress,
    initialize_bonding_curve_state, BondingCurveState, CreateEvent,
};

use spl_pod::optional_keys::OptionalNonZeroPubkey;

use crate::utils::seed::{
    AIRDROP_AUTH_SEED, AIRDROP_STATE_SEED, BONDING_CURVE_AUTH_SEED, BONDING_CURVE_STATE_SEED,
    MAGIC_MINT_TOKEN_SEED, META_LIST_ACCOUNT_SEED, TRADING_FEE_AUTH_SEED,
};

use crate::error::ErrorCode;

#[derive(AnchorDeserialize, AnchorSerialize)]
pub struct CreateMintAccountArgs {
    pub name: String,
    pub symbol: String,
    pub uri: String,
}

#[derive(Accounts)]
#[instruction(token_decimals: u8, args: CreateMintAccountArgs)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(
        init,
        payer = payer,
        mint::token_program = token_0_program,
        mint::decimals = token_decimals,
        mint::authority = payer,
        extensions::metadata_pointer::authority = payer,
        extensions::metadata_pointer::metadata_address = token_0_mint,

        seeds = [MAGIC_MINT_TOKEN_SEED.as_bytes(), args.symbol.as_bytes()],
        bump,

    )]
    pub token_0_mint: Box<InterfaceAccount<'info, Mint>>,

    /// CHECK: This account's data is a buffer of TLV data
    #[account(
        init,
        space = get_meta_list_size(None),
        seeds = [META_LIST_ACCOUNT_SEED.as_bytes(), token_0_mint.key().as_ref()],
        bump,
        payer = payer,
    )]
    pub extra_metas_account: UncheckedAccount<'info>,
    pub system_program: Program<'info, System>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_0_program: Program<'info, Token2022>,

    /// CHECK: pda to control vault_meme_ata & lamports
    #[account(mut,
            seeds = [BONDING_CURVE_AUTH_SEED.as_bytes(), token_0_mint.key().as_ref()],
            bump,
        )]
    pub bonding_curve_auth: UncheckedAccount<'info>,

    /// CHECK: pda to control vault_meme_ata & lamports
    #[account(mut,
        seeds = [AIRDROP_AUTH_SEED.as_bytes(), token_0_mint.key().as_ref()],
        bump,
    )]
    pub airdrop_auth: UncheckedAccount<'info>,

    /// CHECK: ATA for bonding curve vault (created manually to save stack space)
    #[account(mut)]
    pub token_0_bonding_curve_ata: UncheckedAccount<'info>,

    /// CHECK: ATA for airdrop vault (created manually to save stack space)
    #[account(mut)]
    pub token_0_airdrop_ata: UncheckedAccount<'info>,

    /// pda to store bonding curve state
    #[account(init,
            seeds = [BONDING_CURVE_STATE_SEED.as_bytes(),  token_0_mint.key().as_ref()],
            bump,
            payer = payer,
            space = 8 + BondingCurveState::INIT_SPACE
        )]
    pub bonding_curve_state: Account<'info, BondingCurveState>,

    /// CHECK: pda for airdrop state
    #[account(
        mut,
        seeds = [
            AIRDROP_STATE_SEED.as_bytes(),
            token_0_mint.key().as_ref(),
        ],
        bump,
    )]
    pub airdrop_state: UncheckedAccount<'info>,

    /// CHECK: pda to control reward pool
    #[account(mut)]
    pub trading_fee_auth: UncheckedAccount<'info>,

    /// CHECK: pda to control reward pool
    #[account(mut)]
    pub update_authority: UncheckedAccount<'info>,
}

const MIN_TARGET_RESERVE: u64 = 300_000_000; // 0.3 SOL
const MAX_TARGET_RESERVE: u64 = 80_000_000_000; // 80 SOL

pub fn initialize(
    ctx: Context<Initialize>,
    token_decimals: u8,
    args: CreateMintAccountArgs,
    target_reserve: u64,
) -> Result<()> {
    if target_reserve < MIN_TARGET_RESERVE {
        return Err(ErrorCode::TargetReserveTooLow.into());
    }

    if target_reserve > MAX_TARGET_RESERVE {
        return Err(ErrorCode::TargetReserveTooHigh.into());
    }

    let creator = ctx.remaining_accounts.get(0).unwrap();

    create_token_metadata(
        &ctx.accounts.token_0_program.to_account_info(),
        ctx.accounts.token_0_mint.to_account_info(),
        ctx.accounts.payer.to_account_info(),
        ctx.accounts.payer.to_account_info(),
        ctx.accounts.token_0_mint.to_account_info(),
        args.name.clone(),
        args.symbol.clone(),
        args.uri.clone(),
    )?;

    let valid_update_authority = is_admin(&ctx.accounts.update_authority.key());

    require_eq!(valid_update_authority, true);

    let new_authority_key =
        OptionalNonZeroPubkey::try_from(Some(ctx.accounts.update_authority.key()))?;

    edit_token_metadata_update_authority(
        &ctx.accounts.token_0_program.to_account_info(),
        ctx.accounts.token_0_mint.to_account_info(),
        ctx.accounts.payer.to_account_info(),
        ctx.accounts.update_authority.to_account_info(),
        new_authority_key,
    )?;

    ctx.accounts.token_0_mint.reload()?;

    let mint_data = &mut ctx.accounts.token_0_mint.to_account_info();
    let metadata = get_mint_extensible_extension_data::<TokenMetadata>(mint_data)?;

    require_eq!(metadata.mint, ctx.accounts.token_0_mint.key());
    require_eq!(metadata.name, args.name);
    require_eq!(metadata.symbol, args.symbol);
    require_eq!(metadata.uri, args.uri);
    require_eq!(ctx.accounts.token_0_mint.decimals, token_decimals);
    require_eq!(metadata.update_authority.0, new_authority_key.0);

    // transfer minimum rent to mint account
    update_account_lamports_to_minimum_balance(
        ctx.accounts.token_0_mint.to_account_info(),
        ctx.accounts.payer.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
    )?;

    let target_supply = ui_amount_to_amount(888_888_888.0, ctx.accounts.token_0_mint.decimals);
    let initial_reserve = ui_amount_to_amount(0.000000001, 9);
    let connector_weight = 0.15;
    let decimals = ctx.accounts.token_0_mint.decimals;

    let initial_supply = create_bonding_curve(
        &ctx.accounts.payer.to_account_info(),
        &ctx.accounts.token_0_mint.to_account_info(),
        &ctx.accounts.bonding_curve_auth.to_account_info(),
        &ctx.accounts.token_0_bonding_curve_ata.to_account_info(),
        &ctx.accounts.token_0_program.to_account_info(),
        &ctx.accounts.system_program.to_account_info(),
        &ctx.accounts.associated_token_program.to_account_info(),
        target_supply,
        target_reserve,
        initial_reserve,
        connector_weight,
        decimals,
        &[&[
            BONDING_CURVE_AUTH_SEED.as_bytes(),
            ctx.accounts.token_0_mint.key().as_ref(),
            &[ctx.bumps.bonding_curve_auth],
        ]],
    )?;

    msg!("Target reserve: {}", amount_to_ui_amount(target_reserve, 9));

    msg!(
        "Initial supply: {}",
        amount_to_ui_amount(initial_supply, ctx.accounts.token_0_mint.decimals)
    );

    let total_supply = initial_supply;
    let block_timestamp = Clock::get()?.unix_timestamp;
    let open_time = block_timestamp as u64;

    let reserve_balance = get_account_balance(ctx.accounts.bonding_curve_auth.to_account_info())?;

    require_eq!(reserve_balance, initial_reserve);

    let locked_supply = initial_supply;

    let progress = calculate_progress(total_supply, target_supply, locked_supply, decimals)?;

    let market_cap =
        calculate_market_cap(total_supply, reserve_balance, decimals, connector_weight)?;

    let curve_payload = BondingCurveState {
        mint: ctx.accounts.token_0_mint.key(),
        creator: creator.key(),
        connector_weight,
        total_supply,
        initial_supply,
        target_supply,
        reserve_balance,
        decimals,
        progress,
        market_cap,
        open_time,
        target_reserve,
        trading_fees: 0,
    };

    initialize_bonding_curve_state(&mut ctx.accounts.bonding_curve_state, curve_payload)?;

    create_trading_fee_account(
        &ctx.accounts.payer.to_account_info(),
        &ctx.accounts.trading_fee_auth.to_account_info(),
        &ctx.accounts.token_0_mint.to_account_info(),
        &ctx.accounts.system_program.to_account_info(),
    )?;

    let block_timestamp = Clock::get()?.unix_timestamp;

    emit!(CreateEvent {
        mint: ctx.accounts.token_0_mint.key(),
        creator: creator.key(),
        open_time: block_timestamp as u64
    });

    Ok(())
}

pub fn create_bonding_curve<'info>(
    payer: &AccountInfo<'info>,
    token_0_mint: &AccountInfo<'info>,
    bonding_curve_auth: &AccountInfo<'info>,
    token_0_bonding_curve_ata: &AccountInfo<'info>,
    token_0_program: &AccountInfo<'info>,
    system_program: &AccountInfo<'info>,
    assocaited_token_program: &AccountInfo<'info>,
    target_supply: u64,
    target_reserve: u64,
    initial_reserve: u64,
    connector_weight: f64,
    decimals: u8,
    signer_seeds: &[&[&[u8]]],
) -> Result<u64> {
    if bonding_curve_auth.owner != &system_program::ID {
        return err!(ErrorCode::NotApproved);
    }

    let (expected_pda_address, bump) = Pubkey::find_program_address(
        &[
            BONDING_CURVE_AUTH_SEED.as_bytes(),
            token_0_mint.key().as_ref(),
        ],
        &crate::id(),
    );

    require_eq!(expected_pda_address, bonding_curve_auth.key());

    create_or_allocate_account(
        &crate::id(),
        payer.to_account_info(),
        system_program.to_account_info(),
        bonding_curve_auth.clone(),
        &[
            BONDING_CURVE_AUTH_SEED.as_bytes(),
            token_0_mint.key().as_ref(),
            &[bump],
        ],
        0,
    )?;

    require_eq!(bonding_curve_auth.owner, &crate::id());

    get_or_create_ata(
        payer.to_account_info(),
        token_0_bonding_curve_ata.to_account_info(),
        bonding_curve_auth.to_account_info(),
        token_0_mint.to_account_info(),
        system_program.to_account_info(),
        token_0_program.to_account_info(),
        assocaited_token_program.to_account_info(),
    )?;

    // change mint authority
    set_authority(
        token_0_program.to_account_info(),
        payer.to_account_info(),
        token_0_mint.to_account_info(),
        AuthorityType::MintTokens,
        Some(bonding_curve_auth.to_account_info().key()),
    )?;

    // Transfer SOL to bonding curve vault pda
    transfer_sol_to_vault(
        payer.to_account_info(),
        bonding_curve_auth.to_account_info(),
        system_program.to_account_info(),
        initial_reserve,
    )?;

    let initial_supply = calculate_initial_supply(
        target_supply,
        target_reserve,
        initial_reserve,
        connector_weight,
        decimals,
    )?;

    // add liquidity to token supply
    token_mint_to(
        bonding_curve_auth.to_account_info(),
        token_0_program.to_account_info(),
        token_0_mint.to_account_info(),
        token_0_bonding_curve_ata.to_account_info(),
        initial_supply,
        signer_seeds,
    )?;

    let token_account = spl_token_2022::extension::StateWithExtensions::<
        spl_token_2022::state::Account,
    >::unpack(&token_0_bonding_curve_ata.data.borrow())?
    .base;

    require_eq!(initial_supply, token_account.amount);

    require_eq!(bonding_curve_auth.key(), token_account.owner);

    require_eq!(token_0_mint.key(), token_account.mint);

    Ok(initial_supply)
}

pub fn create_trading_fee_account<'info>(
    payer: &AccountInfo<'info>,
    trading_fee_auth: &AccountInfo<'info>,
    token_0_mint: &AccountInfo<'info>,
    system_program: &AccountInfo<'info>,
) -> Result<()> {
    if trading_fee_auth.owner != &system_program::ID {
        return err!(ErrorCode::NotApproved);
    }

    let (expected_pda_address, bump) = Pubkey::find_program_address(
        &[
            TRADING_FEE_AUTH_SEED.as_bytes(),
            token_0_mint.key().as_ref(),
        ],
        &crate::id(),
    );

    require_eq!(expected_pda_address, trading_fee_auth.key());

    create_or_allocate_account(
        &crate::id(),
        payer.to_account_info(),
        system_program.to_account_info(),
        trading_fee_auth.clone(),
        &[
            TRADING_FEE_AUTH_SEED.as_bytes(),
            token_0_mint.key().as_ref(),
            &[bump],
        ],
        0,
    )?;

    Ok(())
}
