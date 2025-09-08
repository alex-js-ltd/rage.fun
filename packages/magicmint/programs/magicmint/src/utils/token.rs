use crate::utils::seed::META_LIST_ACCOUNT_SEED;
use anchor_lang::prelude::*;
use anchor_lang::system_program;
use anchor_lang::{
    prelude::Result,
    solana_program::{
        account_info::AccountInfo, program::invoke, pubkey::Pubkey, rent::Rent,
        system_instruction::transfer, sysvar::Sysvar,
    },
    Lamports,
};
use anchor_spl::token_2022;

use anchor_spl::token_interface::spl_token_2022::{
    self,
    extension::{BaseStateWithExtensions, Extension, ExtensionType, StateWithExtensions},
    state::Mint,
};
use anchor_spl::{token::TokenAccount, token_interface};

use spl_tlv_account_resolution::{account::ExtraAccountMeta, state::ExtraAccountMetaList};
use spl_type_length_value::variable_len_pack::VariableLenPack;

use anchor_spl::associated_token::{self};

use spl_pod::optional_keys::OptionalNonZeroPubkey;

pub fn update_account_lamports_to_minimum_balance<'info>(
    account: AccountInfo<'info>,
    payer: AccountInfo<'info>,
    system_program: AccountInfo<'info>,
) -> Result<()> {
    let extra_lamports = Rent::get()?.minimum_balance(account.data_len()) - account.get_lamports();
    if extra_lamports > 0 {
        invoke(
            &transfer(payer.key, account.key, extra_lamports),
            &[payer, account, system_program],
        )?;
    }
    Ok(())
}

pub fn get_mint_extensible_extension_data<T: Extension + VariableLenPack>(
    account: &mut AccountInfo,
) -> Result<T> {
    let mint_data = account.data.borrow();
    let mint_with_extension = StateWithExtensions::<Mint>::unpack(&mint_data)?;
    let extension_data = mint_with_extension.get_variable_len_extension::<T>()?;
    Ok(extension_data)
}

pub fn get_extra_meta_list_account_pda(mint: Pubkey) -> Pubkey {
    Pubkey::find_program_address(
        &[META_LIST_ACCOUNT_SEED.as_bytes(), mint.as_ref()],
        &crate::id(),
    )
    .0
}

pub fn get_meta_list(approve_account: Option<Pubkey>) -> Vec<ExtraAccountMeta> {
    if let Some(approve_account) = approve_account {
        return vec![ExtraAccountMeta {
            discriminator: 0,
            address_config: approve_account.to_bytes(),
            is_signer: false.into(),
            is_writable: true.into(),
        }];
    }
    vec![]
}

pub fn get_meta_list_size(approve_account: Option<Pubkey>) -> usize {
    // safe because it's either 0 or 1
    ExtraAccountMetaList::size_of(get_meta_list(approve_account).len()).unwrap()
}

pub fn get_account_balance<'a>(account: AccountInfo<'a>) -> Result<u64> {
    Ok(account
        .lamports()
        .saturating_sub(Rent::get()?.minimum_balance(account.data_len())))
}

pub fn transfer_from_user<'a>(
    authority: AccountInfo<'a>,
    from: AccountInfo<'a>,
    to: AccountInfo<'a>,
    mint: AccountInfo<'a>,
    token_program: AccountInfo<'a>,
    amount: u64,
    mint_decimals: u8,
) -> Result<()> {
    if amount == 0 {
        return Ok(());
    }
    token_2022::transfer_checked(
        CpiContext::new(
            token_program.to_account_info(),
            token_2022::TransferChecked {
                from,
                to,
                authority,
                mint,
            },
        ),
        amount,
        mint_decimals,
    )
}

pub fn transfer_from_pool_vault_to_user<'a>(
    authority: AccountInfo<'a>,
    from_vault: AccountInfo<'a>,
    to: AccountInfo<'a>,
    mint: AccountInfo<'a>,
    token_program: AccountInfo<'a>,
    amount: u64,
    mint_decimals: u8,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    if amount == 0 {
        return Ok(());
    }
    token_2022::transfer_checked(
        CpiContext::new_with_signer(
            token_program.to_account_info(),
            token_2022::TransferChecked {
                from: from_vault,
                to,
                authority,
                mint,
            },
            signer_seeds,
        ),
        amount,
        mint_decimals,
    )
}

pub fn transfer_sol_to_vault<'a>(
    from: AccountInfo<'a>,
    to: AccountInfo<'a>,
    system_program: AccountInfo<'a>,
    amount: u64,
) -> Result<()> {
    system_program::transfer(
        CpiContext::new(
            system_program.to_account_info(),
            system_program::Transfer { from, to },
        ),
        amount,
    )
}

