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

use anchor_spl::token_interface::spl_token_2022::{self, ui_amount_to_amount};

use crate::states::{
    calculate_virtual_supply, initialize_bonding_curve_state, BondingCurveState, CreateEvent,
    Status,
};

use spl_pod::optional_keys::OptionalNonZeroPubkey;

use crate::utils::seed::{
    BONDING_CURVE_AUTH_SEED, BONDING_CURVE_STATE_SEED, META_LIST_ACCOUNT_SEED, RAGE_TOKEN_SEED,
    TRADING_FEE_AUTH_SEED,
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

        seeds = [RAGE_TOKEN_SEED.as_bytes(), args.symbol.as_bytes()],
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

    /// CHECK: ATA for bonding curve vault (created manually to save stack space)
    #[account(mut)]
    pub token_0_bonding_curve_ata: UncheckedAccount<'info>,

    /// pda to store bonding curve state
    #[account(init,
            seeds = [BONDING_CURVE_STATE_SEED.as_bytes(),  token_0_mint.key().as_ref()],
            bump,
            payer = payer,
            space = 8 + BondingCurveState::INIT_SPACE
        )]
    pub bonding_curve_state: Account<'info, BondingCurveState>,

    /// CHECK: pda to control reward pool
    #[account(mut)]
    pub trading_fee_auth: UncheckedAccount<'info>,

    /// CHECK: pda to control reward pool
    #[account(mut)]
    pub update_authority: UncheckedAccount<'info>,
}

pub fn initialize(
    ctx: Context<Initialize>,
    token_decimals: u8,
    args: CreateMintAccountArgs,
) -> Result<()> {
    let creator = ctx.accounts.payer.to_account_info();

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

    // create trading fee account to store yield for the creator
    create_trading_fee_account(
        &ctx.accounts.payer.to_account_info(),
        &ctx.accounts.trading_fee_auth.to_account_info(),
        &ctx.accounts.token_0_mint.to_account_info(),
        &ctx.accounts.system_program.to_account_info(),
    )?;

    let target_supply = ui_amount_to_amount(800_000_000.0, ctx.accounts.token_0_mint.decimals);
    let target_reserve = ui_amount_to_amount(80.0, 9);

    let virtual_reserve = ui_amount_to_amount(0.1, 9);
    let connector_weight = 0.33;
    let decimals = ctx.accounts.token_0_mint.decimals;

    let virtual_supply = create_bonding_curve(
        &ctx.accounts.payer.to_account_info(),
        &ctx.accounts.token_0_mint.to_account_info(),
        &ctx.accounts.bonding_curve_auth.to_account_info(),
        &ctx.accounts.token_0_bonding_curve_ata.to_account_info(),
        &ctx.accounts.token_0_program.to_account_info(),
        &ctx.accounts.system_program.to_account_info(),
        &ctx.accounts.associated_token_program.to_account_info(),
        target_supply,
        target_reserve,
        virtual_reserve,
        connector_weight,
        decimals,
    )?;

    // Real minted supply
    let current_supply = 0;
    let block_timestamp = Clock::get()?.unix_timestamp;
    let open_time = block_timestamp as u64;

    let current_reserve = get_account_balance(ctx.accounts.bonding_curve_auth.to_account_info())?;

    let trading_fees = get_account_balance(ctx.accounts.trading_fee_auth.to_account_info())?;

    require_eq!(trading_fees, 0);

    let status = Status::Funding;

    let curve_payload = BondingCurveState {
        mint: ctx.accounts.token_0_mint.key(),
        creator: creator.key(),

        connector_weight,
        decimals,

        virtual_supply,
        current_supply,
        target_supply,

        virtual_reserve,
        current_reserve,
        target_reserve,

        trading_fees,
        open_time,

        status,
    };

    initialize_bonding_curve_state(&mut ctx.accounts.bonding_curve_state, curve_payload)?;

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
    virtual_reserve: u64,
    connector_weight: f64,
    decimals: u8,
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

    let virtual_supply = calculate_virtual_supply(
        target_supply,
        target_reserve,
        virtual_reserve,
        connector_weight,
        decimals,
    )?;

    Ok(virtual_supply)
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
