pub const META_LIST_ACCOUNT_SEED: &str = "extra-account-metas";

// Auth
pub const BONDING_CURVE_AUTH_SEED: &str = "bonding_curve_auth";
pub const TRADING_FEE_AUTH_SEED: &str = "trading_fee_auth";
/// Authority PDA used to reconcile supply drift
/// by minting offsets into the frozen sink account.
/// These tokens are non-circulating and cannot be moved.
pub const SYNC_AUTH_SEED: &str = "sync_auth";

// State
pub const BONDING_CURVE_STATE_SEED: &str = "bonding_curve_state";

// Token
pub const RAGE_TOKEN_SEED: &str = "rage_token";
