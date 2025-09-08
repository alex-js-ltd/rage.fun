export function calculate_buy_amount(
	supply: bigint,
	deposit_amount: bigint,
	connector_balance: bigint,
	decimals: number,
	connector_weight: number,
): bigint

export function calculate_max_mint(supply: bigint, token_amount: bigint, target_supply: bigint): bigint

export function calculate_sell_price(
	supply: bigint,
	sell_amount: bigint,
	connector_balance: bigint,
	decimals: number,
	connector_weight: number,
): bigint
