use crate::utils::admin::is_admin;

use crate::utils::seed::{AIRDROP_AUTH_SEED, AIRDROP_STATE_SEED, BONDING_CURVE_AUTH_SEED};

use anchor_lang::prelude::*;
use anchor_lang::solana_program::pubkey::Pubkey;

use anchor_spl::associated_token::AssociatedToken;

use anchor_spl::token_interface::{
    spl_token_2022::{self, amount_to_ui_amount},
    Mint, TokenInterface,
};

use crate::error::ErrorCode;
use crate::states::AirdropEvent;
use crate::utils::token::{get_or_create_ata, transfer_from_pool_vault_to_user};

use crate::states::{update_airdrop_state, AirdropState, AirdropType};

#[derive(Accounts)]
pub struct UnlockAirdrop<'info> {
    /// The payer of the transaction and the signer

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

    /// CHECK: ATA for bonding curve vault (created manually to save stack space)
    #[account(mut)]
    pub token_0_bonding_curve_ata: UncheckedAccount<'info>,

    /// Mint associated with the meme coin
    #[account(mut,
        mint::token_program = token_0_program,
      
    )]
    pub token_0_mint: Box<InterfaceAccount<'info, Mint>>,

    /// CHECK: pda to control vault_meme_ata & lamports
    #[account(mut,
        seeds = [AIRDROP_AUTH_SEED.as_bytes(), token_0_mint.key().as_ref()],
        bump,
    )]
    pub airdrop_auth: AccountInfo<'info>,

    /// CHECK: ATA for airdrop vault (created manually to save stack space)
    #[account(mut)]
    pub token_0_airdrop_ata: UncheckedAccount<'info>,

    /// CHECK: pda for airdrop state
    #[account(
            mut,
            seeds = [
                AIRDROP_STATE_SEED.as_bytes(),
                token_0_mint.key().as_ref(),
            ],
            bump,
        )]
    pub airdrop_state: AccountLoader<'info, AirdropState>,

    /// SPL token program for the meme coin
    pub token_0_program: Interface<'info, TokenInterface>,

    /// System program
    pub system_program: Program<'info, System>,

    /// Associated token program
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn unlock_airdrop<'c: 'info, 'info>(
    ctx: Context<'_, '_, 'c, 'info, UnlockAirdrop<'info>>,
) -> Result<()> {
    let airdrop_state = &mut ctx.accounts.airdrop_state.load_mut()?;

    if airdrop_state.count == airdrop_state.nonce {
        return Err(ErrorCode::NoPendingAirdrops.into());
    }

    let is_last_airdrop = airdrop_state.count == 9 && airdrop_state.nonce == 10;

    // add initial supply to the last airdrop
    if is_last_airdrop {
        let token_0_bonding_curve_ata = spl_token_2022::extension::StateWithExtensions::<
            spl_token_2022::state::Account,
        >::unpack(
            &ctx.accounts.token_0_bonding_curve_ata.data.borrow()
        )?
        .base;

        let initial_supply = token_0_bonding_curve_ata.amount;

        transfer_from_pool_vault_to_user(
            ctx.accounts.bonding_curve_auth.to_account_info(),
            ctx.accounts.token_0_bonding_curve_ata.to_account_info(),
            ctx.accounts.token_0_airdrop_ata.to_account_info(),
            ctx.accounts.token_0_mint.to_account_info(),
            ctx.accounts.token_0_program.to_account_info(),
            initial_supply,
            ctx.accounts.token_0_mint.decimals,
            &[&[
                BONDING_CURVE_AUTH_SEED.as_bytes(),
                ctx.accounts.token_0_mint.key().as_ref(),
                &[ctx.bumps.bonding_curve_auth],
            ]],
        )?;
    }

    let total_amount = if is_last_airdrop {
        let token_0_airdrop_ata = spl_token_2022::extension::StateWithExtensions::<
            spl_token_2022::state::Account,
        >::unpack(
            &ctx.accounts.token_0_airdrop_ata.data.borrow()
        )?
        .base;

        token_0_airdrop_ata.amount
    } else {
        let initial_supply = airdrop_state.initial_supply;

        initial_supply / 10
    };

    msg!("Airdrop nonce: {}", airdrop_state.nonce);

    msg!(
        "Airdrop total: {}",
        amount_to_ui_amount(total_amount, ctx.accounts.token_0_mint.decimals)
    );

    let remaining_accounts: Vec<_> = ctx.remaining_accounts.iter().collect();

    let num_of_users = remaining_accounts.len() as u64 / 2;

    let amount_per_user = total_amount / num_of_users;

    if amount_per_user < 100 {
        return Err(ErrorCode::InvalidAirdrop.into());
    }

    for i in (0..remaining_accounts.len()).step_by(2) {
        let owner = remaining_accounts[i];
        let ata = remaining_accounts[i + 1];

        get_or_create_ata(
            ctx.accounts.payer.to_account_info(),
            ata.to_account_info(),
            owner.to_account_info(),
            ctx.accounts.token_0_mint.to_account_info(),
            ctx.accounts.system_program.to_account_info(),
            ctx.accounts.token_0_program.to_account_info(),
            ctx.accounts.associated_token_program.to_account_info(),
        )?;

        transfer_from_pool_vault_to_user(
            ctx.accounts.airdrop_auth.to_account_info(),
            ctx.accounts.token_0_airdrop_ata.to_account_info(),
            ata.to_account_info(),
            ctx.accounts.token_0_mint.to_account_info(),
            ctx.accounts.token_0_program.to_account_info(),
            amount_per_user,
            ctx.accounts.token_0_mint.decimals,
            &[&[
                AIRDROP_AUTH_SEED.as_bytes(),
                ctx.accounts.token_0_mint.key().as_ref(),
                &[ctx.bumps.airdrop_auth],
            ]],
        )?;

        let block_timestamp = Clock::get()?.unix_timestamp;

        let airdrop_id = airdrop_state.count + 1;

        emit!(AirdropEvent {
            user: owner.key(),
            mint: ctx.accounts.token_0_mint.key(),
            amount: amount_per_user,
            time: block_timestamp,
            airdrop_type: AirdropType::Unlock,
            airdrop_id: Some(airdrop_id),
        });
    }

    let airdrop_count = airdrop_state.count.checked_add(1).unwrap();

    update_airdrop_state(airdrop_state, airdrop_count, airdrop_state.nonce)?;

    Ok(())
}
