# Turborepo rage.fun

solana-test-validator --reset \
--clone CPMMoo8L3F4NbTegBCKVNunggL7H1ZpdTHKxQB5qKP1C \
--clone DNXgeM9EiiaAbaWvwjHj9fQQLAX5ZsfHyvmYUNRAdNC8 \
--clone D4FPEruKEHrG5TenZ2mpDGEfu1iUvTiqBxvpU8HLBvC2 \
--url https://api.mainnet-beta.solana.com

solana config set --url localhost

solana config set --url https://api.devnet.solana.com

solana config set --url https://api.mainnet-beta.solana.com

solana-keygen recover -o recover.json --force

solana program deploy --buffer recover.json target/deploy/magicmint.so

anchor build -- --features devnet

"resolutions": { "@solana/wallet-standard-wallet-adapter-base": "1.0.1" }

anchor upgrade target/deploy/rage.so --program-id rageM7X7HTzpPgcQwVJbVr47GBQKgpPqnQZZ7YMkkPv

du -h target/deploy/rage.so

solana program extend rageM7X7HTzpPgcQwVJbVr47GBQKgpPqnQZZ7YMkkPv 200000

solana program deploy --buffer recover.json target/deploy/rage.so --program-id
rageM7X7HTzpPgcQwVJbVr47GBQKgpPqnQZZ7YMkkPv









