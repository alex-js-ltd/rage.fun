use anchor_lang::prelude::*;
use anchor_spl::token_interface::spl_token_2022::amount_to_ui_amount;
use anchor_spl::token_interface::spl_token_2022::ui_amount_to_amount;

// Need to do this so the enum shows up in the IDL
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Eq, InitSpace)]
pub enum Status {
    ///
    Funding,
    ///
    Complete,
    ///
    Migrated,
}

#[account]
#[derive(InitSpace)]
pub struct BondingCurveState {
    pub mint: Pubkey,
    pub creator: Pubkey,

    pub connector_weight: f64,
    pub decimals: u8,

    pub initial_supply: u64,
    pub current_supply: u64,
    pub target_supply: u64,

    pub initial_reserve: u64,
    pub current_reserve: u64,
    pub target_reserve: u64,

    pub trading_fees: u64,
    pub open_time: u64,

    pub status: Status,
}

pub fn calculate_buy_amount(
    supply: u64,
    deposit_amount: u64,
    connector_balance: u64,
    decimals: u8,
    connector_weight: f64,
) -> Result<u64> {
    let supply = amount_to_ui_amount(supply, decimals);
    let deposit_amount = amount_to_ui_amount(deposit_amount, 9);
    let connector_balance = amount_to_ui_amount(connector_balance, 9);

    // Ensure division and exponentiation are handled correctly
    let deposit_ratio = deposit_amount / connector_balance;
    let exponent = connector_weight;

    let result = supply * ((1.0 + deposit_ratio).powf(exponent) - 1.0);

    let output = ui_amount_to_amount(result, decimals);

    Ok(output)
}

pub fn calculate_sell_price(
    supply: u64,
    sell_amount: u64,
    connector_balance: u64,
    decimals: u8,
    connector_weight: f64,
) -> Result<u64> {
    let supply = amount_to_ui_amount(supply, decimals);
    let sell_amount = amount_to_ui_amount(sell_amount, decimals);
    let connector_balance = amount_to_ui_amount(connector_balance, 9);

    // The new supply will be the old supply minus the tokens being sold
    let new_supply = supply - sell_amount;

    // Calculate the ratio of new supply to old supply
    let supply_ratio = new_supply / supply;

    // Calculate the amount of reserve token the user will receive using the Bancor formula
    let reserve_amount = connector_balance * (1.0 - supply_ratio.powf(1.0 / connector_weight));

    // Convert to the actual unit amount (reserve tokens)
    let output = ui_amount_to_amount(reserve_amount, 9);

    Ok(output)
}

pub fn get_status(
    current_supply: u64,
    target_supply: u64,
    current_reserve: u64,
    target_reserve: u64,
) -> Status {
    if current_supply >= target_supply || current_reserve >= target_reserve {
        Status::Complete
    } else {
        Status::Funding
    }
}

pub fn calculate_initial_supply(
    target_supply: u64,
    target_reserve: u64,
    connector_balance: u64,
    connector_weight: f64,
    decimals: u8,
) -> Result<u64> {
    let target_supply = amount_to_ui_amount(target_supply, decimals);
    let target_reserve = amount_to_ui_amount(target_reserve, 9);
    let connector_balance = amount_to_ui_amount(connector_balance, 9);
    // Bonding curve equation to solve for initial_supply
    let term = (1.0 + target_reserve / connector_balance).powf(connector_weight) - 1.0;
    let initial_supply = target_supply / (1.0 + term);

    let output = ui_amount_to_amount(initial_supply, decimals);

    Ok(output)
}

pub fn calculate_deposit_amount(
    supply: u64,
    mint_amount: u64,
    connector_balance: u64,
    decimals: u8,
    connector_weight: f64,
) -> Result<u64> {
    let supply = amount_to_ui_amount(supply, decimals);
    let mint_amount = amount_to_ui_amount(mint_amount, decimals);
    let connector_balance = amount_to_ui_amount(connector_balance, 9);

    let new_supply = supply + mint_amount;
    let ratio = new_supply / supply;

    // Apply the inverse Bancor formula
    let deposit_ratio = ratio.powf(1.0 / connector_weight) - 1.0;
    let deposit_amount = connector_balance * deposit_ratio;

    let lamports = ui_amount_to_amount(deposit_amount, 9);
    Ok(lamports)
}

pub fn initialize_bonding_curve_state<'a>(
    curve: &mut Account<BondingCurveState>,
    payload: BondingCurveState,
) -> Result<()> {
    curve.mint = payload.mint;
    curve.creator = payload.creator;

    curve.connector_weight = payload.connector_weight;
    curve.decimals = payload.decimals;

    curve.initial_supply = payload.initial_supply;
    curve.current_supply = payload.current_supply;
    curve.target_supply = payload.target_supply;

    curve.initial_reserve = payload.initial_reserve;
    curve.current_reserve = payload.current_reserve;
    curve.target_reserve = payload.target_reserve;

    curve.trading_fees = payload.trading_fees;
    Ok(())
}

pub fn update_bonding_curve_state<'a>(
    curve: &mut Account<BondingCurveState>,
    current_supply: u64,
    current_reserve: u64,
    trading_fees: u64,
    status: Status,
) -> Result<()> {
    curve.current_supply = current_supply;
    curve.current_reserve = current_reserve;
    curve.trading_fees = trading_fees;
    curve.status = status;
    Ok(())
}
