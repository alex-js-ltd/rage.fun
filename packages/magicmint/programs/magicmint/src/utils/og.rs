use anchor_lang::prelude::*;
use anchor_lang::solana_program::pubkey::Pubkey;

const OG_USERS: [Pubkey; 9] = [
    pubkey!("4VzJUYhiaFMQg9JsbXh1vMFSEssxRDPKqcEhvumvcVRu"), // dumb
    pubkey!("4MH6i4A4XhRnGWm2cpsxKCXdzEQVrHfz1XdY5R4WoVWj"), // parth
    pubkey!("7WnwbJqp2qF6Wq3GJYNvre3S32uun6yHhGdF52bYnG3Z"), // dark
    pubkey!("BEt8TEg6knnGE5isfpxeNq7sjaCvxaqD7jATWed3qsus"), // gabzy
    pubkey!("Gh9GJTfeWDY7VKUWgGCihPojHVdWAqFHBGpU8pE8q3o8"), // abel
    pubkey!("BiJ2T2g6zZT5FcdeVtbQfn84psPLUUU1bi6Tdbcg8P1S"), // fmzly
    pubkey!("7uLrYhhoJX8bT1iLL7kr6WNW7WKuV2qRVDtwPSdNPbKJ"), // dev
    pubkey!("4xZ86p5cTt2NXsfhk2tyBcK53yvh6ethySH1Ksqfcqn4"), // kyrox
    pubkey!("8jCcTyypwWUmYPsQZLT2qK3tuhvWzpU9Se4v8yadKJcv"), // me
];

pub fn is_og(key: &Pubkey) -> bool {
    OG_USERS.contains(key)
}
