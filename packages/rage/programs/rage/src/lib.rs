pub mod error;
pub mod instructions;
pub mod states;
pub mod utils;

use anchor_lang::prelude::*;
use instructions::*;

declare_id!("DUShtzhevyTnQLXQmQaT9EfjjjGhg26m6yXHav3vwe6Z");

#[program]
pub mod rage {

    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        token_decimals: u8,
        args: CreateMintAccountArgs,
        target_reserve: u64,
    ) -> Result<()> {
        instructions::initialize(ctx, token_decimals, args, target_reserve)
    }

    pub fn buy_token(ctx: Context<BuyToken>, lamports: u64) -> Result<()> {
        instructions::buy_token(ctx, lamports)
    }

    pub fn sell_token(ctx: Context<SellToken>, amount: u64) -> Result<()> {
        instructions::sell_token(ctx, amount)
    }

    pub fn proxy_initialize(ctx: Context<ProxyInitialize>, open_time: u64) -> Result<()> {
        instructions::proxy_initialize(ctx, open_time)
    }

    pub fn harvest_yield(ctx: Context<HarvestYield>) -> Result<()> {
        instructions::harvest_yield(ctx)
    }

    pub fn sync_bonding_curve(ctx: Context<SyncBondingCurve>) -> Result<()> {
        instructions::sync_bonding_curve(ctx)
    }

    pub fn realloc(ctx: Context<Realloc>) -> Result<()> {
        instructions::realloc(ctx)
    }
}
