pub mod error;
pub mod instructions;
pub mod states;
pub mod utils;

use anchor_lang::prelude::*;
use instructions::*;

declare_id!("rage9dQeAYhkEhpXwFcrqwikW81dMXdGNY77jdrSmnq");

#[program]
pub mod rage {

    use super::*;

    pub fn initialize(
        ctx: Context<Initialize>,
        token_decimals: u8,
        args: CreateMintAccountArgs,
    ) -> Result<()> {
        instructions::initialize(ctx, token_decimals, args)
    }

    pub fn buy_token(ctx: Context<BuyToken>, lamports: u64, min_output: u64) -> Result<()> {
        instructions::buy_token(ctx, lamports, min_output)
    }

    pub fn sell_token(ctx: Context<SellToken>, amount: u64, min_output: u64) -> Result<()> {
        instructions::sell_token(ctx, amount, min_output)
    }

    pub fn proxy_initialize(ctx: Context<ProxyInitialize>, open_time: u64) -> Result<()> {
        instructions::proxy_initialize(ctx, open_time)
    }

    pub fn harvest_yield(ctx: Context<HarvestYield>) -> Result<()> {
        instructions::harvest_yield(ctx)
    }
}
