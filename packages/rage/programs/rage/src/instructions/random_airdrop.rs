use crate::utils::og::is_og;

use crate::utils::seed::BONDING_CURVE_AUTH_SEED;

use anchor_lang::prelude::*;
use anchor_lang::solana_program::pubkey::Pubkey;

use anchor_spl::associated_token::AssociatedToken;

use anchor_spl::token_interface::{
    spl_token_2022::ui_amount_to_amount, Mint, TokenAccount, TokenInterface,
};

use crate::states::AirdropType;

use crate::error::ErrorCode;
use crate::states::AirdropEvent;
use crate::utils::token::{get_or_create_ata, transfer_from_user};

#[derive(Accounts)]
pub struct RandomAirdrop<'info> {
    /// The payer of the transaction and the signer

    #[account(
        mut,
        constraint = is_og(&payer.key()) @ ErrorCode::UnauthorizedSigner
    )]
    pub payer: Signer<'info>,

    /// CHECK: pda to control meme_ata & lamports
    #[account(mut,
            seeds = [BONDING_CURVE_AUTH_SEED.as_bytes(), token_0_mint.key().as_ref()],
            bump,
        )]
    pub bonding_curve_auth: AccountInfo<'info>,

    /// Mint associated with the meme coin
    #[account(mut,
        mint::token_program = token_0_program,
        mint::authority = bonding_curve_auth,
    )]
    pub token_0_mint: Box<InterfaceAccount<'info, Mint>>,

    /// Token account to which the tokens will be minted (created if needed)
    #[account(
            mut,
                 associated_token::mint = token_0_mint,
                 associated_token::authority = payer,
                 associated_token::token_program = token_0_program,
             )]
    pub token_0_payer_ata: Box<InterfaceAccount<'info, TokenAccount>>,

    /// SPL token program for the meme coin
    pub token_0_program: Interface<'info, TokenInterface>,

    /// System program
    pub system_program: Program<'info, System>,

    /// Associated token program
    pub associated_token_program: Program<'info, AssociatedToken>,
}

pub fn random_airdrop<'c: 'info, 'info>(
    ctx: Context<'_, '_, 'c, 'info, RandomAirdrop<'info>>,
    amount: u64,
) -> Result<()> {
    let remaining_accounts: Vec<_> = ctx.remaining_accounts.iter().collect();

    let max_amount = ui_amount_to_amount(2_222_222.0, ctx.accounts.token_0_mint.decimals);

    // Enforce max per user
    let amount_per_user = amount.min(max_amount);

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

        transfer_from_user(
            ctx.accounts.payer.to_account_info(),
            ctx.accounts.token_0_payer_ata.to_account_info(),
            ata.to_account_info(),
            ctx.accounts.token_0_mint.to_account_info(),
            ctx.accounts.token_0_program.to_account_info(),
            amount_per_user,
            ctx.accounts.token_0_mint.decimals,
        )?;

        let block_timestamp = Clock::get()?.unix_timestamp;

        emit!(AirdropEvent {
            user: owner.key(),
            mint: ctx.accounts.token_0_mint.key(),
            amount: amount,
            time: block_timestamp,
            airdrop_type: AirdropType::Random,
            airdrop_id: None
        });
    }

    Ok(())
}
