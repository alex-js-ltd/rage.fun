use anchor_lang::prelude::*;
use anchor_lang::solana_program::pubkey::Pubkey;

const VALID_SIGNERS: [Pubkey; 4] = [
    pubkey!("CPSRUjX5YTtsdjCSij25kJ5W5b3dsTk6D7zSz3Md5LgU"),
    pubkey!("rageM7X7HTzpPgcQwVJbVr47GBQKgpPqnQZZ7YMkkPv"),
    pubkey!("rageaYnfntSQHMMC1iQcRDSWxaPkk7Qr4ULJ9EDjHpV"),
    pubkey!("rage9dQeAYhkEhpXwFcrqwikW81dMXdGNY77jdrSmnq"),
];

pub fn is_admin(key: &Pubkey) -> bool {
    VALID_SIGNERS.contains(key)
}
