//! All fee information, to be used for validation currently

pub const FEE_RATE_DENOMINATOR_VALUE: u64 = 1_000_000;

pub fn ceil_div(token_amount: u128, numerator: u128, denominator: u128) -> Option<u128> {
    token_amount
        .checked_mul(u128::from(numerator))
        .unwrap()
        .checked_add(denominator)?
        .checked_sub(1)?
        .checked_div(denominator)
}

/// Helper function for calculating swap fee
pub fn floor_div(token_amount: u128, numerator: u128, denominator: u128) -> Option<u128> {
    Some(
        token_amount
            .checked_mul(numerator)?
            .checked_div(denominator)?,
    )
}

pub fn trading_fee(amount: u128) -> Option<u128> {
    ceil_div(amount, 10_000, u128::from(FEE_RATE_DENOMINATOR_VALUE))
}
