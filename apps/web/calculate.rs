/// Convert the UI representation of a token amount (using the decimals field
/// defined in its mint) to the raw amount
pub fn ui_amount_to_amount(ui_amount: f64, decimals: u8) -> u64 {
    (ui_amount * 10_usize.pow(decimals as u32) as f64) as u64
}

/// Convert a raw amount to its UI representation (using the decimals field
/// defined in its mint)
pub fn amount_to_ui_amount(amount: u64, decimals: u8) -> f64 {
    amount as f64 / 10_usize.pow(decimals as u32) as f64
}

#[no_mangle]
pub extern "C" fn calculate_buy_amount(
    supply: u64,
    deposit_amount: u64,
    connector_balance: u64,
    decimals: u8,
    connector_weight: f64,
) -> u64 {
    let supply = amount_to_ui_amount(supply, decimals);
    let deposit_amount = amount_to_ui_amount(deposit_amount, 9);
    let connector_balance = amount_to_ui_amount(connector_balance, 9);

    let deposit_ratio = deposit_amount / connector_balance;
    let exponent = connector_weight;

    let result = supply * ((1.0 + deposit_ratio).powf(exponent) - 1.0);

    let output = ui_amount_to_amount(result, decimals);

    output
}

#[no_mangle]
pub extern "C" fn calculate_sell_price(
    supply: u64,
    sell_amount: u64,
    connector_balance: u64,
    decimals: u8,
    connector_weight: f64,
) -> u64 {
    let supply = amount_to_ui_amount(supply, decimals);
    let sell_amount = amount_to_ui_amount(sell_amount, decimals);
    let connector_balance = amount_to_ui_amount(connector_balance, 9);

    // The new supply will be the old supply minus the tokens being sold
    let new_supply = supply - sell_amount;

    // Calculate the ratio of new supply to old supply
    let supply_ratio = new_supply / supply;

    // Calculate the amount of reserve token the user will receive using the Bancor formula
    let reserve_amount = connector_balance * (1.0 - supply_ratio.powf(1.0 / connector_weight));

    let output = ui_amount_to_amount(reserve_amount, 9);

    output
}

#[no_mangle]
pub extern "C" fn calculate_max_mint(supply: u64, token_amount: u64, target_supply: u64) -> u64 {
    // Calculate the remaining amount that can be minted to not exceed target_supply
    let remaining_supply = target_supply - supply;

    // The max mintable amount is the minimum of remaining supply and token_amount
    let mint_amount = remaining_supply.min(token_amount);

    mint_amount
}
