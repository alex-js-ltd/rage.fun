use anchor_lang::prelude::*;
use std::cell::RefMut;

#[account(zero_copy(unsafe))]
#[repr(packed)]
#[derive(InitSpace, Default, Debug)]
pub struct AirdropState {
    pub count: u8,
    pub initial_supply: u64,
    pub nonce: u8,
}

pub fn calculate_airdrop_supply(target_supply: u64) -> Result<u64> {
    let output = target_supply >> 3;
    Ok(output)
}

pub fn calculate_airdrop_nonce(prev_count: u8, progress: f64) -> Result<u8> {
    // Every full 10% gives one airdrop step, max 10 steps
    let calculated_count = (progress / 10.0).floor().min(10.0) as u8;

    // Never go backwards in count
    let new_count = calculated_count.max(prev_count);

    Ok(new_count)
}

// Function that takes a mutable reference to a RefMut
pub fn initialize_airdrop_state(
    airdrop: &mut RefMut<'_, AirdropState>,
    payload: AirdropState,
) -> Result<()> {
    airdrop.count = payload.count;
    airdrop.initial_supply = payload.initial_supply;
    airdrop.nonce = payload.nonce;
    Ok(())
}

// Function that takes a mutable reference to a RefMut
pub fn update_airdrop_state(
    airdrop: &mut RefMut<'_, AirdropState>,
    count: u8,
    nonce: u8,
) -> Result<()> {
    airdrop.count = count;
    airdrop.nonce = nonce;
    Ok(())
}
