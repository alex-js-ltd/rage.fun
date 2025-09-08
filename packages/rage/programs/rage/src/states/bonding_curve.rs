use anchor_lang::prelude::*;
use anchor_spl::token_interface::spl_token_2022::amount_to_ui_amount;
use anchor_spl::token_interface::spl_token_2022::ui_amount_to_amount;

#[account]
#[derive(InitSpace)]
pub struct BondingCurveState {
    pub mint: Pubkey,
    pub creator: Pubkey,
    pub connector_weight: f64,
    pub total_supply: u64,
    pub initial_supply: u64,
    pub target_supply: u64,
    pub reserve_balance: u64,
    pub decimals: u8,
    pub progress: f64,
    pub market_cap: f64,
    pub open_time: u64,
    pub target_reserve: u64,
    pub trading_fees: u64,
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

pub fn calculate_progress(
    total_supply: u64,
    target_supply: u64,
    locked_supply: u64,
    decimals: u8,
) -> Result<f64> {
    if total_supply == target_supply {
        return Ok(100.0);
    }
    let total_supply = amount_to_ui_amount(total_supply, decimals);
    let target_supply = amount_to_ui_amount(target_supply, decimals);
    let locked_supply = amount_to_ui_amount(locked_supply, decimals);

    // Calculate the progress
    let progress = ((total_supply - locked_supply) / (target_supply - locked_supply)) * 100.0;

    Ok(progress.min(100.0))
}

pub fn calculate_market_cap(
    total_supply: u64,
    connector_balance: u64,
    decimals: u8,
    connector_weight: f64,
) -> Result<f64> {
    // Calculate price
    let total_supply = amount_to_ui_amount(total_supply, decimals);
    let connector_balance = amount_to_ui_amount(connector_balance, 9);
    let price = connector_balance / (total_supply * connector_weight);

    // Calculate market cap
    let market_cap = price * total_supply;

    Ok(market_cap)
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
    curve.total_supply = payload.total_supply;
    curve.initial_supply = payload.initial_supply;
    curve.target_supply = payload.target_supply;
    curve.reserve_balance = payload.reserve_balance;
    curve.decimals = payload.decimals;
    curve.progress = payload.progress;
    curve.market_cap = payload.market_cap;
    curve.open_time = payload.open_time;
    curve.target_reserve = payload.target_reserve;
    curve.trading_fees = payload.trading_fees;
    Ok(())
}

pub fn update_bonding_curve_state<'a>(
    curve: &mut Account<BondingCurveState>,
    total_supply: u64,
    reserve_balance: u64,
    progress: f64,
    market_cap: f64,
    trading_fees: u64,
) -> Result<()> {
    curve.total_supply = total_supply;
    curve.reserve_balance = reserve_balance;
    curve.progress = progress;
    curve.market_cap = market_cap;
    curve.trading_fees = trading_fees;

    Ok(())
}
