use anchor_lang::prelude::*;
use anchor_lang::solana_program::pubkey::Pubkey;

const VALID_SIGNERS: [Pubkey; 3] = [
    pubkey!("CPSRUjX5YTtsdjCSij25kJ5W5b3dsTk6D7zSz3Md5LgU"),
    pubkey!("4GnStCzLnYzE1WLnXJnkbHBf64ZDdkpnPr2VFJnGJHCN"),
    pubkey!("8jCcTyypwWUmYPsQZLT2qK3tuhvWzpU9Se4v8yadKJcv"),
];

pub fn is_admin(key: &Pubkey) -> bool {
    VALID_SIGNERS.contains(key)
}
