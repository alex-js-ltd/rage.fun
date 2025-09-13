use crate::states::BondingCurveState;
use crate::utils::admin::is_admin;
use crate::utils::seed::{BONDING_CURVE_AUTH_SEED, BONDING_CURVE_STATE_SEED, FROZEN_AUTH_SEED};
use crate::utils::token::{create_or_allocate_account, get_or_create_ata, token_mint_to};
use anchor_lang::{prelude::*, system_program};

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

    /// CHECK: pda to control frozen tokens from supply drift
    #[account(mut,
        seeds = [FROZEN_AUTH_SEED.as_bytes(), token_0_mint.key().as_ref()],
        bump,
  
    )]
    pub frozen_auth: AccountInfo<'info>,

    /// Token account to which the tokens will be minted (created if needed)
    #[account(
                mut,
                     associated_token::mint = token_0_mint,
                     associated_token::authority = frozen_auth,
                     associated_token::token_program = token_0_program,
                 )]
    pub token_0_frozen_ata: Box<InterfaceAccount<'info, TokenAccount>>,

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
        .current_supply
        .saturating_sub(current_supply);

    if drift_amount == 0 {
        return Ok(());
    }

    // Create pda to control frozen tokens if it does not already exist
    create_frozen_account(
        &ctx.accounts.payer.to_account_info(),
        &ctx.accounts.token_0_mint.to_account_info(),
        &ctx.accounts.frozen_auth.to_account_info(),
        &ctx.accounts.system_program.to_account_info(),
    )?;

    get_or_create_ata(
        ctx.accounts.payer.to_account_info(),
        ctx.accounts.token_0_frozen_ata.to_account_info(),
        ctx.accounts.frozen_auth.to_account_info(),
        ctx.accounts.token_0_mint.to_account_info(),
        ctx.accounts.system_program.to_account_info(),
        ctx.accounts.token_0_program.to_account_info(),
        ctx.accounts.associated_token_program.to_account_info(),
    )?;

    // Mint missing supply to frozen ata
    token_mint_to(
        ctx.accounts.bonding_curve_auth.to_account_info(),
        ctx.accounts.token_0_program.to_account_info(),
        ctx.accounts.token_0_mint.to_account_info(),
        ctx.accounts.token_0_frozen_ata.to_account_info(),
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
        ctx.accounts.bonding_curve_state.current_supply,
        token_0_mint.supply
    );

    Ok(())
}

pub fn create_frozen_account<'info>(
    payer: &AccountInfo<'info>,
    token_0_mint: &AccountInfo<'info>,
    frozen_auth: &AccountInfo<'info>,
    system_program: &AccountInfo<'info>,
) -> Result<()> {
    if frozen_auth.owner == &crate::id() {
        return Ok(());
    }

    let (expected_pda_address, bump) = Pubkey::find_program_address(
        &[FROZEN_AUTH_SEED.as_bytes(), token_0_mint.key().as_ref()],
        &crate::id(),
    );

    require_eq!(expected_pda_address, frozen_auth.key());

    create_or_allocate_account(
        &crate::id(),
        payer.to_account_info(),
        system_program.to_account_info(),
        frozen_auth.clone(),
        &[
            FROZEN_AUTH_SEED.as_bytes(),
            token_0_mint.key().as_ref(),
            &[bump],
        ],
        0,
    )?;

    require_eq!(frozen_auth.owner, &crate::id());

    Ok(())
}