pub fn transfer_sol_from_vault<'a>(
    from: AccountInfo<'a>,
    to: AccountInfo<'a>,
    system_program: AccountInfo<'a>,
    amount: u64,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    if amount == 0 {
        return Ok(());
    }

    system_program::transfer(
        CpiContext::new_with_signer(
            system_program.to_account_info(),
            system_program::Transfer { from, to },
            signer_seeds,
        ),
        amount,
    )
}

/// Issue a spl_token `MintTo` instruction.
pub fn token_mint_to<'a>(
    authority: AccountInfo<'a>,
    token_program: AccountInfo<'a>,
    mint: AccountInfo<'a>,
    destination: AccountInfo<'a>,
    amount: u64,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    if amount == 0 {
        return Ok(());
    }

    token_2022::mint_to(
        CpiContext::new_with_signer(
            token_program,
            token_2022::MintTo {
                to: destination,
                authority,
                mint,
            },
            signer_seeds,
        ),
        amount,
    )
}

pub fn token_burn<'a>(
    authority: AccountInfo<'a>,
    token_program: AccountInfo<'a>,
    mint: AccountInfo<'a>,
    from: AccountInfo<'a>,
    amount: u64,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    if amount == 0 {
        return Ok(());
    }
    token_2022::burn(
        CpiContext::new_with_signer(
            token_program.to_account_info(),
            token_2022::Burn {
                from,
                authority,
                mint,
            },
            signer_seeds,
        ),
        amount,
    )
}

pub fn token_ui_amount_to_amount<'a>(
    token_program: AccountInfo<'a>,
    mint: AccountInfo<'a>,
    ui_amount: &str,
) -> Result<u64> {
    token_2022::ui_amount_to_amount(
        CpiContext::new(
            token_program,
            token_2022::UiAmountToAmount { account: mint },
        ),
        ui_amount,
    )
}

pub fn token_approve_delegate<'a>(
    token_program: AccountInfo<'a>,
    to: AccountInfo<'a>,
    delegate: AccountInfo<'a>,
    authority: AccountInfo<'a>,
    amount: u64,
) -> Result<()> {
    token_2022::approve(
        CpiContext::new(
            token_program,
            token_2022::Approve {
                to,
                delegate,
                authority,
            },
        ),
        amount,
    )
}

pub fn set_authority<'a>(
    token_program: AccountInfo<'a>,
    current_authority: AccountInfo<'a>,
    account_or_mint: AccountInfo<'a>,
    authority_type: token_interface::spl_token_2022::instruction::AuthorityType,
    new_authority: Option<Pubkey>,
) -> Result<()> {
    token_interface::set_authority(
        CpiContext::new(
            token_program,
            token_interface::SetAuthority {
                current_authority,
                account_or_mint,
            },
        ),
        authority_type,
        new_authority,
    )
}

pub fn set_authority_with_signer<'a>(
    token_program: AccountInfo<'a>,
    current_authority: AccountInfo<'a>,
    account_or_mint: AccountInfo<'a>,
    authority_type: token_interface::spl_token_2022::instruction::AuthorityType,
    new_authority: Option<Pubkey>,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    token_interface::set_authority(
        CpiContext::new_with_signer(
            token_program,
            token_interface::SetAuthority {
                current_authority,
                account_or_mint,
            },
            signer_seeds, // Pass signer_seeds correctly
        ),
        authority_type,
        new_authority,
    )
}

pub fn create_wrapped_sol<'a>(
    from: &AccountInfo<'a>,
    to: &AccountInfo<'a>,
    system_program: &AccountInfo<'a>,
    token_program: &AccountInfo<'a>,
    amount: u64,
    signer_seeds: &[&[&[u8]]],
) -> Result<()> {
    if amount == 0 {
        return Ok(());
    }

    system_program::transfer(
        CpiContext::new_with_signer(
            system_program.to_account_info(),
            system_program::Transfer {
                from: from.to_account_info(),
                to: to.to_account_info(),
            },
            signer_seeds,
        ),
        amount,
    )?;

    // Sync the native token to reflect the new SOL balance as wSOL
    token_2022::sync_native(CpiContext::new(
        token_program.to_account_info(),
        token_2022::SyncNative {
            account: to.to_account_info(),
        },
    ))
}

pub fn get_or_create_ata<'a>(
    payer: AccountInfo<'a>,
    associated_token: AccountInfo<'a>,
    authority: AccountInfo<'a>,
    mint: AccountInfo<'a>,
    system_program: AccountInfo<'a>,
    token_program: AccountInfo<'a>,
    associated_token_program: AccountInfo<'a>, // ✅ Added missing associated_token_program
) -> Result<()> {
    associated_token::create_idempotent(CpiContext::new(
        associated_token_program.to_account_info(), // ✅ Fix: Use associated token program
        associated_token::Create {
            payer,
            associated_token,
            authority,
            mint,
            system_program,
            token_program,
        },
    ))
}

