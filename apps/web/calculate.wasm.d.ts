export function calculate_buy_amount(
	supply: bigint,
	deposit_amount: bigint,
	connector_balance: bigint,
	decimals: number,
	connector_weight: number,
): bigint

export function calculate_sell_price(
	supply: bigint,
	sell_amount: bigint,
	connector_balance: bigint,
	decimals: number,
	connector_weight: number,
): bigint

export function ui_amount_to_amount(ui_amount: number, decimals: number): bigint

export function amount_to_ui_amount(amount: bigint, decimals: number): number
