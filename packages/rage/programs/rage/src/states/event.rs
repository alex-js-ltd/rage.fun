use anchor_lang::prelude::*;
use anchor_spl::token_interface::spl_token_2022;

// Need to do this so the enum shows up in the IDL
#[derive(AnchorSerialize, AnchorDeserialize, Debug, PartialEq, Eq)]
pub enum SwapType {
    Buy,
    Sell,
}

#[event]
#[cfg_attr(feature = "client", derive(Debug))]
pub struct SwapEvent {
    #[index]
    pub mint: Pubkey,
    pub signer: Pubkey,
    pub time: i64,
    pub price: f64,
    pub token_amount: u64,
    pub lamports: u64,
    pub rent_amount: u64,
    pub swap_type: SwapType,
}

pub fn get_swap_event<'a>(
    mint: AccountInfo<'a>,
    signer: AccountInfo<'a>,
    decimals: u8,
    token_amount: u64,
    lamports: u64,
    rent_amount: u64,
    swap_type: SwapType,
) -> Result<SwapEvent> {
    let block_timestamp = Clock::get()?.unix_timestamp;

    let price = calculate_price(token_amount, lamports, decimals)?;

    msg!("Price per token: {} SOL", price);

    msg!(
        "Token Amount: {}",
        spl_token_2022::amount_to_ui_amount(token_amount, decimals)
    );

    Ok(SwapEvent {
        mint: mint.key(),
        signer: signer.key(),
        time: block_timestamp,
        price,
        token_amount,
        lamports,
        rent_amount,
        swap_type,
    })
}

pub fn calculate_price(token_amount: u64, lamports: u64, decimals: u8) -> Result<f64> {
    let token_amount = spl_token_2022::amount_to_ui_amount(token_amount, decimals);
    let sol = spl_token_2022::amount_to_ui_amount(lamports, 9);
    let price = sol / token_amount;

    msg!("calculate_price:");

    msg!("  sol = {}", sol);

    msg!("  token amount = {}", token_amount);

    Ok(price)
}

/// Emitted when new bonding curve is created
#[event]
#[cfg_attr(feature = "client", derive(Debug))]
pub struct HarvestEvent {
    #[index]
    pub signer: Pubkey,
    pub mint: Pubkey,
    pub lamports: u64,
    pub time: i64,
}

/// Emitted when new bonding curve is created
#[event]
#[cfg_attr(feature = "client", derive(Debug))]
pub struct CreateEvent {
    #[index]
    pub creator: Pubkey,
    pub mint: Pubkey,
    pub open_time: u64,
}

/// Emitted when a bonding curve reaches 100% and the token is deployed to raydium
#[event]
#[cfg_attr(feature = "client", derive(Debug))]
pub struct RaydiumEvent {
    #[index]
    pub mint: Pubkey,
    pub open_time: u64,
}