pub fn create_token_metadata<'a>(
    token_program: &AccountInfo<'a>,
    metadata: AccountInfo<'a>,
    update_authority: AccountInfo<'a>,
    mint_authority: AccountInfo<'a>,
    mint: AccountInfo<'a>,
    name: String,
    symbol: String,
    uri: String,
) -> Result<()> {
    token_interface::token_metadata_initialize(
        CpiContext::new(
            token_program.to_account_info(),
            token_interface::TokenMetadataInitialize {
                token_program_id: token_program.to_account_info(),
                metadata,
                update_authority,
                mint_authority,
                mint,
            },
        ),
        name,
        symbol,
        uri,
    )
}

pub fn create_or_allocate_account<'a>(
    program_id: &Pubkey,
    payer: AccountInfo<'a>,
    system_program: AccountInfo<'a>,
    target_account: AccountInfo<'a>,
    siger_seed: &[&[u8]],
    space: usize,
) -> Result<()> {
    let rent = Rent::get()?;
    let current_lamports = target_account.lamports();

    if current_lamports == 0 {
        let lamports = rent.minimum_balance(space);
        let cpi_accounts = system_program::CreateAccount {
            from: payer,
            to: target_account.clone(),
        };
        let cpi_context = CpiContext::new(system_program.clone(), cpi_accounts);
        system_program::create_account(
            cpi_context.with_signer(&[siger_seed]),
            lamports,
            u64::try_from(space).unwrap(),
            program_id,
        )?;
    } else {
        let required_lamports = rent
            .minimum_balance(space)
            .max(1)
            .saturating_sub(current_lamports);
        if required_lamports > 0 {
            let cpi_accounts = system_program::Transfer {
                from: payer.to_account_info(),
                to: target_account.clone(),
            };
            let cpi_context = CpiContext::new(system_program.clone(), cpi_accounts);
            system_program::transfer(cpi_context, required_lamports)?;
        }
        let cpi_accounts = system_program::Allocate {
            account_to_allocate: target_account.clone(),
        };
        let cpi_context = CpiContext::new(system_program.clone(), cpi_accounts);
        system_program::allocate(
            cpi_context.with_signer(&[siger_seed]),
            u64::try_from(space).unwrap(),
        )?;

        let cpi_accounts = system_program::Assign {
            account_to_assign: target_account.clone(),
        };
        let cpi_context = CpiContext::new(system_program.clone(), cpi_accounts);
        system_program::assign(cpi_context.with_signer(&[siger_seed]), program_id)?;
    }
    Ok(())
}

pub fn transfer_sol_from_pda<'a>(
    pda: &AccountInfo<'a>,
    to: &AccountInfo<'a>,
    amount: u64,
) -> Result<()> {
    if amount == 0 {
        return Ok(());
    }

    let pda_balance_before = pda.get_lamports();

    pda.sub_lamports(amount)?;
    to.add_lamports(amount)?;

    // Get the balance of the PDA **after** the transfer from PDA
    let pda_balance_after = pda.get_lamports();

    require_eq!(pda_balance_after, pda_balance_before - amount);

    Ok(())
}

pub fn edit_token_metadata_update_authority<'a>(
    token_program: &AccountInfo<'a>,
    metadata: AccountInfo<'a>,
    current_authority: AccountInfo<'a>,
    new_authority: AccountInfo<'a>,
    new_authority_key: OptionalNonZeroPubkey,
) -> Result<()> {
    token_interface::token_metadata_update_authority(
        CpiContext::new(
            token_program.to_account_info(),
            token_interface::TokenMetadataUpdateAuthority {
                token_program_id: token_program.to_account_info(),
                metadata,
                current_authority,
                new_authority,
            },
        ),
        new_authority_key, // <- this comma was missing
    )
}

pub fn assign_from_pda<'a>(pda: &AccountInfo<'a>, new_owner: &Pubkey) -> Result<()> {
    pda.assign(new_owner);

    Ok(())
}

pub fn token_close_account<'a>(
    token_program: AccountInfo<'a>,
    account: AccountInfo<'a>,
    destination: AccountInfo<'a>,
    authority: AccountInfo<'a>,
) -> Result<()> {
    token_2022::close_account(CpiContext::new(
        token_program,
        token_2022::CloseAccount {
            account,
            destination,
            authority,
        },
    ))
}

pub fn calculate_space_for_ata<'a>(mint_account: &AccountInfo<'a>) -> Result<usize> {
    let space = {
        let mint_info = mint_account.to_account_info();
        if *mint_info.owner == token_2022::Token2022::id() {
            let mint_data = mint_info.try_borrow_data()?;
            let mint_state =
                StateWithExtensions::<spl_token_2022::state::Mint>::unpack(&mint_data)?;
            let mint_extensions = mint_state.get_extension_types()?;
            let required_extensions =
                ExtensionType::get_required_init_account_extensions(&mint_extensions);
            ExtensionType::try_calculate_account_len::<spl_token_2022::state::Account>(
                &required_extensions,
            )?
        } else {
            TokenAccount::LEN
        }
    };

    Ok(space)
}
